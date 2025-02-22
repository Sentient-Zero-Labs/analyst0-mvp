from abc import ABC, abstractmethod
from typing import List, Literal, TypeVar

from pydantic import BaseModel

from src.services.charter_chat.charter_chat_schema import Message

LLMModelType = Literal["small", "large"]
LLMClientName = Literal["claude", "openai"]

T = TypeVar("T", bound=BaseModel)


class LLMClientBase(ABC):
    name = None
    client = None
    async_client = None

    def __init__(self):
        pass

    @abstractmethod
    async def messages_with_instruction(
        messages: List[Message],
        instruction: str,
        response_model: T | None = None,
        model_type: LLMModelType = "large",
    ) -> T | str:
        pass

    # Always USE OpenAI for embeddings. As we already have used them and created the embeddings and saved them in the database.
    # If we change this, we need to update the embeddings in the database everywhere.
    async def create_embeddings(self, text: str):
        embeddings = await self.async_client.embeddings.create(input=text, model="text-embedding-3-small")
        return embeddings.data[0].embedding
