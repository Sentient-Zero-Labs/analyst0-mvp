from src.internal_services.sql_analyzer.analysers.mysql_analyzer import MySQLAnalyzer
from src.internal_services.sql_analyzer.analysers.postgres_analyzer import PostgreSQLAnalyzer
from src.internal_services.sql_analyzer.analysers.snowflake_analyzer import SnowflakeAnalyzer
from src.internal_services.sql_analyzer.analysers.sqlite_analyser import SQLiteAnalyzer
from src.internal_services.sql_analyzer.sql_analyzer_base import SQLAnalyzerBase
from src.services.data_source.data_source_model import DataSourceType


class SQLAnalyzerFactory:
    _analyzers = {
        DataSourceType.POSTGRES: PostgreSQLAnalyzer(),
        DataSourceType.MYSQL: MySQLAnalyzer(),
        DataSourceType.SQLITE: SQLiteAnalyzer(),
        DataSourceType.SNOWFLAKE: SnowflakeAnalyzer(),
    }

    @staticmethod
    def get_sql_analyzer(dialect: str) -> SQLAnalyzerBase:
        try:
            return SQLAnalyzerFactory._analyzers[dialect]
        except KeyError:
            raise ValueError(f"Unsupported dialect: {dialect}")
