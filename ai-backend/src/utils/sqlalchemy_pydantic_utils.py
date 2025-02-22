from typing import List, Type, TypeVar

from pydantic import BaseModel

from src.database import Base

# Define a TypeVar for a Pydantic model
PydanticModel = TypeVar("PydanticModel", bound=BaseModel)
SqlalchemyModel = TypeVar("SqlalchemyModel", bound=Base)


def to_pydantic(sqlalchemy_instance: Base, pydantic_model: Type[PydanticModel]) -> PydanticModel:
    # Use model_validate to create a Pydantic model instance from the dictionary
    return pydantic_model.model_validate(sqlalchemy_instance)


def to_pydantic_list(sqlalchemy_instances: List[Base], pydantic_model: Type[PydanticModel]) -> List[PydanticModel]:
    return [to_pydantic(instance, pydantic_model) for instance in sqlalchemy_instances]


def to_sqlalchemy(
    sqlalchemy_instance: SqlalchemyModel,
    pydantic_model: Type[PydanticModel],
) -> SqlalchemyModel:
    # Get only the fields that exist in the SQLAlchemy model
    model_data = pydantic_model.model_dump()
    valid_fields = sqlalchemy_instance.__table__.columns.keys()
    filtered_data = {k: v for k, v in model_data.items() if k in valid_fields}

    return sqlalchemy_instance(**filtered_data)


def to_sqlalchemy_list(
    pydantic_instances: List[PydanticModel], sqlalchemy_model: Type[SqlalchemyModel]
) -> List[SqlalchemyModel]:
    return [to_sqlalchemy(instance, sqlalchemy_model) for instance in pydantic_instances]


def pydantic_to_json(pydantic_instance: PydanticModel) -> dict:
    return pydantic_instance.model_dump()


def pydantic_list_to_json_list(pydantic_instances: List[PydanticModel]) -> List[dict]:
    return [pydantic_to_json(instance) for instance in pydantic_instances]
