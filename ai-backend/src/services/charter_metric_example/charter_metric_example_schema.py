from pydantic import BaseModel


class CharterMetricExampleBase(BaseModel):
    query: str
    explanation: str


class CharterMetricExampleCreate(CharterMetricExampleBase):
    pass


class CharterMetricExampleUpdate(CharterMetricExampleBase):
    pass


class CharterMetricExampleResponse(CharterMetricExampleBase):
    id: int
    charter_metric_id: int

    class Config:
        from_attributes = True


class CharterMetricExampleExplainInput(BaseModel):
    query: str


class CharterMetricExampleExplainResponse(BaseModel):
    explanation: str
    query: str
