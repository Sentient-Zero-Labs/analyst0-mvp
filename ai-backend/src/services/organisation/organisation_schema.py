from pydantic import BaseModel, EmailStr

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


class OrganisationUserAddSchema(BaseModel):
    email: EmailStr
    role: OrganisationUserRoleEnum = OrganisationUserRoleEnum.USER


class OrganisationUserResponse(BaseModel):
    id: int
    user_id: int
    organisation_id: int
    role: OrganisationUserRoleEnum
    user_email: str
