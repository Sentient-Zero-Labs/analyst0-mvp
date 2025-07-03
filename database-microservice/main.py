"""Main FastAPI application for the database microservice."""

from contextlib import asynccontextmanager

import structlog
from api.routes import databases, health
from config import settings
from core.database_manager import DatabaseManager
from core.exceptions import DatabaseServiceException
from fastapi import Depends, FastAPI, HTTPException, Security
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

# Configure structured logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer(),
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()

# Global database manager instance
database_manager: DatabaseManager = None

# Security
security = HTTPBearer()


async def verify_api_key(credentials: HTTPAuthorizationCredentials = Security(security)):
    """Verify API key authentication."""
    if credentials.credentials != settings.api_key:
        logger.warning("Invalid API key attempt", api_key_prefix=credentials.credentials[:8])
        raise HTTPException(status_code=401, detail="Invalid API key")
    return credentials.credentials


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    global database_manager

    logger.info("Starting database microservice", version="1.0.0")

    # Initialize database manager
    database_manager = DatabaseManager()

    # Set the database manager in the routes module
    from api.routes.databases import set_database_manager

    set_database_manager(database_manager)

    yield

    # Cleanup
    if database_manager:
        await database_manager.close_all_connections()

    logger.info("Database microservice stopped")


# Create FastAPI app
app = FastAPI(
    title="Database Microservice",
    description="Secure database query execution microservice",
    version="1.0.0",
    docs_url="/docs" if settings.is_development else None,
    redoc_url="/redoc" if settings.is_development else None,
    lifespan=lifespan,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.is_development else [],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)


# Exception handlers
@app.exception_handler(DatabaseServiceException)
async def database_service_exception_handler(request, exc: DatabaseServiceException):
    """Handle database service exceptions."""
    logger.error("Database service error", error=str(exc), error_type=type(exc).__name__)
    return HTTPException(status_code=400, detail=str(exc))


@app.exception_handler(Exception)
async def general_exception_handler(request, exc: Exception):
    """Handle general exceptions."""
    logger.error("Unexpected error", error=str(exc), error_type=type(exc).__name__)
    return HTTPException(status_code=500, detail="Internal server error")


# Dependency to get database manager
def get_database_manager() -> DatabaseManager:
    """Get the global database manager instance."""
    return database_manager


# Include routers
app.include_router(health.router, prefix="/api/v1", tags=["health"])

app.include_router(databases.router, prefix="/api/v1", tags=["databases"], dependencies=[Depends(verify_api_key)])


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "service": "Database Microservice",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs" if settings.is_development else "disabled",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        log_level=settings.log_level.lower(),
        reload=settings.reload,
        workers=settings.workers if not settings.reload else 1,
    )
