from src.internal_services.sql_analyzer.sql_analyzer_base import SQLAnalyzerBase
from src.utils.logger import logger


class SnowflakeAnalyzer(SQLAnalyzerBase):
    """Snowflake specific implementation of SQL analyzer"""

    def __init__(self):
        super().__init__()
        self.dialect = "snowflake"
        logger.info("SnowflakeAnalyzer initialized with dialect: %s", self.dialect)