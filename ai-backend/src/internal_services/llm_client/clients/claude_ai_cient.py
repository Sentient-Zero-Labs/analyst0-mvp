import json
import time
from typing import List, Optional

import anthropic
from fastapi import HTTPException

from src.internal_services.llm_client.llm_client_base import LLMClientBase, LLMClientName, LLMModelType, T
from src.services.charter_chat.charter_chat_schema import Message
from src.settings import settings
from src.utils.logger import logger


class ClaudeAIClient(LLMClientBase):
    name: LLMClientName = "claude"

    def __init__(self):
        self.client = anthropic.AsyncAnthropic(api_key=settings.CLAUDE_API_KEY)

    async def messages_with_instruction(
        self,
        messages: List[Message],
        instruction: str,
        response_model: Optional[T] = None,
        model_type: LLMModelType = "large",
    ) -> T | str:
        """
        Simple instruction on messages for Claude API with support for structured output.
        Input is a chat history, system instruction, and optional pydantic response model.
        Output is a response from Claude, either as structured data or raw text.
        """
        start_time = time.time()
        logger.info("Claude simple instruction on messages")

        # Select model based on size
        if model_type == "small":
            model = "claude-3-5-haiku-latest"
        else:
            model = "claude-3-5-sonnet-latest"

        try:
            if response_model:
                # For structured output, we'll add specific instructions
                schema = response_model.model_json_schema()
                system_prompt = (
                    f"{instruction}\n\n"
                    f"Please provide your response as a JSON string following this schema:\n"
                    f"{json.dumps(schema, indent=2)}\n"
                    f"Ensure the response is valid JSON that matches this schema exactly. This JSON string should be SAFE to parse as a JSON object."
                )

                messages.append({"role": "assistant", "content": "{"})

                response = await self.client.messages.create(
                    model=model,
                    messages=messages,
                    system=system_prompt,
                    temperature=0.5,
                    max_tokens=2048,
                )

                response_content = "{" + response.content[0].text

                try:
                    # Parse the response as JSON and validate against the model
                    cleaned_response = (
                        response_content.strip()
                        .replace("\\n", " ")
                        .replace("\n", " ")
                        .replace("\r", " ")
                        .replace("\\'", "'")
                    )
                    # cleaned_response = response_content
                    parsed_json = json.loads(cleaned_response)
                    result = response_model.model_validate(parsed_json)
                except json.JSONDecodeError as e:
                    raise ValueError(f"Invalid JSON response from Claude: {e} \ncleaned_response: {cleaned_response}")
                except Exception as e:
                    raise ValueError(f"Response validation failed: {e} \ncleaned_response: {cleaned_response}")

            else:
                # For regular text responses
                response = await self.client.messages.create(
                    model=model,
                    messages=messages,
                    system=instruction,
                    temperature=0.5,
                    max_tokens=8000,
                )

                result = response.content[0].text

            end_time = time.time()
            execution_time = end_time - start_time
            logger.info(f"messages_with_instruction execution time: {execution_time:.2f} seconds")

            return result

        except Exception as e:
            logger.error(f"Error generating Claude response: {e}")
            raise HTTPException(status_code=500, detail=f"Error generating Claude response: {str(e)}")
