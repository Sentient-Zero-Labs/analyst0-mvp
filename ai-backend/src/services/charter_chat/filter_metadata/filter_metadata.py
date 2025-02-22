import asyncio
import json

from src.internal_services.llm_client.llm_client_base import LLMModelType
from src.internal_services.llm_client.llm_client_service import LLMClientService
from src.services.charter_chat.charter_chat_schema import (
    FilterMetaDataLLMResponse,
    QueryMetadata,
    QueryPayload,
)
from src.services.charter_chat.filter_metadata.prompts.charter_example_prompts import (
    charter_example_prompt,
    charter_example_system_message,
)
from src.services.charter_chat.filter_metadata.prompts.charter_metric_examples_prompts import (
    charter_metric_example_prompt,
    charter_metric_example_system_message,
)
from src.services.charter_chat.filter_metadata.prompts.charter_metrics_prompts import (
    charter_metric_prompt,
    charter_metric_system_message,
)
from src.services.charter_chat.filter_metadata.prompts.data_entity_prompts import (
    data_entity_prompt,
    data_entity_system_message_v1,
)
from src.utils.logger import setup_logger

logger = setup_logger()


async def filter_data_entities(data_entities, processed_prompt):
    logger.info(f"Filtering {len(data_entities)} data entities")

    async def process_entity(entity):
        logger.info(f"Processing data entity: {entity.name}")
        formatted_prompt = data_entity_prompt.format(
            processed_prompt=processed_prompt,
            table_name=entity.name,
            table_description=entity.description,
            column_list="\n".join([f"- {col.name}: {col.description}" for col in entity.columns]),
            foreign_key_list="\n".join(
                [f"- {fk.column}: {fk.referred_column} : {fk.description}" for fk in entity.foreign_keys]
            ),
            index_list="\n".join([f"- {idx.name}: {idx.columns}" for idx in entity.indexes]),
        )

        response: FilterMetaDataLLMResponse = await LLMClientService.messages_with_instruction(
            [{"role": "user", "content": formatted_prompt}],
            data_entity_system_message_v1,
            FilterMetaDataLLMResponse,
        )

        try:
            if response.is_relevant == 1:
                logger.info(f"Data entity '{entity.name}' is relevant")
                return entity
            else:
                logger.debug(f"Data entity '{entity.name}' is not relevant")
                return None
        except json.JSONDecodeError:
            logger.error(f"Failed to parse JSON response for entity {entity.name}")
            return None

    results = await asyncio.gather(*[process_entity(entity) for entity in data_entities])
    filtered_data_entities = [entity for entity in results if entity is not None]
    original_data_entity_names = ", ".join([entity.name for entity in data_entities])
    filtered_data_entity_names = ", ".join([entity.name for entity in filtered_data_entities])

    logger.info(f"Filtered {filtered_data_entity_names} out of {original_data_entity_names} data entities")
    return filtered_data_entities


async def filter_charter_examples(charter_examples, processed_prompt):
    logger.info(f"Filtering {len(charter_examples)} charter examples")

    async def process_example(example):
        logger.debug(f"Processing charter example: ID {example.id}")

        formatted_prompt = charter_example_prompt.format(
            processed_prompt=processed_prompt,
            query=example.query,
            query_explanation=example.explanation,
        )

        response = await LLMClientService.messages_with_instruction(
            [{"role": "user", "content": formatted_prompt}],
            charter_example_system_message,
        )

        try:
            relevance_data = json.loads(response)
            if relevance_data["is_relevant"] == 1:
                logger.info(f"Charter example ID {example.id} is relevant")
                return example
            else:
                logger.debug(f"Charter example ID {example.id} is not relevant")
                return None
        except json.JSONDecodeError:
            logger.error(f"Failed to parse JSON response for charter example {example.id}")
            return None

    results = await asyncio.gather(*[process_example(example) for example in charter_examples])
    filtered_charter_examples = [example for example in results if example is not None]
    logger.info(f"Filtered {len(filtered_charter_examples)} out of {len(charter_examples)} charter examples")
    return filtered_charter_examples


async def filter_charter_metrics(charter_metrics, processed_prompt, model_type: LLMModelType = "large"):
    logger.info(f"Filtering {len(charter_metrics)} charter metrics")

    async def process_metric(charter_metric):
        logger.debug(f"Processing charter metric: {charter_metric.name}")
        formatted_prompt = charter_metric_prompt.format(
            processed_prompt=processed_prompt,
            metric_name=charter_metric.name,
            metric_abbreviation=charter_metric.abbreviation,
            metric_description=charter_metric.description,
        )

        response = await LLMClientService.messages_with_instruction(
            [{"role": "user", "content": formatted_prompt}],
            charter_metric_system_message,
            FilterMetaDataLLMResponse,
            model_type,
        )
        try:
            if response.is_relevant == 1:
                logger.info(f"Charter Metric '{charter_metric.name}' is relevant")
                return charter_metric
            else:
                logger.debug(f"Charter Metric '{charter_metric.name}' is not relevant")
                return None
        except json.JSONDecodeError:
            logger.error(f"Failed to parse JSON response for Charter Metric {charter_metric.name}")
            return None

    results = await asyncio.gather(*[process_metric(metric) for metric in charter_metrics])
    filtered_charter_metrics = [metric for metric in results if metric is not None]

    logger.info(f"Filtered {len(filtered_charter_metrics)} out of {len(charter_metrics)} charter metrics")

    return filtered_charter_metrics


async def filter_charter_metric_examples(charter_metric_examples, processed_prompt):
    logger.info(f"Filtering {len(charter_metric_examples)} charter metric examples")

    async def process_example(charter_metric_example):
        logger.debug(f"Processing charter metric example: ID {charter_metric_example.id}")

        formatted_prompt = charter_metric_example_prompt.format(
            processed_prompt=processed_prompt,
            query=charter_metric_example.query,
            query_explanation=charter_metric_example.explanation,
        )

        response = await LLMClientService.messages_with_instruction(
            [{"role": "user", "content": formatted_prompt}],
            charter_metric_example_system_message,
            FilterMetaDataLLMResponse,
        )

        try:
            if response.is_relevant == 1:
                logger.info(f"Charter Metric Example ID {charter_metric_example.id} is relevant")
                return charter_metric_example
            else:
                logger.debug(f"Charter Metric Example ID {charter_metric_example.id} is not relevant")
                return None
        except json.JSONDecodeError:
            logger.error(f"Failed to parse JSON response for Charter Metric Example {charter_metric_example.id}")
            return None

    results = await asyncio.gather(*[process_example(example) for example in charter_metric_examples])
    filtered_charter_metric_examples = [example for example in results if example is not None]

    logger.info(
        f"Filtered {len(filtered_charter_metric_examples)} out of {len(charter_metric_examples)} charter metric examples"
    )

    return filtered_charter_metric_examples


async def filter_metadata_using_llm(
    processed_query: QueryPayload, vector_search_result: QueryMetadata
) -> QueryMetadata:
    processed_prompt = processed_query.prompt

    filtered_results = await asyncio.gather(
        filter_data_entities(vector_search_result.data_entities, processed_prompt),
        filter_charter_examples(vector_search_result.charter_examples, processed_prompt),
        filter_charter_metrics(vector_search_result.charter_metrics, processed_prompt),
        filter_charter_metric_examples(vector_search_result.charter_metric_examples, processed_prompt),
    )

    # Unpack the results
    (
        filtered_data_entities,
        filtered_data_entity_examples,
        filtered_charter_metrics,
        filtered_charter_metric_examples,
    ) = filtered_results

    vector_search_result.data_entities = filtered_data_entities
    vector_search_result.charter_examples = filtered_data_entity_examples
    vector_search_result.charter_metrics = filtered_charter_metrics
    vector_search_result.charter_metric_examples = filtered_charter_metric_examples

    logger.info("Metadata filtering process completed")
    logger.info(
        f"Filtered results: {len(filtered_data_entities)} data entities, "
        f"{len(filtered_data_entity_examples)} data entity examples, "
        f"{len(filtered_charter_metrics)} charter metrics, "
        f"{len(filtered_charter_metric_examples)} charter metric examples"
    )

    return vector_search_result
