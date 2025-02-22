import jwt
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy.orm import Session

from src.database import get_db
from src.internal_services.slack.slack_service import send_new_user_registered_to_slack
from src.services.auth.auth_service import AuthService
from src.services.user.user_model import UserModel
from src.services.user.user_schema import TokenRefreshSchema, TokenVerifySchema, UserCreateSchema, UserLoginSchema
from src.utils.logger import logger
from src.utils.security import (
    decode_token,
    get_password_hash,
    verify_password,
)

router = APIRouter(prefix="/auth")


@router.post("/login")
async def login(form_data: UserLoginSchema, db: Session = Depends(get_db)):
    logger.info(f"Login attempt for email: {form_data.email}")
    user = db.query(UserModel).filter(UserModel.email == form_data.email).first()
    if not user:
        logger.info(f"Login failed for email: {form_data.email}")
        raise HTTPException(status_code=400, detail="Incorrect email or password")

    # Then check if email is verified
    if not user.is_verified:
        raise HTTPException(status_code=403, detail="Email not verified")

    # Finally verify password
    if not verify_password(form_data.password, user.hashed_password):
        logger.info(f"Login failed for email: {form_data.email}")
        raise HTTPException(status_code=400, detail="Incorrect email or password")

    logger.info(f"Login successful for email: {form_data.email}")
    access_token, expires_at = AuthService.create_access_token(data={"sub": user.email})
    refresh_token, refresh_expires_at = AuthService.create_refresh_token(data={"sub": user.email})

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "expires_at": expires_at,
        "refresh_expires_at": refresh_expires_at,
        "token_type": "bearer",
        "id": user.id,
    }


@router.post("/refresh")
async def refresh_token(refresh_token: TokenRefreshSchema, db: Session = Depends(get_db)):
    logger.info(f"Refresh token attempt for refresh token: {refresh_token.refresh_token}")
    try:
        payload = decode_token(refresh_token.refresh_token)
        if payload["type"] != "refresh":
            logger.info(f"Invalid token type: {payload['type']}")
            raise HTTPException(status_code=400, detail="Invalid token type")

        user_email = payload["sub"]
        user = db.query(UserModel).filter(UserModel.email == user_email).first()

        if not user:
            logger.info(f"User not found for email: {user_email}")
            raise HTTPException(status_code=404, detail="User not found")

        access_token, expires_at = AuthService.create_access_token(data={"sub": user.email})
        return {"access_token": access_token, "token_type": "bearer", "expires_at": expires_at}
    except jwt.JWTError:
        logger.info(f"Invalid refresh token: {refresh_token.refresh_token}")
        raise HTTPException(status_code=400, detail="Invalid refresh token")


@router.post("/register")
async def register(user: UserCreateSchema, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    existing_user = db.query(UserModel).filter(UserModel.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User with this email already exists")

    # Create new user
    hashed_password = get_password_hash(user.password)
    new_user = UserModel(email=user.email, hashed_password=hashed_password, is_verified=False)

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    AuthService.create_and_send_verification_email(user.email, background_tasks)

    send_new_user_registered_to_slack(user.email)

    return {"message": "Registration successful. Please check your email to verify your account."}


# @router.post("/google")
# async def google_auth(user_data: UserGoogleSchema, db: Session = Depends(get_db)):
#     user = db.query(UserModel).filter(
#         UserModel.email == user_data.email).first()
#     if not user:
#         logger.info(f"User not found for email: {user_data.email}")
#         new_user = UserModel(
#             email=user_data.email,
#             name=user_data.name,
#             google_id=user_data.google_id
#         )
#         db.add(new_user)
#         db.commit()
#         db.refresh(new_user)
#         user = new_user
#     logger.info(f"User found for email: {user.email}")
#     access_token = create_access_token(data={"sub": user.email})
#     return {"access_token": access_token, "token_type": "bearer", "id": user.id}


@router.post("/verify-email")
async def verify_email(tokenVerify: TokenVerifySchema, db: Session = Depends(get_db)):
    try:
        # Decode and verify the token
        payload = decode_token(tokenVerify.token)
        if payload["type"] != "verify":
            raise HTTPException(status_code=400, detail="Invalid token type")

        # Get user email from token
        user_email = payload["sub"]

        # Find and update user
        user = db.query(UserModel).filter(UserModel.email == user_email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        if user.is_verified:
            return {"message": "Email already verified"}

        # Update user verification status
        user.is_verified = True
        db.commit()

        return {"message": "Email verified successfully"}

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=400, detail="Verification link has expired")
    except jwt.PyJWTError:
        # Raised for any other invalid token error
        raise HTTPException(status_code=400, detail="Invalid token")


@router.post("/resend-verification")
async def resend_verification(email_data: dict, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    email = email_data.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")
    user = db.query(UserModel).filter(UserModel.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.is_verified:
        raise HTTPException(status_code=400, detail="Email is already verified")

    AuthService.create_and_send_verification_email(email, background_tasks)

    return {"message": "Verification email has been resent"}
