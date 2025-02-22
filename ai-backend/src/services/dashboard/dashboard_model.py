from datetime import datetime
from typing import List

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.dialects.postgresql import ARRAY, JSONB
from sqlalchemy.orm import Mapped, relationship

from src.database import Base


class DashboardModel(Base):
    __tablename__ = "dashboard"

    id = Column(Integer, primary_key=True)
    title = Column(String, nullable=False)
    description = Column(String)
    tags = Column(ARRAY(String))
    organisation_id = Column(Integer, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    deleted_at = Column(DateTime)

    queries: Mapped[List["DashboardQueryModel"]] = relationship(
        "DashboardQueryModel",
        back_populates="dashboard",
        lazy="selectin",
        cascade="all, delete-orphan",
    )

    def soft_delete(self):
        self.deleted_at = datetime.utcnow()


class DashboardQueryModel(Base):
    __tablename__ = "dashboard_query"

    id = Column(Integer, primary_key=True)
    dashboard_id = Column(Integer, ForeignKey("dashboard.id"), nullable=False)
    data_source_id = Column(Integer, nullable=False)
    title = Column(String, nullable=False)
    description = Column(String)
    query = Column(String, nullable=False)
    query_metadata = Column(JSONB)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    deleted_at = Column(DateTime)

    dashboard: Mapped["DashboardModel"] = relationship(
        "DashboardModel",
        back_populates="queries",
        lazy="selectin",
    )

    def soft_delete(self):
        self.deleted_at = datetime.utcnow()
