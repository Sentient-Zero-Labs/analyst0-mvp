from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Session

from src.internal_services.llm_client.llm_client_service import LLMClientService
from src.prompts.charter_metric_example_explanation import (
    CharterMetricExplanationLLMResponse,
    charter_metric_explanation_system_prompt,
    charter_metric_explanation_user_prompt,
)
from src.services.charter_metric_example.charter_metric_example_model import CharterMetricExampleModel
from src.services.data_entity.data_entity_schema import DataEntityResponse
from src.services.data_entity.data_entity_service import DataEntityService

from .charter_metric_example_schema import (
    CharterMetricExampleCreate,
    CharterMetricExampleExplainResponse,
    CharterMetricExampleResponse,
    CharterMetricExampleUpdate,
)


class CharterMetricExampleService:
    @staticmethod
    async def create_charter_metric_example(
        charter_metric_example_create: CharterMetricExampleCreate, charter_metric_id: int, db: Session
    ) -> CharterMetricExampleModel:
        db_charter_metric_example = CharterMetricExampleModel(**charter_metric_example_create.model_dump())
        db_charter_metric_example.charter_metric_id = charter_metric_id

        db_charter_metric_example.embeddings = await CharterMetricExampleService.get_charter_metric_example_embedding(
            db_charter_metric_example
        )

        db.add(db_charter_metric_example)
        db.commit()
        db.refresh(db_charter_metric_example)

        return db_charter_metric_example

    @staticmethod
    def get_charter_metric_example(
        charter_metric_example_id: int, charter_metric_id: int, db: Session
    ) -> Optional[CharterMetricExampleModel]:
        charter_metric_example = (
            db.query(CharterMetricExampleModel)
            .filter(
                CharterMetricExampleModel.id == charter_metric_example_id,
                CharterMetricExampleModel.charter_metric_id == charter_metric_id,
            )
            .first()
        )

        return charter_metric_example

    @staticmethod
    def get_charter_metric_examples_list(charter_metric_id: int, db: Session) -> List[CharterMetricExampleModel]:
        examples = (
            db.query(CharterMetricExampleModel)
            .filter(CharterMetricExampleModel.charter_metric_id == charter_metric_id)
            .all()
        )

        return examples

    @staticmethod
    async def update_charter_metric_example(
        charter_metric_example_id: int,
        charter_metric_id: int,
        charter_metric_example_update: CharterMetricExampleUpdate,
        db: Session,
    ) -> Optional[CharterMetricExampleModel]:
        db_charter_metric_example = CharterMetricExampleService.get_charter_metric_example(
            charter_metric_example_id, charter_metric_id, db
        )

        if db_charter_metric_example:
            updated_charter_metric_example = charter_metric_example_update.model_dump(exclude_unset=True)
            for key, value in updated_charter_metric_example.items():
                setattr(db_charter_metric_example, key, value)

            db_charter_metric_example.embeddings = (
                await CharterMetricExampleService.get_charter_metric_example_embedding(db_charter_metric_example)
            )

            db.commit()
            db.refresh(db_charter_metric_example)

        return db_charter_metric_example

    @staticmethod
    def delete_charter_metric_example(
        charter_metric_example_id: int, charter_metric_id: int, db: Session
    ) -> Optional[CharterMetricExampleModel]:
        db_charter_metric_example = CharterMetricExampleService.get_charter_metric_example(
            charter_metric_example_id, charter_metric_id, db
        )

        if db_charter_metric_example:
            db.delete(db_charter_metric_example)
            db.commit()

        return db_charter_metric_example

    @staticmethod
    async def get_charter_metric_example_embedding(charter_metric_example: CharterMetricExampleModel):
        charter_metric_text = CharterMetricExampleService.get_charter_metric_example_text(charter_metric_example)
        return await LLMClientService.create_embeddings(charter_metric_text)

    @staticmethod
    def get_charter_metric_example_list_text(charter_metric_examples: List[CharterMetricExampleResponse]) -> str:
        charter_metric_examples_text_list = []
        for example in charter_metric_examples:
            charter_metric_examples_text_list.append(
                CharterMetricExampleService.get_charter_metric_example_text(example)
            )

        return "\n\n".join(charter_metric_examples_text_list)

    @staticmethod
    def get_charter_metric_example_text(charter_metric_example: CharterMetricExampleModel):
        return f"Query: {charter_metric_example.query} \nExplanation: {charter_metric_example.explanation}"

    @staticmethod
    async def explain_charter_metric_example(
        query: str, metric_name: str, metric_abbr: str, metric_description: str, data_entities: List[DataEntityResponse]
    ) -> Optional[CharterMetricExampleExplainResponse]:
        charter_metric_explanation_user_prompt_formated = charter_metric_explanation_user_prompt.format(
            metric_name=metric_name,
            metric_abbr=metric_abbr,
            metric_description=metric_description,
            tables="\n".join(
                [DataEntityService.create_data_entity_text_info(data_entity) for data_entity in data_entities]
            ),
            sql_query=query,
        )

        explanation = await LLMClientService.messages_with_instruction(
            messages=[
                {"role": "user", "content": charter_metric_explanation_user_prompt_formated},
            ],
            instruction=charter_metric_explanation_system_prompt,
            response_model=CharterMetricExplanationLLMResponse,
            model_type="small",
        )

        return CharterMetricExampleExplainResponse(
            query=query,
            explanation=explanation.explanation,
        )

    @staticmethod
    async def get_charter_metric_examples_by_metric_ids_and_charter_id(
        charter_metric_ids: List[int], charter_id: int, async_db: AsyncSession
    ) -> List[CharterMetricExampleResponse]:
        if not charter_metric_ids or len(charter_metric_ids) == 0:
            return []

        charter_metric_examples_stmt = select(CharterMetricExampleModel).filter(
            CharterMetricExampleModel.charter_metric_id.in_(charter_metric_ids)
        )

        charter_metric_examples = (await async_db.execute(charter_metric_examples_stmt)).scalars().all()

        return [
            CharterMetricExampleResponse.model_validate(charter_metric_example)
            for charter_metric_example in charter_metric_examples
        ]
