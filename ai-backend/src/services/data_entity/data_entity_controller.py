from typing import List, Literal

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy.orm import Session

from src.database import get_db
from src.internal_services.data_source_connector.data_source_connector_base import DataSourceConnectorBase
from src.internal_services.data_source_connector.data_source_connector_dependency import get_user_data_source_connector
from src.internal_services.llm_client.llm_client_service import LLMClientService
from src.middleware.wrap_response import DataResponse, DataResponseClass
from src.prompts.data_entity_metadata_prompts import (
    DataEntityDescriptionResponse,
    data_entity_metadata_system_prompt_2,
    data_entity_metadata_user_prompt,
)
from src.services.data_entity.data_entity_dep import get_admin_data_entity, get_user_data_entity
from src.services.data_entity.data_entity_model import DataEntityModel
from src.services.data_entity.data_entity_schema import (
    DataEntityCreate,
    DataEntityListResponseItem,
    DataEntityResponse,
    DataEntityUpdate,
)
from src.services.data_entity.data_entity_service import (
    DataEntityService,
)
from src.services.data_source.data_source_dependency import (
    get_admin_data_source,
    get_user_data_source,
)
from src.services.data_source.data_source_model import DataSourceModel
from src.services.organisation.organisation_dependency import get_admin_organisation, get_user_organisation
from src.services.organisation.organisation_model import OrganisationModel
from src.utils.logger import setup_logger
from src.utils.sqlalchemy_pydantic_utils import to_pydantic, to_pydantic_list, to_sqlalchemy

logger = setup_logger()

router = APIRouter(prefix="/organisation/{organisation_public_id}/data-source/{data_source_id}/data-entity")


@router.post("", response_model=DataResponseClass[DataEntityResponse])
async def create_data_entity(
    data_entity: DataEntityCreate,
    data_source: DataSourceModel = Depends(get_admin_data_source),
    organisation: OrganisationModel = Depends(get_admin_organisation),
    db: Session = Depends(get_db),
):
    return await DataEntityService.create_data_entity_in_db(data_entity, data_source.id, organisation.id, db)


@router.get("/list", response_model=DataResponseClass[List[DataEntityListResponseItem]])
async def get_data_entity_list(
    data_source: DataSourceModel = Depends(get_user_data_source),
    type: Literal["compact", "detailed"] = "compact",
    organisation: OrganisationModel = Depends(get_user_organisation),
    db: Session = Depends(get_db),
):
    # Base query columns
    query_columns = [
        DataEntityModel.id,
        DataEntityModel.name,
        DataEntityModel.description,
        DataEntityModel.organisation_id,
        DataEntityModel.schema_name,
        DataSourceModel.name.label("data_source_name"),
        DataSourceModel.id.label("data_source_id"),
        DataSourceModel.type.label("data_source_type"),
    ]

    # Add additional columns for full type
    if type == "detailed":
        query_columns.extend(
            [
                DataEntityModel.columns,
                DataEntityModel.foreign_keys,
                DataEntityModel.indexes,
            ]
        )

    data_entities = (
        db.query(*query_columns)
        .join(DataSourceModel)
        .filter(DataEntityModel.organisation_id == organisation.id, DataEntityModel.data_source_id == data_source.id)
        .order_by(DataEntityModel.name)
        .all()
    )
    return DataResponse(data=data_entities)


@router.get("/{data_entity_id}", response_model=DataResponseClass[DataEntityResponse])
async def get_data_entity(
    data_entity: DataEntityModel = Depends(get_user_data_entity),
    data_source: DataSourceModel = Depends(get_user_data_source),
):
    data_entity.data_source_name = data_source.name
    return DataResponse(data=data_entity)


@router.put("/{data_entity_id}", response_model=DataResponseClass[DataEntityResponse])
async def update_data_entity(
    data_entity_update: DataEntityUpdate,
    data_entity: DataEntityModel = Depends(get_admin_data_entity),
    db: Session = Depends(get_db),
):
    for key, value in data_entity_update.model_dump().items():
        setattr(data_entity, key, value)

    data_entity.embeddings = await LLMClientService.create_embeddings(
        DataEntityService.create_data_entity_text_info(
            to_pydantic(
                data_entity,
                DataEntityResponse,
            )
        )
    )

    db.commit()
    db.refresh(data_entity)

    return DataResponse(data=data_entity)


@router.delete("/{data_entity_id}", status_code=204)
async def delete_data_entity(
    data_entity: DataEntityModel = Depends(get_admin_data_entity),
    db: Session = Depends(get_db),
):
    db.delete(data_entity)
    db.commit()
    return None


@router.post("/fetch")
async def fetch_data_entities_from_data_source(
    data_source: DataSourceModel = Depends(get_admin_data_source),
    db: Session = Depends(get_db),
    data_source_connector: DataSourceConnectorBase = Depends(get_user_data_source_connector),
):
    return await DataEntityService.fetch_and_save_data_entities_from_data_source(data_source, db, data_source_connector)


@router.post("/fetch-background")
async def fetch_data_entities_from_data_source_background(
    background_tasks: BackgroundTasks,
    data_source: DataSourceModel = Depends(get_admin_data_source),
    db: Session = Depends(get_db),
    data_source_connector: DataSourceConnectorBase = Depends(get_user_data_source_connector),
):
    background_tasks.add_task(
        DataEntityService.fetch_and_save_data_entities_from_data_source,
        data_source,
        db,
        data_source_connector,
    )

    return DataResponse(data={"message": "Data entity fetch started in background"})


@router.post("/create-embeddings", response_model=DataResponseClass[List[DataEntityResponse]])
async def create_all_data_entity_embeddings(
    data_source: DataSourceModel = Depends(get_user_data_source), db: Session = Depends(get_db)
):
    data_entities = (
        db.query(DataEntityModel).join(DataSourceModel).filter(DataEntityModel.data_source_id == data_source.id).all()
    )

    for data_entity in data_entities:
        data_entity.embeddings = await LLMClientService.create_embeddings(
            DataEntityService.create_data_entity_text_info(to_pydantic(data_entity, DataEntityResponse))
        )

    db.commit()

    return DataResponse(data=data_entities)


@router.get("/{data_entity_id}/sample-data")
async def get_data_entity_sample_data(
    db_data_entity: DataEntityModel = Depends(get_user_data_entity),
    data_source_connector: DataSourceConnectorBase = Depends(get_user_data_source_connector),
):
    query = f"SELECT * FROM {db_data_entity.schema_name}.{db_data_entity.name} LIMIT 20"

    result, error, status = await data_source_connector.execute_query(query)

    if error:
        raise HTTPException(status_code=400, detail=error)

    return DataResponse(data=result)


@router.post("/{data_entity_id}/schema/refetch", response_model=DataResponseClass[DataEntityResponse])
async def refresh_data_entity_schema(
    data_entity: DataEntityModel = Depends(get_admin_data_entity),
    db: Session = Depends(get_db),
    data_source_connector: DataSourceConnectorBase = Depends(get_user_data_source_connector),
):
    new_data_entity = await DataEntityService.fetch_and_save_data_entity_schema(data_entity, db, data_source_connector)

    return DataResponse(data=new_data_entity)


@router.post("/{data_entity_id}/metadata/fetch", response_model=DataResponseClass[DataEntityResponse])
async def fetch_data_entity_metadata(
    data_entity: DataEntityModel = Depends(get_user_data_entity),
    data_source: DataSourceModel = Depends(get_user_data_source),
    db: Session = Depends(get_db),
):
    data_entity: DataEntityResponse = to_pydantic(data_entity, DataEntityResponse)

    # Split by dot and get the first element in set
    data_entity_foreign_key_entity_names = {
        foreign_key.referred_column.split(".")[0] for foreign_key in data_entity.foreign_keys
    }

    data_entities_for_schema = to_pydantic_list(
        DataEntityService.get_data_entity_by_schema(data_entity.schema_name, data_source.id, db), DataEntityResponse
    )

    foreign_key_data_entities = DataEntityService.filter_foreign_key_entities(
        data_entities_for_schema, data_entity_foreign_key_entity_names
    )
    referred_data_entities = DataEntityService.filter_referred_entities(data_entities_for_schema, data_entity.name)

    # Create a prompt data for the data entity that we want to get metadata for
    data_entity_prompt_data = DataEntityService.create_data_entity_text_info(data_entity)

    # Create a list of prompts for each foreign key entity and concat into string with 2 new lines after each foreign key entity
    foreign_key_entities_prompt_data = "\n\n".join(
        [DataEntityService.create_data_entity_text_info(entity) for entity in foreign_key_data_entities]
    )

    # Create a list of prompts for each referred entity and concat into string with 2 new lines after each referred entity
    referred_entities_prompt_data = "\n\n".join(
        [
            DataEntityService.create_referred_entity_text_info(entity, data_entity.name)
            for entity in referred_data_entities
        ]
    )

    # Create the full prompt for the data entity
    full_data_entity_description_prompt = data_entity_metadata_user_prompt.format(
        data_entity=data_entity_prompt_data,
        foreign_key_entities=foreign_key_entities_prompt_data,
        referred_entities=referred_entities_prompt_data,
    )

    # Get the data entity metadata using LLM
    full_table_description = await LLMClientService.messages_with_instruction(
        [{"role": "user", "content": full_data_entity_description_prompt}],
        data_entity_metadata_system_prompt_2,
        DataEntityDescriptionResponse,
        model_type="small",
    )

    data_entity.description = (
        full_table_description.description if not data_entity.description else data_entity.description
    )

    # Loop through the data_entity.columns and update the description
    for column in full_table_description.columns:
        for data_entity_column in data_entity.columns:
            if data_entity_column.name == column.name and not data_entity_column.description:
                data_entity_column.description = column.description

    # Loop through the data_entity.foreign_keys and update the description
    for foreign_key in full_table_description.foreign_keys:
        for data_entity_foreign_key in data_entity.foreign_keys:
            if data_entity_foreign_key.column == foreign_key.column and not data_entity_foreign_key.description:
                data_entity_foreign_key.description = foreign_key.description

    data_entity_model = to_sqlalchemy(DataEntityModel, data_entity)

    data_entity_model.embeddings = await LLMClientService.create_embeddings(
        DataEntityService.create_data_entity_text_info(data_entity)
    )

    db.merge(data_entity_model)
    db.commit()

    return DataResponse(data=data_entity_model)
