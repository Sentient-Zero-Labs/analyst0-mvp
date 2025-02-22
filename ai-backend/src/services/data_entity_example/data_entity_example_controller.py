from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.middleware.wrap_response import DataResponse, DataResponseClass
from src.services.organisation.organisation_model import OrganisationModel
from src.services.organisation.organisation_dependency import get_user_organisation
from src.database import get_db
from src.services.data_entity_example.data_entity_example_model import DataEntityExampleModel
from src.services.data_entity_example.data_entity_example_schema import DataEntityExampleCreate, DataEntityExampleListResponseItem, DataEntityExampleResponse, DataEntityExampleUpdate
from typing import List

router = APIRouter(
    prefix="/organisations/{organisation_public_id}/data-entity-examples")


@router.post("", response_model=DataResponseClass[DataEntityExampleResponse])
async def create_data_entity_example(
    data_entity_example: DataEntityExampleCreate,
    organisation: OrganisationModel = Depends(get_user_organisation),
    db: Session = Depends(get_db)
):
    new_data_entity_example = DataEntityExampleModel(
        **data_entity_example.model_dump())
    db.add(new_data_entity_example)
    db.commit()
    db.refresh(new_data_entity_example)
    return DataResponse(data=new_data_entity_example)


@router.get("", response_model=DataResponseClass[List[DataEntityExampleListResponseItem]])
async def get_data_entity_examples(
    organisation: OrganisationModel = Depends(get_user_organisation),
    db: Session = Depends(get_db)
):
    data_entity_examples = db.query(DataEntityExampleModel).join(DataEntityExampleModel.data_entity).join(DataEntityExampleModel.data_entity.data_source).filter(
        DataEntityExampleModel.data_entity.data_source.has(
            organisation_id=organisation.id)
    ).all()
    return DataResponse(data=data_entity_examples)


@router.get("/{data_entity_example_id}", response_model=DataResponseClass[DataEntityExampleResponse])
async def get_data_entity_example(
    data_entity_example_id: int,
    organisation: OrganisationModel = Depends(get_user_organisation),
    db: Session = Depends(get_db)
):
    data_entity_example = db.query(DataEntityExampleModel).join(DataEntityExampleModel.data_entity).join(DataEntityExampleModel.data_entity.data_source).filter(
        DataEntityExampleModel.id == data_entity_example_id,
        DataEntityExampleModel.data_entity.data_source.has(
            organisation_id=organisation.id)
    ).first()
    if not data_entity_example:
        raise HTTPException(
            status_code=404, detail="Data entity example not found")
    return DataResponse(data=data_entity_example)


@router.put("/{data_entity_example_id}", response_model=DataResponseClass[DataEntityExampleResponse])
async def update_data_entity_example(
    data_entity_example_id: int,
    data_entity_example_update: DataEntityExampleUpdate,
    organisation: OrganisationModel = Depends(get_user_organisation),
    db: Session = Depends(get_db)
):
    data_entity_example = db.query(DataEntityExampleModel).join(DataEntityExampleModel.data_entity).join(DataEntityExampleModel.data_entity.data_source).filter(
        DataEntityExampleModel.id == data_entity_example_id,
        DataEntityExampleModel.data_entity.data_source.has(
            organisation_id=organisation.id)
    ).first()
    if not data_entity_example:
        raise HTTPException(
            status_code=404, detail="Data entity example not found")

    for key, value in data_entity_example_update.model_dump().items():
        setattr(data_entity_example, key, value)

    db.commit()
    db.refresh(data_entity_example)
    return DataResponse(data=data_entity_example)


@router.delete("/{data_entity_example_id}", status_code=204)
async def delete_data_entity_example(
    data_entity_example_id: int,
    organisation: OrganisationModel = Depends(get_user_organisation),
    db: Session = Depends(get_db)
):
    data_entity_example = db.query(DataEntityExampleModel).join(DataEntityExampleModel.data_entity).join(DataEntityExampleModel.data_entity.data_source).filter(
        DataEntityExampleModel.id == data_entity_example_id,
        DataEntityExampleModel.data_entity.data_source.has(
            organisation_id=organisation.id)
    ).first()
    if not data_entity_example:
        raise HTTPException(
            status_code=404, detail="Data entity example not found")

    db.delete(data_entity_example)
    db.commit()
    return None
