from sqlalchemy import create_engine, text
from sqlalchemy.engine.reflection import Inspector
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import QueuePool

from src.internal_services.sql_analyzer.sql_analyzer_factory import SQLAnalyzerFactory
from src.services.data_source.data_source_model import DataSourceType
from src.utils.logger import logger

from ..data_source_connector_base import DataSourceConnectorBase


class SnowflakeConnector(DataSourceConnectorBase):
    dialect = "snowflake"

    system_schemas = {"information_schema"}
    query_analyzer = SQLAnalyzerFactory.get_sql_analyzer(DataSourceType.SNOWFLAKE)

    def __init__(self, db_uri):
        # Add session parameters to ignore case for quoted identifiers. This is to ensure that the column and table names are case insensitive.
        connect_args = {"sslmode": "require", "session_parameters": {"QUOTED_IDENTIFIERS_IGNORE_CASE": True}}

        self.engine = create_engine(
            db_uri,
            execution_options={"readonly": True},
            connect_args=connect_args,
            poolclass=QueuePool,
            pool_size=2,  # Adjust based on your needs
            max_overflow=3,  # Additional connections that can be created beyond pool_size
            pool_timeout=300,  # Timeout waiting for a connection from pool
            pool_pre_ping=True,  # Verify connection is still valid before using
        )

        self.Session = sessionmaker(bind=self.engine)
        self.inspector = Inspector.from_engine(self.engine)

    def get_table_schema(self, table_name, schema=None):
        if schema:
            return schema

        query = text("""
            SELECT TABLE_SCHEMA
            FROM INFORMATION_SCHEMA.TABLES
            WHERE TABLE_NAME = :table_name
            LIMIT 1
        """)

        with self.engine.connect() as conn:
            result = conn.execute(query, {"table_name": table_name})
            row = result.fetchone()
            return row[0] if row else None

    def _get_columns_info(self, table_name, schema=None):
        schema = schema.upper() if schema else None
        table_name = table_name.upper()

        columns = []

        # If schema is not provided, use the current schema
        schema_clause = f"AND table_schema = '{schema}'" if schema else ""

        query = text(f"""
            SELECT column_name, data_type, comment as description
            FROM information_schema.columns WHERE table_name = '{table_name}' {schema_clause}
            ORDER BY ordinal_position""")

        with self.engine.connect() as connection:
            result = connection.execute(query)

            for row in result:
                column_info = {
                    "name": row.column_name,
                    "type": row.data_type.upper(),
                    "description": row.description if row.description else "",
                }
                columns.append(column_info)

        return columns

    def _get_enum_values(self, table_name, column_name):
        # Snowflake does not support enum values
        return None

    def test_connection(self):
        try:
            with self.engine.connect() as connection:
                connection.execute(text("SELECT 1 AS col"))
            return True, None
        except Exception as e:
            error_message = f"Failed to connect to Snowflake database: {str(e)}"
            logger.error(error_message)
            return False, error_message
