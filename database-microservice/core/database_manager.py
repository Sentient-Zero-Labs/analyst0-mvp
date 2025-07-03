"""Database manager for handling multiple database connections."""

import asyncio
from typing import Dict, List, Optional
from urllib.parse import quote_plus

import structlog

from core.connectors.base import BaseConnector
from core.connectors.mysql import MySQLConnector
from core.connectors.postgres import PostgresConnector
from core.connectors.snowflake import SnowflakeConnector
from core.connectors.sqlite import SQLiteConnector
from core.exceptions import ConfigurationError, DatabaseConnectionError, DatabaseNotFoundError
from core.models import (
    ColumnInfo,
    ConnectionTestResult,
    DatabaseConfig,
    DatabaseInfo,
    DatabaseType,
    QueryRequest,
    QueryResult,
    SchemaInfo,
    TableInfo,
)

logger = structlog.get_logger()


class DatabaseManager:
    """Manages multiple database connections."""

    def __init__(self):
        self._databases: Dict[str, DatabaseConfig] = {}
        self._connectors: Dict[str, BaseConnector] = {}
        self._lock = asyncio.Lock()

    async def add_database(self, config: DatabaseConfig) -> None:
        """Add a new database configuration."""
        async with self._lock:
            if config.name in self._databases:
                raise ConfigurationError(f"Database '{config.name}' already exists")

            try:
                # Create connection URL
                connection_url = self._create_connection_url(config)

                # Create connector
                connector = self._create_connector(config.name, config.type, connection_url)

                # Test connection
                test_result = await connector.test_connection()
                if not test_result.success:
                    connector.close()
                    raise DatabaseConnectionError(f"Connection test failed: {test_result.message}")

                # Encrypt sensitive configuration
                encrypted_config = self._encrypt_config(config)

                # Store configuration and connector
                self._databases[config.name] = encrypted_config
                self._connectors[config.name] = connector

                logger.info("Database added successfully", database=config.name, type=config.type.value)

            except Exception as e:
                logger.error("Failed to add database", database=config.name, error=str(e))
                raise

    async def remove_database(self, name: str) -> None:
        """Remove a database configuration."""
        async with self._lock:
            if name not in self._databases:
                raise DatabaseNotFoundError(f"Database '{name}' not found")

            # Close connector if exists
            if name in self._connectors:
                self._connectors[name].close()
                del self._connectors[name]

            # Remove configuration
            del self._databases[name]

            logger.info("Database removed successfully", database=name)

    async def update_database(self, name: str, config: DatabaseConfig) -> None:
        """Update a database configuration."""
        if name != config.name:
            raise ConfigurationError("Database name cannot be changed during update")

        # Remove old configuration
        await self.remove_database(name)

        # Add new configuration
        await self.add_database(config)

    async def get_database_info(self, name: str) -> DatabaseInfo:
        """Get database information (without sensitive config)."""
        if name not in self._databases:
            raise DatabaseNotFoundError(f"Database '{name}' not found")

        config = self._databases[name]

        # Test connection status
        status = "unknown"
        if name in self._connectors:
            try:
                test_result = await self._connectors[name].test_connection()
                status = "connected" if test_result.success else "disconnected"
            except Exception:
                status = "error"

        return DatabaseInfo(name=config.name, type=config.type, status=status)

    async def list_databases(self) -> List[DatabaseInfo]:
        """List all configured databases."""
        databases = []

        for name in self._databases:
            try:
                db_info = await self.get_database_info(name)
                databases.append(db_info)
            except Exception as e:
                logger.error("Error getting database info", database=name, error=str(e))
                # Add with error status
                config = self._databases[name]
                databases.append(DatabaseInfo(name=config.name, type=config.type, status="error"))

        return databases

    async def test_connection(self, name: str) -> ConnectionTestResult:
        """Test database connection."""
        connector = await self._get_connector(name)
        return await connector.test_connection()

    async def execute_query(self, name: str, request: QueryRequest) -> QueryResult:
        """Execute a query on the specified database."""
        connector = await self._get_connector(name)

        # Apply limit if specified
        query = request.query
        if request.limit:
            query = connector.query_validator.add_limit_if_missing(query, request.limit)

        return await connector.execute_query(query=query, params=request.params, timeout=request.timeout)

    async def get_tables(self, name: str) -> List[TableInfo]:
        """Get tables for the specified database."""
        connector = await self._get_connector(name)
        return await connector.get_tables()

    async def get_table_columns(self, name: str, table_name: str, schema: Optional[str] = None) -> List[ColumnInfo]:
        """Get columns for a specific table."""
        connector = await self._get_connector(name)
        return await connector.get_table_columns(table_name, schema)

    async def get_schema_info(self, name: str) -> SchemaInfo:
        """Get schema information for the database."""
        tables = await self.get_tables(name)

        return SchemaInfo(tables=tables, total_tables=len(tables))

    async def close_all_connections(self) -> None:
        """Close all database connections."""
        async with self._lock:
            for name, connector in self._connectors.items():
                try:
                    connector.close()
                    logger.info("Connection closed", database=name)
                except Exception as e:
                    logger.error("Error closing connection", database=name, error=str(e))

            self._connectors.clear()

    async def _get_connector(self, name: str) -> BaseConnector:
        """Get connector for the specified database."""
        if name not in self._databases:
            raise DatabaseNotFoundError(f"Database '{name}' not found")

        if name not in self._connectors:
            # Recreate connector if it doesn't exist
            config = self._databases[name]
            decrypted_config = self._decrypt_config(config)
            connection_url = self._create_connection_url(decrypted_config)

            connector = self._create_connector(name, config.type, connection_url)
            self._connectors[name] = connector

        return self._connectors[name]

    def _create_connector(self, name: str, db_type: DatabaseType, connection_url: str) -> BaseConnector:
        """Create a database connector based on type."""
        if db_type == DatabaseType.POSTGRES:
            return PostgresConnector(name, connection_url)
        elif db_type == DatabaseType.MYSQL:
            return MySQLConnector(name, connection_url)
        elif db_type == DatabaseType.SNOWFLAKE:
            return SnowflakeConnector(name, connection_url)
        elif db_type == DatabaseType.SQLITE:
            return SQLiteConnector(name, connection_url)
        else:
            raise ConfigurationError(f"Unsupported database type: {db_type}")

    def _create_connection_url(self, config: DatabaseConfig) -> str:
        """Create connection URL from database configuration."""
        if config.type == DatabaseType.POSTGRES:
            pg_config = config.config
            return f"postgresql://{pg_config.username}:{quote_plus(pg_config.password)}@{pg_config.host}:{pg_config.port}/{pg_config.database}"

        elif config.type == DatabaseType.MYSQL:
            mysql_config = config.config
            return f"mysql+pymysql://{mysql_config.username}:{quote_plus(mysql_config.password)}@{mysql_config.host}:{mysql_config.port}/{mysql_config.database}"

        elif config.type == DatabaseType.SNOWFLAKE:
            sf_config = config.config
            url = f"snowflake://{sf_config.username}:{quote_plus(sf_config.password)}@{sf_config.account_identifier}/{sf_config.database}"
            if sf_config.schema:
                url += f"/{sf_config.schema}"
            url += f"?warehouse={sf_config.warehouse}"
            if sf_config.role:
                url += f"&role={sf_config.role}"
            return url

        elif config.type == DatabaseType.SQLITE:
            sqlite_config = config.config
            return f"sqlite:///{sqlite_config.database_path}"

        else:
            raise ConfigurationError(f"Unsupported database type: {config.type}")

    def _encrypt_config(self, config: DatabaseConfig) -> DatabaseConfig:
        """Encrypt sensitive configuration data."""
        # For now, return as-is. In production, implement proper encryption
        # This would encrypt passwords and other sensitive data
        return config

    def _decrypt_config(self, config: DatabaseConfig) -> DatabaseConfig:
        """Decrypt sensitive configuration data."""
        # For now, return as-is. In production, implement proper decryption
        return config
