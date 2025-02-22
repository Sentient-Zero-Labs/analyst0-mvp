from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Session

from src.database import get_async_db, get_db
from src.middleware.wrap_response import DataResponse, DataResponseClass
from src.services.charter.charter_dep import get_admin_charter, get_user_charter
from src.services.charter.charter_model import CharterModel
from src.services.charter_metric.charter_metric_model import CharterMetricModel
from src.services.charter_metric.charter_metric_service import CharterMetricService
from src.services.charter_metric.charter_metrics_schema import (
    CharterMetricCreate,
    CharterMetricDescribeInput,
    CharterMetricDescribeResponse,
    CharterMetricListResponseItem,
    CharterMetricResponse,
    CharterMetricUpdate,
)
from src.services.charter_metric_example.charter_metric_example_model import CharterMetricExampleModel
from src.services.data_entity.data_entity_service import DataEntityService
from src.utils.logger import setup_logger

# Set up logging
logger = setup_logger()

# Create a router for charter metrics with a specific prefix
router = APIRouter(prefix="/organisations/{organisation_public_id}/charters/{charter_id}/metrics")


# POST endpoint to create a new charter metric
@router.post("", response_model=DataResponseClass[CharterMetricResponse])
async def create_charter_metric(
    charter_metric: CharterMetricCreate,
    db_charter: CharterModel = Depends(get_admin_charter),
    db: Session = Depends(get_db),
):
    """Create a new charter metric, generate embeddings."""

    # Create a new charter metric, generate embeddings, and save to the database
    db_charter_metric = CharterMetricModel(**charter_metric.model_dump(), charter_id=db_charter.id)
    db_charter_metric.embeddings = await CharterMetricService.get_charter_metric_embedding(db_charter_metric)
    db.add(db_charter_metric)
    db.commit()
    db.refresh(db_charter_metric)
    return DataResponse(data=db_charter_metric)


# GET endpoint to retrieve all charter metrics for a specific charter with example counts
@router.get("", response_model=DataResponseClass[List[CharterMetricListResponseItem]])
async def get_charter_metrics_list(db_charter: CharterModel = Depends(get_user_charter), db: Session = Depends(get_db)):
    """Retrieve all charter metrics for a specific charter with example counts."""

    # Query charter metrics with example counts
    charter_metrics = (
        db.query(CharterMetricModel, func.count(CharterMetricExampleModel.id).label("example_count"))
        .outerjoin(CharterMetricExampleModel, CharterMetricModel.id == CharterMetricExampleModel.charter_metric_id)
        .filter(CharterMetricModel.charter_id == db_charter.id)
        .group_by(CharterMetricModel.id)
        .order_by(CharterMetricModel.name)
        .all()
    )

    # Prepare the response data
    result = [
        CharterMetricListResponseItem(**metric[0].__dict__, example_count=metric[1]) for metric in charter_metrics
    ]

    return DataResponse(data=result)


# GET endpoint to retrieve a specific charter metric by ID
@router.get("/{charter_metric_id}", response_model=DataResponseClass[CharterMetricResponse])
async def get_charter_metric(
    charter_metric_id: int, db_charter: CharterModel = Depends(get_user_charter), db: Session = Depends(get_db)
):
    """Retrieve a specific charter metric by ID."""

    # Query the database for the specific charter metric
    charter_metric = (
        db.query(CharterMetricModel)
        .filter(CharterMetricModel.id == charter_metric_id, CharterMetricModel.charter_id == db_charter.id)
        .first()
    )

    if not charter_metric:
        raise HTTPException(status_code=404, detail="Charter metric not found")

    return DataResponse(data=charter_metric)


# PUT endpoint to update a specific charter metric
@router.put("/{charter_metric_id}", response_model=DataResponseClass[CharterMetricResponse])
async def update_charter_metric(
    charter_metric_id: int,
    charter_metric_update: CharterMetricUpdate,
    db_charter: CharterModel = Depends(get_admin_charter),
    db: Session = Depends(get_db),
):
    """Update a specific charter metric, generate embeddings."""

    # Query the database for the charter metric to update
    charter_metric = (
        db.query(CharterMetricModel)
        .filter(CharterMetricModel.id == charter_metric_id, CharterMetricModel.charter_id == db_charter.id)
        .first()
    )

    if not charter_metric:
        raise HTTPException(status_code=404, detail="Charter metric not found")

    # Update the charter metric with the new data
    for key, value in charter_metric_update.model_dump().items():
        setattr(charter_metric, key, value)

    # Regenerate embeddings for the updated charter metric
    charter_metric.embeddings = await CharterMetricService.get_charter_metric_embedding(charter_metric)

    db.commit()
    db.refresh(charter_metric)

    return DataResponse(data=charter_metric)


# DELETE endpoint to remove a specific charter metric
@router.delete("/{charter_metric_id}", status_code=204)
async def delete_charter_metric(
    charter_metric_id: int, db_charter: CharterModel = Depends(get_admin_charter), db: Session = Depends(get_db)
):
    """Delete a specific charter metric."""

    # Query the database for the charter metric to delete
    charter_metric = (
        db.query(CharterMetricModel)
        .filter(CharterMetricModel.id == charter_metric_id, CharterMetricModel.charter_id == db_charter.id)
        .first()
    )
    if not charter_metric:
        raise HTTPException(status_code=404, detail="Charter metric not found")

    # Delete the charter metric from the database
    db.delete(charter_metric)
    db.commit()
    return None


@router.post("/describe", response_model=DataResponseClass[CharterMetricDescribeResponse])
async def describe_charter_metric(
    charter_metric_describe_input: CharterMetricDescribeInput,
    db_charter: CharterMetricModel = Depends(get_user_charter),
    async_db: AsyncSession = Depends(get_async_db),
):
    data_entities = await DataEntityService.get_data_entities_by_ids_and_charter_id(
        charter_metric_describe_input.data_entity_ids, db_charter.id, async_db
    )

    if len(data_entities) == 0:
        raise HTTPException(status_code=404, detail="Data entities not found")

    """Explain a charter metric."""
    explanation = await CharterMetricService.describe_charter_metric(
        charter_metric_describe_input.abbreviation,
        charter_metric_describe_input.name,
        data_entities,
    )

    return DataResponse(data=explanation)
