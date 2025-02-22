from sqlalchemy import create_engine, text
from sqlalchemy.engine.reflection import Inspector
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import QueuePool

from src.internal_services.sql_analyzer.sql_analyzer_factory import SQLAnalyzerFactory
from src.services.data_source.data_source_model import DataSourceType
from src.settings import settings
from src.utils.logger import logger

from ..data_source_connector_base import DataSourceConnectorBase


class MySQLConnector(DataSourceConnectorBase):
    dialect = "mysql"
    system_schemas = {"sys", "information_schema", "performance_schema", "mysql"}
    query_analyzer = SQLAnalyzerFactory.get_sql_analyzer(DataSourceType.MYSQL)

    def __init__(self, db_uri):
        connect_args = {"ssl_ca": settings.SSL_CERT_PATH}

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
            error_message = f"Failed to connect to MySQL database: {str(e)}"
            logger.error(error_message)
            return False, error_message

    def _get_enum_values(self, table_name, column_name):
        query = text("""
            SELECT COLUMN_TYPE
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_NAME = :table_name
            AND COLUMN_NAME = :column_name
            AND DATA_TYPE = 'enum'
        """)

        with self.engine.connect() as conn:
            result = conn.execute(query, {"table_name": table_name, "column_name": column_name})
            row = result.fetchone()
            if row:
                # Parse enum values from format: "enum('value1','value2')"
                enum_str = row[0]
                values = enum_str[5:-1].replace("'", "").split(",")
                return values

        return None
