from sqlalchemy import Column, ForeignKey, Integer, String

from src.database import Base


class CharterSlackChannelModel(Base):
    __tablename__ = "charter_slack_channel"
    id = Column(Integer, primary_key=True)
    charter_id = Column(Integer, ForeignKey("charter.id"), index=True)
    slack_channel_id = Column(String(255), nullable=False, index=True)
