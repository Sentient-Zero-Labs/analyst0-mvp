from typing import List, Optional

from src.internal_services.llm_client.clients.claude_ai_cient import ClaudeAIClient
from src.internal_services.llm_client.clients.open_ai_client import OpenAIClient
from src.internal_services.llm_client.llm_client_base import LLMClientName, LLMModelType, T
from src.services.charter_chat.charter_chat_schema import Message
from src.utils.logger import logger

claude_client = ClaudeAIClient()
openai_client = OpenAIClient()

model_type_default_client = {
    "large": claude_client,
    "small": openai_client,
}


class LLMClientService:
    @staticmethod
    async def create_embeddings(text: str) -> List[float]:
        return await openai_client.create_embeddings(text)

    @staticmethod
    async def messages_with_instruction(
        messages: List[Message],
        instruction: str,
        response_model: Optional[T] = None,
        model_type: LLMModelType = "large",
        client_name: Optional[LLMClientName] = None,
    ) -> T | str:
        if client_name is None:
            client = model_type_default_client[model_type]
        elif client_name == "claude":
            client = claude_client
        elif client_name == "openai":
            client = openai_client

        logger.info(f"Using {model_type} model from {client.name} client")

        return await client.messages_with_instruction(messages, instruction, response_model, model_type)

    @staticmethod
    def create_messages_text_info(messages: List[Message]) -> str:
        message_list = []

        for message in messages:
            if message.role == "user":
                message_list.append(f"User Message: {message.content}")
            elif message.role == "assistant":
                if message.data_call:
                    message_list.append(
                        f"Assistant Data Call Message:\n Query: `{message.data_call.query}`\nQuery Explanation: `{message.data_call.explanation}`"
                    )
                else:
                    message_list.append(f"Assistant Message: {message.content}")

        return "\n\n".join(message_list)
