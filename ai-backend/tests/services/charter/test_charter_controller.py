from datetime import timedelta

import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.services.charter.charter_model import CharterModel
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
async def test_data_source(db: AsyncSession, test_organisation):
    data_source = DataSourceModel(
        name="Test Data Source",
        type=DataSourceType.POSTGRES,
        organisation_id=test_organisation.id,
        config={
            "host": "localhost",
            "port": 5432,
            "database": "test_db",
            "username": "test_user",
            "password": "test_password",
        },
    )
    db.add(data_source)
    await db.commit()
    await db.refresh(data_source)
    return data_source


@pytest.fixture
async def auth_headers(test_user):
    token, _ = create_token({"sub": test_user.email}, timedelta(minutes=30))
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.asyncio
async def test_create_charter(
    client: AsyncClient, test_organisation, test_data_source, test_organisation_user, auth_headers
):
    test_data = {
        "name": "Test Charter",
        "data_source_id": test_data_source.id,
        "data_entity_ids": [],
        "slack_channel_ids": [],
    }

    response = await client.post(
        f"/v1/organisations/{test_organisation.public_id}/charters/",
        json=test_data,
        headers=auth_headers,
    )

    assert response.status_code == 200
    data = response.json()["data"]
    assert "id" in data


@pytest.mark.asyncio
async def test_get_charter_list(
    client: AsyncClient, test_organisation, test_data_source, test_organisation_user, db: AsyncSession, auth_headers
):
    # Create a test charter first
    charter = CharterModel(
        name="Test Charter",
        data_source_id=test_data_source.id,
        organisation_id=test_organisation.id,
    )
    db.add(charter)
    await db.commit()

    response = await client.get(
        f"/v1/organisations/{test_organisation.public_id}/charters/",
        headers=auth_headers,
    )

    assert response.status_code == 200
    data = response.json()["data"]
    assert isinstance(data, list)
    assert len(data) > 0
    assert data[0]["name"] == "Test Charter"


@pytest.mark.asyncio
async def test_get_single_charter(
    client: AsyncClient, test_organisation, test_data_source, test_organisation_user, db: AsyncSession, auth_headers
):
    # Create a test charter
    charter = CharterModel(
        name="Test Charter",
        data_source_id=test_data_source.id,
        organisation_id=test_organisation.id,
    )
    db.add(charter)
    await db.commit()
    await db.refresh(charter)

    response = await client.get(
        f"/v1/organisations/{test_organisation.public_id}/charters/{charter.id}",
        headers=auth_headers,
    )

    assert response.status_code == 200
    data = response.json()["data"]
    assert data["name"] == "Test Charter"


@pytest.mark.asyncio
async def test_update_charter(
    client: AsyncClient, test_organisation, test_data_source, test_organisation_user, db: AsyncSession, auth_headers
):
    # Create a test charter
    charter = CharterModel(
        name="Test Charter",
        data_source_id=test_data_source.id,
        organisation_id=test_organisation.id,
    )
    db.add(charter)
    await db.commit()
    await db.refresh(charter)

    update_data = {
        "name": "Updated Charter",
        "data_source_id": test_data_source.id,
        "data_entity_ids": [],
        "slack_channel_ids": [],
    }

    response = await client.put(
        f"/v1/organisations/{test_organisation.public_id}/charters/{charter.id}",
        json=update_data,
        headers=auth_headers,
    )

    assert response.status_code == 200
    data = response.json()["data"]
    assert data["name"] == "Updated Charter"


@pytest.mark.asyncio
async def test_delete_charter(
    client: AsyncClient, test_organisation, test_data_source, test_organisation_user, db: AsyncSession, auth_headers
):
    # Create a test charter
    charter = CharterModel(
        name="Test Charter",
        data_source_id=test_data_source.id,
        organisation_id=test_organisation.id,
    )
    db.add(charter)
    await db.commit()
    await db.refresh(charter)

    response = await client.delete(
        f"/v1/organisations/{test_organisation.public_id}/charters/{charter.id}",
        headers=auth_headers,
    )

    assert response.status_code == 200

    # Verify charter is deleted
    stmt = select(CharterModel).where(CharterModel.id == charter.id)
    result = await db.execute(stmt)
    assert result.scalar_one_or_none() is None
