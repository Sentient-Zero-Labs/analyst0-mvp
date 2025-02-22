from src.internal_services.sql_analyzer.sql_analyzer_base import SQLAnalyzerBase
from src.utils.logger import logger


class SQLiteAnalyzer(SQLAnalyzerBase):
    """SQLite specific implementation of SQL analyzer"""

    def __init__(self):
        super().__init__()
        self.dialect = "sqlite"
        logger.info("SQLiteAnalyzer initialized with dialect: %s", self.dialect)
