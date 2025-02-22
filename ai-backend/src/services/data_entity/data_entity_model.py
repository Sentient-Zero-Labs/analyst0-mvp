from pgvector.sqlalchemy import Vector
from sqlalchemy import Column, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from src.database import Base


class DataEntityModel(Base):
    __tablename__ = "data_entity"
    __table_args__ = (
        UniqueConstraint("data_source_id", "schema_name", "name", name="_data_source_id_schema_name_name_uc"),
    )

    id = Column(Integer, primary_key=True)
    data_source_id = Column(Integer, ForeignKey("data_source.id"), index=True)
    organisation_id = Column(Integer, ForeignKey("organisations.id"), index=True)
    name = Column(String(255))
    schema_name = Column(String(255))
    description = Column(Text)
    columns = Column(JSONB)
    indexes = Column(JSONB)
    foreign_keys = Column(JSONB)
    embeddings = Column(Vector(1536))
    examples = relationship("DataEntityExampleModel", back_populates="data_entity")
