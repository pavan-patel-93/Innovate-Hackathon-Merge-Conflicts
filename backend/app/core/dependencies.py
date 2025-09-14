"""
Dependency injection container for the application.
This module provides all the dependencies needed throughout the application.
"""
from functools import lru_cache
from typing import Generator
from fastapi import Depends
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.core.config import settings
from app.core.database import get_database
from app.repositories.chat_repository import ChatRepository
from app.repositories.user_repository import UserRepository
from app.services.chat_service import ChatService
from app.services.ai_service import AIService
from app.services.websocket_service import WebSocketService
from app.services.file_upload_service import FileUploadService


@lru_cache()
def get_settings():
    """Get application settings (cached)."""
    return settings


async def get_db() -> AsyncIOMotorDatabase:
    """Get database connection."""
    return await get_database()


# Repository Dependencies
async def get_chat_repository(db: AsyncIOMotorDatabase = Depends(get_database)) -> ChatRepository:
    """Get chat repository instance."""
    return ChatRepository(db)


async def get_user_repository(db: AsyncIOMotorDatabase = Depends(get_database)) -> UserRepository:
    """Get user repository instance."""
    return UserRepository(db)


# Service Dependencies
async def get_ai_service() -> AIService:
    """Get AI service instance."""
    return AIService()


async def get_websocket_service() -> WebSocketService:
    """Get WebSocket service instance."""
    return WebSocketService()


async def get_file_upload_service() -> FileUploadService:
    """Get file upload service instance."""
    return FileUploadService()


async def get_chat_service(
    chat_repo: ChatRepository = Depends(get_chat_repository),
    websocket_service: WebSocketService = Depends(get_websocket_service)
) -> ChatService:
    """Get chat service instance."""
    return ChatService(chat_repo, websocket_service)