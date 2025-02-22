from pydantic import BaseModel


class CharterExampleBase(BaseModel):
    query: str
    explanation: str


class CharterExampleCreate(CharterExampleBase):
    pass


class CharterExampleUpdate(CharterExampleBase):
    pass


class CharterExampleResponse(CharterExampleBase):
    id: int
    charter_id: int

    class Config:
        from_attributes = True


class CharterExampleExplainInput(BaseModel):
    query: str


class CharterExampleExplainResponse(BaseModel):
    explanation: str
    query: str
