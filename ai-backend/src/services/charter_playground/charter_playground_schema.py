from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


# Charter Playground CRUD operations schema
class CharterPlaygroundCreate(BaseModel):
    charter_id: int
    user_id: int


class CharterPlaygroundUpdate(BaseModel):
    query: Optional[str]
    name: Optional[str]


class CharterPlaygroundResponse(BaseModel):
    charter_id: int
    user_id: int
    public_id: str
    name: str
    query: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ExecuteCharterPlaygroundQuery(BaseModel):
    query: str
    limit: Optional[int] = None


class ExecuteCharterPlaygroundResponse(BaseModel):
    data: Optional[List[dict]]
    error: Optional[str]
