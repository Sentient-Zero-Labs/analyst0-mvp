from typing import List, Literal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from src.database import get_db
from src.internal_services.data_source_connector.data_source_connector_base import DataSourceConnectorBase
from src.internal_services.data_source_connector.data_source_connector_dependency import (
    get_user_data_source_connector_for_charter,
)
from src.internal_services.sql_analyzer.sql_analyzer_factory import SQLAnalyzerFactory
from src.middleware.wrap_response import DataResponse, DataResponseClass
from src.services.auth.auth_dependency import get_current_user
from src.services.charter.charter_dep import get_user_charter
from src.services.charter.charter_model import CharterModel
from src.services.charter.charter_schema import CharterResponse
from src.services.charter_playground.charter_playground_schema import (
    CharterPlaygroundResponse,
    CharterPlaygroundUpdate,
    ExecuteCharterPlaygroundQuery,
    ExecuteCharterPlaygroundResponse,
)
from src.services.charter_playground.charter_playground_service import CharterPlaygroundService
from src.services.user.user_schema import UserSchema
from src.utils.logger import setup_logger

router = APIRouter(prefix="/organisation/{organisation_public_id}/charter/{charter_id}/playground")

logger = setup_logger()


@router.post("", response_model=DataResponseClass[CharterPlaygroundResponse])
async def create_charter_playground(
    charter: CharterModel = Depends(get_user_charter),
    current_user: UserSchema = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db_charter_playground = CharterPlaygroundService.create_charter_playground(charter.id, current_user.id, db)

    return DataResponse(data=db_charter_playground)


@router.get("/list", response_model=DataResponseClass[List[CharterPlaygroundResponse]])
async def get_charter_playgrounds_list(
    charter: CharterModel = Depends(get_user_charter),
    type: Literal["compact", "detailed"] = "compact",
    db: Session = Depends(get_db),
):
    playgrounds = CharterPlaygroundService.get_charter_playgrounds_list(charter.id, db)
    return DataResponse(data=playgrounds)


@router.get("/{playground_public_id}", response_model=DataResponseClass[CharterPlaygroundResponse])
async def get_charter_playground(
    playground_public_id: str,
    charter: CharterModel = Depends(get_user_charter),
    db: Session = Depends(get_db),
):
    db_charter_playground = CharterPlaygroundService.get_charter_playground(playground_public_id, charter.id, db)
    if not db_charter_playground:
        raise HTTPException(status_code=404, detail="Charter playground not found")

    return DataResponse(data=db_charter_playground)


@router.put("/{playground_public_id}", response_model=DataResponseClass[CharterPlaygroundResponse])
async def update_charter_playground(
    playground_public_id: str,
    playground_update: CharterPlaygroundUpdate,
    charter: CharterModel = Depends(get_user_charter),
    db: Session = Depends(get_db),
):
    db_charter_playground = CharterPlaygroundService.update_charter_playground(
        playground_public_id, charter.id, playground_update, db
    )
    if not db_charter_playground:
        raise HTTPException(status_code=404, detail="Charter playground not found")

    return DataResponse(data=db_charter_playground)


@router.post("/{playground_public_id}/execute", response_model=DataResponseClass[ExecuteCharterPlaygroundResponse])
async def execute_charter_playground_query(
    query: ExecuteCharterPlaygroundQuery,
    charter: CharterResponse = Depends(get_user_charter),
    data_source_connector: DataSourceConnectorBase = Depends(get_user_data_source_connector_for_charter),
):
    sql_analyser = SQLAnalyzerFactory.get_sql_analyzer(charter.data_source.type)

    is_valid, error_message = sql_analyser.validate_query(query.query)

    if not is_valid:
        return DataResponse(data=ExecuteCharterPlaygroundResponse(data=None, error=error_message))

    # Add limit if provided
    if query.limit:
        query.query = sql_analyser.add_limit(query.query, query.limit)

    data, error, _ = await data_source_connector.execute_query(query.query)

    return DataResponse(data=ExecuteCharterPlaygroundResponse(data=data, error=error))


@router.delete("/{playground_public_id}", status_code=204)
async def delete_charter_playground(
    playground_public_id: str,
    charter: CharterModel = Depends(get_user_charter),
    db: Session = Depends(get_db),
):
    db_charter_playground = CharterPlaygroundService.delete_charter_playground(playground_public_id, charter.id, db)
    if not db_charter_playground:
        raise HTTPException(status_code=404, detail="Charter playground not found")
    return None
