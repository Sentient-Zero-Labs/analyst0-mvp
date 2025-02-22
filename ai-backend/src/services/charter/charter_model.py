from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import JSONB

from src.database import Base


class CharterModel(Base):
    __tablename__ = "charter"

    id = Column(Integer, primary_key=True)
    name = Column(String(255))
    organisation_id = Column(Integer, ForeignKey("organisations.id"))
    data_source_id = Column(Integer, ForeignKey("data_source.id"))
    example_questions = Column(JSONB)


class CharterDataEntityModel(Base):
    __tablename__ = "charter_data_entity"

    id = Column(Integer, primary_key=True)
    charter_id = Column(Integer, ForeignKey("charter.id"), index=True)
    data_entity_id = Column(Integer, ForeignKey("data_entity.id"))
