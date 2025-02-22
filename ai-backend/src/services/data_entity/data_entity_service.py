import asyncio
from typing import List

from fastapi import Depends, HTTPException
from sqlalchemy import func, select, update
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Session

from src.database import get_db
from src.internal_services.data_source_connector.data_source_connector_base import DataSourceConnectorBase
from src.internal_services.llm_client.llm_client_service import LLMClientService
from src.middleware.wrap_response import DataResponse
from src.services.charter.charter_model import CharterDataEntityModel
from src.services.data_entity.data_entity_model import DataEntityModel
from src.services.data_entity.data_entity_schema import (
    ColumnInfo,
    DataEntityBase,
    DataEntityCreate,
    DataEntityResponse,
    ForeignKeyInfo,
)
from src.services.data_source.data_source_model import DataSourceModel
from src.services.data_source.data_source_schema import DataSourceResponse
from src.utils.logger import setup_logger
from src.utils.sqlalchemy_pydantic_utils import pydantic_list_to_json_list, to_pydantic

logger = setup_logger()


class DataEntityService:
    @staticmethod
    async def fetch_and_save_data_entity_schema(
        data_entity: DataEntityModel, db: Session, data_source_connector: DataSourceConnectorBase
    ):
        """Fetches and saves the definition of a data entity from a data source."""

        table_info = await data_source_connector.get_table_info(
            data_entity.name,
            data_entity.schema_name,
        )

        data_entity.columns = DataEntityService.merge_new_columns(data_entity.columns, table_info.columns)

        # Update indexes completely
        data_entity.indexes = pydantic_list_to_json_list(table_info.indexes)

        data_entity.foreign_keys = DataEntityService.merge_new_foreign_keys(
            data_entity.foreign_keys, table_info.foreign_keys
        )

        db.commit()

        return data_entity

    @staticmethod
    def merge_new_columns(old_columns: List, new_columns: List[ColumnInfo]):
        """
        Steps:
            1. Remove columns if not exist in table info,
            2. Update all properties except `description` for existing columns,
            3. Add new column if not exist in entity
        """
        columns = old_columns

        new_columns_map = {column.name: column for column in new_columns}
        columns = [
            {**new_columns_map[column["name"]].model_dump(), "description": column["description"]}
            for column in columns
            if column["name"] in new_columns_map
        ]

        old_column_names_set = {column["name"] for column in columns}

        remaining_new_columns = [column for column in new_columns if column.name not in old_column_names_set]

        columns.extend(pydantic_list_to_json_list(remaining_new_columns))

        return columns

    @staticmethod
    def merge_new_foreign_keys(old_foreign_keys: List, new_foreign_keys: List[ForeignKeyInfo]):
        """
        Steps:
            1. Remove foreign keys if not exist in table info,
            2. Update all properties except `description` for existing foreign keys,
            3. Add new foreign keys if not exist in entity
        """
        foreign_keys = old_foreign_keys

        new_foreign_keys_map = {foreign_key.column: foreign_key for foreign_key in new_foreign_keys}
        foreign_keys = [
            {**new_foreign_keys_map[foreign_key["column"]].model_dump(), "description": foreign_key["description"]}
            for foreign_key in foreign_keys
            if foreign_key["column"] in new_foreign_keys_map
        ]
        old_column_names_set = {foreign_key["column"] for foreign_key in foreign_keys}
        remaining_new_foreign_keys = [
            foreign_key for foreign_key in new_foreign_keys if foreign_key.column not in old_column_names_set
        ]
        foreign_keys.extend(pydantic_list_to_json_list(remaining_new_foreign_keys))

        return foreign_keys

    @staticmethod
    async def fetch_and_save_data_entities_from_data_source(
        data_source: DataSourceResponse,
        db: Session,
        data_source_connector: DataSourceConnectorBase,
    ):
        """Fetches data entities from a data source and saves them to the database."""

        data_entities = await DataEntityService.get_data_entitities_from_data_source(data_source, data_source_connector)
        return await DataEntityService.create_data_entities_in_db(data_entities, db)

    @staticmethod
    async def create_data_entity_in_db(
        data_entity: DataEntityCreate, data_source_id: int, organisation_id: int, db: Session = Depends(get_db)
    ):
        """Creates a single data entity record in the database."""

        new_data_entity = DataEntityModel(**data_entity.model_dump())
        new_data_entity.data_source_id = data_source_id
        new_data_entity.organisation_id = organisation_id

        db.add(new_data_entity)
        db.commit()
        db.refresh(new_data_entity)

        return DataResponse(data=new_data_entity)

    @staticmethod
    async def create_data_entities_in_db(data_entities: List[DataEntityCreate], db: Session = Depends(get_db)):
        """Bulk creates multiple data entity records in the database with conflict handling. Returns the ids of the
        entities that were created. Then generates embeddings for the entities."""

        successful_entities = {}

        for entity in data_entities:
            try:
                # Prepare individual insert statement
                stmt = insert(DataEntityModel).values(entity.model_dump(exclude_none=True))
                stmt = stmt.on_conflict_do_nothing()
                stmt = stmt.returning(DataEntityModel.id)  # Add this line to return the ID

                # Execute and get the result
                result = db.execute(stmt)
                inserted_id = result.scalar()  # Get the returned ID

                if inserted_id:  # If insertion was successful
                    successful_entities[inserted_id] = entity

            except IntegrityError as e:
                logger.warning(f"Integrity error occurred for entity: {str(e)}")
                db.rollback()
                continue

        db.commit()

        # Generate embeddings for the successful entities
        async def process_entity_embeddings(id, entity, semaphore):
            async with semaphore:
                data_entity_base = to_pydantic(entity, DataEntityBase)
                text_info = DataEntityService.create_data_entity_text_info(data_entity_base)
                embeddings = await LLMClientService.create_embeddings(text_info)

                stmt = update(DataEntityModel).where(DataEntityModel.id == id).values(embeddings=embeddings)
                db.execute(stmt)
                db.commit()

                return entity

        semaphore = asyncio.Semaphore(5)

        tasks = [process_entity_embeddings(id, entity, semaphore) for id, entity in successful_entities.items()]

        await asyncio.gather(*tasks)

        return DataResponse(data=successful_entities)

    @staticmethod
    async def get_data_entities_by_ids_and_charter_id(
        data_entity_ids: List[int], charter_id: int, async_db: AsyncSession
    ):
        """Retrieves data entities that are associated with a specific charter."""

        if not data_entity_ids or len(data_entity_ids) == 0:
            return []

        data_entities_smt = (
            select(DataEntityModel)
            .join(CharterDataEntityModel, CharterDataEntityModel.data_entity_id == DataEntityModel.id)
            .filter(CharterDataEntityModel.charter_id == charter_id, DataEntityModel.id.in_(data_entity_ids))
        )

        data_entities = (await async_db.execute(data_entities_smt)).scalars().all()

        return [DataEntityResponse.model_validate(data_entity) for data_entity in data_entities]

    @staticmethod
    def get_data_entities_by_table_names_and_charter_id(table_names: List[str], charter_id: int, db: Session):
        """Retrieves data entities by their table names that are associated with a specific charter."""

        data_entities = (
            db.query(DataEntityModel)
            .join(CharterDataEntityModel, CharterDataEntityModel.data_entity_id == DataEntityModel.id)
            .filter(
                CharterDataEntityModel.charter_id == charter_id,
                # Case insensitive match
                func.lower(DataEntityModel.name).in_([table_name.lower() for table_name in table_names]),
            )
            .order_by(DataEntityModel.name)
            .all()
        )

        return data_entities

    @staticmethod
    async def get_data_entitities_from_data_source(
        data_source: DataSourceModel, data_source_connector: DataSourceConnectorBase
    ):
        """Fetches all table information from a given data source using the appropriate connector."""

        dataEntities = await data_source_connector.get_all_table_info()

        logger.info(f"Fetched data entities for {data_source.name}")

        for data_entity in dataEntities:
            data_entity.organisation_id = data_source.organisation_id
            data_entity.data_source_id = data_source.id

        return dataEntities

    @staticmethod
    def create_referred_entity_text_info(entity: DataEntityResponse, table_name: str, indent=""):
        """Generates a formatted text description of a data entity, focusing on its relationships to a specific table."""

        result = []
        result.append(f"{indent}Table: {entity.name}\n")

        referred_columns = []
        for fk in entity.foreign_keys:
            if fk.referred_table_name == table_name:
                referred_columns.append(fk.referred_column)

        if referred_columns and len(referred_columns) > 0:
            result.append("Referenced Columns from `" + table_name + "` table: " + ", ".join(referred_columns) + "\n")

        if entity.description:
            result.append(f"{indent}Description: {entity.description}\n")

        result.append(f"{indent}Columns:\n")
        for column in entity.columns:
            column_info = f"{indent}  - {column.name} ({column.type})"
            if column.description:
                column_info += f" : {column.description}"
            if column.enum_values:
                column_info += f" [Enum: {', '.join(column.enum_values)}]"
            result.append(column_info + "\n")

        # Add indexes text info
        # if entity.indexes:
        #     result.append(f"{indent}Indexes:\n")
        #     for index in entity.indexes:
        #         result.append(f"{indent}  - {index.name}: {', '.join(index.columns)}\n")

        if entity.foreign_keys:
            result.append(f"{indent}Foreign Keys:\n")
            for fk in entity.foreign_keys:
                foreign_key_info = f"{indent}  - {fk.column} references {fk.referred_table_name}.{fk.referred_column}"
                if fk.description:
                    foreign_key_info += f" : {fk.description}"
                result.append(foreign_key_info + "\n")

        result.append("\n")
        return "".join(result)

    def create_data_entity_list_text_info(data_entities: List[DataEntityResponse]) -> str:
        data_entities_text_list = []
        for entity in data_entities:
            data_entities_text_list.append(DataEntityService.create_data_entity_text_info(entity))

        return "\n".join(data_entities_text_list)

    def create_data_entity_text_info(entity: DataEntityResponse, indent=""):
        """Generates a formatted text description of a data entity including its columns, indexes, and relationships."""

        result = []
        result.append(f"{indent}Table: {entity.name}\n")

        if entity.schema_name:
            result.append(f"{indent}Schema: {entity.schema_name}\n")

        if entity.description:
            result.append(f"{indent}Description: {entity.description}\n")

        result.append(f"{indent}Columns:\n")
        for column in entity.columns:
            column_info = f"{indent}  - {column.name} ({column.type})"
            if column.description:
                column_info += f" : {column.description}"
            if column.enum_values:
                column_info += f" [Enum: {', '.join(column.enum_values)}]"
            result.append(column_info + "\n")

        if entity.indexes:
            result.append(f"{indent}Indexes:\n")
            for index in entity.indexes:
                result.append(f"{indent}  - {index.name}: {', '.join(index.columns)}\n")

        if entity.foreign_keys:
            result.append(f"{indent}Foreign Keys:\n")
            for fk in entity.foreign_keys:
                foreign_key_info = f"{indent}  - {fk.column} references {fk.referred_table_name}.{fk.referred_column}"
                if fk.description:
                    foreign_key_info += f" : {fk.description}"
                result.append(foreign_key_info + "\n")

        result.append("\n")
        return "".join(result)

    def get_data_entity_by_id(data_entity_id: int, data_source_id: int, db: Session):
        """Retrieves a specific data entity by its ID and data source ID."""
        data_entity, data_source = (
            db.query(DataEntityModel, DataSourceModel)
            .join(DataSourceModel, DataSourceModel.id == DataEntityModel.data_source_id)
            .filter(DataEntityModel.id == data_entity_id, DataEntityModel.data_source_id == data_source_id)
            .first()
        )

        if not data_entity:
            raise HTTPException(status_code=404, detail="Data entity not found")

        data_entity.data_source_name = data_source.name

        return data_entity

    def get_data_entity_by_schema_and_names(
        schema_name: str, data_entity_names: List[str], data_source_id: int, db: Session
    ):
        """Retrieves data entities based on their schema name and entity names within a specific data source."""
        return (
            db.query(DataEntityModel)
            .filter(
                DataEntityModel.data_source_id == data_source_id,
                DataEntityModel.schema_name == schema_name,
                DataEntityModel.name.in_(data_entity_names),
            )
            .all()
        )

    def get_data_entity_by_schema(schema_name: str, data_source_id: int, db: Session):
        return (
            db.query(DataEntityModel)
            .filter(
                DataEntityModel.data_source_id == data_source_id,
                DataEntityModel.schema_name == schema_name,
            )
            .all()
        )

    def filter_foreign_key_entities(data_entities: List[DataEntityResponse], foreign_key_table_names: List[str]):
        """Filters a list of data entities to only include those whose names match the provided foreign key table names."""
        return [entity for entity in data_entities if entity.name in foreign_key_table_names]

    def filter_referred_entities(data_entities: List[DataEntityResponse], table_name: str):
        """Filters a list of data entities to only include those that reference a specific table through foreign keys."""
        return [
            entity
            for entity in data_entities
            if any(fk.referred_table_name == table_name for fk in entity.foreign_keys)
        ]
