from typing import List, Literal, Optional

from pydantic import BaseModel

from src.internal_services.llm_client.llm_client_base import LLMClientName, LLMModelType
from src.services.charter_metric.charter_metrics_schema import CharterMetricResponse
from src.services.charter_metric_example.charter_metric_example_schema import CharterMetricExampleResponse
from src.services.data_entity.data_entity_schema import DataEntityResponse


class PlaygroundMessageContext(BaseModel):
    data_entity_ids: Optional[List[int]] = None
    charter_metric_ids: Optional[List[int]] = None

    selected_texts: Optional[List[str]] = None
    query: Optional[str] = None

    data_entities: Optional[List[DataEntityResponse]] = None
    charter_metrics: Optional[List[CharterMetricResponse]] = None
    charter_metric_examples: Optional[List[CharterMetricExampleResponse]] = None


class PlaygroundMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str
    context: Optional[PlaygroundMessageContext] = None


class PlaygroundChatInput(BaseModel):
    messages: List[PlaygroundMessage]
    model_type: Optional[LLMModelType] = None
    client_name: Optional[LLMClientName] = None
    conversation_id: Optional[str] = None


class PlaygroundChatResponse(PlaygroundChatInput):
    pass
