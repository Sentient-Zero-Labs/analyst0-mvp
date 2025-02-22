from typing import List, Optional

from sqlalchemy.orm import Session

from src.internal_services.llm_client.llm_client_service import LLMClientService
from src.prompts.charter_example_explanation import (
    CharterExampleExplanationLLMResponse,
    charter_example_explanation_system_prompt,
    charter_example_explanation_user_prompt,
)
from src.services.charter_example.charter_example_model import CharterExampleModel
from src.services.charter_example.charter_example_schema import (
    CharterExampleCreate,
    CharterExampleExplainResponse,
    CharterExampleResponse,
    CharterExampleUpdate,
)
from src.services.data_entity.data_entity_model import DataEntityModel
from src.services.data_entity.data_entity_service import DataEntityService


class CharterExampleService:
    @staticmethod
    async def create_charter_example(
        charter_example_create: CharterExampleCreate, charter_id: int, db: Session
    ) -> CharterExampleModel:
        db_charter_example = CharterExampleModel(**charter_example_create.model_dump())
        db_charter_example.charter_id = charter_id

        db_charter_example.embeddings = await CharterExampleService.get_charter_example_embeddings(db_charter_example)

        db.add(db_charter_example)
        db.commit()
        db.refresh(db_charter_example)

        return db_charter_example

    @staticmethod
    def get_charter_example(charter_example_id: int, charter_id: int, db: Session) -> Optional[CharterExampleModel]:
        charter_example = (
            db.query(CharterExampleModel)
            .filter(
                CharterExampleModel.id == charter_example_id,
                CharterExampleModel.charter_id == charter_id,
            )
            .first()
        )

        return charter_example

    @staticmethod
    def get_charter_examples_list(charter_id: int, db: Session) -> List[CharterExampleModel]:
        charter_examples = (
            db.query(CharterExampleModel)
            .filter(
                CharterExampleModel.charter_id == charter_id,
            )
            .all()
        )

        return charter_examples

    @staticmethod
    async def update_charter_example(
        charter_example_id: int,
        charter_id: int,
        charter_example_update: CharterExampleUpdate,
        db: Session,
    ) -> Optional[CharterExampleModel]:
        db_charter_example = CharterExampleService.get_charter_example(charter_example_id, charter_id, db)

        if db_charter_example:
            updated_charter_example = charter_example_update.model_dump(exclude_unset=True)

            for key, value in updated_charter_example.items():
                setattr(db_charter_example, key, value)

            db_charter_example.embeddings = await CharterExampleService.get_charter_example_embeddings(
                db_charter_example
            )

            db.commit()
            db.refresh(db_charter_example)

        return db_charter_example

    @staticmethod
    def delete_charter_example(charter_example_id: int, charter_id: int, db: Session) -> Optional[CharterExampleModel]:
        db_charter_example = CharterExampleService.get_charter_example(charter_example_id, charter_id, db)

        if db_charter_example:
            db.delete(db_charter_example)
            db.commit()

        return db_charter_example

    @staticmethod
    async def get_charter_example_embeddings(charter_example: CharterExampleModel):
        charter_example_text = CharterExampleService.get_charter_example_text(charter_example)
        return await LLMClientService.create_embeddings(charter_example_text)

    @staticmethod
    def get_charter_example_text(charter_example: CharterExampleModel):
        return f"Query: {charter_example.query} \nExplanation: {charter_example.explanation}"

    @staticmethod
    async def explain_charter_example(
        query: str, data_entities: List[DataEntityModel]
    ) -> CharterExampleExplanationLLMResponse:
        charter_example_explanation_user_prompt_formated = charter_example_explanation_user_prompt.format(
            query=query,
            data_entities="\n".join(
                [DataEntityService.create_data_entity_text_info(data_entity) for data_entity in data_entities]
            ),
        )

        explanation = await LLMClientService.messages_with_instruction(
            messages=[
                {"role": "user", "content": charter_example_explanation_user_prompt_formated},
            ],
            instruction=charter_example_explanation_system_prompt,
            response_model=CharterExampleExplanationLLMResponse,
            model_type="large",
        )

        return CharterExampleExplainResponse(
            query=query,
            explanation=explanation.explanation,
        )

    @staticmethod
    def create_charter_example_list_text_info(charter_examples: List[CharterExampleResponse]) -> str:
        charter_examples_text_list = []
        for example in charter_examples:
            charter_examples_text_list.append(CharterExampleService.create_charter_example_text_info(example))

        return "\n\n".join(charter_examples_text_list)

    @staticmethod
    def create_charter_example_text_info(charter_example: CharterExampleResponse):
        return f"Query: {charter_example.query} \nExplanation: {charter_example.explanation}"
