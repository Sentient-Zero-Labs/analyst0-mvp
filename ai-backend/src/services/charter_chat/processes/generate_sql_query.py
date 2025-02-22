from typing import Tuple

from src.internal_services.data_source_connector.data_source_connector_base import DataSourceConnectorBase
from src.internal_services.llm_client.llm_client_service import LLMClientService
from src.prompts.generate_analytics_query import AnalyticsQueryLLMResponse, system_message_2, user_prompt_template
from src.prompts.generate_analytics_query_on_error import (
    GenerateCorrectedQueryOnErrorPrompt,
    handle_sql_error_system_message,
    handle_sql_error_system_message_v2,
    handle_sql_error_user_prompt_template,
    handle_sql_error_user_prompt_template_v2,
)
from src.prompts.verify_analytics_query import (
    VerifyAnalyticsQueryLLMResponse,
    verify_analytics_query_system_message,
    verify_analytics_query_user_prompt,
)
from src.services.charter_chat.charter_chat_schema import (
    AnalyticsQueryResponse,
    DataCallResponse,
    QueryMetadata,
    QueryPayload,
)
from src.services.charter_example.charter_example_service import CharterExampleService
from src.services.charter_metric.charter_metric_service import CharterMetricService
from src.services.charter_metric_example.charter_metric_example_service import CharterMetricExampleService
from src.services.data_entity.data_entity_service import DataEntityService
from src.settings import settings
from src.utils.logger import setup_logger

logger = setup_logger()

MAX_RETRY_ATTEMPTS = 3


async def handle_analytics_query(
    query_payload: QueryPayload, query_metadata: QueryMetadata, user_db_manager: DataSourceConnectorBase
) -> AnalyticsQueryResponse:
    type, content, explanation = await _llm_chat_analytics_query(query_payload, query_metadata, user_db_manager)

    if type == "general":
        return AnalyticsQueryResponse(content=content, status="success")
    else:
        sql_query = content

    # Extract table names
    data_entity_names = user_db_manager.query_analyzer.extract_table_names(sql_query)

    # Execute the query
    data, error, status = await user_db_manager.execute_query(sql_query)

    if status != "failed":
        logger.info("Query executed successfully")
        return AnalyticsQueryResponse(
            status="success",
            data_call=DataCallResponse(
                query=sql_query, data_entity_names=data_entity_names, explanation=explanation, data=data
            )
            if sql_query
            else None,
        )
    else:
        logger.info("Query execution failed. Retrying...")
        for attempt in range(MAX_RETRY_ATTEMPTS):
            logger.info(f"Retry Attempt {attempt + 1} of {MAX_RETRY_ATTEMPTS}")

            # COMMENTED OUT FOR NOW. WE ARE USING THE SECOND ERROR HANDLING METHOD FOR NOW
            # type, content, explanation = await handle_sql_execution_error_1(
            #     query_payload, query_metadata, user_db_manager, error
            # )

            # Using the second error handling method
            _, sql_query, explanation = await _llm_chat_handle_sql_execution_error_2(sql_query, error, user_db_manager)

            # Extract table names
            data_entity_names = user_db_manager.query_analyzer.extract_table_names(sql_query)

            # Execute the query
            data, error, status = await user_db_manager.execute_query(sql_query)

            if status != "failed":
                logger.info("Query executed successfully on retry")
                return AnalyticsQueryResponse(
                    status="success",
                    data_call=DataCallResponse(
                        query=sql_query, data_entity_names=data_entity_names, explanation=explanation, data=data
                    )
                    if sql_query
                    else None,
                )

    return AnalyticsQueryResponse(
        content="Failed to execute the query after multiple attempts. Please try again.",
        status="failed",
        data_call=DataCallResponse(
            query=sql_query,
            data_entity_names=data_entity_names,
            explanation=explanation,
            error="Failed to execute the query after multiple attempts. Please try again.",
        ),
    )


async def _get_analytics_query_metadata(query_metadata: QueryMetadata, query_payload: QueryPayload) -> QueryMetadata:
    data_entities = DataEntityService.create_data_entity_list_text_info(query_metadata.data_entities)
    charter_examples = CharterExampleService.create_charter_example_list_text_info(query_metadata.charter_examples)
    charter_metrics = CharterMetricService.get_charter_metric_list_text(query_metadata.charter_metrics)
    charter_metric_examples = CharterMetricExampleService.get_charter_metric_example_list_text(
        query_metadata.charter_metric_examples
    )

    user_and_ai_messages = (
        LLMClientService.create_messages_text_info(query_payload.messages) if len(query_payload.messages) > 1 else ""
    )

    return data_entities, charter_examples, charter_metrics, charter_metric_examples, user_and_ai_messages


async def _llm_chat_analytics_query(
    query_payload: QueryPayload,
    query_metadata: QueryMetadata,
    user_db_manager: DataSourceConnectorBase,
) -> Tuple[str, str, str]:
    (
        data_entities,
        charter_examples,
        charter_metrics,
        charter_metric_examples,
        user_and_ai_messages,
    ) = await _get_analytics_query_metadata(query_metadata, query_payload)

    # Format the user prompt
    user_prompt = user_prompt_template.format(
        processed_prompt=query_payload.prompt,
        data_entities=data_entities,
        charter_examples=charter_examples,
        charter_metrics=charter_metrics,
        charter_metric_examples=charter_metric_examples,
        user_and_ai_messages=user_and_ai_messages,
    )

    system_message_formatted = system_message_2.format(dialect=user_db_manager.dialect)

    analytics_query_llm_response = await LLMClientService.messages_with_instruction(
        [{"role": "user", "content": user_prompt}], system_message_formatted, AnalyticsQueryLLMResponse, "large"
    )

    if analytics_query_llm_response.type == "general" or analytics_query_llm_response.query is None:
        return "general", analytics_query_llm_response.content, None

    explanation = analytics_query_llm_response.explanation

    # Add limit and format the query if not in benchmark mode else just use the query as it is
    if settings.IS_BENCHMARK_MODE:
        sql_query = user_db_manager.query_analyzer.format_query(analytics_query_llm_response.query)
    else:
        sql_query = user_db_manager.query_analyzer.add_limit(analytics_query_llm_response.query)
        sql_query = user_db_manager.query_analyzer.format_query(sql_query)

    # type, sql_query, explanation = await handle_sql_query_verification(
    #     sql_query, query_payload, query_metadata, user_db_manager
    # )

    return "analytics", sql_query, explanation


async def _llm_chat_sql_query_verification(
    sql_query: str,
    explanation: str,
    query_payload: QueryPayload,
    query_metadata: QueryMetadata,
    user_db_manager: DataSourceConnectorBase,
) -> Tuple[str, str]:
    (
        data_entities,
        charter_examples,
        charter_metrics,
        charter_metric_examples,
        user_and_ai_messages,
    ) = await _get_analytics_query_metadata(query_metadata, query_payload)

    # Verify if the query is correct
    verify_analytics_query_system_message_formatted = verify_analytics_query_system_message.format(
        dialect=user_db_manager.dialect
    )

    verify_analytics_query_user_prompt_formatted = verify_analytics_query_user_prompt.format(
        data_entities=data_entities, sql_query=sql_query, user_prompt=query_payload.prompt
    )

    verify_analytics_query_llm_response = await LLMClientService.messages_with_instruction(
        [{"role": "user", "content": verify_analytics_query_user_prompt_formatted}],
        verify_analytics_query_system_message_formatted,
        VerifyAnalyticsQueryLLMResponse,
        "large",
    )

    if not verify_analytics_query_llm_response.is_correct:
        logger.info("Query is not correct. Corrected the query.")
        sql_query = verify_analytics_query_llm_response.correct_sql_query
        explanation = verify_analytics_query_llm_response.explanation

    return "analytics", sql_query, explanation


async def _llm_chat_handle_sql_execution_error_1(
    query_payload: QueryPayload,
    query_metadata: QueryMetadata,
    user_db_manager: DataSourceConnectorBase,
    error: str,
) -> Tuple[str, str]:
    (
        data_entities,
        charter_examples,
        charter_metrics,
        charter_metric_examples,
        user_and_ai_messages,
    ) = await _get_analytics_query_metadata(query_metadata, query_payload)

    handle_sql_error_system_message_formatted = handle_sql_error_system_message.format(dialect=user_db_manager.dialect)

    handle_sql_error_user_prompt = handle_sql_error_user_prompt_template.format(
        processed_prompt=query_payload.prompt,
        data_entities=data_entities,
        charter_examples=charter_examples,
        charter_metrics=charter_metrics,
        charter_metric_examples=charter_metric_examples,
        user_and_ai_messages=user_and_ai_messages,
        query_error_info=error,
    )

    analytics_query_llm_response = await LLMClientService.messages_with_instruction(
        [{"role": "user", "content": handle_sql_error_user_prompt}],
        handle_sql_error_system_message_formatted,
        AnalyticsQueryLLMResponse,
        "large",
    )

    if analytics_query_llm_response.type == "general" or analytics_query_llm_response.query is None:
        return "general", analytics_query_llm_response.content

    # Add limit and format the query if not in benchmark mode else just use the query as it is
    if settings.IS_BENCHMARK_MODE:
        sql_query = user_db_manager.query_analyzer.format_query(analytics_query_llm_response.query)
    else:
        sql_query = user_db_manager.query_analyzer.add_limit(analytics_query_llm_response.query)
        sql_query = user_db_manager.query_analyzer.format_query(sql_query)

    return "analytics", sql_query, analytics_query_llm_response.explanation


async def _llm_chat_handle_sql_execution_error_2(
    query: str,
    error: str,
    user_db_manager: DataSourceConnectorBase,
) -> Tuple[str, str]:
    handle_sql_error_system_message_formatted = handle_sql_error_system_message_v2.format(
        dialect=user_db_manager.dialect
    )

    handle_sql_error_user_prompt = handle_sql_error_user_prompt_template_v2.format(
        dialect=user_db_manager.dialect,
        sql_query=query,
        error=error,
    )

    corrected_query_on_error_prompt = await LLMClientService.messages_with_instruction(
        [{"role": "user", "content": handle_sql_error_user_prompt}],
        handle_sql_error_system_message_formatted,
        GenerateCorrectedQueryOnErrorPrompt,
        "large",
    )

    if settings.IS_BENCHMARK_MODE:
        sql_query = user_db_manager.query_analyzer.format_query(corrected_query_on_error_prompt.corrected_query)
    else:
        sql_query = user_db_manager.query_analyzer.add_limit(corrected_query_on_error_prompt.corrected_query)
        sql_query = user_db_manager.query_analyzer.format_query(sql_query)

    return "analytics", sql_query, corrected_query_on_error_prompt.explanation
