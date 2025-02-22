from fastapi import Depends, HTTPException, status
from jose import JWTError
from sqlalchemy.orm import Session

from src.database import get_db
from src.services.auth.auth_dependency import get_current_user
from src.services.charter.charter_dep import get_user_charter
from src.services.charter.charter_model import CharterModel
from src.services.data_source.data_source_model import DataSourceModel, DataSourceType
from src.services.data_source.data_source_schema import DataSourceCreate, DataSourceUpdate
from src.services.organisation.organisation_dependency import get_admin_organisation
from src.services.organisation.organisation_model import OrganisationModel
from src.services.user.user_model import UserModel
from src.settings import settings


def check_super_admin_data_source(
    data_source: DataSourceCreate | DataSourceUpdate,
    user: UserModel = Depends(get_current_user),
) -> bool:
    if data_source.type == DataSourceType.SQLITE and user.email not in settings.SUPER_ADMIN_EMAILS:
        raise HTTPException(status_code=403, detail="You are not authorized to create a SQLite data source")

    return data_source


def get_admin_data_source(
    data_source_id: int,
    organisation: OrganisationModel = Depends(get_admin_organisation),
    db: Session = Depends(get_db),
) -> DataSourceModel:
    """
    This function is used to get the current user from the token. It is used
    to protect routes that require authentication by adding it as a dependency to the route.
    """
    return _get_data_source(data_source_id, organisation.id, db)


def get_user_data_source(
    data_source_id: int,
    organisation: OrganisationModel = Depends(get_admin_organisation),
    db: Session = Depends(get_db),
) -> DataSourceModel:
    """
    This function is used to get the current user from the token. It is used
    to protect routes that require authentication by adding it as a dependency to the route.
    """
    return _get_data_source(data_source_id, organisation.id, db)


def get_user_data_source_for_charter(
    charter: CharterModel = Depends(get_user_charter), db: Session = Depends(get_db)
) -> DataSourceModel:
    """
    This function is used to get the current user from the token. It is used
    to protect routes that require authentication by adding it as a dependency to the route.
    """
    return _get_data_source(charter.data_source_id, charter.organisation_id, db)


def _get_data_source_for_charter(data_source_id: int, charter: CharterModel, db: Session) -> DataSourceModel:
    return _get_data_source(data_source_id, charter.organisation, db)


def _get_data_source(
    data_source_id: int,
    organisation_id: int,
    db: Session,
) -> DataSourceModel:
    """
    This function is used to get the current user from the token. It is used
    to protect routes that require authentication by adding it as a dependency to the route.
    """

    data_source_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate data source for user",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        data_source = (
            db.query(DataSourceModel)
            .filter(DataSourceModel.id == data_source_id, DataSourceModel.organisation_id == organisation_id)
            .first()
        )

        if data_source is None:
            raise data_source_exception
    except JWTError:
        raise data_source_exception

    return data_source
