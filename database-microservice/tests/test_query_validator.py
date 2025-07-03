"""Tests for query validator."""

import pytest
from core.query_validator import QueryValidator


class TestQueryValidator:
    """Test cases for QueryValidator."""
    
    def setup_method(self):
        """Setup test method."""
        self.validator = QueryValidator()
    
    def test_is_select_query_valid(self):
        """Test valid SELECT queries."""
        valid_queries = [
            "SELECT * FROM users",
            "select id, name from products",
            "SELECT COUNT(*) FROM orders WHERE status = 'active'",
            "SELECT u.name, p.title FROM users u JOIN posts p ON u.id = p.user_id",
        ]
        
        for query in valid_queries:
            assert self.validator.is_select_query(query), f"Query should be valid: {query}"
    
    def test_is_select_query_invalid(self):
        """Test invalid non-SELECT queries."""
        invalid_queries = [
            "INSERT INTO users (name) VALUES ('test')",
            "UPDATE users SET name = 'test'",
            "DELETE FROM users",
            "DROP TABLE users",
            "CREATE TABLE test (id INT)",
        ]
        
        for query in invalid_queries:
            assert not self.validator.is_select_query(query), f"Query should be invalid: {query}"
    
    def test_is_safe_query_valid(self):
        """Test safe queries."""
        safe_queries = [
            "SELECT * FROM users",
            "SELECT id, name FROM products WHERE price > 100",
            "SELECT COUNT(*) FROM orders",
        ]
        
        for query in safe_queries:
            assert self.validator.is_safe_query(query), f"Query should be safe: {query}"
    
    def test_is_safe_query_dangerous(self):
        """Test dangerous queries."""
        dangerous_queries = [
            "SELECT * FROM users; DROP TABLE users;",
            "SELECT * FROM users WHERE id = 1 OR 1=1 --",
            "SELECT * FROM users UNION SELECT * FROM passwords",
            "SELECT load_file('/etc/passwd')",
        ]
        
        for query in dangerous_queries:
            assert not self.validator.is_safe_query(query), f"Query should be dangerous: {query}"
    
    def test_extract_table_names(self):
        """Test table name extraction."""
        test_cases = [
            ("SELECT * FROM users", ["users"]),
            ("SELECT u.name FROM users u", ["users"]),
            ("SELECT * FROM users JOIN orders ON users.id = orders.user_id", ["users", "orders"]),
            ("SELECT * FROM schema.table_name", ["table_name"]),
        ]
        
        for query, expected_tables in test_cases:
            tables = self.validator.extract_table_names(query)
            assert set(tables) == set(expected_tables), f"Expected {expected_tables}, got {tables}"
    
    def test_add_limit_if_missing(self):
        """Test adding LIMIT clause."""
        test_cases = [
            ("SELECT * FROM users", "SELECT * FROM users LIMIT 100"),
            ("SELECT * FROM users;", "SELECT * FROM users LIMIT 100;"),
            ("SELECT * FROM users LIMIT 50", "SELECT * FROM users LIMIT 50"),
        ]
        
        for original, expected in test_cases:
            result = self.validator.add_limit_if_missing(original, 100)
            assert result == expected, f"Expected '{expected}', got '{result}'"
