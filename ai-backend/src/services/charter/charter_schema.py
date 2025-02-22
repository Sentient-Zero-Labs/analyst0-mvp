from typing import List, Optional

from pydantic import BaseModel

from src.services.data_source.data_source_schema import DataSourceListResponseItem


class CharterBase(BaseModel):
    name: str
    data_source_id: int
    data_entity_ids: List[int]
    slack_channel_ids: Optional[List[str]] = None
    example_questions: Optional[List[str]] = None


class CharterCreate(CharterBase):
    pass


class CharterUpdate(CharterBase):
    pass


class CharterResponse(CharterBase):
    id: int
    organisation_id: int
    data_source: DataSourceListResponseItem
    slack_channel_ids: List[str]

    class Config:
        from_attributes = True


class CharterListResponseItem(CharterBase):
    id: int
    organisation_id: int
    data_source: DataSourceListResponseItem
    metrics_count: int = 0
    examples_count: int = 0
    slack_channel_ids_count: int = 0

    class Config:
        from_attributes = True
