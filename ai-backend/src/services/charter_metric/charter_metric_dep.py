from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from src.services.charter.charter_dep import get_admin_charter, get_user_charter
from src.database import get_db
from src.services.charter_metric.charter_metric_model import CharterMetricModel
from src.services.charter.charter_model import CharterModel


def get_user_charter_metric(charter_metric_id: int,
                            charter: CharterModel = Depends(get_user_charter),
                            db: Session = Depends(get_db)):
    return _get_charter_metric(charter_metric_id, charter.id, db)


def get_admin_charter_metric(charter_metric_id: int,
                             charter: CharterModel = Depends(get_admin_charter),
                             db: Session = Depends(get_db)):
    return _get_charter_metric(charter_metric_id, charter.id, db)


def _get_charter_metric(charter_metric_id: int, charter_id: int, db: Session = Depends(get_db)):
    charter_metric = db.query(CharterMetricModel).\
        filter(CharterMetricModel.id == charter_metric_id, CharterMetricModel.charter_id == charter_id).\
        first()

    if charter_metric is None:
        raise HTTPException(status_code=404, detail="Charter Metric not found")

    return charter_metric
