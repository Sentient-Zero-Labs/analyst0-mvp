from pgvector.sqlalchemy import Vector
from sqlalchemy import Column, ForeignKey, Integer, Text

from src.database import Base


class CharterMetricExampleModel(Base):
    __tablename__ = "charter_metric_example"
    id = Column(Integer, primary_key=True)
    charter_metric_id = Column(Integer, ForeignKey("charter_metric.id"))
    query = Column(Text)
    explanation = Column(Text, default="")
    embeddings = Column(Vector(1536))
