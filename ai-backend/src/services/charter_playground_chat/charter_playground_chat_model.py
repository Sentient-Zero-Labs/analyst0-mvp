from sqlalchemy import Column, DateTime, ForeignKey, Integer, func
from sqlalchemy.dialects.postgresql import JSONB

from src.database import Base


class CharterPlaygroundChatModel(Base):
    __tablename__ = "charter_playground_chat"

    id = Column(Integer, primary_key=True)
    charter_playground_id = Column(Integer, ForeignKey("charter_playground.id"))
    messages = Column(JSONB)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
