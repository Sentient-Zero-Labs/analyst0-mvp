from threading import Lock
from typing import Optional

from cachetools import LRUCache

from src.internal_services.data_source_connector.data_source_connector_base import DataSourceConnectorBase
from src.utils.logger import logger


class ConnectionLRUCache(LRUCache):
    def __init__(self, maxsize: int):
        super().__init__(maxsize)

    def popitem(self) -> tuple[int, DataSourceConnectorBase]:
        data_source_id, connector = super().popitem()
        logger.info(f"Cache full: Removing LRU connection. Data Source ID: {data_source_id}")
        try:
            connector.close_connection()
        except Exception as e:
            logger.error(f"Error closing connection for {data_source_id}: {str(e)}")
        finally:
            return data_source_id, connector


class DataSourceConnectorCache:
    def __init__(self, maxsize: int = 100):
        self._lock = Lock()
        self._cache = ConnectionLRUCache(maxsize=maxsize)
        logger.info(f"Initialized DataSourceConnectorCache with maxsize {maxsize}")

    def get(self, data_source_id: int) -> Optional[DataSourceConnectorBase]:
        """
        Get a connector from cache if it exists
        """
        with self._lock:
            connector = self._cache.get(data_source_id)
            if connector:
                logger.debug(f"Cache hit for data_source_id: {data_source_id}")
            else:
                logger.debug(f"Cache miss for data_source_id: {data_source_id}")
            return connector

    def set(self, data_source_id: int, connector: DataSourceConnectorBase) -> None:
        """
        Add a connector to cache. If cache is full, least recently used connector will be removed
        """
        with self._lock:
            # If we're at capacity, LRUCache will automatically call popitem()
            # to remove the least recently used item before adding the new one
            self._cache[data_source_id] = connector
            logger.info(
                f"Added/Updated connection for data_source_id: {data_source_id}. "
                f"Cache size: {len(self._cache)}/{self._cache.maxsize}"
            )

    def remove(self, data_source_id: int) -> None:
        """
        Explicitly remove a connector from cache
        """
        with self._lock:
            if data_source_id in self._cache:
                connector = self._cache[data_source_id]
                try:
                    connector.close_connection()
                except Exception as e:
                    logger.error(f"Error closing connection for {data_source_id}: {str(e)}")
                finally:
                    del self._cache[data_source_id]
                    logger.info(f"Explicitly removed connection for data_source_id: {data_source_id}")
            else:
                logger.debug(f"Attempted to remove non-existent connection for data_source_id: {data_source_id}")

    def clear(self) -> None:
        """
        Remove all connectors from cache
        """
        with self._lock:
            logger.info(f"Clearing cache with {len(self._cache)} connections")
            for data_source_id, connector in list(self._cache.items()):
                try:
                    connector.close_connection()
                except Exception as e:
                    logger.error(f"Error closing connection for {data_source_id}: {str(e)}")
            self._cache.clear()
            logger.info("Cache cleared successfully")

    def get_stats(self) -> dict:
        """
        Get current cache statistics
        """
        with self._lock:
            return {
                "current_size": len(self._cache),
                "max_size": self._cache.maxsize,
                "active_connections": list(self._cache.keys()),
            }

    @property
    def size(self) -> int:
        """
        Get current cache size
        """
        with self._lock:
            return len(self._cache)
