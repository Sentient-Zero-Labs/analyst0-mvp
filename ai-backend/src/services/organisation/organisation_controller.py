from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import and_, func
from sqlalchemy.orm import Session

from src.database import get_db
from src.middleware.wrap_response import DataResponse, DataResponseClass
from src.services.auth.auth_dependency import get_current_user
from src.services.data_source.data_source_model import DataSourceModel
from src.services.organisation.organisation_dependency import get_admin_organisation, get_user_organisation
from src.services.organisation.organisation_model import (
    OrganisationModel,
    OrganisationUserModel,
    OrganisationUserRoleEnum,
)
from src.services.organisation.organisation_schema import (
    Organisation,
    OrganisationCreateSchema,
    OrganisationListResponseItem,
    OrganisationUserAddSchema,
    OrganisationUserResponse,
)
from src.services.organisation_slack_bot.organisation_slack_bot_model import OrganisationSlackBotModel
from src.services.user.user_model import UserModel
from src.services.user.user_schema import UserSchema
from src.utils.uuid import generate_uuid

router = APIRouter(prefix="/organisations")


@router.post("", response_model=DataResponseClass[Organisation])
async def create_organisation(
    organisation: OrganisationCreateSchema,
    current_user: UserSchema = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    new_organisation = OrganisationModel(name=organisation.name, public_id=generate_uuid())

    db.add(new_organisation)
    db.flush()

    new_organisation_user = OrganisationUserModel(
        organisation_id=new_organisation.id, user_id=current_user.id, role=OrganisationUserRoleEnum.ADMIN
    )

    db.add(new_organisation_user)

    db.commit()
    db.refresh(new_organisation)

    return DataResponse(data=new_organisation)


@router.get("", response_model=DataResponseClass[List[OrganisationListResponseItem]])
async def get_organisation_list(current_user: UserSchema = Depends(get_current_user), db: Session = Depends(get_db)):
    organisations = (
        db.query(
            OrganisationModel,
            func.count(OrganisationSlackBotModel.id).label("slack_bot_count"),
            func.count(DataSourceModel.id).label("data_source_count"),
            OrganisationUserModel.role.label("user_role"),
        )
        .join(
            OrganisationUserModel,
            and_(
                OrganisationUserModel.organisation_id == OrganisationModel.id,
                OrganisationUserModel.user_id == current_user.id,
            ),
        )
        .join(
            OrganisationSlackBotModel, OrganisationSlackBotModel.organisation_id == OrganisationModel.id, isouter=True
        )
        .join(DataSourceModel, DataSourceModel.organisation_id == OrganisationModel.id, isouter=True)
        .group_by(OrganisationModel.id, OrganisationUserModel.role)
        .filter(OrganisationUserModel.user_id == current_user.id)
        .all()
    )

    result = []

    for organisation, slack_bot_count, data_source_count, user_role in organisations:
        organisation.is_slack_bot_enabled = slack_bot_count > 0
        organisation.data_source_count = data_source_count
        organisation.user_role = user_role
        result.append(organisation)

    return DataResponse(data=result)


@router.post("/{organisation_public_id}/users", response_model=DataResponseClass[OrganisationUserResponse])
async def add_user_to_organisation(
    organisation_public_id: str,
    user_data: OrganisationUserAddSchema,
    organisation: OrganisationModel = Depends(get_admin_organisation),
    db: Session = Depends(get_db),
):
    """Add a user to an organisation. Only organisation admins can add users."""
    # Check if the user exists
    user = db.query(UserModel).filter(UserModel.email == user_data.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found. The user must have an account before they can be added to an organisation.",
        )

    # Check if the user is already in the organisation
    existing_user = (
        db.query(OrganisationUserModel)
        .filter(
            OrganisationUserModel.organisation_id == organisation.id,
            OrganisationUserModel.user_id == user.id,
        )
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already a member of this organisation.",
        )

    # Add the user to the organisation
    new_organisation_user = OrganisationUserModel(
        organisation_id=organisation.id, user_id=user.id, role=user_data.role
    )

    db.add(new_organisation_user)
    db.commit()
    db.refresh(new_organisation_user)

    # Create response with user email
    response = OrganisationUserResponse(
        id=new_organisation_user.id,
        user_id=new_organisation_user.user_id,
        organisation_id=new_organisation_user.organisation_id,
        role=new_organisation_user.role,
        user_email=user.email,
    )

    return DataResponse(data=response)


@router.get("/{organisation_public_id}/users", response_model=DataResponseClass[List[OrganisationUserResponse]])
async def get_organisation_users(
    organisation_public_id: str,
    organisation: OrganisationModel = Depends(get_user_organisation),
    db: Session = Depends(get_db),
):
    """Get all users in an organisation."""
    # Get all users in the organisation
    organisation_users = (
        db.query(OrganisationUserModel, UserModel.email)
        .join(UserModel, OrganisationUserModel.user_id == UserModel.id)
        .filter(OrganisationUserModel.organisation_id == organisation.id)
        .all()
    )

    # Create response
    result = []
    for org_user, email in organisation_users:
        result.append(
            OrganisationUserResponse(
                id=org_user.id,
                user_id=org_user.user_id,
                organisation_id=org_user.organisation_id,
                role=org_user.role,
                user_email=email,
            )
        )

    return DataResponse(data=result)


@router.delete("/{organisation_public_id}/users/{user_id}", status_code=204)
async def remove_user_from_organisation(
    organisation_public_id: str,
    user_id: int,
    organisation: OrganisationModel = Depends(get_admin_organisation),
    current_user: UserSchema = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Remove a user from an organisation. Only organisation admins can remove users.
    Admins cannot be removed to prevent locking out of the organisation."""
    # Get the user's role in the organisation
    org_user = (
        db.query(OrganisationUserModel)
        .filter(
            OrganisationUserModel.organisation_id == organisation.id,
            OrganisationUserModel.user_id == user_id,
        )
        .first()
    )

    if not org_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found in this organisation.",
        )

    # Check if the user is an admin - prevent removing admins
    if org_user.role == OrganisationUserRoleEnum.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admin users cannot be removed from the organisation.",
        )

    # Check if the user is trying to remove themselves
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot remove yourself from the organisation.",
        )

    # Remove the user from the organisation
    db.delete(org_user)
    db.commit()

    return None
