import time
from typing import List

from fastapi import HTTPException
from openai import AsyncOpenAI

from src.internal_services.llm_client.llm_client_base import LLMClientBase, LLMClientName, LLMModelType, T
from src.services.charter_chat.charter_chat_schema import Message
from src.settings import settings
from src.utils.logger import logger


class OpenAIClient(LLMClientBase):
    name: LLMClientName = "openai"

    def __init__(self):
        self.async_client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

    async def messages_with_instruction(
        self,
        messages: List[Message],
        instruction: str,
        response_model: T | None = None,
        model_type: LLMModelType = "large",
    ) -> T | str:
        """
        Simple instruction on messages. Input is a chat history and a system instruction. and pydantic response model.
        Output is a response from the LLM
        """
        start_time = time.time()
        logger.info("Simple instruction on messages")
        llmMessages: List[Message] = [{"role": "system", "content": f"{instruction}"}]
        llmMessages.extend(messages)

        if model_type == "small":
            model = "gpt-4o-mini"
            model = "gpt-4o"
        else:
            model = "gpt-4o"

        try:
            if response_model:
                response = await self.async_client.beta.chat.completions.parse(
                    messages=llmMessages,
                    model=model,
                    response_format=response_model,
                    temperature=0.5,
                    max_tokens=8000,
                    top_p=1,
                    stop=None,
                )
                response_message = response.choices[0].message.content

                result = response_model.model_validate_json(response_message)
            else:
                response = await self.async_client.beta.chat.completions.parse(
                    messages=llmMessages, model=model, temperature=0.5, max_tokens=2048, top_p=1, stop=None
                )

                response_message = response.choices[0].message.content
                result = str(response_message)

            end_time = time.time()
            execution_time = end_time - start_time
            logger.info(f"messages_with_instruction execution time: {execution_time:.2f} seconds")

            return result

        except Exception as e:
            logger.error(f"Error generating AI response: {e}")
            raise HTTPException(status_code=500, detail="Error generating AI response")
