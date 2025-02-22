from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


class DashboardQueryCreate(BaseModel):
    title: str
    description: Optional[str] = None
    query: str
    data_source_id: int
    query_metadata: Optional[dict] = None


class DashboardQueryUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    query: Optional[str] = None
    data_source_id: Optional[int] = None
    query_metadata: Optional[dict] = None


class DashboardQueryResponse(BaseModel):
    id: int
    dashboard_id: int
    data_source_id: int
    title: str
    description: Optional[str] = None
    query: str
    query_metadata: Optional[dict] = None
    created_at: datetime
    updated_at: datetime


class DashboardCreate(BaseModel):
    title: str
    description: Optional[str] = None
    tags: Optional[List[str]] = None


class DashboardUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[List[str]] = None


class DashboardResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    tags: Optional[List[str]] = None
    organisation_id: int
    created_at: datetime
    updated_at: datetime
    queries: Optional[List[DashboardQueryResponse]] = []

    class Config:
        from_attributes = True
        arbitrary_types_allowed = True
        populate_by_name = True


class DashboardListResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    tags: Optional[List[str]] = None
    organisation_id: int
    created_at: datetime
    updated_at: datetime
    query_count: int
