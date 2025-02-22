import time
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Session

from src.database import get_async_db, get_db
from src.internal_services.data_source_connector.data_source_connector_base import (
    DataSourceConnectorBase,
)
from src.internal_services.data_source_connector.data_source_connector_dependency import (
    get_user_data_source_connector_for_charter,
)
from src.middleware.wrap_response import DataResponse, DataResponseClass
from src.services.charter.charter_dep import get_user_charter
from src.services.charter.charter_model import CharterModel
from src.services.charter_chat.charter_chat_conversation_service import CharterChatConversationService
from src.services.charter_chat.charter_chat_schema import (
    ChatInput,
    ConversationListResponse,
    Message,
    QueryPayload,
)
from src.services.charter_chat.charter_chat_service import (
    vector_search_for_metadata,
)
from src.services.charter_chat.filter_metadata.filter_metadata_v2 import filter_metadata_using_llm_v2
from src.services.charter_chat.processes.generate_sql_query import (
    handle_analytics_query,
)
from src.services.charter_chat.processes.process_question import process_query
from src.services.charter_metric.charter_metric_service import CharterMetricService
from src.services.data_entity.data_entity_service import DataEntityService
from src.services.organisation_usage.organisation_usage_dep import check_organisation_credit_usage_for_chat
from src.services.organisation_usage.organisation_usage_service import OrganisationUsageService
from src.utils.array_utils import merge_arrays
from src.utils.logger import setup_logger

router = APIRouter(prefix="/organisations/{organisation_public_id}/charters/{charter_id}/chat")

logger = setup_logger()


@router.get("/conversations", response_model=DataResponseClass[List[ConversationListResponse]])
async def get_conversations(
    charter: CharterModel = Depends(get_user_charter),
    async_db: AsyncSession = Depends(get_async_db),
):
    conversations = await CharterChatConversationService.get_conversations_by_charter(charter.id, async_db)
    return DataResponse(
        data=[
            ConversationListResponse(
                conversation_id=conv.conversation_id,
                created_at=conv.created_at,
                updated_at=conv.updated_at,
                last_message=Message(**conv.messages[-1]) if conv.messages else None,
            )
            for conv in conversations
        ]
    )


@router.get("/conversations/{conversation_id}", response_model=DataResponseClass[List[Message]])
async def get_conversation(
    conversation_id: str,
    charter: CharterModel = Depends(get_user_charter),
    async_db: AsyncSession = Depends(get_async_db),
):
    conversation = await CharterChatConversationService.get_conversation(conversation_id, async_db)
    if not conversation or conversation.charter_id != charter.id:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return DataResponse(data=[Message(**msg) for msg in conversation.messages])


@router.post("/", response_model=DataResponseClass[List[Message]])
async def handle_chat_question(
    chat_input: ChatInput,
    has_credits: bool = Depends(check_organisation_credit_usage_for_chat),
    charter: CharterModel = Depends(get_user_charter),
    async_db: AsyncSession = Depends(get_async_db),
    db: Session = Depends(get_db),
    data_source_connector: DataSourceConnectorBase = Depends(get_user_data_source_connector_for_charter),
):
    # start time
    start_time = time.time()

    last_user_message: Message = chat_input.messages[-1]
    if last_user_message.role != "user":
        logger.error("Last message is not from user")
        raise HTTPException(status_code=400, detail="Last message must be from the user")

    query_payload = QueryPayload(
        messages=chat_input.messages,
        original_prompt=last_user_message.content,
        prompt=last_user_message.content,
    )

    chat_input_context_data_entities = await DataEntityService.get_data_entities_by_ids_and_charter_id(
        chat_input.context.data_entity_ids, charter.id, async_db
    )

    chat_input_context_charter_metrics = await CharterMetricService.get_charter_metrics_by_ids_and_charter_id(
        chat_input.context.charter_metric_ids, charter.id, async_db
    )

    # Process the user prompt and add metrics and other information to the query
    processed_query = await process_query(query_payload, charter.id, async_db)

    # Perform vector search and get relevant metadata data
    query_metadata = await vector_search_for_metadata(processed_query, charter.id, async_db)

    # Filter the metadata to get the better relevant data using LLM
    query_metadata = await filter_metadata_using_llm_v2(processed_query, query_metadata, model_type="small")

    # Merge the data entities from the chat input context and the query metadata
    query_metadata.data_entities = merge_arrays(chat_input_context_data_entities, query_metadata.data_entities)
    query_metadata.charter_metrics = merge_arrays(chat_input_context_charter_metrics, query_metadata.charter_metrics)

    analytics_query_response = await handle_analytics_query(processed_query, query_metadata, data_source_connector)

    query_payload.messages.append(Message(**analytics_query_response.model_dump(), role="assistant"))

    # Store or update conversation
    if chat_input.conversation_id:
        update_success = await CharterChatConversationService.update_conversation(
            chat_input.conversation_id, query_payload.messages, async_db
        )
        if not update_success:
            raise HTTPException(status_code=404, detail="Conversation not found")
    else:
        chat_input.conversation_id = await CharterChatConversationService.create_conversation(
            charter.id, query_payload.messages, async_db
        )

    logger.info("Query processing completed successfully")

    end_time = time.time()
    logger.info(f"Query processing time: {end_time - start_time} seconds")

    # Update the daily organisation usage
    OrganisationUsageService.update_daily_organisation_usage(
        charter.organisation_id,
        db,
        small_credit_count=6,
        large_credit_count=2,
    )

    return DataResponse(data=query_payload.messages)
