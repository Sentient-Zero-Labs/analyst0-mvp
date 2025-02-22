import base64
import json
from datetime import UTC, datetime, timedelta
from typing import Any, Dict

from cryptography.fernet import Fernet
from fastapi import HTTPException
from jose import jwt
from passlib.context import CryptContext

from src.settings import settings
from src.utils.logger import logger

fernet = Fernet(settings.SLACK_STATE_ENCRYPTION_KEY)


pwd_context = CryptContext(
    schemes=["bcrypt"], deprecated="auto", bcrypt__default_rounds=12, bcrypt__ident="2b"
)


def create_token(data: dict, expires_delta: timedelta, token_type: str = "access"):
    if token_type not in ["access", "refresh", "verify"]:
        raise ValueError("Token type must be one of: access, refresh, verify")

    to_encode = data.copy()
    expire = datetime.now(tz=UTC) + expires_delta
    to_encode.update({"exp": expire, "type": token_type})
    encoded_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )
    return encoded_jwt, int(expire.timestamp())


def decode_token(token: str):
    try:
        # Decode the JWT token with the secret key and specified algorithm
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
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


def generate_fernet_key() -> bytes:
    """Generate a valid Fernet key"""
    try:
        # First try to decode the existing key
        return base64.urlsafe_b64encode(
            base64.urlsafe_b64decode(settings.ENCRYPTION_KEY.encode())
        )
    except:
        # If that fails, generate a new key
        return Fernet.generate_key()


def get_encryption_key():
    """Get properly formatted encryption key"""
    return generate_fernet_key()


def encrypt_data(data: str) -> str:
    """Encrypt a string using Fernet symmetric encryption"""
    if not isinstance(data, str):
        raise ValueError("Data must be a string")

    f = Fernet(generate_fernet_key())
    return f.encrypt(data.encode()).decode()


def decrypt_data(encrypted_data: str) -> str:
    """Decrypt a Fernet-encrypted string"""
    if not isinstance(encrypted_data, str):
        raise ValueError("Encrypted data must be a string")

    f = Fernet(generate_fernet_key())
    return f.decrypt(encrypted_data.encode()).decode()


def encrypt_value(value: str) -> str:
    """Encrypt a single value"""
    logger.debug(f"Encrypting value: {value} (type: {type(value)})")
    if not isinstance(value, str):
        value = str(value)
        logger.debug(f"Converted to string: {value}")

    f = Fernet(generate_fernet_key())
    encrypted = f.encrypt(value.encode()).decode()
    logger.debug(f"Encrypted result: {encrypted}")
    return encrypted


def decrypt_value(encrypted_value: str) -> str:
    """Decrypt a single value"""
    logger.debug(f"Decrypting value: {encrypted_value}")
    if not isinstance(encrypted_value, str):
        raise ValueError("Encrypted value must be a string")

    f = Fernet(generate_fernet_key())
    decrypted = f.decrypt(encrypted_value.encode()).decode()
    logger.debug(f"Decrypted result: {decrypted}")
    return decrypted