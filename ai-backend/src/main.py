import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException

from src.database import Base, engine
from src.internal_services.data_source_connector.data_source_connector_factory import DataSourceConnectorFactory
from src.middleware.error_handler import (
    data_response_exception_handler,
    general_exception_handler,
    http_exception_handler,
)
from src.services.auth import auth_controller
from src.services.charter import charter_controller
from src.services.charter_chat import charter_chat_controller
from src.services.charter_example import charter_example_controller
from src.services.charter_metric import charter_metric_controller
from src.services.charter_metric_example import charter_metric_example_controller
from src.services.charter_playground import charter_playground_controller
from src.services.charter_playground_chat import charter_playground_chat_controller
from src.services.dashboard import dashboard_controller
from src.services.data_entity import data_entity_controller
from src.services.data_entity_example import data_entity_example_controller
from src.services.data_source import data_source_controller
from src.services.early_access_users import early_access_users_controller
from src.services.organisation import organisation_controller
from src.services.organisation_slack_bot import organisation_slack_bot_controller
from src.services.organisation_usage import organisation_usage_controller
from src.services.try_it_out import try_it_out_controller
from src.services.user_playground import user_playground_controller
from src.settings import settings
from src.utils.logger import logger


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    logger.info("Starting up FastAPI application...")
    yield

    # Shutdown logic
    logger.info("Shutting down FastAPI application...")
    try:
        # TODO:
        # Run clear_cache with a timeout. This is to ensure that we don't block the shutdown of the application.
        # This is not a blocking call and we'd rather have the application shutdown cleanly.
        # We need to do this because clear_cache is a synchronous call and will block the thread.
        # NEED TO LEARN HOW PYTHON ASYNC WORKS
        # But for now it ensures that all the connections are closed and after 5 seconds the application will shutdown.
        async with asyncio.timeout(5.0):  # 5 second timeout
            await asyncio.to_thread(DataSourceConnectorFactory.clear_cache)

        logger.info("Successfully cleared database connection cache")
    except asyncio.TimeoutError:
        logger.warning("Timeout while clearing connection cache - forcing shutdown")
    except Exception as e:
        logger.error(f"Error during shutdown: {str(e)}")


app = FastAPI(title=settings.PROJECT_NAME, lifespan=lifespan)


app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(Exception, general_exception_handler)
app.add_exception_handler(RequestValidationError, data_response_exception_handler)

if settings.ENV == "prod":
    logger.info("Running in prod environment")
    app.add_middleware(
        CORSMiddleware,
        # This should be your Next.js app's URL
        allow_origins=[settings.FRONTEND_URL],
        allow_credentials=True,
        allow_methods=["*"],  # Allows all methods
        allow_headers=["*"],  # Allows all headers
    )
elif settings.ENV == "dev":
    logger.info("Running in beta environment")
    app.add_middleware(
        CORSMiddleware,
        # This should be your Next.js app's URL
        allow_origins=[settings.FRONTEND_URL],
        allow_credentials=True,
        allow_methods=["*"],  # Allows all methods
        allow_headers=["*"],  # Allows all headers
    )
elif settings.ENV == "local":
    logger.info("Running in local environment")
    # Allow cors from frontend
    app.add_middleware(
        CORSMiddleware,
        # This should be your Next.js app's URL
        allow_origins=[settings.FRONTEND_URL],
        allow_credentials=True,
        allow_methods=["*"],  # Allows all methods
        allow_headers=["*"],  # Allows all headers
    )
else:
    logger.info("Running in local environment, as no environment is set")
    # Allow cors from frontend
    app.add_middleware(
        CORSMiddleware,
        # This should be your Next.js app's URL
        allow_origins=[settings.FRONTEND_URL],
        allow_credentials=True,
        allow_methods=["*"],  # Allows all methods
        allow_headers=["*"],  # Allows all headers
    )

# Create database tables
Base.metadata.create_all(bind=engine)

# Include routers
app.include_router(auth_controller.router, prefix="/v1", tags=["auth"])
app.include_router(organisation_controller.router, prefix="/v1", tags=["organisation"])
app.include_router(charter_chat_controller.router, prefix="/v1", tags=["charter-chat"])
app.include_router(data_source_controller.router, prefix="/v1", tags=["data-sources"])
app.include_router(data_entity_controller.router, prefix="/v1", tags=["data-entities"])
app.include_router(data_entity_example_controller.router, prefix="/v1", tags=["data-entity-examples"])
app.include_router(charter_controller.router, prefix="/v1", tags=["charters"])
app.include_router(charter_metric_controller.router, prefix="/v1", tags=["charter-metrics"])
app.include_router(charter_metric_example_controller.router, prefix="/v1", tags=["charter-metric-examples"])
app.include_router(charter_example_controller.router, prefix="/v1", tags=["charter-examples"])
app.include_router(organisation_slack_bot_controller.router, prefix="/v1", tags=["organisation-slack-bot"])
app.include_router(charter_playground_controller.router, prefix="/v1", tags=["charter-playground"])
app.include_router(charter_playground_chat_controller.router, prefix="/v1", tags=["charter-playground-chat"])
app.include_router(user_playground_controller.router, prefix="/v1", tags=["user-playground"])
app.include_router(early_access_users_controller.router, prefix="/v1", tags=["early-access-users"])
app.include_router(try_it_out_controller.router, prefix="/v1", tags=["try-it-out"])
app.include_router(organisation_usage_controller.router, prefix="/v1", tags=["organisation-usage"])
app.include_router(dashboard_controller.router, prefix="/v1", tags=["dashboards"])
