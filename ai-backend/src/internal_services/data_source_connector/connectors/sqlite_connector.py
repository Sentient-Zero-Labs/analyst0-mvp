from sqlalchemy import create_engine, text
from sqlalchemy.engine.reflection import Inspector
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import QueuePool

from src.internal_services.sql_analyzer.sql_analyzer_factory import SQLAnalyzerFactory
from src.services.data_source.data_source_model import DataSourceType
from src.utils.logger import logger

from ..data_source_connector_base import DataSourceConnectorBase


class SQLiteConnector(DataSourceConnectorBase):
    dialect = "sqlite"
    system_schemas = set()  # SQLite doesn't have system schemas like other databases
    query_analyzer = SQLAnalyzerFactory.get_sql_analyzer(DataSourceType.SQLITE)

    def __init__(self, db_uri):
        self.engine = create_engine(
            db_uri,
            execution_options={"readonly": True},
            poolclass=QueuePool,
            pool_size=2,
            max_overflow=3,
            pool_timeout=300,
            pool_pre_ping=True,
        )

        self.Session = sessionmaker(bind=self.engine)
        self.inspector = Inspector.from_engine(self.engine)

    def test_connection(self):
        try:
            with self.engine.connect() as connection:
                connection.execute(text("SELECT 1"))
            return True, None
        except Exception as e:
            error_message = f"Failed to connect to SQLite database: {str(e)}"
            logger.error(error_message)
            return False, error_message

    def _get_columns_info(self, table_name, schema=None):
        columns = []

        query = text(f"SELECT name, type FROM pragma_table_info('{table_name}')")

        with self.engine.connect() as connection:
            result = connection.execute(query)

            for row in result:
                column_info = {"name": row.name, "type": row.type.upper(), "description": ""}

                enum_values = self._get_enum_values(table_name, row.name)
                if enum_values:
                    column_info["type"] = "ENUM"
                    column_info["enum_values"] = enum_values

                columns.append(column_info)

        return columns

    def _get_enum_values(self, table_name, column_name):
        # SQLite doesn't have native enum types
        return None
