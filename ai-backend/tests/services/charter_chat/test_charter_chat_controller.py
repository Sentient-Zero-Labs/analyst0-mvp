from datetime import timedelta
from unittest.mock import AsyncMock, patch

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from src.services.charter.charter_model import CharterModel
from src.services.charter_chat.charter_chat_model import CharterChatConversationModel
from src.services.charter_chat.charter_chat_schema import (
    AnalyticsQueryResponse,
    DataCallResponse,
    ProcessedQuery,
    QueryMetadata,
)
from src.services.data_source.data_source_model import DataSourceModel, DataSourceType
from src.services.organisation.organisation_model import (
    OrganisationModel,
    OrganisationUserModel,
    OrganisationUserRoleEnum,
)
from src.services.user.user_model import UserModel
from src.utils.security import create_token


@pytest.fixture
def mock_services():
    with (
        patch(
            "src.services.charter_chat.charter_chat_controller.handle_analytics_query"
        ) as mock_handle_analytics_query,
        patch("src.services.charter_chat.charter_chat_controller.process_query") as mock_process_query,
        patch("src.services.charter_chat.charter_chat_controller.vector_search_for_metadata") as mock_vector_search,
        patch("src.services.charter_chat.charter_chat_controller.filter_metadata_using_llm_v2") as mock_filter_metadata,
    ):
        mock_handle_analytics_query.return_value = AnalyticsQueryResponse(
            content="Here's the analysis of your data...",
            status="success",
            data_call=DataCallResponse(
                query="SELECT * FROM sales", explanation="Query to get sales data", data=[{"total_sales": 1000000}]
            ),
        )
        mock_process_query.return_value = ProcessedQuery(
            messages=[],
            original_prompt="What is the total sales?",
            prompt="What is the total sales?",
            processed_data={},
        )
        mock_vector_search.return_value = QueryMetadata(
            data_entities=[], charter_examples=[], charter_metrics=[], charter_metric_examples=[]
        )
        mock_filter_metadata.return_value = QueryMetadata(
            data_entities=[], charter_examples=[], charter_metrics=[], charter_metric_examples=[]
        )

        yield {
            "handle_analytics_query": mock_handle_analytics_query,
            "process_query": mock_process_query,
            "vector_search": mock_vector_search,
            "filter_metadata": mock_filter_metadata,
        }


@pytest.fixture
def mock_credit_check():
    with patch(
        "src.services.charter_chat.charter_chat_controller.check_organisation_credit_usage_for_chat"
    ) as mock_check:
        mock_check.return_value = True
        yield mock_check


@pytest.fixture
async def test_user(db: AsyncSession):
    user = UserModel(email="test@example.com", hashed_password="test_password")
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@pytest.fixture
async def test_organisation(db: AsyncSession):
    org = OrganisationModel(name="Test Organisation", public_id="test-org-id")
    db.add(org)
    await db.commit()
    await db.refresh(org)
    return org


@pytest.fixture
async def test_organisation_user(db: AsyncSession, test_organisation, test_user):
    org_user = OrganisationUserModel(
        organisation_id=test_organisation.id,
        user_id=test_user.id,
        role=OrganisationUserRoleEnum.ADMIN,
    )
    db.add(org_user)
    await db.commit()
    await db.refresh(org_user)
    return org_user


@pytest.fixture
async def test_data_source(test_organisation, db):
    data_source = DataSourceModel(
        name="Test Data Source",
        type=DataSourceType.SQLITE,
        organisation_id=test_organisation.id,
        config={"database_path": ":memory:"},
        metadata={"tables": [], "views": []},
    )
    db.add(data_source)
    await db.commit()
    await db.refresh(data_source)
    return data_source


@pytest.fixture
async def test_charter(db: AsyncSession, test_organisation, test_data_source):
    charter = CharterModel(
        name="Test Charter",
        data_source_id=test_data_source.id,
        organisation_id=test_organisation.id,
    )
    db.add(charter)
    await db.commit()
    await db.refresh(charter)
    return charter


@pytest.fixture
async def auth_headers(test_user):
    token, _ = create_token({"sub": test_user.email}, timedelta(minutes=30))
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
async def test_conversation(db: AsyncSession, test_charter):
    conversation = CharterChatConversationModel(
        conversation_id="test-conversation-id",
        charter_id=test_charter.id,
        messages=[
            {"role": "user", "content": "What is the revenue?"},
            {"role": "assistant", "content": "The revenue is $1M"},
        ],
    )
    db.add(conversation)
    await db.commit()
    await db.refresh(conversation)
    return conversation


@pytest.fixture
def mock_usage_service():
    with patch("src.services.charter_chat.charter_chat_controller.OrganisationUsageService") as mock_service:
        mock_service.update_daily_organisation_usage = AsyncMock()
        yield mock_service


@pytest.fixture
def mock_data_entity_service():
    with patch("src.services.charter_chat.charter_chat_controller.DataEntityService") as mock_service:
        mock_service.get_data_entities_by_ids_and_charter_id = AsyncMock(return_value=[])
        yield mock_service


@pytest.fixture
def mock_charter_metric_service():
    with patch("src.services.charter_chat.charter_chat_controller.CharterMetricService") as mock_service:
        mock_service.get_charter_metrics_by_ids_and_charter_id = AsyncMock(return_value=[])
        yield mock_service


@pytest.mark.asyncio
async def test_get_conversations(
    client: AsyncClient,
    test_organisation,
    test_charter,
    test_conversation,
    test_organisation_user,
    auth_headers,
):
    response = await client.get(
        f"/v1/organisations/{test_organisation.public_id}/charters/{test_charter.id}/chat/conversations",
        headers=auth_headers,
    )

    assert response.status_code == 200
    data = response.json()["data"]
    assert isinstance(data, list)
    assert len(data) > 0
    assert data[0]["conversation_id"] == test_conversation.conversation_id
    assert "last_message" in data[0]
    assert data[0]["last_message"]["content"] == "The revenue is $1M"


@pytest.mark.asyncio
async def test_get_conversation(
    client: AsyncClient,
    test_organisation,
    test_charter,
    test_conversation,
    test_organisation_user,
    auth_headers,
):
    response = await client.get(
        f"/v1/organisations/{test_organisation.public_id}/charters/{test_charter.id}/chat/conversations/{test_conversation.conversation_id}",
        headers=auth_headers,
    )

    assert response.status_code == 200
    data = response.json()["data"]
    assert isinstance(data, list)
    assert len(data) == 2
    assert data[0]["role"] == "user"
    assert data[0]["content"] == "What is the revenue?"
    assert data[1]["role"] == "assistant"
    assert data[1]["content"] == "The revenue is $1M"


@pytest.mark.asyncio
async def test_get_conversation_not_found(
    client: AsyncClient,
    test_organisation,
    test_charter,
    test_organisation_user,
    auth_headers,
):
    response = await client.get(
        f"/v1/organisations/{test_organisation.public_id}/charters/{test_charter.id}/chat/conversations/non-existent-id",
        headers=auth_headers,
    )

    assert response.status_code == 404


@pytest.mark.asyncio
async def test_create_chat_conversation(
    client: AsyncClient,
    test_organisation,
    test_charter,
    test_data_source,
    test_organisation_user,
    auth_headers,
    mock_services,
    mock_credit_check,
    mock_usage_service,
    mock_data_entity_service,
    mock_charter_metric_service,
):
    chat_input = {
        "messages": [{"role": "user", "content": "What is the total sales?"}],
        "context": {"data_entity_ids": [], "charter_metric_ids": []},
    }

    response = await client.post(
        f"/v1/organisations/{test_organisation.public_id}/charters/{test_charter.id}/chat/",
        json=chat_input,
        headers=auth_headers,
    )

    assert response.status_code == 200
    data = response.json()["data"]
    assert isinstance(data, list)
    assert len(data) == 2  # Original message + assistant's response
    assert data[0]["role"] == "user"
    assert data[0]["content"] == "What is the total sales?"
    assert data[1]["role"] == "assistant"
    assert data[1]["content"] == "Here's the analysis of your data..."
    assert data[1]["status"] == "success"
    assert data[1]["data_call"]["query"] == "SELECT * FROM sales"


@pytest.mark.asyncio
async def test_update_chat_conversation(
    client: AsyncClient,
    test_organisation,
    test_charter,
    test_conversation,
    test_data_source,
    test_organisation_user,
    auth_headers,
    mock_services,
    mock_credit_check,
    mock_usage_service,
    mock_data_entity_service,
    mock_charter_metric_service,
):
    chat_input = {
        "conversation_id": test_conversation.conversation_id,
        "messages": [
            {"role": "user", "content": "What is the total sales?"},
            {"role": "assistant", "content": "The total sales is $2M"},
            {"role": "user", "content": "And what about profit?"},
        ],
        "context": {"data_entity_ids": [], "charter_metric_ids": []},
    }

    response = await client.post(
        f"/v1/organisations/{test_organisation.public_id}/charters/{test_charter.id}/chat/",
        json=chat_input,
        headers=auth_headers,
    )

    assert response.status_code == 200
    data = response.json()["data"]
    assert isinstance(data, list)
    assert len(data) == 4  # Previous messages + new message + assistant's response
    assert data[2]["role"] == "user"
    assert data[2]["content"] == "And what about profit?"
    assert data[3]["role"] == "assistant"
    assert data[3]["content"] == "Here's the analysis of your data..."
    assert data[3]["status"] == "success"
    assert data[3]["data_call"]["query"] == "SELECT * FROM sales"
