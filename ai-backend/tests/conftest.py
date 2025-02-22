import asyncio

import pytest
from asgi_lifespan import LifespanManager
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from src.database import Base
from src.main import app
from src.settings import settings

# Create async engine for testing
test_engine = create_async_engine(
    settings.ASYNC_DATABASE_URL, echo=False, future=True, pool_pre_ping=True, connect_args={"ssl": False}
)

# Create async session factory
test_async_session = async_sessionmaker(test_engine, class_=AsyncSession, expire_on_commit=False, autoflush=False)


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for each test case."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
async def db():
    async with test_async_session() as session:
        yield session
        await session.rollback()


@pytest.fixture
async def client():
    async with LifespanManager(app):
        async with AsyncClient(app=app, base_url="http://test") as client:
            yield client


@pytest.fixture(autouse=True)
async def setup_db():
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    yield

    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
