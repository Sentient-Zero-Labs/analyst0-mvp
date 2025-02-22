from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from src.database import get_db
from src.internal_services.sql_analyzer.sql_analyzer_factory import SQLAnalyzerFactory
from src.middleware.wrap_response import DataResponse, DataResponseClass
from src.services.charter.charter_dep import get_admin_charter, get_user_charter
from src.services.charter.charter_model import CharterModel
from src.services.charter_example.charter_example_service import CharterExampleService
from src.services.data_entity.data_entity_schema import DataEntityResponse
from src.services.data_entity.data_entity_service import DataEntityService
from src.utils.sqlalchemy_pydantic_utils import to_pydantic_list

from .charter_example_schema import (
    CharterExampleCreate,
    CharterExampleExplainInput,
    CharterExampleResponse,
    CharterExampleUpdate,
)

router = APIRouter(prefix="/organisation/{organisation_public_id}/charter/{charter_id}/example")


@router.post("/", response_model=DataResponseClass[CharterExampleResponse])
async def create_charter_example(
    charter_example_create: CharterExampleCreate,
    db_charter: CharterModel = Depends(get_admin_charter),
    db: Session = Depends(get_db),
) -> DataResponseClass[CharterExampleResponse]:
    """Create a new charter example."""
    db_charter_example = await CharterExampleService.create_charter_example(charter_example_create, db_charter.id, db)

    return DataResponse(data=db_charter_example)


@router.get("/list", response_model=DataResponseClass[List[CharterExampleResponse]])
async def get_charter_examples_list(
    db_charter: CharterModel = Depends(get_user_charter),
    db: Session = Depends(get_db),
) -> DataResponseClass[List[CharterExampleResponse]]:
    """Get all charter examples."""
    db_charter_examples = CharterExampleService.get_charter_examples_list(db_charter.id, db)

    return DataResponse(data=db_charter_examples)


@router.get("/{charter_example_id}", response_model=DataResponseClass[CharterExampleResponse])
async def get_charter_example(
    charter_example_id: int,
    db_charter: CharterModel = Depends(get_user_charter),
    db: Session = Depends(get_db),
) -> DataResponseClass[CharterExampleResponse]:
    """Get a specific charter example."""
    db_charter_example = CharterExampleService.get_charter_example(charter_example_id, db_charter.id, db)

    if not db_charter_example:
        raise HTTPException(status_code=404, detail="Charter example not found")

    return DataResponse(data=db_charter_example)


@router.put("/{charter_example_id}", response_model=DataResponseClass[CharterExampleResponse])
async def update_charter_example(
    charter_example_id: int,
    charter_example_update: CharterExampleUpdate,
    db_charter: CharterModel = Depends(get_user_charter),
    db: Session = Depends(get_db),
) -> DataResponseClass[CharterExampleResponse]:
    """Update a specific charter example."""
    db_charter_example = await CharterExampleService.update_charter_example(
        charter_example_id, db_charter.id, charter_example_update, db
    )

    if not db_charter_example:
        raise HTTPException(status_code=404, detail="Charter example not found")

    return DataResponse(data=db_charter_example)


@router.delete("/{charter_example_id}", status_code=204)
async def delete_charter_example(
    charter_example_id: int,
    db_charter: CharterModel = Depends(get_user_charter),
    db: Session = Depends(get_db),
):
    """Delete a specific charter example."""
    db_charter_example = CharterExampleService.delete_charter_example(charter_example_id, db_charter.id, db)

    if not db_charter_example:
        raise HTTPException(status_code=404, detail="Charter example not found")

    return None


@router.post("/explain")
async def explain_charter_example(
    charter_example_explain_input: CharterExampleExplainInput,
    db: Session = Depends(get_db),
    db_charter: CharterModel = Depends(get_user_charter),
):
    """Explain a specific charter example."""

    sql_analyzer = SQLAnalyzerFactory.get_sql_analyzer(db_charter.data_source.type)

    is_valid, error_message = sql_analyzer.validate_query(charter_example_explain_input.query)

    if not is_valid:
        raise HTTPException(status_code=400, detail=error_message)

    tables_columns = sql_analyzer.extract_tables_columns(charter_example_explain_input.query)

    table_names = list(tables_columns.keys())

    data_entities = to_pydantic_list(
        DataEntityService.get_data_entities_by_table_names_and_charter_id(table_names, db_charter.id, db),
        DataEntityResponse,
    )

    db_tables_names = [data_entity.name.lower() for data_entity in data_entities]

    if not all(table_name.lower() in db_tables_names for table_name in table_names):
        raise HTTPException(
            status_code=400, detail="One or more tables provided in the query are not present in the charter"
        )

    explanation = await CharterExampleService.explain_charter_example(
        charter_example_explain_input.query, data_entities
    )

    return DataResponse(data=explanation)
