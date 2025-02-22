from pydantic import BaseModel, Field


class CharterMetricBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    abbreviation: str = Field(..., min_length=1, max_length=20)
    description: str


class CharterMetricCreate(CharterMetricBase):
    pass


class CharterMetricUpdate(CharterMetricBase):
    pass


class CharterMetricResponse(CharterMetricBase):
    id: int
    charter_id: int

    class Config:
        from_attributes = True


class CharterMetricWithSimilarity(CharterMetricBase):
    id: int
    charter_id: int
    similarity: float

    class Config:
        from_attributes = True


class CharterMetricListResponseItem(BaseModel):
    id: int
    name: str
    abbreviation: str
    description: str
    charter_id: int
    example_count: int

    class Config:
        from_attributes = True


class CharterMetricDescribeInput(BaseModel):
    name: str
    abbreviation: str
    data_entity_ids: list[int]


class CharterMetricDescribeResponse(BaseModel):
    name: str
    abbreviation: str
    description: str
