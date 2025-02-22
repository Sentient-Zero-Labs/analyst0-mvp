from fastapi import Depends
from sqlalchemy.orm import Session

from src.database import get_db
from src.services.data_entity.data_entity_model import DataEntityModel
from src.services.data_entity.data_entity_service import DataEntityService
from src.services.data_source.data_source_dependency import get_admin_data_source, get_user_data_source
from src.services.data_source.data_source_model import DataSourceModel


def get_user_data_entity(
    data_entity_id: int, data_source: DataSourceModel = Depends(get_user_data_source), db: Session = Depends(get_db)
) -> DataEntityModel:
    return DataEntityService.get_data_entity_by_id(data_entity_id, data_source.id, db)


def get_admin_data_entity(
    data_entity_id: int, data_source: DataSourceModel = Depends(get_admin_data_source), db: Session = Depends(get_db)
) -> DataEntityModel:
    return DataEntityService.get_data_entity_by_id(data_entity_id, data_source.id, db)
