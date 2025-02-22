from abc import ABC
from dataclasses import dataclass
from typing import Dict, List, Optional, Set, Tuple

from sqlglot import exp, parse_one

from src.settings import settings
from src.utils.logger import logger


@dataclass
class TableInfo:
    """Data class to store table information"""

    name: str
    columns: Set[str]


class SQLAnalyzerBase(ABC):
    """Base class for SQL query analysis"""

    def __init__(self):
        self.dialect = None
        self.supported_operations = {"SELECT", "INTERSECT", "UNION", "UNION ALL", "EXCEPT", "EXCEPT ALL"}

    def validate_query(self, sql_query: str) -> Tuple[bool, Optional[str]]:
        """
        Validate PostgreSQL/MySQL query
        Returns: (is_valid, error_message)
        """
        logger.info(f"Validating {self.dialect} query")
        try:
            # Try parsing
            parsed = self._parse_query(sql_query)

            # Check if the operation is supported
            operation = parsed.key
            if operation.upper() not in self.supported_operations:
                logger.warning("Unsupported operation: %s", operation)
                return False, f"Operation {operation} is not supported"

            # Additional validations can be added here for specific dialects
            logger.info("Query validation successful")
            return True, None
        except Exception as e:
            logger.error("Query validation failed: %s", str(e))
            return False, str(e)

    def extract_tables_columns(self, sql_query: str) -> Dict[str, TableInfo]:
        """
        Extract table and column information from the PostgreSQL/MySQL query.
        Returns: Dictionary mapping table names to their column information
        """
        parsed = self._parse_query(sql_query)
        table_info: Dict[str, TableInfo] = {}
        table_aliases_map: Dict[str, str] = {}

        # Extract table names
        for table in parsed.find_all(exp.Table):
            # Get the table name
            table_name = table.name

            # Skip if this is a CTE reference (i.e., the table name matches one of the CTEs)
            is_cte_reference = any(cte.alias_or_name == table_name for cte in parsed.find_all(exp.CTE))

            if not is_cte_reference:
                table_info[table_name] = TableInfo(name=table_name, columns=set())
                table_aliases_map[table.alias_or_name] = table_name

        for column in parsed.find_all(exp.Column):
            table = table_aliases_map.get(column.table)
            column_name = column.name

            if table and table in table_info:
                table_info[table].columns.add(column_name)

        return table_info

    def extract_table_names(self, sql_query: str) -> List[str]:
        """
        Extract table names from the PostgreSQL/MySQL query. This function is same
        for both dialects. For other dialects, we need to verify this.

        Returns: List of table names used in the query
        """
        logger.info(f"Extracting table names from {self.dialect} query")
        parsed = self._parse_query(sql_query)
        table_names = []

        for table in parsed.find_all(exp.Table):
            table_name = table.name

            # Skip if this is a CTE reference (i.e., the table name matches one of the CTEs)
            if not any(cte.alias_or_name == table_name for cte in parsed.find_all(exp.CTE)):
                table_names.append(table_name)

        return list(set(table_names))

    def format_query(self, sql_query: str) -> str:
        """Format PostgreSQL/Mysql query"""
        logger.info(f"Formatting {self.dialect} query")
        try:
            parsed = self._parse_query(sql_query)

            # Custom formatting options for PostgreSQL
            formatting_opts = {
                "indent": 4,  # 4 spaces
                "pretty": True,
            }

            formatted_query = parsed.sql(dialect=self.dialect, **formatting_opts)
            logger.info("Query formatting completed")
            return formatted_query
        except Exception as e:
            logger.error("Error formatting query: %s", str(e))
            return sql_query

    def has_limit(self, sql_query: str) -> bool:
        """
        Check if the SQL query has a LIMIT clause at the outermost level
        Returns: True if the query has a LIMIT clause, False otherwise
        """
        logger.info("Checking for LIMIT clause in query")
        try:
            parsed = self._parse_query(sql_query)

            # Check for LIMIT in the main query
            if parsed.find(exp.Limit):
                logger.info("LIMIT clause found in query")
                return True

            logger.info("No LIMIT clause found in query")
            return False
        except Exception as e:
            logger.error("Error checking for LIMIT clause: %s", str(e))
            return False

    def add_limit(self, sql_query: str, limit: int = settings.DEFAULT_QUERY_LIMIT) -> str:
        """
        Add a LIMIT clause to the query if it doesn't already have one.
        Args:
            sql_query: The SQL query string
            limit: The limit value to add
        Returns: Query string with LIMIT clause
        """
        logger.info("Adding LIMIT %d to query if not present", limit)
        try:
            # Check if query already has LIMIT
            if self.has_limit(sql_query):
                logger.info("Query already has LIMIT clause, returning unchanged")
                return sql_query

            # Remove trailing semicolon if present
            has_semicolon = sql_query.rstrip().endswith(";")
            query_without_semicolon = sql_query.rstrip().rstrip(";").strip()

            # Add LIMIT clause
            query_with_limit = f"{query_without_semicolon} LIMIT {limit}"

            # Add back semicolon if it was present
            return f"{query_with_limit};" if has_semicolon else query_with_limit

        except Exception as e:
            logger.error("Error adding LIMIT clause: %s", str(e))
            return sql_query

    def _parse_query(self, sql_query: str) -> exp.Expression:
        """Parse SQL query using appropriate dialect"""
        try:
            return parse_one(sql_query, dialect=self.dialect)
        except Exception as e:
            raise ValueError(f"Failed to parse SQL query: \n {sql_query} \nError: {str(e)}")
