"""MySQL database connector."""

from typing import Dict, Any
from core.connectors.base import BaseConnector


class MySQLConnector(BaseConnector):
    """MySQL database connector."""
    
    def get_dialect(self) -> str:
        """Get the database dialect."""
        return "mysql"
    
    def get_system_schemas(self) -> set:
        """Get system schemas to exclude from introspection."""
        return {"sys", "information_schema", "performance_schema", "mysql"}
    
    def _get_connect_args(self) -> Dict[str, Any]:
        """Get MySQL-specific connection arguments."""
        return {
            "connect_timeout": 10,
            "autocommit": True
        }
    
    def _get_test_query(self) -> str:
        """Get MySQL-specific test query."""
        return "SELECT 1"
