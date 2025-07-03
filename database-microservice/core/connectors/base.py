"""Base database connector class."""

import asyncio
import time
from abc import ABC, abstractmethod
from typing import Dict, Any, List, Tuple, Optional
import structlog
from sqlalchemy import create_engine, text
from sqlalchemy.engine.reflection import Inspector
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import QueuePool

from config import settings
from core.exceptions import DatabaseConnectionError, QueryExecutionError
from core.models import QueryResult, ConnectionTestResult, TableInfo, ColumnInfo
from core.query_validator import QueryValidator


logger = structlog.get_logger()


class BaseConnector(ABC):
    """Base class for database connectors."""
    
    def __init__(self, name: str, connection_url: str):
        self.name = name
        self.connection_url = connection_url
        self.engine = None
        self.Session = None
        self.inspector = None
        self.query_validator = QueryValidator()
        self._setup_connection()
    
    @abstractmethod
    def get_dialect(self) -> str:
        """Get the database dialect."""
        pass
    
    @abstractmethod
    def get_system_schemas(self) -> set:
        """Get system schemas to exclude from introspection."""
        pass
    
    def _setup_connection(self):
        """Setup database connection with pooling."""
        try:
            connect_args = self._get_connect_args()
            
            self.engine = create_engine(
                self.connection_url,
                execution_options={"readonly": True},
                connect_args=connect_args,
                poolclass=QueuePool,
                pool_size=settings.max_connections,
                max_overflow=3,
                pool_timeout=settings.connection_timeout,
                pool_pre_ping=True,
                echo=settings.debug
            )
            
            self.Session = sessionmaker(bind=self.engine)
            self.inspector = Inspector.from_engine(self.engine)
            
            logger.info("Database connection setup completed", database=self.name, dialect=self.get_dialect())
            
        except Exception as e:
            logger.error("Failed to setup database connection", database=self.name, error=str(e))
            raise DatabaseConnectionError(f"Failed to setup connection for {self.name}: {str(e)}")
    
    @abstractmethod
    def _get_connect_args(self) -> Dict[str, Any]:
        """Get database-specific connection arguments."""
        pass
    
    async def test_connection(self) -> ConnectionTestResult:
        """Test database connection."""
        start_time = time.time()
        
        try:
            test_query = self._get_test_query()
            
            with self.engine.connect() as connection:
                connection.execute(text(test_query))
            
            response_time = time.time() - start_time
            
            logger.info("Connection test successful", database=self.name, response_time=response_time)
            
            return ConnectionTestResult(
                success=True,
                message="Connection successful",
                response_time=response_time
            )
            
        except Exception as e:
            response_time = time.time() - start_time
            error_message = f"Connection failed: {str(e)}"
            
            logger.error("Connection test failed", database=self.name, error=str(e))
            
            return ConnectionTestResult(
                success=False,
                message=error_message,
                response_time=response_time
            )
    
    @abstractmethod
    def _get_test_query(self) -> str:
        """Get database-specific test query."""
        pass
    
    async def execute_query(self, query: str, params: Optional[Dict[str, Any]] = None, timeout: Optional[int] = None) -> QueryResult:
        """Execute a SQL query."""
        start_time = time.time()
        
        try:
            # Validate query
            if not self.query_validator.is_select_query(query):
                raise QueryExecutionError("Only SELECT queries are allowed")
            
            if not self.query_validator.is_safe_query(query):
                raise QueryExecutionError("Query contains potentially unsafe operations")
            
            # Set timeout
            query_timeout = timeout or settings.query_timeout
            
            # Execute query in thread pool
            loop = asyncio.get_running_loop()
            result = await asyncio.wait_for(
                loop.run_in_executor(None, self._execute_query_sync, query, params or {}),
                timeout=query_timeout
            )
            
            execution_time = time.time() - start_time
            
            logger.info("Query executed successfully", 
                       database=self.name, 
                       execution_time=execution_time,
                       row_count=len(result['data']) if result['data'] else 0)
            
            return QueryResult(
                data=result['data'],
                columns=result['columns'],
                row_count=len(result['data']) if result['data'] else 0,
                execution_time=execution_time,
                status="success"
            )
            
        except asyncio.TimeoutError:
            execution_time = time.time() - start_time
            error_message = f"Query execution timed out after {query_timeout} seconds"
            
            logger.error("Query timeout", database=self.name, timeout=query_timeout)
            
            return QueryResult(
                execution_time=execution_time,
                status="timeout",
                error=error_message
            )
            
        except Exception as e:
            execution_time = time.time() - start_time
            error_message = f"Query execution failed: {str(e)}"
            
            logger.error("Query execution failed", database=self.name, error=str(e))
            
            return QueryResult(
                execution_time=execution_time,
                status="error",
                error=error_message
            )
    
    def _execute_query_sync(self, query: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Execute query synchronously in thread pool."""
        with self.engine.connect().execution_options(readonly=True) as connection:
            result = connection.execute(text(query), params)
            columns = list(result.keys())
            
            # Handle duplicate column names
            unique_columns = []
            column_counts = {}
            
            for col in columns:
                if col in column_counts:
                    column_counts[col] += 1
                    unique_columns.append(f"{col}_{column_counts[col]}")
                else:
                    column_counts[col] = 0
                    unique_columns.append(col)
            
            # Convert rows to dictionaries
            data = []
            for row in result:
                row_dict = {}
                for i, value in enumerate(row):
                    # Convert non-serializable types
                    if value is not None:
                        if hasattr(value, 'isoformat'):  # datetime objects
                            value = value.isoformat()
                        elif hasattr(value, '__str__') and not isinstance(value, (str, int, float, bool)):
                            value = str(value)
                    
                    row_dict[unique_columns[i]] = value
                
                data.append(row_dict)
            
            return {
                'data': data,
                'columns': unique_columns
            }
    
    async def get_tables(self) -> List[TableInfo]:
        """Get list of tables in the database."""
        try:
            loop = asyncio.get_running_loop()
            tables = await loop.run_in_executor(None, self._get_tables_sync)
            
            logger.info("Retrieved table list", database=self.name, table_count=len(tables))
            return tables
            
        except Exception as e:
            logger.error("Failed to get table list", database=self.name, error=str(e))
            raise QueryExecutionError(f"Failed to get tables: {str(e)}")
    
    def _get_tables_sync(self) -> List[TableInfo]:
        """Get tables synchronously."""
        tables = []
        system_schemas = self.get_system_schemas()
        
        for schema_name in self.inspector.get_schema_names():
            if schema_name.lower() in system_schemas:
                continue
                
            for table_name in self.inspector.get_table_names(schema=schema_name):
                tables.append(TableInfo(
                    name=table_name,
                    schema=schema_name,
                    type="table"
                ))
        
        return tables
    
    async def get_table_columns(self, table_name: str, schema: Optional[str] = None) -> List[ColumnInfo]:
        """Get columns for a specific table."""
        try:
            loop = asyncio.get_running_loop()
            columns = await loop.run_in_executor(None, self._get_table_columns_sync, table_name, schema)
            
            logger.info("Retrieved table columns", database=self.name, table=table_name, column_count=len(columns))
            return columns
            
        except Exception as e:
            logger.error("Failed to get table columns", database=self.name, table=table_name, error=str(e))
            raise QueryExecutionError(f"Failed to get columns for table {table_name}: {str(e)}")
    
    def _get_table_columns_sync(self, table_name: str, schema: Optional[str] = None) -> List[ColumnInfo]:
        """Get table columns synchronously."""
        columns = []
        
        for column in self.inspector.get_columns(table_name, schema=schema):
            columns.append(ColumnInfo(
                name=column['name'],
                type=str(column['type']),
                nullable=column.get('nullable', True),
                default=str(column.get('default')) if column.get('default') is not None else None
            ))
        
        return columns
    
    def close(self):
        """Close database connection."""
        try:
            if self.Session:
                self.Session.close_all()
            if self.engine:
                self.engine.dispose()
            
            logger.info("Database connection closed", database=self.name)
            
        except Exception as e:
            logger.error("Error closing database connection", database=self.name, error=str(e))
