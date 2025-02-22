from fastapi import APIRouter, Depends
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from src.database import get_db
from src.internal_services.slack.slack_service import send_early_access_user_to_slack
from src.middleware.wrap_response import DataResponse
from src.services.early_access_users.early_access_users_model import EarlyAccessUserModel
from src.services.early_access_users.early_access_users_schema import EarlyAccessUserCreateSchema

router = APIRouter(prefix="/early-access-users")


@router.post("")
async def create_early_access_user(
    early_access_user_create_schema: EarlyAccessUserCreateSchema, db: Session = Depends(get_db)
):
    # Only allow certain users to create early access entries
    new_early_access_user = EarlyAccessUserModel(**early_access_user_create_schema.model_dump())

    db.add(new_early_access_user)

    try:
        db.commit()

        send_early_access_user_to_slack(early_access_user_create_schema)

        return DataResponse(data="success")
    except IntegrityError:
        db.rollback()
        # Update the existing record with new values if email already exists
        existing_user = (
            db.query(EarlyAccessUserModel)
            .filter(EarlyAccessUserModel.email == early_access_user_create_schema.email)
            .first()
        )

        if existing_user and early_access_user_create_schema.usage_type:
            existing_user.usage_type = early_access_user_create_schema.usage_type
            existing_user.usage_feature = early_access_user_create_schema.usage_feature
            existing_user.explanation = early_access_user_create_schema.explanation
            db.commit()

        send_early_access_user_to_slack(early_access_user_create_schema)

        return DataResponse(data="success")
