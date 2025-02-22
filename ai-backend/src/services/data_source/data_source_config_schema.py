from typing import Optional

from pydantic import BaseModel, Field, field_validator


def trim_and_validate_space(v):
    v = v.strip() if v else None
    if v and " " in v:
        raise ValueError("must not contain spaces")
    return v


# Postgres Config
class PostgresConfig(BaseModel):
    host: str = Field(..., description="Database host")
    port: int = Field(default=5432, description="Database port")
    database: str = Field(..., description="Database name")
    username: str = Field(..., description="Database username")
    password: str = Field(..., description="Database password")
    ssl_mode: Optional[str] = Field(default="require", description="SSL mode")
    connect_timeout: Optional[int] = Field(default=10, description="Connection timeout in seconds")

    @field_validator("username", "database", "host")
    def trim_and_validate_space(cls, v):
        return trim_and_validate_space(v)


# MySQL Config
class MySQLConfig(BaseModel):
    host: str = Field(..., description="Database host")
    port: int = Field(default=3306, description="Database port")
    database: str = Field(..., description="Database name")
    username: str = Field(..., description="Database username")
    password: str = Field(..., description="Database password")
    ssl_ca: Optional[str] = Field(default=None, description="SSL CA certificate path")
    connect_timeout: Optional[int] = Field(default=10, description="Connection timeout in seconds")

    @field_validator("username", "database", "host")
    def trim_and_validate_space(cls, v):
        return trim_and_validate_space(v)


# Snowflake Config
class SnowflakeConfig(BaseModel):
    account_identifier: str = Field(..., description="Snowflake account identifier")
    warehouse: str = Field(..., description="Warehouse name")
    database: str = Field(..., description="Database name")
    username: str = Field(..., description="Username")
    password: str = Field(..., description="Password")
    role: Optional[str] = Field(default=None, description="Role name")
    schema: Optional[str] = Field(default=None, description="Schema name")

    @field_validator("account_identifier", "warehouse", "database", "username")
    def trim_and_validate_space(cls, v):
        return trim_and_validate_space(v)


class SQLiteConfig(BaseModel):
    database_path: str = Field(..., description="SQLite database path. Can only be used by ")
