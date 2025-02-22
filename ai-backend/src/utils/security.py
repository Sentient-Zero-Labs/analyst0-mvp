import base64
import json
from datetime import UTC, datetime, timedelta
from typing import Any, Dict

from cryptography.fernet import Fernet
from fastapi import HTTPException
from jose import jwt
from passlib.context import CryptContext

from src.settings import settings

fernet = Fernet(settings.SLACK_STATE_ENCRYPTION_KEY)


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__default_rounds=12, bcrypt__ident="2b")


def create_token(data: dict, expires_delta: timedelta, token_type: str = "access"):
    if token_type not in ["access", "refresh", "verify"]:
        raise ValueError("Token type must be one of: access, refresh, verify")

    to_encode = data.copy()
    expire = datetime.now(tz=UTC) + expires_delta
    to_encode.update({"exp": expire, "type": token_type})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt, int(expire.timestamp())


def decode_token(token: str):
    try:
        # Decode the JWT token with the secret key and specified algorithm
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        # Raised if the token is expired
        raise HTTPException(status_code=400, detail="Token has expired")
    except jwt.JWTError:
        # Raised for any other invalid token error
        raise HTTPException(status_code=400, detail="Invalid token")


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


def encode_encrypted(data: Dict[str, Any]) -> str:
    """
    Encrypt and encode state data
    """
    # Convert dict to JSON string
    json_data = json.dumps(data)

    # Encrypt and encode to base64
    encrypted = fernet.encrypt(json_data.encode())
    return base64.urlsafe_b64encode(encrypted).decode()


def decode_encrypted(text: str) -> Dict[str, Any]:
    """
    Decode and decrypt state data
    """
    try:
        # Decode base64 and decrypt
        decoded = base64.urlsafe_b64decode(text)
        decrypted = fernet.decrypt(decoded)

        # Parse JSON
        return json.loads(decrypted)
    except Exception as e:
        raise ValueError(f"Invalid state string: {e}")
