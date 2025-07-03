"""Snowflake database connector."""

from typing import Dict, Any
from core.connectors.base import BaseConnector


class SnowflakeConnector(BaseConnector):
    """Snowflake database connector."""
    
    def get_dialect(self) -> str:
        """Get the database dialect."""
        return "snowflake"
    
    def get_system_schemas(self) -> set:
        """Get system schemas to exclude from introspection."""
        return {"information_schema"}
    
    def _get_connect_args(self) -> Dict[str, Any]:
        """Get Snowflake-specific connection arguments."""
        return {
            "sslmode": "require",
            "session_parameters": {
                "QUOTED_IDENTIFIERS_IGNORE_CASE": True
            }
        }
    
    def _get_test_query(self) -> str:
        """Get Snowflake-specific test query."""
        return "SELECT 1"
