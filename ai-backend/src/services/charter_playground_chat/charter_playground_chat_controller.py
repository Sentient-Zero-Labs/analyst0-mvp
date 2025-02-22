from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Session

from src.database import get_async_db, get_db
from src.internal_services.sql_analyzer.sql_analyzer_factory import SQLAnalyzerFactory
from src.middleware.wrap_response import DataResponse, DataResponseClass
from src.services.charter.charter_dep import get_user_charter
from src.services.charter.charter_model import CharterModel
from src.services.charter_metric.charter_metric_service import CharterMetricService
from src.services.charter_metric_example.charter_metric_example_service import CharterMetricExampleService
from src.services.charter_playground_chat.charter_playground_chat_schema import (
    PlaygroundChatInput,
    PlaygroundMessage,
)
from src.services.charter_playground_chat.charter_playground_chat_service import CharterPlaygroundChatService
from src.services.data_entity.data_entity_schema import DataEntityResponse
from src.services.data_entity.data_entity_service import DataEntityService
from src.services.organisation_usage.organisation_usage_dep import check_organisation_credit_usage_for_playground
from src.services.organisation_usage.organisation_usage_service import OrganisationUsageService
from src.utils.logger import setup_logger
from src.utils.sqlalchemy_pydantic_utils import to_pydantic_list

router = APIRouter(
    prefix="/organisation/{organisation_public_id}/charter/{charter_id}/playground/{playground_public_id}/chat"
)

logger = setup_logger()


@router.post("/", response_model=DataResponseClass[PlaygroundChatInput])
async def handle_playground_chat(
    playground_chat_input: PlaygroundChatInput,
    has_credits: bool = Depends(check_organisation_credit_usage_for_playground),
    charter: CharterModel = Depends(get_user_charter),
    async_db: AsyncSession = Depends(get_async_db),
    db: Session = Depends(get_db),
):
    try:
        # We are updating the last playground message with the data entities and examples
        last_user_message: PlaygroundMessage = playground_chat_input.messages[-1]

        if last_user_message.role != "user":
            logger.error("Last message is not from user")
            raise HTTPException(status_code=400, detail="Last message must be from the user")

        # Extract tables and columns from the query.
        sql_analyzer = SQLAnalyzerFactory.get_sql_analyzer(charter.data_source.type)

        try:
            table_names = sql_analyzer.extract_table_names(last_user_message.context.query)

            last_user_message.context.data_entities = to_pydantic_list(
                DataEntityService.get_data_entities_by_table_names_and_charter_id(table_names, charter.id, db),
                DataEntityResponse,
            )
        except Exception:
            last_user_message.context.data_entities = []

        # Add data entities that are not in the query but giving directly in the context by the user
        remaining_data_entity_ids = set(last_user_message.context.data_entity_ids) - set(
            [data_entity.id for data_entity in last_user_message.context.data_entities]
        )

        if len(remaining_data_entity_ids) > 0:
            last_user_message.context.data_entities.extend(
                await DataEntityService.get_data_entities_by_ids_and_charter_id(
                    last_user_message.context.data_entity_ids, charter.id, async_db
                )
            )

        # Add charter metrics given directly in the context by the user
        last_user_message.context.charter_metrics = (
            await CharterMetricService.get_charter_metrics_by_ids_and_charter_id(
                last_user_message.context.charter_metric_ids, charter.id, async_db
            )
        )

        # Add charter metric examples for the metrics given in the context by the user
        last_user_message.context.charter_metric_examples = (
            await CharterMetricExampleService.get_charter_metric_examples_by_metric_ids_and_charter_id(
                last_user_message.context.charter_metric_ids, charter.id, async_db
            )
        )

        # As we have updated the last user message with the data entities and examples, which is an object
        # so the last message is now updated, we can send it to the LLM
        playground_chat_response = await CharterPlaygroundChatService.handle_playground_messages(
            playground_chat_input, charter.data_source.type
        )

        # IMP: Update the daily organisation usage
        OrganisationUsageService.update_daily_organisation_usage(
            charter.organisation_id,
            db,
            small_credit_count=1 if playground_chat_input.model_type == "small" else 0,
            large_credit_count=1 if playground_chat_input.model_type == "large" else 0,
        )

        return DataResponse(data=playground_chat_response)

    except Exception as e:
        logger.exception(f"Error processing query: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
