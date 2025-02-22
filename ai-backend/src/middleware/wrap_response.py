from typing import Any, Generic, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class DataResponseClass(BaseModel, Generic[T]):
    data: T
    error: str | None = None

    class Config:
        from_attributes = True


class DataResponse(BaseModel):
    data: Any
    error: str | None = None

    # def __init__(self, data: Any):
    #     self.data = data
