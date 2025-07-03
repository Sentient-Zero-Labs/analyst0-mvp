"""PostgreSQL database connector."""

from typing import Dict, Any
from core.connectors.base import BaseConnector


class PostgresConnector(BaseConnector):
    """PostgreSQL database connector."""
    
    def get_dialect(self) -> str:
        """Get the database dialect."""
        return "postgresql"
    
    def get_system_schemas(self) -> set:
        """Get system schemas to exclude from introspection."""
        return {"information_schema", "pg_catalog", "pg_toast"}
    
    def _get_connect_args(self) -> Dict[str, Any]:
        """Get PostgreSQL-specific connection arguments."""
        return {
            "sslmode": "require",
            "connect_timeout": 10
        }
    
    def _get_test_query(self) -> str:
        """Get PostgreSQL-specific test query."""
        return "SELECT 1"
