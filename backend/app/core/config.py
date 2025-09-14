# app/core/config.py
import os
from typing import List, Optional
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings with validation"""
    
    # Application settings
    APP_NAME: str = "FasiAPI"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = Field(default=False, description="Debug mode")
    
    # Server settings
    HOST: str = Field(default="0.0.0.0", description="Server host")
    PORT: int = Field(default=8000, description="Server port")
    
    # CORS settings
    CORS_ORIGINS: List[str] = Field(
        default=["http://localhost:3000", "http://localhost:3001"],
        description="Allowed CORS origins"
    )
    CORS_ALLOW_CREDENTIALS: bool = Field(default=True, description="Allow credentials in CORS")
    CORS_ALLOW_METHODS: List[str] = Field(
        default=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        description="Allowed HTTP methods"
    )
    CORS_ALLOW_HEADERS: List[str] = Field(
        default=["*"],
        description="Allowed headers"
    )
    
    # Database settings
    MONGODB_URI: str = Field(
        default="mongodb://localhost:27017",
        description="MongoDB connection URI"
    )
    MONGODB_DB_NAME: str = Field(
        default="fasi_api",
        description="MongoDB database name"
    )
    
    # Logging settings
    LOG_LEVEL: str = Field(default="INFO", description="Logging level")
    LOG_FORMAT: str = Field(default="json", description="Log format (json/text)")
    
    # File upload settings
    MAX_FILE_SIZE: int = Field(default=10 * 1024 * 1024, description="Max file size in bytes")
    ALLOWED_FILE_TYPES: List[str] = Field(
        default=[
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/plain"
        ],
        description="Allowed file types for upload"
    )
    UPLOAD_DIR: str = Field(default="app/uploaded-files", description="Upload directory")
    
    # Analysis settings
    ANALYSIS_TIMEOUT: int = Field(default=300, description="Analysis timeout in seconds")
    ENABLE_AI_ANALYSIS: bool = Field(default=True, description="Enable AI analysis")
    
    # WebSocket settings
    WS_HEARTBEAT_INTERVAL: int = Field(default=30, description="WebSocket heartbeat interval")
    WS_MAX_CONNECTIONS: int = Field(default=1000, description="Max WebSocket connections")
    
    # Security settings
    SECRET_KEY: str = Field(default="your-secret-key-here", description="Secret key for JWT")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30, description="Access token expiration")
    
    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v
    
    @field_validator("ALLOWED_FILE_TYPES", mode="before")
    @classmethod
    def parse_file_types(cls, v):
        if isinstance(v, str):
            return [file_type.strip() for file_type in v.split(",")]
        return v
    
    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": False,
        "extra": "allow"
    }


# Global settings instance
settings = Settings()