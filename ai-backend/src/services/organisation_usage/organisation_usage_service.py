from sqlalchemy import func
from sqlalchemy.orm import Session

from src.services.organisation_usage.organisation_usage_model import (
    OrganisationDailyUsageModel,
    OrganisationUsageLimitModel,
)


class OrganisationUsageService:
    @staticmethod
    def get_organisation_usage_limit(organisation_id: int, db: Session):
        organisation_usage_limit = (
            db.query(OrganisationUsageLimitModel)
            .filter(OrganisationUsageLimitModel.organisation_id == organisation_id)
            .first()
        )

        # If the organisation usage limit does not exist, create a new one
        if not organisation_usage_limit:
            organisation_usage_limit = OrganisationUsageLimitModel(organisation_id=organisation_id)
            db.add(organisation_usage_limit)
            db.commit()
            db.refresh(organisation_usage_limit)

        return organisation_usage_limit

    @staticmethod
    def get_daily_organisation_usage(organisation_id: int, db: Session):
        organisation_daily_usage = (
            db.query(OrganisationDailyUsageModel)
            .filter(
                OrganisationDailyUsageModel.organisation_id == organisation_id,
                OrganisationDailyUsageModel.date == func.date(func.now()),
            )
            .first()
        )

        # If the organisation daily usage does not exist, create a new one
        if not organisation_daily_usage:
            organisation_daily_usage = OrganisationDailyUsageModel(organisation_id=organisation_id)
            db.add(organisation_daily_usage)
            db.commit()
            db.refresh(organisation_daily_usage)

        return organisation_daily_usage

    @staticmethod
    def update_daily_organisation_usage(
        organisation_id: int,
        db: Session,
        small_credit_count: int = 0,
        large_credit_count: int = 0,
    ):
        daily_usage = OrganisationUsageService.get_daily_organisation_usage(organisation_id, db)

        daily_usage.small_credit_count += small_credit_count
        daily_usage.large_credit_count += large_credit_count

        db.commit()
