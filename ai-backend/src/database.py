from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from src.settings import settings
from src.utils.logger import setup_logger

# Synchronous engine and session
engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Asynchronous engine and session
async_engine = create_async_engine(settings.ASYNC_DATABASE_URL, echo=True)
AsyncSessionLocal = async_sessionmaker(
    async_engine, class_=AsyncSession, expire_on_commit=False
)

Base = declarative_base()

logger = setup_logger()


def to_dict(model):
    return {c.name: getattr(model, c.name) for c in model.__table__.columns}


def get_db():
    db = SessionLocal()
    try:
        logger.info("Opening synchronous database session")
        yield db
    finally:
        logger.info("Closing synchronous database session")
        db.close()


async def get_async_db():
    async with AsyncSessionLocal() as db:
        try:
            logger.info("Opening async database session")
            yield db
        finally:
            logger.info("Closing async database session")
            await db.close()
