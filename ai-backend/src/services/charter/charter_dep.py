from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from src.services.data_source.data_source_model import DataSourceModel
from src.database import get_db
from src.services.organisation.organisation_model import OrganisationModel
from src.services.organisation.organisation_dependency import get_admin_organisation, get_user_organisation
from src.services.charter.charter_model import CharterModel


def get_user_charter(charter_id: int,
                     organisation: OrganisationModel = Depends(get_user_organisation),
                     db: Session = Depends(get_db)):
    return _get_charter(charter_id, organisation.id, db)


def get_admin_charter(charter_id: int,
                      organisation: OrganisationModel = Depends(get_admin_organisation),
                      db: Session = Depends(get_db)):
    return _get_charter(charter_id, organisation.id, db)


def _get_charter(charter_id: int, organisation_id: int, db: Session = Depends(get_db)):
    charter, data_source = db.query(CharterModel, DataSourceModel).\
        join(DataSourceModel, DataSourceModel.id == CharterModel.data_source_id).\
        filter(CharterModel.id == charter_id, CharterModel.organisation_id == organisation_id).\
        first()

    if charter is None:
        raise HTTPException(status_code=404, detail="Charter not found")

    charter.data_source = data_source

    return charter
