from datetime import timedelta

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from src.services.dashboard.dashboard_model import DashboardModel, DashboardQueryModel
from src.services.data_source.data_source_model import DataSourceModel, DataSourceType
from src.services.organisation.organisation_model import (
    OrganisationModel,
    OrganisationUserModel,
    OrganisationUserRoleEnum,
)
from src.services.user.user_model import UserModel
from src.utils.security import create_token


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
async def auth_headers(test_user):
    token, _ = create_token({"sub": test_user.email}, timedelta(minutes=30))
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
async def test_dashboard(db: AsyncSession, test_organisation):
    dashboard = DashboardModel(
        title="Test Dashboard",
        description="Test Description",
        tags=["test", "dashboard"],
        organisation_id=test_organisation.id,
    )
    db.add(dashboard)
    await db.commit()
    await db.refresh(dashboard)
    return dashboard


@pytest.fixture
async def test_dashboard_query(db: AsyncSession, test_dashboard, test_data_source):
    query = DashboardQueryModel(
        dashboard_id=test_dashboard.id,
        data_source_id=test_data_source.id,
        title="Test Query",
        description="Test Query Description",
        query="SELECT * FROM test_table",
        metadata={"test": "metadata"},
    )
    db.add(query)
    await db.commit()
    await db.refresh(query)
    return query


@pytest.mark.asyncio
async def test_create_dashboard(
    client: AsyncClient,
    test_organisation,
    test_organisation_user,
    auth_headers,
):
    dashboard_data = {
        "title": "New Dashboard",
        "description": "New Description",
        "tags": ["new", "test"],
    }

    response = await client.post(
        f"/v1/organisations/{test_organisation.public_id}/dashboards",
        json=dashboard_data,
        headers=auth_headers,
    )

    assert response.status_code == 200
    data = response.json()["data"]
    assert data["title"] == dashboard_data["title"]
    assert data["description"] == dashboard_data["description"]
    assert data["tags"] == dashboard_data["tags"]
    assert data["organisation_id"] == test_organisation.id


@pytest.mark.asyncio
async def test_get_dashboards(
    client: AsyncClient,
    test_organisation,
    test_dashboard,
    test_organisation_user,
    auth_headers,
):
    response = await client.get(
        f"/v1/organisations/{test_organisation.public_id}/dashboards",
        headers=auth_headers,
    )

    assert response.status_code == 200
    data = response.json()["data"]
    assert isinstance(data, list)
    assert len(data) > 0
    assert data[0]["title"] == test_dashboard.title
    assert data[0]["description"] == test_dashboard.description
    assert data[0]["tags"] == test_dashboard.tags


@pytest.mark.asyncio
async def test_get_dashboard(
    client: AsyncClient,
    test_organisation,
    test_dashboard,
    test_organisation_user,
    auth_headers,
):
    response = await client.get(
        f"/v1/organisations/{test_organisation.public_id}/dashboards/{test_dashboard.id}",
        headers=auth_headers,
    )

    assert response.status_code == 200
    data = response.json()["data"]
    assert data["title"] == test_dashboard.title
    assert data["description"] == test_dashboard.description
    assert data["tags"] == test_dashboard.tags


@pytest.mark.asyncio
async def test_update_dashboard(
    client: AsyncClient,
    test_organisation,
    test_dashboard,
    test_organisation_user,
    auth_headers,
):
    update_data = {
        "title": "Updated Dashboard",
        "description": "Updated Description",
        "tags": ["updated", "test"],
    }

    response = await client.put(
        f"/v1/organisations/{test_organisation.public_id}/dashboards/{test_dashboard.id}",
        json=update_data,
        headers=auth_headers,
    )

    assert response.status_code == 200
    data = response.json()["data"]
    assert data["title"] == update_data["title"]
    assert data["description"] == update_data["description"]
    assert data["tags"] == update_data["tags"]


@pytest.mark.asyncio
async def test_delete_dashboard(
    client: AsyncClient,
    test_organisation,
    test_dashboard,
    test_organisation_user,
    auth_headers,
):
    response = await client.delete(
        f"/v1/organisations/{test_organisation.public_id}/dashboards/{test_dashboard.id}",
        headers=auth_headers,
    )

    assert response.status_code == 204


@pytest.mark.asyncio
async def test_create_dashboard_query(
    client: AsyncClient,
    test_organisation,
    test_dashboard,
    test_data_source,
    test_organisation_user,
    auth_headers,
):
    query_data = {
        "title": "New Query",
        "description": "New Query Description",
        "query": "SELECT * FROM test_table",
        "data_source_id": test_data_source.id,
        "query_metadata": {"test": "metadata"},
    }

    response = await client.post(
        f"/v1/organisations/{test_organisation.public_id}/dashboards/{test_dashboard.id}/queries",
        json=query_data,
        headers=auth_headers,
    )

    assert response.status_code == 200
    data = response.json()["data"]
    assert data["title"] == query_data["title"]
    assert data["description"] == query_data["description"]
    assert data["query"] == query_data["query"]
    assert data["data_source_id"] == query_data["data_source_id"]
    assert data["query_metadata"] == query_data["query_metadata"]


@pytest.mark.asyncio
async def test_get_dashboard_queries(
    client: AsyncClient,
    test_organisation,
    test_dashboard,
    test_dashboard_query,
    test_organisation_user,
    auth_headers,
):
    response = await client.get(
        f"/v1/organisations/{test_organisation.public_id}/dashboards/{test_dashboard.id}/queries",
        headers=auth_headers,
    )

    assert response.status_code == 200
    data = response.json()["data"]
    assert isinstance(data, list)
    assert len(data) > 0
    assert data[0]["title"] == test_dashboard_query.title
    assert data[0]["description"] == test_dashboard_query.description
    assert data[0]["query"] == test_dashboard_query.query


@pytest.mark.asyncio
async def test_get_dashboard_query(
    client: AsyncClient,
    test_organisation,
    test_dashboard,
    test_dashboard_query,
    test_organisation_user,
    auth_headers,
):
    response = await client.get(
        f"/v1/organisations/{test_organisation.public_id}/dashboards/{test_dashboard.id}/queries/{test_dashboard_query.id}",
        headers=auth_headers,
    )

    assert response.status_code == 200
    data = response.json()["data"]
    assert data["title"] == test_dashboard_query.title
    assert data["description"] == test_dashboard_query.description
    assert data["query"] == test_dashboard_query.query


@pytest.mark.asyncio
async def test_update_dashboard_query(
    client: AsyncClient,
    test_organisation,
    test_dashboard,
    test_dashboard_query,
    test_organisation_user,
    auth_headers,
):
    update_data = {
        "title": "Updated Query",
        "description": "Updated Query Description",
        "query": "SELECT * FROM updated_table",
        "query_metadata": {"updated": "metadata"},
    }

    response = await client.put(
        f"/v1/organisations/{test_organisation.public_id}/dashboards/{test_dashboard.id}/queries/{test_dashboard_query.id}",
        json=update_data,
        headers=auth_headers,
    )

    assert response.status_code == 200
    data = response.json()["data"]
    assert data["title"] == update_data["title"]
    assert data["description"] == update_data["description"]
    assert data["query"] == update_data["query"]
    assert data["query_metadata"] == update_data["query_metadata"]


@pytest.mark.asyncio
async def test_delete_dashboard_query(
    client: AsyncClient,
    test_organisation,
    test_dashboard,
    test_dashboard_query,
    test_organisation_user,
    auth_headers,
):
    response = await client.delete(
        f"/v1/organisations/{test_organisation.public_id}/dashboards/{test_dashboard.id}/queries/{test_dashboard_query.id}",
        headers=auth_headers,
    )

    assert response.status_code == 204


# Error cases
@pytest.mark.asyncio
async def test_get_dashboard_not_found(
    client: AsyncClient,
    test_organisation,
    test_organisation_user,
    auth_headers,
):
    response = await client.get(
        f"/v1/organisations/{test_organisation.public_id}/dashboards/999999",
        headers=auth_headers,
    )

    assert response.status_code == 404
    assert response.json() == {"error": {"detail": "Dashboard not found"}}


@pytest.mark.asyncio
async def test_get_dashboard_query_not_found(
    client: AsyncClient,
    test_organisation,
    test_dashboard,
    test_organisation_user,
    auth_headers,
):
    response = await client.get(
        f"/v1/organisations/{test_organisation.public_id}/dashboards/{test_dashboard.id}/queries/999999",
        headers=auth_headers,
    )

    assert response.status_code == 404
    assert response.json() == {"error": {"detail": "Query not found"}}
