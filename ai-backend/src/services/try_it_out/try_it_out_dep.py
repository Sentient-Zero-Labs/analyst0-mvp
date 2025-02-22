from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session

from src.database import get_db
from src.services.charter.charter_model import CharterModel
from src.services.data_entity.data_entity_model import DataEntityModel
from src.services.data_source.data_source_model import DataSourceModel
from src.settings import settings


def get_try_it_out_charter(charter_id: int, db: Session = Depends(get_db)):
    if charter_id not in settings.TRY_IT_OUT_CHARTER_IDS:
        raise HTTPException(status_code=404, detail="Charter not found")

    charter, data_source = (
        db.query(CharterModel, DataSourceModel)
        .join(DataSourceModel, DataSourceModel.id == CharterModel.data_source_id)
        .filter(CharterModel.id == charter_id, CharterModel.organisation_id == settings.TRY_IT_OUT_ORGANISATION_ID)
        .first()
    )

    if charter is None:
        raise HTTPException(status_code=404, detail="Charter not found")

    charter.data_source = data_source

    return charter


def get_try_it_out_data_entity(data_entity_id: int, db: Session = Depends(get_db)):
    data_entity = (
        db.query(DataEntityModel)
        .filter(
            DataEntityModel.id == data_entity_id, DataEntityModel.organisation_id == settings.TRY_IT_OUT_ORGANISATION_ID
        )
        .first()
    )

    if data_entity is None:
        raise HTTPException(status_code=404, detail="Data entity not found")

    return data_entity
