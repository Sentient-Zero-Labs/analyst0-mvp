from datetime import datetime
from typing import List, Literal, Optional

from pydantic import BaseModel

from src.services.charter_example.charter_example_schema import CharterExampleResponse
from src.services.charter_metric.charter_metrics_schema import CharterMetricResponse
from src.services.charter_metric_example.charter_metric_example_schema import CharterMetricExampleResponse
from src.services.data_entity.data_entity_schema import DataEntityResponse


class DataCallResponse(BaseModel):
    query: Optional[str] = None
    explanation: Optional[str] = None
    error: Optional[str] = None
    data: Optional[list] = None
    data_entity_names: Optional[List[str]] = None


class AnalyticsQueryResponse(BaseModel):
    content: Optional[str] = None
    status: Literal["success", "failed"] = "failed"
    data_call: Optional[DataCallResponse] = None


class Message(BaseModel):
    role: str
    content: Optional[str] = None
    status: Literal["success", "failed"] = "success"
    data_call: Optional[DataCallResponse] = None


class ChatInputContext(BaseModel):
    data_entity_ids: Optional[List[int]] = None
    charter_metric_ids: Optional[List[int]] = None


class ChatInput(BaseModel):
    messages: List[Message]
    context: Optional[ChatInputContext] = None
    conversation_id: Optional[str] = None


class UserOutput(ChatInput):
    pass


class ChatResponse(BaseModel):
    messages: List[Message]
    conversation_id: str


class QueryPayload(BaseModel):
    messages: List[Message]
    original_prompt: str
    prompt: str


class ProcessedQuery(QueryPayload):
    processed_data: Optional[dict] = None


class QueryMetadata(ProcessedQuery):
    vector_search_results: Optional[List[dict]] = None


class FilteredMetadata(QueryMetadata):
    filtered_metadata: Optional[dict] = None


class DataEntityExample(BaseModel):
    id: int
    data_entity_id: int
    query: str
    description: Optional[str]


class QueryMetadata(BaseModel):
    data_entities: Optional[List[DataEntityResponse]] = None
    charter_examples: Optional[List[CharterExampleResponse]] = None
    charter_metrics: Optional[List[CharterMetricResponse]] = None
    charter_metric_examples: Optional[List[CharterMetricExampleResponse]] = None


class FilterMetaDataLLMResponse(BaseModel):
    is_relevant: bool
    explanation: Optional[str] = None


class FilterMetaDataLLMResponseV2(BaseModel):
    relevance_score: int
    explanation: Optional[str] = None


class ConversationListResponse(BaseModel):
    conversation_id: str
    title: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    last_message: Optional[Message] = None
