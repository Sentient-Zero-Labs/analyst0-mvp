
from sqlalchemy import Column, ForeignKey, Integer, String, UniqueConstraint

from src.database import Base


class OrganisationSlackBotModel(Base):
    __tablename__ = "organisation_slack_bot"
    id = Column(Integer, primary_key=True)
    organisation_id = Column(Integer, ForeignKey("organisations.id"), index=True)
    enterprise_id = Column(String(255))
    team_id = Column(String(255), nullable=False, index=True)
    bot_user_id = Column(String(255), nullable=False, index=True)
    bot_token = Column(String(255), nullable=False)

    # Unique index on organisation_id and team_id
    __table_args__ = (UniqueConstraint('organisation_id', 'team_id', name='uix_organisation_slack_bot'),)
