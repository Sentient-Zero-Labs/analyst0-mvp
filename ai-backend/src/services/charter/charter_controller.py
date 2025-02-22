from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import delete, distinct, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Session

from src.database import get_async_db, get_db
from src.middleware.wrap_response import DataResponse, DataResponseClass
from src.services.charter.charter_dep import get_admin_charter, get_user_charter
from src.services.charter.charter_model import CharterDataEntityModel, CharterModel
from src.services.charter_example.charter_example_model import CharterExampleModel
from src.services.charter_metric.charter_metric_model import CharterMetricModel
from src.services.charter_slack_channel.charter_slack_channel_model import CharterSlackChannelModel
from src.services.data_entity.data_entity_model import DataEntityModel
from src.services.data_entity.data_entity_schema import DataEntityListResponseItem
from src.services.data_source.data_source_dependency import get_user_data_source
from src.services.data_source.data_source_model import DataSourceModel
from src.services.organisation.organisation_dependency import get_admin_organisation, get_user_organisation
from src.services.organisation.organisation_model import OrganisationModel

from .charter_schema import CharterCreate, CharterListResponseItem, CharterResponse, CharterUpdate

router = APIRouter(prefix="/organisations/{organisation_public_id}/charters")


@router.post("/")
def create_charter(
    create_charter: CharterCreate,
    organisation: OrganisationModel = Depends(get_admin_organisation),
    db: Session = Depends(get_db),
):
    # Check if the data source exists and belongs to the organisation. We cant check
    # the data source id directly in Depends because data_source_id is not sent in the path params
    # against the organisation id.
    get_user_data_source(create_charter.data_source_id, organisation, db)

    create_charter_model = CharterModel(
        **create_charter.model_dump(exclude={"data_entity_ids", "slack_channel_ids"}), organisation_id=organisation.id
    )

    db.add(create_charter_model)
    db.commit()
    db.refresh(create_charter_model)

    # Create data_entity and charter model if provided
    if create_charter.data_entity_ids is not None:
        for data_entity_id in create_charter.data_entity_ids:
            new_charter_data_entity_association = CharterDataEntityModel(
                charter_id=create_charter_model.id, data_entity_id=data_entity_id
            )
            db.add(new_charter_data_entity_association)

    if create_charter.slack_channel_ids is not None:
        for slack_channel_id in create_charter.slack_channel_ids:
            if slack_channel_id.strip() != "":
                new_charter_slack_channel_association = CharterSlackChannelModel(
                    charter_id=create_charter_model.id, slack_channel_id=slack_channel_id
                )
                db.add(new_charter_slack_channel_association)

    db.commit()

    create_charter_model.data_entity_ids = create_charter.data_entity_ids

    return DataResponse(data={"id": create_charter_model.id})


@router.get("/{charter_id}", response_model=DataResponseClass[CharterResponse])
def get_charter(
    charter_id: int, db_charter: CharterResponse = Depends(get_user_charter), db: Session = Depends(get_db)
):
    charter_data_entities = (
        db.query(CharterDataEntityModel, CharterDataEntityModel.data_entity_id)
        .filter(CharterDataEntityModel.charter_id == charter_id)
        .all()
    )

    charter_slack_channels = (
        db.query(CharterSlackChannelModel, CharterSlackChannelModel.slack_channel_id)
        .filter(CharterSlackChannelModel.charter_id == charter_id)
        .all()
    )

    db_charter.data_entity_ids = [charter_entity.data_entity_id for charter_entity in charter_data_entities]
    db_charter.slack_channel_ids = [
        charter_slack_channel.slack_channel_id for charter_slack_channel in charter_slack_channels
    ]

    return DataResponse(data=db_charter)


@router.get("/{charter_id}/data-entities", response_model=DataResponseClass[List[DataEntityListResponseItem]])
async def get_data_entity_list_for_charter(
    db_charter: CharterResponse = Depends(get_user_charter),
    organisation: OrganisationModel = Depends(get_user_organisation),
    db: Session = Depends(get_db),
):
    data_entities = (
        db.query(
            DataEntityModel.id,
            DataEntityModel.name,
            DataEntityModel.description,
            DataEntityModel.organisation_id,
            DataEntityModel.schema_name,
            DataEntityModel.columns,
            DataEntityModel.foreign_keys,
            DataEntityModel.indexes,
        )
        .join(CharterDataEntityModel, CharterDataEntityModel.data_entity_id == DataEntityModel.id)
        .filter(
            CharterDataEntityModel.charter_id == db_charter.id,
            DataEntityModel.organisation_id == organisation.id,
            DataEntityModel.data_source_id == db_charter.data_source_id,
        )
        .order_by(DataEntityModel.name)
        .all()
    )

    result = []
    for entity in data_entities:
        result.append(
            {
                **entity._asdict(),
                "data_source_name": db_charter.data_source.name,
                "data_source_id": db_charter.data_source.id,
                "data_source_type": db_charter.data_source.type,
            }
        )

    return DataResponse(data=result)


@router.get("/", response_model=DataResponseClass[List[CharterListResponseItem]])
def get_charter_list(organisation: OrganisationModel = Depends(get_user_organisation), db: Session = Depends(get_db)):
    charters = (
        db.query(
            CharterModel,
            DataSourceModel,
            func.count(distinct(CharterMetricModel.id).label("metrics_count")),
            func.count(distinct(CharterExampleModel.id).label("examples_count")),
            func.count(distinct(CharterSlackChannelModel.slack_channel_id)).label("slack_channel_ids_count"),
        )
        .outerjoin(CharterMetricModel, CharterModel.id == CharterMetricModel.charter_id)
        .outerjoin(CharterExampleModel, CharterModel.id == CharterExampleModel.charter_id)
        .join(DataSourceModel, DataSourceModel.id == CharterModel.data_source_id)
        .join(CharterSlackChannelModel, CharterModel.id == CharterSlackChannelModel.charter_id, isouter=True)
        .filter(CharterModel.organisation_id == organisation.id)
        .group_by(CharterModel.id, DataSourceModel.id)
        .order_by(CharterModel.name)
        .all()
    )

    result = []

    for charter, data_source, metrics_count, examples_count, slack_channel_ids_count in charters:
        charter.data_source = data_source
        charter.data_entity_ids = []
        charter.metrics_count = metrics_count
        charter.examples_count = examples_count
        charter.slack_channel_ids_count = slack_channel_ids_count
        result.append(charter)

    return DataResponse(data=result)


@router.put("/{charter_id}", response_model=DataResponseClass[CharterResponse])
def update_charter(
    update_charter: CharterUpdate,
    db_charter: CharterResponse = Depends(get_admin_charter),
    organisation: OrganisationModel = Depends(get_admin_organisation),
    db: Session = Depends(get_db),
):
    # Check if the data source exists and belongs to the organisation. We cant check
    # the data source id directly in Depends because data_source_id is not sent in the path params
    # against the organisation id.
    get_user_data_source(update_charter.data_source_id, organisation, db)

    for key, value in update_charter.model_dump(exclude_unset=True).items():
        setattr(db_charter, key, value)

    # Update data_entity_ids if provided
    if update_charter.data_entity_ids is not None:
        # Delete existing associations
        db.query(CharterDataEntityModel).filter(CharterDataEntityModel.charter_id == db_charter.id).delete()

        # Create new associations
        for data_entity_id in update_charter.data_entity_ids:
            new_association = CharterDataEntityModel(charter_id=db_charter.id, data_entity_id=data_entity_id)
            db.add(new_association)

    if update_charter.slack_channel_ids is not None:
        # Delete existing associations
        db.query(CharterSlackChannelModel).filter(CharterSlackChannelModel.charter_id == db_charter.id).delete()

        # Create new associations
        for slack_channel_id in update_charter.slack_channel_ids:
            new_association = CharterSlackChannelModel(charter_id=db_charter.id, slack_channel_id=slack_channel_id)
            db.add(new_association)

    db.commit()
    db.refresh(db_charter)

    return DataResponse(data=db_charter)


@router.delete("/{charter_id}")
async def delete_charter(
    charter_id: int,
    organisation: OrganisationModel = Depends(get_admin_organisation),
    db: AsyncSession = Depends(get_async_db),
):
    # Get the charter
    stmt = select(CharterModel).where(CharterModel.id == charter_id, CharterModel.organisation_id == organisation.id)
    result = await db.execute(stmt)
    charter = result.scalar_one_or_none()

    if charter is None:
        raise HTTPException(status_code=404, detail="Charter not found")

    # Delete related records first
    await db.execute(delete(CharterDataEntityModel).where(CharterDataEntityModel.charter_id == charter_id))
    await db.execute(delete(CharterSlackChannelModel).where(CharterSlackChannelModel.charter_id == charter_id))
    await db.execute(delete(CharterMetricModel).where(CharterMetricModel.charter_id == charter_id))
    await db.execute(delete(CharterExampleModel).where(CharterExampleModel.charter_id == charter_id))

    # Delete the charter
    await db.delete(charter)
    await db.commit()
    return
