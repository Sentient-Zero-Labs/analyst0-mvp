from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.services.dashboard.dashboard_model import DashboardModel, DashboardQueryModel
from src.services.dashboard.dashboard_schema import (
    DashboardCreate,
    DashboardQueryCreate,
    DashboardQueryUpdate,
    DashboardUpdate,
)


class DashboardService:
    @staticmethod
    async def create_dashboard(
        organisation_id: int, dashboard_create: DashboardCreate, db: AsyncSession
    ) -> DashboardModel:
        dashboard = DashboardModel(
            title=dashboard_create.title,
            description=dashboard_create.description,
            tags=dashboard_create.tags,
            organisation_id=organisation_id,
        )
        db.add(dashboard)
        await db.commit()
        await db.refresh(dashboard)
        return dashboard

    @staticmethod
    async def update_dashboard(
        dashboard_id: int,
        organisation_id: int,
        dashboard_update: DashboardUpdate,
        db: AsyncSession,
    ) -> Optional[DashboardModel]:
        query = select(DashboardModel).where(
            DashboardModel.id == dashboard_id,
            DashboardModel.organisation_id == organisation_id,
            DashboardModel.deleted_at.is_(None),
        )
        result = await db.execute(query)
        dashboard = result.scalar_one_or_none()

        if not dashboard:
            return None

        if dashboard_update.title is not None:
            dashboard.title = dashboard_update.title
        if dashboard_update.description is not None:
            dashboard.description = dashboard_update.description
        if dashboard_update.tags is not None:
            dashboard.tags = dashboard_update.tags

        await db.commit()
        await db.refresh(dashboard)
        return dashboard

    @staticmethod
    async def delete_dashboard(dashboard_id: int, organisation_id: int, db: AsyncSession) -> bool:
        query = select(DashboardModel).where(
            DashboardModel.id == dashboard_id,
            DashboardModel.organisation_id == organisation_id,
            DashboardModel.deleted_at.is_(None),
        )
        result = await db.execute(query)
        dashboard = result.scalar_one_or_none()

        if not dashboard:
            return False

        dashboard.soft_delete()
        await db.commit()
        return True

    @staticmethod
    async def get_dashboard(db: AsyncSession, dashboard_id: int, organisation_id: int) -> Optional[DashboardModel]:
        query = (
            select(DashboardModel)
            .options(selectinload(DashboardModel.queries))
            .where(
                DashboardModel.id == dashboard_id,
                DashboardModel.organisation_id == organisation_id,
                DashboardModel.deleted_at.is_(None),
            )
        )
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_dashboards(organisation_id: int, db: AsyncSession) -> List[DashboardModel]:
        query = (
            select(DashboardModel)
            .where(DashboardModel.organisation_id == organisation_id, DashboardModel.deleted_at.is_(None))
            .order_by(DashboardModel.created_at.desc())
        )
        result = await db.execute(query)
        dashboards = list(result.scalars().all())

        # Add query count for each dashboard
        for dashboard in dashboards:
            query_count_query = select(DashboardQueryModel).where(
                DashboardQueryModel.dashboard_id == dashboard.id, DashboardQueryModel.deleted_at.is_(None)
            )
            query_count_result = await db.execute(query_count_query)
            dashboard.query_count = len(list(query_count_result.scalars().all()))

        return dashboards

    @staticmethod
    async def create_dashboard_query(
        dashboard_id: int, query_create: DashboardQueryCreate, db: AsyncSession
    ) -> DashboardQueryModel:
        query = DashboardQueryModel(
            dashboard_id=dashboard_id,
            data_source_id=query_create.data_source_id,
            title=query_create.title,
            description=query_create.description,
            query=query_create.query,
            query_metadata=query_create.query_metadata,
        )
        db.add(query)
        await db.commit()
        await db.refresh(query)
        return query

    @staticmethod
    async def update_dashboard_query(
        query_id: int, dashboard_id: int, query_update: DashboardQueryUpdate, db: AsyncSession
    ) -> Optional[DashboardQueryModel]:
        query = select(DashboardQueryModel).where(
            DashboardQueryModel.id == query_id,
            DashboardQueryModel.dashboard_id == dashboard_id,
            DashboardQueryModel.deleted_at.is_(None),
        )
        result = await db.execute(query)
        dashboard_query = result.scalar_one_or_none()

        if not dashboard_query:
            return None

        if query_update.title is not None:
            dashboard_query.title = query_update.title
        if query_update.description is not None:
            dashboard_query.description = query_update.description
        if query_update.query is not None:
            dashboard_query.query = query_update.query
        if query_update.data_source_id is not None:
            dashboard_query.data_source_id = query_update.data_source_id
        if query_update.query_metadata is not None:
            dashboard_query.query_metadata = query_update.query_metadata

        await db.commit()
        await db.refresh(dashboard_query)
        return dashboard_query

    @staticmethod
    async def delete_dashboard_query(query_id: int, dashboard_id: int, db: AsyncSession) -> bool:
        query = select(DashboardQueryModel).where(
            DashboardQueryModel.id == query_id,
            DashboardQueryModel.dashboard_id == dashboard_id,
            DashboardQueryModel.deleted_at.is_(None),
        )
        result = await db.execute(query)
        dashboard_query = result.scalar_one_or_none()

        if not dashboard_query:
            return False

        dashboard_query.soft_delete()
        await db.commit()
        return True

    @staticmethod
    async def get_dashboard_query(db: AsyncSession, query_id: int, dashboard_id: int) -> Optional[DashboardQueryModel]:
        query = select(DashboardQueryModel).where(
            DashboardQueryModel.id == query_id,
            DashboardQueryModel.dashboard_id == dashboard_id,
            DashboardQueryModel.deleted_at.is_(None),
        )
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_dashboard_queries(dashboard_id: int, db: AsyncSession) -> List[DashboardQueryModel]:
        query = (
            select(DashboardQueryModel)
            .where(DashboardQueryModel.dashboard_id == dashboard_id, DashboardQueryModel.deleted_at.is_(None))
            .order_by(DashboardQueryModel.created_at.desc())
        )
        result = await db.execute(query)
        return list(result.scalars().all())
