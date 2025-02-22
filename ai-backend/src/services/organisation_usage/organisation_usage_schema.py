from pydantic import BaseModel


class OrganisationUsageResponse(BaseModel):
    daily_small_credit_limit: int
    daily_large_credit_limit: int

    daily_small_credit_count: int
    daily_large_credit_count: int
