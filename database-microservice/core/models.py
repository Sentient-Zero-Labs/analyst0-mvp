"""Pydantic models for the database microservice."""

from typing import Dict, Any, List, Optional, Union
from enum import Enum
from pydantic import BaseModel, Field, validator


class DatabaseType(str, Enum):
    """Supported database types."""
    POSTGRES = "postgres"
    MYSQL = "mysql"
    SNOWFLAKE = "snowflake"
    SQLITE = "sqlite"


class PostgresConfig(BaseModel):
    """PostgreSQL database configuration."""
    host: str
    port: int = 5432
    database: str
    username: str
    password: str
    ssl_mode: str = "require"


class MySQLConfig(BaseModel):
    """MySQL database configuration."""
    host: str
    port: int = 3306
    database: str
    username: str
    password: str
    ssl_ca: Optional[str] = None


class SnowflakeConfig(BaseModel):
    """Snowflake database configuration."""
    account_identifier: str
    username: str
    password: str
    database: str
    warehouse: str
    schema: Optional[str] = None
    role: Optional[str] = None


class SQLiteConfig(BaseModel):
    """SQLite database configuration."""
    database_path: str


class DatabaseConfig(BaseModel):
    """Database configuration model."""
    name: str = Field(..., description="Unique name for the database")
    type: DatabaseType = Field(..., description="Database type")
    config: Union[PostgresConfig, MySQLConfig, SnowflakeConfig, SQLiteConfig] = Field(
        ..., description="Database-specific configuration"
    )
    
    @validator('name')
    def validate_name(cls, v):
        """Validate database name."""
        if not v or not v.strip():
            raise ValueError("Database name cannot be empty")
        if not v.replace('_', '').replace('-', '').isalnum():
            raise ValueError("Database name can only contain letters, numbers, hyphens, and underscores")
        return v.strip()


class QueryRequest(BaseModel):
    """Query execution request."""
    query: str = Field(..., description="SQL query to execute")
    params: Optional[Dict[str, Any]] = Field(default=None, description="Query parameters")
    limit: Optional[int] = Field(default=None, description="Result limit", ge=1, le=10000)
    timeout: Optional[int] = Field(default=None, description="Query timeout in seconds", ge=1, le=300)


class QueryResult(BaseModel):
    """Query execution result."""
    data: Optional[List[Dict[str, Any]]] = Field(default=None, description="Query result data")
    columns: List[str] = Field(default=[], description="Column names")
    row_count: int = Field(default=0, description="Number of rows returned")
    execution_time: float = Field(default=0.0, description="Execution time in seconds")
    status: str = Field(default="success", description="Execution status")
    error: Optional[str] = Field(default=None, description="Error message if failed")


class ConnectionTestResult(BaseModel):
    """Database connection test result."""
    success: bool = Field(..., description="Whether connection was successful")
    message: str = Field(..., description="Connection test message")
    response_time: float = Field(default=0.0, description="Connection response time in seconds")


class DatabaseInfo(BaseModel):
    """Database information (without sensitive config)."""
    name: str
    type: DatabaseType
    status: str = "unknown"
    last_tested: Optional[str] = None


class TableInfo(BaseModel):
    """Database table information."""
    name: str
    schema: Optional[str] = None
    type: str = "table"
    comment: Optional[str] = None


class ColumnInfo(BaseModel):
    """Database column information."""
    name: str
    type: str
    nullable: bool = True
    default: Optional[str] = None
    comment: Optional[str] = None


class SchemaInfo(BaseModel):
    """Database schema information."""
    tables: List[TableInfo] = []
    total_tables: int = 0


class ServiceInfo(BaseModel):
    """Service information."""
    name: str = "Database Microservice"
    version: str = "1.0.0"
    status: str = "running"
    databases_count: int = 0
    supported_types: List[str] = [db_type.value for db_type in DatabaseType]


class HealthCheck(BaseModel):
    """Health check response."""
    status: str = "healthy"
    timestamp: str
    version: str = "1.0.0"
    uptime: float = 0.0
