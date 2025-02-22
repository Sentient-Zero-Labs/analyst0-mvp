from pydantic import BaseModel, Field
from typing import Optional

class DataEntityExampleBase(BaseModel):
    query: str
    description: Optional[str] = None

class DataEntityExampleCreate(DataEntityExampleBase):
    data_entity_id: int

class DataEntityExampleUpdate(DataEntityExampleBase):
    pass

class DataEntityExampleResponse(DataEntityExampleBase):
    id: int
    data_entity_id: int

    class Config:
        from_attributes = True

class DataEntityExampleListResponseItem(BaseModel):
    id: int
    query: str

    class Config:
        from_attributes = True

