from fastapi import HTTPException

from src.internal_services.llm_client.llm_client_service import LLMClientService
from src.services.charter_metric.charter_metric_service import CharterMetricService
from src.services.charter_metric_example.charter_metric_example_service import CharterMetricExampleService
from src.services.charter_playground_chat.charter_playground_chat_schema import (
    PlaygroundChatInput,
    PlaygroundChatResponse,
    PlaygroundMessage,
)
from src.services.data_entity.data_entity_service import DataEntityService
from src.services.data_source.data_source_model import DataSourceType
from src.utils.logger import setup_logger

logger = setup_logger()

system_message = """
You are an AI assistant specializing in database analytics for {dialect}.
Your task is to answer the user's question based on the provided Tables and Charter metrics, Charter metric examples,
SQL query and User Selected Snippets context if available/provided.
"""

user_prompt_template = """
Tables Context:
```
{data_entities}
```

Charter Metrics Context:
```
{charter_metrics}
```

Charter Metric Examples Context:
```
{charter_metric_examples}
```

Query:
```
{sql_query}
```

```
{user_content}
```
"""


class CharterPlaygroundChatService:
    @staticmethod
    async def handle_playground_messages(
        playground_chat_input: PlaygroundChatInput,
        dialect: DataSourceType,
    ) -> PlaygroundChatResponse:
        messages = []

        for message in playground_chat_input.messages:
            if message.role == "user":
                # Prepare the context
                data_entities = DataEntityService.create_data_entity_list_text_info(message.context.data_entities)

                charter_metrics = CharterMetricService.get_charter_metric_list_text(message.context.charter_metrics)
                charter_metric_examples = CharterMetricExampleService.get_charter_metric_example_list_text(
                    message.context.charter_metric_examples
                )

                # Format the user prompt
                user_prompt = user_prompt_template.format(
                    data_entities=data_entities,
                    charter_metrics=charter_metrics,
                    charter_metric_examples=charter_metric_examples,
                    sql_query=message.context.query,
                    user_content=message.content,
                )

                messages.append({"role": "user", "content": user_prompt})
            else:
                messages.append({"role": "assistant", "content": message.content})

        system_message_formatted = system_message.format(dialect=dialect.value)

        try:
            llm_response_content = await LLMClientService.messages_with_instruction(
                messages,
                system_message_formatted,
                model_type=playground_chat_input.model_type,
                client_name=playground_chat_input.client_name,
            )

            playground_chat_input.messages.append(PlaygroundMessage(role="assistant", content=llm_response_content))

            return playground_chat_input
        except Exception as e:
            logger.error(f"Error in handling analytics query: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))
