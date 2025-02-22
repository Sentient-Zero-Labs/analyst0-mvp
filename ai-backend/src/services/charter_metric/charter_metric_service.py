from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.internal_services.llm_client.llm_client_service import LLMClientService
from src.prompts.charter_metric_description import (
    CharterMetricDescribeLLMResponse,
    charter_metric_description_system_prompt,
    charter_metric_description_user_prompt,
)
from src.services.charter_metric.charter_metric_model import CharterMetricModel
from src.services.charter_metric.charter_metrics_schema import CharterMetricDescribeResponse, CharterMetricResponse
from src.services.data_entity.data_entity_schema import DataEntityResponse
from src.services.data_entity.data_entity_service import DataEntityService


class CharterMetricService:
    @staticmethod
    async def get_charter_metric_embedding(charter_metric: CharterMetricModel):
        charter_metric_text = CharterMetricService.get_charter_metric_text(charter_metric)
        return await LLMClientService.create_embeddings(charter_metric_text)

    @staticmethod
    def get_charter_metric_list_text(charter_metrics: List[CharterMetricResponse]) -> str:
        charter_metrics_text_list = []
        for metric in charter_metrics:
            charter_metrics_text_list.append(CharterMetricService.get_charter_metric_text(metric))

        return "\n\n".join(charter_metrics_text_list)

    @staticmethod
    def get_charter_metric_text(charter_metric: CharterMetricModel):
        return f"{charter_metric.name} ({charter_metric.abbreviation}): {charter_metric.description}"

    @staticmethod
    async def describe_charter_metric(
        metric_name: str, metric_abbr: str, data_entities: List[DataEntityResponse]
    ) -> Optional[CharterMetricDescribeResponse]:
        charter_metric_description_user_prompt_formated = charter_metric_description_user_prompt.format(
            metric_name=metric_name,
            metric_abbr=metric_abbr,
            tables="\n".join(
                [DataEntityService.create_data_entity_text_info(data_entity) for data_entity in data_entities]
            ),
        )

        descriptionLLMResponse = await LLMClientService.messages_with_instruction(
            messages=[
                {"role": "user", "content": charter_metric_description_user_prompt_formated},
            ],
            instruction=charter_metric_description_system_prompt,
            response_model=CharterMetricDescribeLLMResponse,
            model_type="small",
        )

        return CharterMetricDescribeResponse(
            name=metric_name,
            abbreviation=metric_abbr,
            description=descriptionLLMResponse.description,
        )

    @staticmethod
    async def get_charter_metrics_by_ids_and_charter_id(
        charter_metric_ids: List[int], charter_id: int, async_db: AsyncSession
    ) -> List[CharterMetricModel]:
        if not charter_metric_ids or len(charter_metric_ids) == 0:
            return []

        charter_metrics_stmt = select(CharterMetricModel).filter(
            CharterMetricModel.charter_id == charter_id, CharterMetricModel.id.in_(charter_metric_ids)
        )

        charter_metrics = (await async_db.execute(charter_metrics_stmt)).scalars().all()

        return [CharterMetricResponse.model_validate(charter_metric) for charter_metric in charter_metrics]
