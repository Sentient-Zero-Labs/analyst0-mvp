from sqlalchemy import Column, Integer, String, Text, ForeignKey
from src.database import Base
from pgvector.sqlalchemy import Vector


class CharterMetricModel(Base):
    __tablename__ = 'charter_metric'
    id = Column(Integer, primary_key=True)
    charter_id = Column(Integer, ForeignKey('charter.id'))
    name = Column(String(255))
    abbreviation = Column(String(20))
    description = Column(Text)
    embeddings = Column(Vector(1536))
