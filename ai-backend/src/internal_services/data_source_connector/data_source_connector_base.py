import asyncio
import json
from abc import ABC, abstractmethod
from functools import partial

from sqlalchemy import text
from sqlalchemy.ext.declarative import declarative_base

from src.internal_services.sql_analyzer.sql_analyzer_base import SQLAnalyzerBase
from src.services.data_entity.data_entity_schema import DataEntityCreate
from src.settings import settings
from src.utils.logger import logger

Base = declarative_base()


class DataSourceConnectorBase(ABC):
    # Timeout for the query execution in seconds
    timeout = settings.DEFAULT_QUERY_TIMEOUT
    engine = None
    Session = None
    inspector = None
    dialect = None
    query_analyzer: SQLAnalyzerBase = None

    @abstractmethod
    def __init__(self, db_uri):
        """
        Initialize engine, session and inspector in each connector class as the implementation is different for each connector.
        """
        pass

    @abstractmethod
    def test_connection(self):
        """
        Test the database connection by attempting to execute a database-specific test query.

        Returns:
            tuple: A tuple containing (status, error_message), where:
                - status (bool): True if connection is successful, False otherwise
                - error_message (str): Description of the error if connection failed, None otherwise
        """
        pass

    def close_connection(self):
        """
        Closes the database connection and disposes of the engine.
        Should be called when the connector is no longer needed.
        """
        try:
            if self.Session:
                self.Session.close_all()
            if self.engine:
                self.engine.dispose()
            logger.info("Datasource connection closed successfully")
        except Exception as e:
            error_message = f"Error closing datasource connection: {str(e)}"
            logger.error(error_message)

    async def execute_query(self, query, params=None):
        """
        Execute a read-only SQL query and return the results along with error and status information.

        Args:
            query (str): The SQL query to execute.
            params (dict, optional): Parameters to be used with the query.

        Returns:
            tuple: A tuple containing (data, error, status), where:
                - data (list): A list of dictionaries with JSON-serializable values
                - error (str): An error message if an exception occurred, otherwise None.
                - status (bool): True if the query was successful, False otherwise.
        """
        try:
            # Validate the query. This is required as we only support SELECT queries.
            self.query_analyzer.validate_query(query)

            loop = asyncio.get_running_loop()
            # Add timeout of 30 seconds
            result = await asyncio.wait_for(
                loop.run_in_executor(None, self._execute_query_sync, query, params or {}), timeout=self.timeout
            )
            return result
        except asyncio.TimeoutError:
            error_message = f"Query execution timed out after {self.timeout} seconds."
            logger.error(f"Error: {error_message} \n Query: {query}")
            raise Exception(error_message)
        except Exception as e:
            error_message = f"An error occurred while executing the query: {str(e)}"
            logger.error(error_message)
            return None, error_message, "failed"

    def _execute_query_sync(self, query, params):
        """
        Synchronous helper method to execute the query in a thread pool.
        """
        with self.engine.connect().execution_options(readonly=True) as connection:
            result = connection.execute(text(query), params)
            columns = result.keys()

            columns_count = {}
            unique_columns = []

            # Create unique column names if there are duplicate columns
            for col in columns:
                if col in columns_count:
                    columns_count[col] += 1
                    unique_columns.append(f"{col}_{columns_count[col]}")
                else:
                    columns_count[col] = 0
                    unique_columns.append(col)

            data = []
            for row in result.fetchall():
                cleaned_row = {}
                for col, value in zip(unique_columns, row):
                    try:
                        # Try to JSON serialize the value to test if it's serializable
                        json.dumps(value)
                        cleaned_row[col] = value
                    except (TypeError, OverflowError, json.JSONDecodeError):
                        # If serialization fails, convert to string
                        cleaned_row[col] = str(value)
                data.append(cleaned_row)
        return data, None, "success"

    async def get_all_table_info(self):
        schema_names = self._get_schema_names()
        tables = []
        for schema in schema_names:
            table_names = self._get_table_names(schema=schema)

            logger.info(f"Inside get_all_table_info, getting tables for schema:{schema}")

            tables.extend(
                await asyncio.gather(*[asyncio.create_task(self._get_table_info(name, schema)) for name in table_names])
            )

        logger.info(f"Inside get_all_table_info, tables fetched successfully: {tables}")

        return tables

    async def get_table_info(self, table_name, schema) -> DataEntityCreate:
        return await self._get_table_info(table_name, schema)

    # Keep common methods as they are
    def _get_session(self):
        return self.Session()

    async def _get_table_info(self, table_name, schema) -> DataEntityCreate:
        logger.info(f"Inside get_table_info Getting table info for {table_name}")

        # Create semaphore as class attribute if it doesn't exist. Limit concurrency to 20.
        # Semaphore is used to limit the concurrency. In this case, the number of concurrent requests to the database.
        if not hasattr(self, "_semaphore"):
            self._semaphore = asyncio.Semaphore(20)

        async with self._semaphore:
            loop = asyncio.get_running_loop()
            return await loop.run_in_executor(None, partial(self._get_table_info_sync, table_name, schema))

    def _get_table_info_sync(self, table_name, schema):
        logger.info(f"Fetching table_info for {schema}.{table_name}")

        columns = self._get_columns_info(table_name, schema)
        indexes = self._get_indexes_info(table_name, schema)
        foreign_keys = self._get_foreign_keys_info(table_name, schema)

        logger.debug(f"Table {table_name} info:")
        logger.debug(f"Schema: {schema}")
        logger.debug(f"Columns: {columns}")
        logger.debug(f"Indexes: {indexes}")
        logger.debug(f"Foreign keys: {foreign_keys}")

        try:
            data_entity_create = DataEntityCreate(
                name=table_name,
                description=None,
                schema_name=schema,
                columns=columns,
                indexes=indexes,
                foreign_keys=foreign_keys,
            )
        except Exception as e:
            logger.error(f"Error creating data entity for {table_name}: {str(e)}")
            logger.error(f"Indexes causing error: {indexes}")  # Add this line for debugging
            return None

        logger.info(f"Table info for {schema}.{table_name} fetched successfully")

        return data_entity_create

    def _get_schema_names(self):
        return [schema for schema in self.inspector.get_schema_names() if schema not in self.system_schemas]

    def _get_table_names(self, schema=None):
        if schema:
            return self.inspector.get_table_names(schema)

        return self.inspector.get_table_names()

    def _get_columns_info(self, table_name, schema=None):
        columns = []

        for col in self.inspector.get_columns(table_name=table_name, schema=schema):
            column_info = {"name": col["name"], "type": str(col["type"]), "description": ""}

            enum_values = self._get_enum_values(table_name, col["name"])
            if enum_values:
                column_info["type"] = "ENUM"
                column_info["enum_values"] = enum_values

            columns.append(column_info)
        return columns

    def _get_indexes_info(self, table_name, schema=None):
        indexes = []

        for idx in self.inspector.get_indexes(table_name, schema):
            # Filter out None values from column_names
            columns = [col for col in idx["column_names"] if col is not None]
            if columns:  # Only add the index if it has valid columns
                indexes.append({"name": idx["name"], "columns": columns})
        return indexes

    def _get_foreign_keys_info(self, table_name, schema=None):
        return [
            {
                "column": fk["constrained_columns"][0],
                "referred_column": f"{fk['referred_columns'][0]}",
                "referred_table_name": fk["referred_table"],
            }
            for fk in self.inspector.get_foreign_keys(table_name, schema)
        ]

    @abstractmethod
    def _get_enum_values(self, table_name, column_name):
        pass
