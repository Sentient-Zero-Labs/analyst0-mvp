from typing import List

from fastapi import Depends, HTTPException, status
from jose import JWTError
from sqlalchemy import and_
from sqlalchemy.orm import Session

from src.database import get_db
from src.services.auth.auth_dependency import get_current_user
from src.services.organisation.organisation_model import (
    OrganisationModel,
    OrganisationUserModel,
    OrganisationUserRoleEnum,
)
from src.services.user.user_schema import UserSchema


def get_admin_organisation(
    organisation_public_id: str, current_user: UserSchema = Depends(get_current_user), db: Session = Depends(get_db)
) -> OrganisationModel:
    """
    This function is used to get the current user from the token. It is used
    to protect routes that require authentication by adding it as a dependency to the route.
    """
    return _get_user_organisation(organisation_public_id, current_user, db, [OrganisationUserRoleEnum.ADMIN])


def get_user_organisation(
    organisation_public_id: str, current_user: UserSchema = Depends(get_current_user), db: Session = Depends(get_db)
) -> OrganisationModel:
    """
    This function is used to get the current user from the token. It is used
    to protect routes that require authentication by adding it as a dependency to the route.
    """
    return _get_user_organisation(
        organisation_public_id, current_user, db, [OrganisationUserRoleEnum.USER, OrganisationUserRoleEnum.ADMIN]
    )


def _get_user_organisation(
    organisation_public_id: str, current_user: UserSchema, db: Session, roles: List[OrganisationUserRoleEnum]
) -> OrganisationModel:
    """
    This function is used to get the current user from the token. It is used
    to protect routes that require authentication by adding it as a dependency to the route.
    """

    organisation_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate organisation for user",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        organisation = (
            db.query(OrganisationModel)
            .join(
                OrganisationUserModel,
                and_(
                    OrganisationModel.id == OrganisationUserModel.organisation_id,
                    OrganisationUserModel.user_id == current_user.id,
                    OrganisationUserModel.role.in_(roles),
                ),
            )
            .filter(OrganisationModel.public_id == organisation_public_id)
            .first()
        )

        if organisation is None:
            raise organisation_exception
    except JWTError:
        raise organisation_exception

    return organisation
