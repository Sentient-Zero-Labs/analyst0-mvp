from src.internal_services.sql_analyzer.sql_analyzer_base import SQLAnalyzerBase
from src.utils.logger import logger


class PostgreSQLAnalyzer(SQLAnalyzerBase):
    """PostgreSQL specific implementation of SQL analyzer"""

    def __init__(self):
        super().__init__()
        self.dialect = "postgres"
        logger.info("PostgreSQLAnalyzer initialized with dialect: %s", self.dialect)
