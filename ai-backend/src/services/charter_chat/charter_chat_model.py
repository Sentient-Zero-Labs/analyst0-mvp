from sqlalchemy import JSON, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.sql import func

from src.database import Base


class CharterChatConversationModel(Base):
    __tablename__ = "charter_chat_conversation"
    id = Column(Integer, primary_key=True)
    conversation_id = Column(String(255), unique=True, nullable=False)
    charter_id = Column(Integer, ForeignKey("charter.id"))
    messages = Column(JSON)  # Store the messages array as JSON
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
