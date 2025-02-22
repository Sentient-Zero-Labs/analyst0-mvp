from sqlalchemy import Column, Date, DateTime, ForeignKey, Integer, UniqueConstraint, func

from src.database import Base


class OrganisationUsageLimitModel(Base):
    __tablename__ = "organisation_usage_limits"

    id = Column(Integer, primary_key=True, index=True)
    organisation_id = Column(Integer, ForeignKey("organisations.id"), unique=True)

    daily_small_credit_limit = Column(Integer, default=100)
    daily_large_credit_limit = Column(Integer, default=20)

    monthly_small_credit_limit = Column(Integer, default=3000)
    monthly_large_credit_limit = Column(Integer, default=600)

    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())


class OrganisationMonthlyUsageModel(Base):
    __tablename__ = "organisation_monthly_usage"

    id = Column(Integer, primary_key=True, index=True)
    organisation_id = Column(Integer, ForeignKey("organisations.id"))

    month_start = Column(Date)
    month_end = Column(Date)

    small_credit_count = Column(Integer, default=0)
    large_credit_count = Column(Integer, default=0)

    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())


class OrganisationDailyUsageModel(Base):
    __tablename__ = "organisation_daily_usage"

    id = Column(Integer, primary_key=True, index=True)
    organisation_id = Column(Integer, ForeignKey("organisations.id"))
    date = Column(Date, default=func.date(func.now()))

    small_credit_count = Column(Integer, default=0)
    large_credit_count = Column(Integer, default=0)

    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    __table_args__ = (UniqueConstraint("organisation_id", "date", name="unique_organisation_id_date"),)
