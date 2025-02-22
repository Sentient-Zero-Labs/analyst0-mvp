import enum

from sqlalchemy import Column, DateTime, Enum, Integer, String, func

from src.database import Base


class EarlyAccessUserUsageType(enum.Enum):
    TEAM_USE = "team_use"
    PERSONAL_USE = "personal_use"


class EarlyAccessUserUsageFeature(enum.Enum):
    SLACK_CHAT_FEATURE = "slack_chat_feature"
    PLATFORM_FEATURE = "playground_feature"
    BOTH = "both"


class EarlyAccessUserModel(Base):
    __tablename__ = "early_access_users"

    id = Column(Integer, primary_key=True)
    email = Column(String, nullable=False, unique=True)
    usage_type = Column(Enum(EarlyAccessUserUsageType))
    usage_feature = Column(Enum(EarlyAccessUserUsageFeature))
    explanation = Column(String)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
