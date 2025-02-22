from pydantic import BaseModel

from src.services.organisation.organisation_model import OrganisationUserRoleEnum


class OrganisationCreateSchema(BaseModel):
    name: str


class OrganisationUpdateSchema(BaseModel):
    id: int
    name: str


class Organisation(BaseModel):
    id: int
    public_id: str
    name: str


class OrganisationListResponseItem(BaseModel):
    id: int
    public_id: str
    name: str
    is_slack_bot_enabled: bool
    data_source_count: int
    user_role: OrganisationUserRoleEnum
