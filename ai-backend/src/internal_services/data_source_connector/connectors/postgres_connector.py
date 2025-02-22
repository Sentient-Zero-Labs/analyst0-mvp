from sqlalchemy import create_engine, text
from sqlalchemy.engine.reflection import Inspector
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import QueuePool

from src.internal_services.sql_analyzer.sql_analyzer_factory import SQLAnalyzerFactory
from src.services.data_source.data_source_model import DataSourceType
from src.utils.logger import logger

from ..data_source_connector_base import DataSourceConnectorBase


class PostgresConnector(DataSourceConnectorBase):
    dialect = "postgres"
    system_schemas = {"information_schema", "pg_catalog"}
    query_analyzer = SQLAnalyzerFactory.get_sql_analyzer(DataSourceType.POSTGRES)

    def __init__(self, db_uri):
        # Here certificate is not added as the psycopg2 driver will use the default certificate path automatically
        connect_args = {"sslmode": "require"}

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

    def test_connection(self):
        try:
            with self.engine.connect() as connection:
                connection.execute(text("SELECT 1"))
            return True, None
        except Exception as e:
            error_message = f"Failed to connect to PostgreSQL database: {str(e)}"
            logger.error(error_message)
            return False, "Failed to connect to PostgreSQL database."

    def _get_enum_values(self, table_name, column_name):
        query = text("""
            SELECT t.typname AS enum_name,
                   e.enumlabel AS enum_value
            FROM pg_type t
            JOIN pg_enum e ON t.oid = e.enumtypid
            JOIN pg_catalog.pg_attribute a ON a.atttypid = t.oid
            JOIN pg_catalog.pg_class c ON c.oid = a.attrelid
            WHERE c.relname = :table_name AND a.attname = :column_name
            ORDER BY e.enumsortorder
        """)

        with self.engine.connect() as conn:
            result = conn.execute(query, {"table_name": table_name, "column_name": column_name})
            enum_values = [row[1] for row in result]

        return enum_values if enum_values else None
