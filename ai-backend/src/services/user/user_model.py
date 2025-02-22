from sqlalchemy import Boolean, Column, Integer, String

from src.database import Base


class UserModel(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    name = Column(String)
    hashed_password = Column(String, nullable=True)
    google_id = Column(String, unique=True, nullable=True)
    is_verified = Column(Boolean, default=False)
