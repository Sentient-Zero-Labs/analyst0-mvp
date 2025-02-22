from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from src.database import get_db
from src.internal_services.data_source_connector.data_source_connector_factory import (
    DataSourceConnectorFactory,
)
from src.middleware.wrap_response import DataResponse, DataResponseClass
from src.services.data_source.data_source_dependency import (
    check_super_admin_data_source,
)
from src.services.data_source.data_source_model import DataSourceModel
from src.services.data_source.data_source_schema import (
    DataSourceCreate,
    DataSourceListResponseItem,
    DataSourceResponse,
)
from src.services.organisation.organisation_dependency import (
    get_admin_organisation,
    get_user_organisation,
)
from src.services.organisation.organisation_model import OrganisationModel
from src.utils.logger import setup_logger

logger = setup_logger()

router = APIRouter(prefix="/organisations/{organisation_public_id}/data-sources")


@router.post("", response_model=DataResponseClass[DataSourceResponse])
async def create_data_source(
    data_source_create: DataSourceCreate = Depends(check_super_admin_data_source),
    organisation: OrganisationModel = Depends(get_admin_organisation),
    db: Session = Depends(get_db),
):
    # Create model and explicitly set config
    new_data_source = DataSourceModel(
        organisation_id=organisation.id,
        name=data_source_create.name,
        type=data_source_create.type,
    )

    # Convert config to dict before setting
    config_dict = (
        data_source_create.config.model_dump()
        if hasattr(data_source_create.config, "model_dump")
        else data_source_create.config
    )
    new_data_source.config = config_dict

    data_source_connector = DataSourceConnectorFactory.get_data_source_connector(
        new_data_source, no_cache=True
    )

    status, error_message = data_source_connector.test_connection()

    if not status:
        raise HTTPException(status_code=400, detail=error_message)

    db.add(new_data_source)
    db.commit()
    db.refresh(new_data_source)

    data_source_connector.close_connection()

    return DataResponse(data=new_data_source)


@router.get("", response_model=DataResponseClass[List[DataSourceListResponseItem]])
async def get_data_sources(
    organisation: OrganisationModel = Depends(get_admin_organisation),
    db: Session = Depends(get_db),
):
    data_sources = (
        db.query(DataSourceModel)
        .filter(
            DataSourceModel.organisation_id == organisation.id,
            DataSourceModel.deleted_at == None,
        )
        .all()
    )
    return DataResponse(data=data_sources)


@router.get("/{data_source_id}", response_model=DataResponseClass[DataSourceResponse])
async def get_data_source(
    data_source_id: int,
    organisation: OrganisationModel = Depends(get_user_organisation),
    db: Session = Depends(get_db),
):
    data_source = (
        db.query(DataSourceModel)
        .filter(
            DataSourceModel.id == data_source_id,
            DataSourceModel.organisation_id == organisation.id,
            DataSourceModel.deleted_at == None,
        )
        .first()
    )
    if not data_source:
        raise HTTPException(status_code=404, detail="Data source not found")
    return DataResponse(data=data_source)


@router.put("/{data_source_id}", response_model=DataResponseClass[DataSourceResponse])
async def update_data_source(
    data_source_id: int,
    data_source_update: DataSourceCreate = Depends(check_super_admin_data_source),
    organisation: OrganisationModel = Depends(get_user_organisation),
    db: Session = Depends(get_db),
):
    data_source = (
        db.query(DataSourceModel)
        .filter(
            DataSourceModel.id == data_source_id,
            DataSourceModel.organisation_id == organisation.id,
            DataSourceModel.deleted_at == None,
        )
        .first()
    )
    if not data_source:
        raise HTTPException(status_code=404, detail="Data source not found")

    update_data = data_source_update.model_dump(exclude_unset=True)
    if "config" in update_data:
        data_source.config = update_data["config"]

    for key, value in update_data.items():
        if key != "config":
            setattr(data_source, key, value)

    data_source_connector = DataSourceConnectorFactory.get_data_source_connector(
        data_source
    )
    status, error_message = data_source_connector.test_connection()

    if not status:
        raise HTTPException(status_code=400, detail=error_message)

    db.commit()
    db.refresh(data_source)
    return DataResponse(data=data_source)


@router.delete("/{data_source_id}", status_code=204)
async def delete_data_source(
    data_source_id: int,
    organisation: OrganisationModel = Depends(get_user_organisation),
    db: Session = Depends(get_db),
):
    data_source = (
        db.query(DataSourceModel)
        .filter(
            DataSourceModel.id == data_source_id,
            DataSourceModel.organisation_id == organisation.id,
            DataSourceModel.deleted_at == None,
        )
        .first()
    )
    if not data_source:
        raise HTTPException(status_code=404, detail="Data source not found")

    data_source.soft_delete()
    db.commit()
    return None