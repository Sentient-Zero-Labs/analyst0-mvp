from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_async_db
from src.middleware.wrap_response import DataResponse, DataResponseClass
from src.services.dashboard.dashboard_schema import (
    DashboardCreate,
    DashboardListResponse,
    DashboardQueryCreate,
    DashboardQueryResponse,
    DashboardQueryUpdate,
    DashboardResponse,
    DashboardUpdate,
)
from src.services.dashboard.dashboard_service import DashboardService
from src.services.organisation.organisation_dependency import get_user_organisation
from src.services.organisation.organisation_model import OrganisationModel

router = APIRouter(prefix="/organisations/{organisation_public_id}/dashboards")


@router.post("", response_model=DataResponseClass[DashboardResponse])
async def create_dashboard(
    dashboard_data: DashboardCreate,
    organisation: OrganisationModel = Depends(get_user_organisation),
    db: AsyncSession = Depends(get_async_db),
):
    """Create a new dashboard for the organisation."""
    dashboard_service = DashboardService()
    dashboard = await dashboard_service.create_dashboard(
        organisation_id=organisation.id,
        dashboard_create=dashboard_data,
        db=db,
    )
    return DataResponse(data=dashboard)


@router.get("", response_model=DataResponseClass[List[DashboardListResponse]])
async def get_dashboards(
    organisation: OrganisationModel = Depends(get_user_organisation),
    db: AsyncSession = Depends(get_async_db),
):
    """Get all dashboards for the organisation."""
    dashboard_service = DashboardService()
    dashboards = await dashboard_service.get_dashboards(organisation_id=organisation.id, db=db)
    return DataResponse(data=dashboards)


@router.get("/{dashboard_id}", response_model=DataResponseClass[DashboardResponse])
async def get_dashboard(
    dashboard_id: int,
    organisation: OrganisationModel = Depends(get_user_organisation),
    db: AsyncSession = Depends(get_async_db),
):
    """Get a specific dashboard by ID."""
    dashboard_service = DashboardService()
    dashboard = await dashboard_service.get_dashboard(db, dashboard_id, organisation.id)
    if not dashboard:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"detail": "Dashboard not found"},
        )
    return DataResponse(data=dashboard)


@router.put("/{dashboard_id}", response_model=DataResponseClass[DashboardResponse])
async def update_dashboard(
    dashboard_id: int,
    dashboard_data: DashboardUpdate,
    organisation: OrganisationModel = Depends(get_user_organisation),
    db: AsyncSession = Depends(get_async_db),
):
    """Update a specific dashboard."""
    dashboard_service = DashboardService()
    try:
        dashboard = await dashboard_service.update_dashboard(
            dashboard_id=dashboard_id,
            organisation_id=organisation.id,
            dashboard_update=dashboard_data,
            db=db,
        )
        if not dashboard:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"error": {"detail": "Dashboard not found"}},
            )
        return DataResponse(data=dashboard)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": {"detail": str(e)}},
        )


@router.delete("/{dashboard_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_dashboard(
    dashboard_id: int,
    organisation: OrganisationModel = Depends(get_user_organisation),
    db: AsyncSession = Depends(get_async_db),
):
    """Delete a specific dashboard."""
    dashboard_service = DashboardService()
    try:
        success = await dashboard_service.delete_dashboard(
            dashboard_id=dashboard_id,
            organisation_id=organisation.id,
            db=db,
        )
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"error": {"detail": "Dashboard not found"}},
            )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": {"detail": str(e)}},
        )


@router.post("/{dashboard_id}/queries", response_model=DataResponseClass[DashboardQueryResponse])
async def create_dashboard_query(
    dashboard_id: int,
    query_data: DashboardQueryCreate,
    organisation: OrganisationModel = Depends(get_user_organisation),
    db: AsyncSession = Depends(get_async_db),
):
    """Add a new query to a dashboard."""
    dashboard_service = DashboardService()
    try:
        query = await dashboard_service.create_dashboard_query(
            dashboard_id=dashboard_id,
            query_create=query_data,
            db=db,
        )
        return DataResponse(data=query)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": {"detail": str(e)}},
        )


@router.get("/{dashboard_id}/queries", response_model=DataResponseClass[List[DashboardQueryResponse]])
async def get_dashboard_queries(
    dashboard_id: int,
    organisation: OrganisationModel = Depends(get_user_organisation),
    db: AsyncSession = Depends(get_async_db),
):
    """Get all queries for a dashboard."""
    dashboard_service = DashboardService()
    try:
        queries = await dashboard_service.get_dashboard_queries(dashboard_id=dashboard_id, db=db)
        return DataResponse(data=queries)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": {"detail": str(e)}},
        )


@router.get("/{dashboard_id}/queries/{query_id}", response_model=DataResponseClass[DashboardQueryResponse])
async def get_dashboard_query(
    dashboard_id: int,
    query_id: int,
    organisation: OrganisationModel = Depends(get_user_organisation),
    db: AsyncSession = Depends(get_async_db),
):
    """Get a specific query from a dashboard."""
    dashboard_service = DashboardService()
    query = await dashboard_service.get_dashboard_query(db, query_id, dashboard_id)
    if not query:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"detail": "Query not found"},
        )
    return DataResponse(data=query)


@router.put("/{dashboard_id}/queries/{query_id}", response_model=DataResponseClass[DashboardQueryResponse])
async def update_dashboard_query(
    dashboard_id: int,
    query_id: int,
    query_data: DashboardQueryUpdate,
    organisation: OrganisationModel = Depends(get_user_organisation),
    db: AsyncSession = Depends(get_async_db),
):
    """Update a specific query in a dashboard."""
    dashboard_service = DashboardService()
    try:
        query = await dashboard_service.update_dashboard_query(
            query_id=query_id,
            dashboard_id=dashboard_id,
            query_update=query_data,
            db=db,
        )
        if not query:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"error": {"detail": "Query not found"}},
            )
        return DataResponse(data=query)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": {"detail": str(e)}},
        )


@router.delete("/{dashboard_id}/queries/{query_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_dashboard_query(
    dashboard_id: int,
    query_id: int,
    organisation: OrganisationModel = Depends(get_user_organisation),
    db: AsyncSession = Depends(get_async_db),
):
    """Delete a specific query from a dashboard."""
    dashboard_service = DashboardService()
    try:
        success = await dashboard_service.delete_dashboard_query(
            query_id=query_id,
            dashboard_id=dashboard_id,
            db=db,
        )
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"error": {"detail": "Query not found"}},
            )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": {"detail": str(e)}},
        )
