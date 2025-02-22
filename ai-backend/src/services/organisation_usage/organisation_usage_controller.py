from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.database import get_db
from src.middleware.wrap_response import DataResponse, DataResponseClass
from src.services.organisation.organisation_dependency import get_user_organisation
from src.services.organisation.organisation_model import OrganisationModel
from src.services.organisation_usage.organisation_usage_schema import OrganisationUsageResponse
from src.services.organisation_usage.organisation_usage_service import OrganisationUsageService

router = APIRouter(prefix="/organisation/{organisation_public_id}/usage")


@router.get("", response_model=DataResponseClass[OrganisationUsageResponse])
async def get_organisation_usage(
    organisation: OrganisationModel = Depends(get_user_organisation),
    db: Session = Depends(get_db),
):
    organisation_usage_limit = OrganisationUsageService.get_organisation_usage_limit(organisation.id, db)
    organisation_daily_usage = OrganisationUsageService.get_daily_organisation_usage(organisation.id, db)

    organisation_usage_response = OrganisationUsageResponse(
        daily_small_credit_limit=organisation_usage_limit.daily_small_credit_limit,
        daily_large_credit_limit=organisation_usage_limit.daily_large_credit_limit,
        daily_small_credit_count=organisation_daily_usage.small_credit_count,
        daily_large_credit_count=organisation_daily_usage.large_credit_count,
    )

    return DataResponse(data=organisation_usage_response)
