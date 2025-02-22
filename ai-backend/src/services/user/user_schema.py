from pydantic import BaseModel, EmailStr


class TokenRefreshSchema(BaseModel):
    refresh_token: str


class TokenVerifySchema(BaseModel):
    token: str


class UserLoginSchema(BaseModel):
    email: EmailStr
    password: str


class UserCreateSchema(BaseModel):
    email: EmailStr
    password: str


class UserGoogleSchema(BaseModel):
    email: EmailStr
    name: str
    google_id: str


class UserSchema(BaseModel):
    id: int
    email: EmailStr
    name: str

    class Config:
        from_attributes = True
