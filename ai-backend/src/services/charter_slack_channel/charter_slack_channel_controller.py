from typing import List
from fastapi import APIRouter, Depends
from src.services.charter.charter_dep import get_admin_charter
from src.services.charter_slack_channel.charter_slack_channel_model import CharterSlackChannelModel
from src.utils.logger import setup_logger
from src.database import Session, get_db
from src.services.charter.charter_model import CharterModel

router = APIRouter(prefix="/organisations/{organisation_public_id}/charters/{charter_public_id}/slack-channels")

logger = setup_logger()


@router.post("", status_code=200)
async def create_charter_slack_channel(slack_channel_ids: List[str], db_charter: CharterModel = Depends(get_admin_charter), db: Session = Depends(get_db)):
    db.query(CharterSlackChannelModel).filter(CharterSlackChannelModel.charter_id == db_charter.id).delete()
    db.commit()
    for slack_channel_id in slack_channel_ids:
        db.add(CharterSlackChannelModel(charter_id=db_charter.id, slack_channel_id=slack_channel_id))
    db.commit()
    return {"message": "Slack channels added to charter"}
