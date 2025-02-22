from typing import List

from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.internal_services.llm_client.llm_client_service import LLMClientService
from src.services.charter_chat.charter_chat_schema import QueryPayload
from src.services.charter_metric.charter_metric_model import CharterMetricModel
from src.utils.logger import setup_logger

logger = setup_logger()

add_historical_context_instruction = """
You are an Expert Data Analyst specializing in finding context from previous conversation context to enhance data queries. Your task is to analyze user interactions and improve data retrieval.

FOLLOW THESE STEP BY STEP:
1. Analyze conversation history: Identify KEY TOPICS, ENTITIES, and USERS's Data interests.
2. Prioritize recent and relevant exchanges: Give more weight to recent conversations and those directly related to the current query.
3. Combine historical context with current query: Synthesize relevant information from history and current prompt.
4. Extract search terms: Identify key words, phrases, and data-related concepts from the expanded query.
5. Determine data parameters: Specify relevant data fields, date ranges, or filters based on the context.
6. Your will never answer the user query, your only job is to expand the user query with historical context.
7. Your expanded prompt should be such that the user is user is asking the prompt.
8. Only expand the user prompt if it is related to the Previous conversation. Otherwise, just return the original prompt.

RESPONSE JSON FORMAT:
{{
    "original_prompt": "<original user prompt>",
    "expanded_expanded": "<expanded prompt with historical context, key topics, entities, and user's data interests>",
}}
"""

add_historical_context_user_prompt = """
User-AI Conversation History:
{conversation_history}

Original User Prompt:
{original_prompt}
"""

add_metrics_instruction = """
You are an AI data analytics assistant for a company. You have been provided with a list of metrics and their definitions that the company uses. When given a User Prompt about these metrics, your task is to follow the points mentioned below:

PLEASE KEEP the below POINTS in mind before answering the User Prompt:
1. Repeat the User Prompt exactly as it was asked.
2. Identify the metrics mentioned in the User Prompt.
3. For each identified metric, provide its abbreviation (if any) and definition.
4. Only include information about metrics explicitly mentioned in the User Prompt.
5. Do not return anything except the User Prompt and metrics.
6. Just return the User Prompt back if no metric is asked by the User.
7. IMPORTANT: If no metric is found, only return the User Prompt text.


EXAMPLE:

User Prompt: What is the <metric_1> and <metric_2> for yesterday?
Your response:

What is the <metric_1> and <metric_2> for yesterday?
<metric_1>: <given metric 1 definition>
<metric_2>: <given metric 2 definition>

METRICS YOU CAN USE:```
{metrics}
```
"""

add_metrics_instruction_2 = """
You are an AI data analytics assistant for a company. You have been provided with a list of metrics and their definitions that the company uses. When given a User Prompt about these metrics, your task is to follow the points mentioned below:

PLEASE KEEP the below POINTS in mind before answering the User Prompt:
1. Identify the metrics mentioned in the User Prompt.
2. For each identified metric, provide its abbreviation (if any) and definition in a list format with the key `metrics`.
3. Only include information about metrics explicitly mentioned in the User Prompt.
4. Do not return anything except `metrics`.
5. If no metric is found, return an empty list in `metrics`.

EXAMPLE:
User Prompt: What is the <metric_1> and <metric_2> for yesterday?

Your JSON response:
{{
    "metrics": [
        "<metric_1>: <given metric 1 definition>",
        "<metric_2>: <given metric 2 definition>"
    ]
}}

METRICS YOU CAN USE:```
{metrics}
```
"""


async def process_query(payload: QueryPayload, charter_id: int, async_db: AsyncSession) -> QueryPayload:
    logger.info("Processing query")

    charter_metrics = await get_metrics(charter_id, async_db)

    # Format the instruction with the actual metrics
    formatted_add_metrics_instruction = add_metrics_instruction_2.format(metrics=charter_metrics)

    payload.prompt = payload.original_prompt

    if len(payload.messages) > 2:
        # Call the AI with the formatted instruction
        expanded_prompt_response: ExpandedPromptAIResponse = await LLMClientService.messages_with_instruction(
            [
                {
                    "role": "user",
                    "content": add_historical_context_user_prompt.format(
                        conversation_history=LLMClientService.create_messages_text_info(payload.messages),
                        original_prompt=payload.original_prompt,
                    ),
                }
            ],
            add_historical_context_instruction,
            ExpandedPromptAIResponse,
        )

        payload.prompt = expanded_prompt_response.expanded_prompt

    metrics_response = await LLMClientService.messages_with_instruction(
        [{"role": "user", "content": f"User Prompt: `{payload.prompt}`"}],
        formatted_add_metrics_instruction,
        MetricsAIResponse,
    )

    if len(metrics_response.metrics) > 0:
        payload.prompt = f"{payload.prompt}\n\n{'---'.join(metrics_response.metrics)}"

    logger.info(f"Processed Prompt: \n{payload.prompt}")

    return payload


async def get_metrics(charter_id: int, async_db: AsyncSession):
    charter_metrics_smt = select(CharterMetricModel).filter(CharterMetricModel.charter_id == charter_id)

    charter_metrics = (await async_db.execute(charter_metrics_smt)).scalars().all()

    return "\n".join(
        [
            f"{index + 1}. {metric.name} ({metric.abbreviation}) - {metric.description}"
            for index, metric in enumerate(charter_metrics)
        ]
    )


class ExpandedPromptAIResponse(BaseModel):
    original_prompt: str
    expanded_prompt: str


class MetricsAIResponse(BaseModel):
    metrics: List[str]
