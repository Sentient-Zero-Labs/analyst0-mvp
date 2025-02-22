from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session

from src.database import get_db
from src.services.charter_playground_chat.charter_playground_chat_schema import PlaygroundChatInput
from src.services.organisation.organisation_dependency import get_user_organisation
from src.services.organisation.organisation_model import OrganisationModel
from src.services.organisation_usage.organisation_usage_service import OrganisationUsageService
from src.settings import settings


def check_organisation_credit_usage_for_chat(
    organisation: OrganisationModel = Depends(get_user_organisation),
    db: Session = Depends(get_db),
):
    if settings.IS_BENCHMARK_MODE:
        return True

    organisation_usage_limit = OrganisationUsageService.get_organisation_usage_limit(organisation.id, db)
    organisation_daily_usage = OrganisationUsageService.get_daily_organisation_usage(organisation.id, db)

    if (organisation_daily_usage.large_credit_count + 2) > organisation_usage_limit.daily_large_credit_limit:
        raise HTTPException(
            status_code=429,
            detail="Your free daily credits for premium/large models has been exhausted.",
        )

    if (organisation_daily_usage.small_credit_count + 6) > organisation_usage_limit.daily_small_credit_limit:
        raise HTTPException(
            status_code=429,
            detail="Your free daily credits for small models has been exhausted.",
        )

    return True


def check_organisation_credit_usage_for_playground(
    playground_chat_input: PlaygroundChatInput,
    organisation: OrganisationModel = Depends(get_user_organisation),
    db: Session = Depends(get_db),
):
    if settings.IS_BENCHMARK_MODE:
        return True

    organisation_usage_limit = OrganisationUsageService.get_organisation_usage_limit(organisation.id, db)
    organisation_daily_usage = OrganisationUsageService.get_daily_organisation_usage(organisation.id, db)

    model_used = "large" if playground_chat_input.model_type == "large" else "small"

    if model_used == "large" and (
        (organisation_daily_usage.large_credit_count + 10) > organisation_usage_limit.daily_large_credit_limit
    ):
        raise HTTPException(
            status_code=429,
            detail="Your free daily credits for premium/large models has been exhausted. Please use small models instead.",
        )

    if model_used == "small" and (
        (organisation_daily_usage.small_credit_count + 1) > organisation_usage_limit.daily_small_credit_limit
    ):
        raise HTTPException(
            status_code=429,
            detail="Your free daily credits for small models has been exhausted.",
        )

    return True
