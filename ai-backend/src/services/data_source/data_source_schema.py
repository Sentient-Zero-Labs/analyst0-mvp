from pydantic import BaseModel, Field

from src.services.data_source.data_source_config_schema import (
    MySQLConfig,
    PostgresConfig,
    SnowflakeConfig,
    SQLiteConfig,
)
from src.services.data_source.data_source_model import DataSourceType


class DataSourceBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    type: DataSourceType
    config: PostgresConfig | MySQLConfig | SnowflakeConfig | SQLiteConfig


class DataSourceCreate(DataSourceBase):
    pass


class DataSourceUpdate(DataSourceBase):
    pass


class DataSourceListResponseItem(BaseModel):
    id: int
    organisation_id: int
    name: str
    type: DataSourceType

    class Config:
        from_attributes = True


class DataSourceResponse(DataSourceBase):
    id: int
    organisation_id: int

    class Config:
        from_attributes = True
