import enum

from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, String, func

from src.database import Base
from src.utils.uuid import generate_uuid


class OrganisationUserRoleEnum(enum.Enum):
    ADMIN = "admin"
    USER = "user"


class OrganisationModel(Base):
    __tablename__ = "organisations"

    id = Column(Integer, primary_key=True, index=True)
    public_id = Column(String(30), unique=True, index=True, default=generate_uuid)
    name = Column(String, nullable=False)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())


class OrganisationUserModel(Base):
    __tablename__ = "organisation_users"

    id = Column(Integer, primary_key=True, index=True)
    organisation_id = Column(Integer, ForeignKey("organisations.id"), index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    role = Column(Enum(OrganisationUserRoleEnum), nullable=False, default=OrganisationUserRoleEnum.ADMIN)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
