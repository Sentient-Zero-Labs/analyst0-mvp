"""Security utilities for encryption and authentication."""

import base64
import secrets
from typing import Any
from cryptography.fernet import Fernet
from config import settings


# Initialize encryption key
_encryption_key = None


def get_encryption_key() -> bytes:
    """Get or generate encryption key."""
    global _encryption_key
    
    if _encryption_key is None:
        if settings.encryption_key:
            # Use provided key
            key_bytes = settings.encryption_key.encode('utf-8')
            # Ensure key is proper length for Fernet
            key_bytes = base64.urlsafe_b64encode(key_bytes[:32].ljust(32, b'0'))
        else:
            # Generate new key
            key_bytes = Fernet.generate_key()
        
        _encryption_key = key_bytes
    
    return _encryption_key


def encrypt_data(data: str) -> str:
    """Encrypt sensitive data."""
    if not data:
        return data
    
    try:
        key = get_encryption_key()
        fernet = Fernet(key)
        encrypted_bytes = fernet.encrypt(data.encode('utf-8'))
        return base64.urlsafe_b64encode(encrypted_bytes).decode('utf-8')
    except Exception:
        # If encryption fails, return original data (for development)
        return data


def decrypt_data(encrypted_data: str) -> str:
    """Decrypt sensitive data."""
    if not encrypted_data:
        return encrypted_data
    
    try:
        key = get_encryption_key()
        fernet = Fernet(key)
        encrypted_bytes = base64.urlsafe_b64decode(encrypted_data.encode('utf-8'))
        decrypted_bytes = fernet.decrypt(encrypted_bytes)
        return decrypted_bytes.decode('utf-8')
    except Exception:
        # If decryption fails, assume data is not encrypted
        return encrypted_data


def generate_api_key() -> str:
    """Generate a secure API key."""
    return secrets.token_urlsafe(32)
