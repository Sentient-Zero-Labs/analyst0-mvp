"""SQLite database connector."""

from typing import Dict, Any
from core.connectors.base import BaseConnector


class SQLiteConnector(BaseConnector):
    """SQLite database connector."""
    
    def get_dialect(self) -> str:
        """Get the database dialect."""
        return "sqlite"
    
    def get_system_schemas(self) -> set:
        """Get system schemas to exclude from introspection."""
        return set()  # SQLite doesn't have system schemas like other databases
    
    def _get_connect_args(self) -> Dict[str, Any]:
        """Get SQLite-specific connection arguments."""
        return {
            "check_same_thread": False,
            "timeout": 10
        }
    
    def _get_test_query(self) -> str:
        """Get SQLite-specific test query."""
        return "SELECT 1"
