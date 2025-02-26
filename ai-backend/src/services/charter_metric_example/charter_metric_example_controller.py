from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.database import get_db
from src.internal_services.sql_analyzer.sql_analyzer_factory import SQLAnalyzerFactory
from src.middleware.wrap_response import DataResponse, DataResponseClass
from src.services.charter.charter_dep import get_user_charter
from src.services.charter.charter_schema import CharterResponse
from src.services.charter_metric.charter_metric_dep import get_admin_charter_metric, get_user_charter_metric
from src.services.charter_metric.charter_metric_model import CharterMetricModel
from src.services.data_entity.data_entity_schema import DataEntityResponse
from src.services.data_entity.data_entity_service import DataEntityService
from src.utils.sqlalchemy_pydantic_utils import to_pydantic_list

from .charter_metric_example_schema import (
    CharterMetricExampleCreate,
    CharterMetricExampleExplainInput,
    CharterMetricExampleResponse,
    CharterMetricExampleUpdate,
)
from .charter_metric_example_service import CharterMetricExampleService

# Create a router for charter metric examples with a specific prefix
router = APIRouter(
    prefix="/organisations/{organisation_public_id}/charters/{charter_id}/metrics/{charter_metric_id}/examples"
)


# POST endpoint to create a new charter metric example
@router.post("", response_model=DataResponseClass[CharterMetricExampleResponse])
async def create_charter_metric_example(
    charter_metric_example_create: CharterMetricExampleCreate,
    db_charter_metric: CharterMetricModel = Depends(get_admin_charter_metric),
    db: Session = Depends(get_db),
):
    """Create a new charter metric example."""
    db_charter_metric_example = await CharterMetricExampleService.create_charter_metric_example(
        charter_metric_example_create, db_charter_metric.id, db
    )

    return DataResponse(data=db_charter_metric_example)


# GET endpoint to retrieve a specific charter metric example by ID
@router.get("/{charter_metric_example_id}", response_model=DataResponseClass[CharterMetricExampleResponse])
def get_charter_metric_example(
    charter_metric_example_id: int,
    db_charter_metric: CharterMetricModel = Depends(get_user_charter_metric),
    db: Session = Depends(get_db),
):
    """Retrieve a specific charter metric example by ID."""
    charter_metric_example = CharterMetricExampleService.get_charter_metric_example(
        charter_metric_example_id, db_charter_metric.id, db
    )

    if charter_metric_example is None:
        raise HTTPException(status_code=404, detail="Charter metric example not found")

    return DataResponse(data=charter_metric_example)


# GET endpoint to retrieve all charter metric examples for a specific charter metric
@router.get("", response_model=DataResponseClass[List[CharterMetricExampleResponse]])
def get_charter_metric_examples_list(
    db_charter_metric: CharterMetricModel = Depends(get_user_charter_metric), db: Session = Depends(get_db)
):
    """Retrieve all charter metric examples for a specific charter metric."""
    examples = CharterMetricExampleService.get_charter_metric_examples_list(db_charter_metric.id, db)

    return DataResponse(data=examples)


# PUT endpoint to update a specific charter metric example
@router.put("/{charter_metric_example_id}", response_model=DataResponseClass[CharterMetricExampleResponse])
async def update_charter_metric_example(
    charter_metric_example_id: int,
    charter_metric_example_update: CharterMetricExampleUpdate,
    db_charter_metric: CharterMetricModel = Depends(get_user_charter_metric),
    db: Session = Depends(get_db),
):
    """Update a specific charter metric example."""
    updated_example = await CharterMetricExampleService.update_charter_metric_example(
        charter_metric_example_id, db_charter_metric.id, charter_metric_example_update, db
    )

    if updated_example is None:
        raise HTTPException(status_code=404, detail="Charter metric example not found")

    return DataResponse(data=updated_example)


# DELETE endpoint to remove a specific charter metric example
@router.delete("/{charter_metric_example_id}", status_code=204)
def delete_charter_metric_example(
    charter_metric_example_id: int,
    db_charter_metric: CharterMetricModel = Depends(get_admin_charter_metric),
    db: Session = Depends(get_db),
):
    """Delete a specific charter metric example."""
    deleted_example = CharterMetricExampleService.delete_charter_metric_example(
        charter_metric_example_id, db_charter_metric.id, db
    )

    if deleted_example is None:
        raise HTTPException(status_code=404, detail="Charter metric example not found")

    return None


@router.post("/explain")
async def explain_charter_metric_example(
    charter_metric_example_explain_input: CharterMetricExampleExplainInput,
    db_charter_metric: CharterMetricModel = Depends(get_user_charter_metric),
    db_charter: CharterResponse = Depends(get_user_charter),
    db: Session = Depends(get_db),
):
    """Explain a specific charter metric example."""

    sql_analyzer = SQLAnalyzerFactory.get_sql_analyzer(db_charter.data_source.type)

    is_valid, error_message = sql_analyzer.validate_query(charter_metric_example_explain_input.query)

    if not is_valid:
        raise HTTPException(status_code=400, detail=error_message)

    tables_columns = sql_analyzer.extract_tables_columns(charter_metric_example_explain_input.query)

    table_names = list(tables_columns.keys())

    data_entities = to_pydantic_list(
        DataEntityService.get_data_entities_by_table_names_and_charter_id(table_names, db_charter.id, db),
        DataEntityResponse,
    )

    db_tables_names = [data_entity.name for data_entity in data_entities]

    # Check if all tables_names are present in db_tables_names
    if not all(table_name in db_tables_names for table_name in table_names):
        raise HTTPException(
            status_code=400, detail="One or more tables provided in the query are not present in the charter."
        )

    explanation_response = await CharterMetricExampleService.explain_charter_metric_example(
        charter_metric_example_explain_input.query,
        db_charter_metric.name,
        db_charter_metric.abbreviation,
        db_charter_metric.description,
        data_entities,
    )

    return DataResponse(data=explanation_response)
