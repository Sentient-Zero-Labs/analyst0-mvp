from src.internal_services.sql_analyzer.sql_analyzer_base import SQLAnalyzerBase
from src.utils.logger import logger


class MySQLAnalyzer(SQLAnalyzerBase):
    """MySQL specific implementation of SQL analyzer"""

    def __init__(self):
        super().__init__()
        self.dialect = "mysql"
        logger.info("MySQLAnalyzer initialized with dialect: %s", self.dialect)
