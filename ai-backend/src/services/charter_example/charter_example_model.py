from pgvector.sqlalchemy import Vector
from sqlalchemy import Column, ForeignKey, Integer, Text

from src.database import Base


class CharterExampleModel(Base):
    __tablename__ = "charter_example"
    id = Column(Integer, primary_key=True)
    charter_id = Column(Integer, ForeignKey("charter.id"))
    query = Column(Text)
    explanation = Column(Text)
    embeddings = Column(Vector(1536))
