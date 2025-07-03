"""SQL query validation for security and safety."""

import re
import sqlparse
from typing import List
import structlog

logger = structlog.get_logger()


class QueryValidator:
    """Validates SQL queries for security and safety."""
    
    # Dangerous SQL keywords that should not be allowed
    DANGEROUS_KEYWORDS = {
        'INSERT', 'UPDATE', 'DELETE', 'DROP', 'CREATE', 'ALTER', 'TRUNCATE',
        'GRANT', 'REVOKE', 'EXEC', 'EXECUTE', 'CALL', 'MERGE', 'REPLACE',
        'LOAD', 'BULK', 'COPY', 'IMPORT', 'EXPORT'
    }
    
    # Potentially dangerous functions
    DANGEROUS_FUNCTIONS = {
        'xp_cmdshell', 'sp_configure', 'openrowset', 'opendatasource',
        'load_file', 'into outfile', 'into dumpfile', 'system', 'shell'
    }
    
    def is_select_query(self, query: str) -> bool:
        """Check if query is a SELECT statement."""
        try:
            # Parse the query
            parsed = sqlparse.parse(query.strip())
            
            if not parsed:
                return False
            
            # Get the first statement
            statement = parsed[0]
            
            # Check if it's a SELECT statement
            first_token = None
            for token in statement.flatten():
                if token.ttype is None and token.value.upper() not in ('', ' ', '\n', '\t'):
                    first_token = token.value.upper()
                    break
                elif token.ttype in (sqlparse.tokens.Keyword, sqlparse.tokens.Keyword.DML):
                    first_token = token.value.upper()
                    break
            
            is_select = first_token == 'SELECT'
            
            if not is_select:
                logger.warning("Non-SELECT query attempted", query_start=query[:100])
            
            return is_select
            
        except Exception as e:
            logger.error("Error parsing query for SELECT validation", error=str(e))
            return False
    
    def is_safe_query(self, query: str) -> bool:
        """Check if query is safe (no dangerous operations)."""
        try:
            query_upper = query.upper()
            
            # Check for dangerous keywords
            for keyword in self.DANGEROUS_KEYWORDS:
                if re.search(r'\b' + keyword + r'\b', query_upper):
                    logger.warning("Dangerous keyword detected", keyword=keyword, query_start=query[:100])
                    return False
            
            # Check for dangerous functions
            for func in self.DANGEROUS_FUNCTIONS:
                if func.upper() in query_upper:
                    logger.warning("Dangerous function detected", function=func, query_start=query[:100])
                    return False
            
            # Check for comment-based SQL injection attempts
            if self._has_suspicious_comments(query):
                logger.warning("Suspicious comments detected", query_start=query[:100])
                return False
            
            # Check for multiple statements (basic check)
            if self._has_multiple_statements(query):
                logger.warning("Multiple statements detected", query_start=query[:100])
                return False
            
            return True
            
        except Exception as e:
            logger.error("Error validating query safety", error=str(e))
            return False
    
    def _has_suspicious_comments(self, query: str) -> bool:
        """Check for suspicious SQL comments that might indicate injection."""
        # Look for comment patterns that might be used for SQL injection
        suspicious_patterns = [
            r'--\s*\w+',  # Comments followed by words (potential injection)
            r'/\*.*\*/',  # Block comments
            r'#\s*\w+',   # MySQL-style comments followed by words
        ]
        
        for pattern in suspicious_patterns:
            if re.search(pattern, query, re.IGNORECASE | re.DOTALL):
                return True
        
        return False
    
    def _has_multiple_statements(self, query: str) -> bool:
        """Check if query contains multiple statements."""
        try:
            # Parse the query
            parsed = sqlparse.parse(query)
            
            # Count non-empty statements
            statement_count = 0
            for statement in parsed:
                # Check if statement has meaningful content
                has_content = False
                for token in statement.flatten():
                    if token.ttype is None and token.value.strip():
                        has_content = True
                        break
                    elif token.ttype in (sqlparse.tokens.Keyword, sqlparse.tokens.Name):
                        has_content = True
                        break
                
                if has_content:
                    statement_count += 1
            
            return statement_count > 1
            
        except Exception:
            # If parsing fails, be conservative and check for semicolons
            # Remove string literals first to avoid false positives
            cleaned_query = re.sub(r"'[^']*'", "", query)
            cleaned_query = re.sub(r'"[^"]*"', "", cleaned_query)
            
            # Count semicolons (basic check)
            semicolon_count = cleaned_query.count(';')
            
            # Allow one trailing semicolon
            if cleaned_query.strip().endswith(';'):
                semicolon_count -= 1
            
            return semicolon_count > 0
    
    def extract_table_names(self, query: str) -> List[str]:
        """Extract table names from the query."""
        try:
            # Parse the query
            parsed = sqlparse.parse(query)
            
            if not parsed:
                return []
            
            table_names = []
            
            # Simple extraction - look for FROM and JOIN clauses
            tokens = list(parsed[0].flatten())
            
            i = 0
            while i < len(tokens):
                token = tokens[i]
                
                if token.ttype is sqlparse.tokens.Keyword and token.value.upper() in ('FROM', 'JOIN'):
                    # Look for the next identifier
                    j = i + 1
                    while j < len(tokens):
                        next_token = tokens[j]
                        
                        if next_token.ttype is None and next_token.value.strip():
                            # This might be a table name
                            table_name = next_token.value.strip()
                            
                            # Remove schema prefix if present
                            if '.' in table_name:
                                table_name = table_name.split('.')[-1]
                            
                            # Remove quotes if present
                            table_name = table_name.strip('"\'`')
                            
                            if table_name and table_name not in table_names:
                                table_names.append(table_name)
                            
                            break
                        
                        j += 1
                
                i += 1
            
            return table_names
            
        except Exception as e:
            logger.error("Error extracting table names", error=str(e))
            return []
    
    def add_limit_if_missing(self, query: str, limit: int) -> str:
        """Add LIMIT clause to query if not present."""
        try:
            query_upper = query.upper()
            
            # Check if LIMIT already exists
            if 'LIMIT' in query_upper:
                return query
            
            # Remove trailing semicolon if present
            query = query.strip()
            has_semicolon = query.endswith(';')
            if has_semicolon:
                query = query[:-1].strip()
            
            # Add LIMIT clause
            query_with_limit = f"{query} LIMIT {limit}"
            
            # Add back semicolon if it was present
            if has_semicolon:
                query_with_limit += ";"
            
            return query_with_limit
            
        except Exception as e:
            logger.error("Error adding LIMIT clause", error=str(e))
            return query
