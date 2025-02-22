from src.internal_services.data_source_connector.connectors.mysql_connector import MySQLConnector
from src.internal_services.data_source_connector.connectors.postgres_connector import PostgresConnector
from src.internal_services.data_source_connector.connectors.snowflake_connector import SnowflakeConnector
from src.internal_services.data_source_connector.connectors.sqlite_connector import SQLiteConnector
from src.internal_services.data_source_connector.data_source_connector_base import DataSourceConnectorBase
from src.internal_services.data_source_connector.data_source_connector_cache import DataSourceConnectorCache
from src.services.data_source.data_source_model import DataSourceModel, DataSourceType
from src.settings import settings
from src.utils.logger import logger


class DataSourceConnectorFactory:
    _cache = DataSourceConnectorCache(maxsize=settings.DATA_SOURCE_CONNECTOR_CACHE_MAXSIZE)

    @classmethod
    def get_data_source_connector(cls, data_source: DataSourceModel, no_cache: bool = False) -> DataSourceConnectorBase:
        if no_cache:
            logger.info("Creating new data source connector without cache")
            return cls._create_new_connector(data_source)

        # Try to get from cache first
        cached_connector = cls._cache.get(data_source.id)

        if cached_connector is not None:
            logger.info(f"Cache Hit for Data Source: {data_source.id}")
            # Optionally add health check here
            if cls._is_connector_healthy(cached_connector):
                logger.info(f"Cache Connector for Data Source is healthy: {data_source.id}")
                return cached_connector
            else:
                # Remove unhealthy connector from cache
                cls._cache.remove(data_source.id)
                logger.info(f"Removed unhealthy connector from Cache for Data Source: {data_source.id}")

        logger.info(f"Creating new connector for Cache for Data Source: {data_source.id}")

        # Create new connector if not in cache or unhealthy
        connector = cls._create_new_connector(data_source)
        cls._cache.set(data_source.id, connector)

        logger.info(f"Added new connector to Cache for Data Source: {data_source.id}")

        return connector

    @staticmethod
    def _create_new_connector(data_source: DataSourceModel):
        if data_source.type == DataSourceType.POSTGRES:
            return PostgresConnector(data_source.get_connection_url())
        elif data_source.type == DataSourceType.SNOWFLAKE:
            return SnowflakeConnector(data_source.get_connection_url())
        elif data_source.type == DataSourceType.MYSQL:
            return MySQLConnector(data_source.get_connection_url())
        elif data_source.type == DataSourceType.SQLITE:
            return SQLiteConnector(data_source.get_connection_url())
        else:
            raise ValueError(f"Unsupported data source type: {data_source.type}")

    @staticmethod
    def _is_connector_healthy(connector) -> bool:
        try:
            # Implement appropriate health check based on your connector implementation
            return connector.test_connection()  # You'll need to implement this method in your connectors
        except Exception:
            return False

    @classmethod
    def clear_cache(cls) -> None:
        cls._cache.clear()
        logger.info("Cleared DataSourceConnectorCache")
