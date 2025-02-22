from fastapi import APIRouter, Depends, HTTPException

from src.internal_services.data_source_connector.data_source_connector_factory import DataSourceConnectorFactory
from src.middleware.wrap_response import DataResponse
from src.services.charter.charter_schema import CharterResponse
from src.services.data_entity.data_entity_model import DataEntityModel
from src.services.try_it_out.try_it_out_dep import get_try_it_out_charter, get_try_it_out_data_entity

router = APIRouter(prefix="/try-it-out")


@router.get("/charters/{charter_id}/data-entities/{data_entity_id}/sample-data")
async def get_data_entity_sample_data_for_charter(
    db_charter: CharterResponse = Depends(get_try_it_out_charter),
    db_data_entity: DataEntityModel = Depends(get_try_it_out_data_entity),
):
    data_source_connector = DataSourceConnectorFactory.get_data_source_connector(db_charter.data_source)

    query = f"SELECT * FROM {db_data_entity.schema_name}.{db_data_entity.name} LIMIT 10"

    result, error, status = await data_source_connector.execute_query(query)

    if error:
        raise HTTPException(status_code=400, detail=error)

    return DataResponse(data={"data": result, "error": error, "status": status})
