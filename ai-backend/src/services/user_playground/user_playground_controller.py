from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.database import get_db
from src.middleware.wrap_response import DataResponse, DataResponseClass
from src.services.auth.auth_dependency import get_current_user
from src.services.charter.charter_model import CharterModel
from src.services.charter_playground.charter_playground_model import CharterPlaygroundModel
from src.services.charter_playground.charter_playground_schema import (
    CharterPlaygroundResponse,
)
from src.services.organisation.organisation_dependency import get_user_organisation
from src.services.organisation.organisation_model import OrganisationModel
from src.services.user.user_schema import UserSchema

router = APIRouter(prefix="/organisation/{organisation_public_id}/user/playground/list")


@router.get("", response_model=DataResponseClass[List[CharterPlaygroundResponse]])
async def get_charter_playgrounds_list(
    current_user: UserSchema = Depends(get_current_user),
    organisation: OrganisationModel = Depends(get_user_organisation),
    db: Session = Depends(get_db),
):
    playgrounds = (
        db.query(CharterPlaygroundModel)
        .join(CharterModel, CharterModel.id == CharterPlaygroundModel.charter_id)
        .filter(CharterModel.organisation_id == organisation.id, CharterPlaygroundModel.user_id == current_user.id)
        .all()
    )

    return DataResponse(data=playgrounds)
