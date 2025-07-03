"""Health check endpoints."""

import time
from datetime import datetime
from fastapi import APIRouter
from core.models import HealthCheck, ServiceInfo

router = APIRouter()

# Track service start time
_start_time = time.time()


@router.get("/health", response_model=HealthCheck)
async def health_check():
    """Health check endpoint."""
    uptime = time.time() - _start_time
    
    return HealthCheck(
        status="healthy",
        timestamp=datetime.utcnow().isoformat(),
        uptime=uptime
    )


@router.get("/info", response_model=ServiceInfo)
async def service_info():
    """Service information endpoint."""
    return ServiceInfo(
        name="Database Microservice",
        version="1.0.0",
        status="running",
        databases_count=0,  # Will be updated by database manager
        supported_types=["postgres", "mysql", "snowflake", "sqlite"]
    )
