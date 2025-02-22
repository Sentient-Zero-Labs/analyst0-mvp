from sqlalchemy import Column, Integer, Text, ForeignKey
from sqlalchemy.orm import relationship
from src.database import Base
from pgvector.sqlalchemy import Vector


class DataEntityExampleModel(Base):
    __tablename__ = 'data_entity_example'
    id = Column(Integer, primary_key=True)
    data_entity_id = Column(Integer, ForeignKey('data_entity.id'))
    query = Column(Text)
    description = Column(Text)
    embeddings = Vector(1536)
    data_entity = relationship('DataEntityModel', back_populates='examples')
