from typing import List, Optional

from pydantic import BaseModel, Field


class ColumnInfo(BaseModel):
    name: str
    type: str
    enum_values: Optional[List[str]] = None
    description: str = ""


class IndexInfo(BaseModel):
    name: str
    columns: List[str]


class ForeignKeyInfo(BaseModel):
    column: str
    referred_column: str
    referred_table_name: str
    description: str = ""


class DataEntityBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    schema_name: str | None = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    columns: List[ColumnInfo]
    indexes: List[IndexInfo]
    foreign_keys: List[ForeignKeyInfo]


class DataEntityCreate(DataEntityBase):
    data_source_id: Optional[int] = None
    organisation_id: Optional[int] = None


class DataEntityUpdate(DataEntityBase):
    pass


class DataEntityResponse(DataEntityBase):
    id: int
    data_source_id: int
    data_source_name: Optional[str] = None

    class Config:
        from_attributes = True
        exclude = {"data_source_name"}


class DataEntityListResponseItem(BaseModel):
    id: int
    name: str
    description: str | None
    schema_name: str
    organisation_id: int
    data_source_name: str
    data_source_id: int
    data_source_type: str
    columns: Optional[List[ColumnInfo]] = None
    indexes: Optional[List[IndexInfo]] = None
    foreign_keys: Optional[List[ForeignKeyInfo]] = None

    class Config:
        from_attributes = True
