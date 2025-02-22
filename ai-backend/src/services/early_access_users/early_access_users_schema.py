from typing import Optional

from pydantic import BaseModel, EmailStr

from src.services.early_access_users.early_access_users_model import (
    EarlyAccessUserUsageFeature,
    EarlyAccessUserUsageType,
)


class EarlyAccessUserCreateSchema(BaseModel):
    email: EmailStr
    usage_type: Optional[EarlyAccessUserUsageType] = None
    usage_feature: Optional[EarlyAccessUserUsageFeature] = None
    explanation: Optional[str] = None
