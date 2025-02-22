from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, func

from src.database import Base
from src.utils.uuid import generate_uuid


class CharterPlaygroundModel(Base):
    __tablename__ = "charter_playground"

    id = Column(Integer, primary_key=True)
    charter_id = Column(Integer, ForeignKey("charter.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    public_id = Column(String(30), unique=True, index=True, default=generate_uuid)
    name = Column(String)
    query = Column(String)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
