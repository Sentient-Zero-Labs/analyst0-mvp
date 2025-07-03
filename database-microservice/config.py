"""Configuration settings for the database microservice."""

import os
import secrets
from typing import Optional
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """Application settings."""
    
    # Authentication
    api_key: str = Field(..., description="API key for authentication")
    
    # Server settings
    host: str = Field(default="0.0.0.0", description="Host to bind to")
    port: int = Field(default=8000, description="Port to bind to")
    workers: int = Field(default=1, description="Number of worker processes")
    
    # Database settings
    max_connections: int = Field(default=5, description="Max connections per database")
    query_timeout: int = Field(default=30, description="Query timeout in seconds")
    connection_timeout: int = Field(default=10, description="Connection timeout in seconds")
    
    # Security
    encryption_key: Optional[str] = Field(default=None, description="Key for encrypting credentials")
    
    # Logging
    log_level: str = Field(default="INFO", description="Logging level")
    
    # Development
    debug: bool = Field(default=False, description="Debug mode")
    reload: bool = Field(default=False, description="Auto-reload on changes")
    
    class Config:
        env_file = ".env"
        case_sensitive = False
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        
        # Generate encryption key if not provided
        if not self.encryption_key:
            self.encryption_key = secrets.token_urlsafe(32)
    
    @property
    def is_development(self) -> bool:
        """Check if running in development mode."""
        return self.debug or self.reload


# Global settings instance
settings = Settings()
