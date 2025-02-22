import asyncio
from typing import List

from pgvector.sqlalchemy import Vector
from sqlalchemy import cast, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.internal_services.llm_client.llm_client_service import LLMClientService
from src.services.charter.charter_model import CharterDataEntityModel
from src.services.charter_chat.charter_chat_schema import QueryMetadata, QueryPayload
from src.services.charter_example.charter_example_model import CharterExampleModel
from src.services.charter_example.charter_example_schema import CharterExampleResponse
from src.services.charter_metric.charter_metric_model import CharterMetricModel
from src.services.charter_metric.charter_metrics_schema import CharterMetricResponse
from src.services.charter_metric_example.charter_metric_example_model import CharterMetricExampleModel
from src.services.charter_metric_example.charter_metric_example_schema import CharterMetricExampleResponse
from src.services.data_entity.data_entity_model import DataEntityModel
from src.services.data_entity.data_entity_schema import DataEntityResponse


async def vector_search_for_metadata(
    processed_query: QueryPayload, charter_id: int, async_db: AsyncSession
) -> QueryMetadata:
    prompt_embedding = cast((await LLMClientService.create_embeddings(processed_query.prompt)), Vector)

    # Create separate session factories for each concurrent operation.
    # THIS IS REQUIRED BECAUSE SOMEHOW WE CANT USE THE SAME SESSION FOR MULTIPLE QUERIES AT ONCE
    async def get_data_entities():
        async with AsyncSession(async_db.bind) as session:
            return await get_relevant_data_entities(charter_id, prompt_embedding, session, limit=10)

    async def get_metrics():
        async with AsyncSession(async_db.bind) as session:
            return await get_relevant_charter_metrics(charter_id, prompt_embedding, session, limit=3)

    async def get_examples():
        async with AsyncSession(async_db.bind) as session:
            return await get_relevant_charter_examples(charter_id, prompt_embedding, session, limit=5)

    # Use asyncio.gather to run both queries concurrently
    data_entities, charter_metrics, charter_examples = await asyncio.gather(
        get_data_entities(), get_metrics(), get_examples()
    )

    # Use the original session for this query as it depends on the results of the previous queries
    charter_metric_examples = await get_relevant_charter_metric_examples(
        [cm.id for cm in charter_metrics], prompt_embedding, async_db, limit=10
    )

    # Combine all results
    result = QueryMetadata(
        data_entities=data_entities,
        charter_examples=charter_examples,
        charter_metrics=charter_metrics,
        charter_metric_examples=charter_metric_examples,
    )

    return result


async def get_relevant_data_entities(
    charter_id: int, prompt_embedding: Vector, async_db: AsyncSession, limit: int = 5
) -> List[DataEntityModel]:
    data_entities_stmt = (
        select(DataEntityModel)
        .join(CharterDataEntityModel, CharterDataEntityModel.data_entity_id == DataEntityModel.id)
        .filter(CharterDataEntityModel.charter_id == charter_id)
        .order_by(DataEntityModel.embeddings.cosine_distance(prompt_embedding))
        .limit(limit)
    )

    result = (await async_db.execute(data_entities_stmt)).scalars().all()
    return [DataEntityResponse.model_validate(data_entity) for data_entity in result]


async def get_relevant_charter_metrics(
    charter_id: int, prompt_embedding: Vector, async_db: AsyncSession, limit: int = 5
) -> List[CharterMetricModel]:
    charter_metrics_stmt = (
        select(CharterMetricModel)
        # Get similarity score in the result
        # select(CharterMetricModel, CharterMetricModel.embeddings.cosine_distance(prompt_embedding).label("similarity"))
        .filter(CharterMetricModel.charter_id == charter_id)
        .order_by(CharterMetricModel.embeddings.cosine_distance(prompt_embedding))
        .limit(limit)
    )

    # Print SQL statement
    # print(charter_metrics_stmt.compile(dialect=async_db.bind.dialect, compile_kwargs={"literal_binds": True}))

    result = (await async_db.execute(charter_metrics_stmt)).scalars().all()
    return [CharterMetricResponse.model_validate(charter_metric) for charter_metric in result]


async def get_relevant_charter_examples(
    charter_id: int, prompt_embedding: Vector, async_db: AsyncSession, limit: int = 5
) -> List[CharterExampleModel]:
    charter_examples_stmt = (
        select(CharterExampleModel)
        .filter(CharterExampleModel.charter_id == charter_id)
        .order_by(CharterExampleModel.embeddings.cosine_distance(prompt_embedding))
        .limit(limit)
    )

    result = (await async_db.execute(charter_examples_stmt)).scalars().all()
    return [CharterExampleResponse.model_validate(charter_example) for charter_example in result]


async def get_relevant_charter_metric_examples(
    charter_metric_ids: List[int], prompt_embedding: Vector, async_db: AsyncSession, limit: int = 5
) -> List[CharterMetricModel]:
    if not charter_metric_ids or len(charter_metric_ids) == 0:
        return []

    charter_metric_examples_stmt = (
        select(CharterMetricExampleModel)
        .filter(CharterMetricExampleModel.charter_metric_id.in_(charter_metric_ids))
        .order_by(CharterMetricExampleModel.embeddings.cosine_distance(prompt_embedding))
        .limit(limit)
    )

    result = (await async_db.execute(charter_metric_examples_stmt)).scalars().all()
    return [CharterMetricExampleResponse.model_validate(charter_metric) for charter_metric in result]
