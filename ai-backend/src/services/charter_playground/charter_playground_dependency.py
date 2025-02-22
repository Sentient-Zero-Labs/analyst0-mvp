from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session

from src.database import get_db
from src.services.charter.charter_dep import get_admin_charter, get_user_charter
from src.services.charter.charter_model import CharterModel
from src.services.charter_playground.charter_playground_model import CharterPlaygroundModel


def get_user_charter_playground(
    playground_public_id: str, charter: CharterModel = Depends(get_user_charter), db: Session = Depends(get_db)
):
    return _get_charter_playground(playground_public_id, charter.id, db)


def get_admin_charter_playground(
    playground_public_id: str, charter: CharterModel = Depends(get_admin_charter), db: Session = Depends(get_db)
):
    return _get_charter_playground(playground_public_id, charter.id, db)


def _get_charter_playground(playground_public_id: str, charter_id: int, db: Session = Depends(get_db)):
    charter_playground = (
        db.query(CharterPlaygroundModel)
        .filter(
            CharterPlaygroundModel.public_id == playground_public_id, CharterPlaygroundModel.charter_id == charter_id
        )
        .first()
    )

    if charter_playground is None:
        raise HTTPException(status_code=404, detail="Charter playground not found")

    return charter_playground
