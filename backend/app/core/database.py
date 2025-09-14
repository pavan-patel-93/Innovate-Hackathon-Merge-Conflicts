"""
Database connection and configuration.
Centralized database management with proper connection handling.
"""
import asyncio
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.core.config import settings


class DatabaseManager:
    """Singleton database manager."""
    _instance: Optional['DatabaseManager'] = None
    _client: Optional[AsyncIOMotorClient] = None
    _database: Optional[AsyncIOMotorDatabase] = None
    _lock = asyncio.Lock()

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    async def get_client(self) -> AsyncIOMotorClient:
        """Get MongoDB client instance."""
        if self._client is None:
            async with self._lock:
                if self._client is None:
                    self._client = AsyncIOMotorClient(settings.MONGODB_URI)
        return self._client

    async def get_database(self) -> AsyncIOMotorDatabase:
        """Get database instance."""
        if self._database is None:
            client = await self.get_client()
            self._database = client[settings.MONGODB_DB_NAME]
        return self._database

    async def close_connection(self):
        """Close database connection."""
        if self._client:
            self._client.close()
            self._client = None
            self._database = None

    async def health_check(self) -> bool:
        """Check database connection health."""
        try:
            client = await self.get_client()
            await client.admin.command('ping')
            return True
        except Exception:
            return False


# Global database manager instance
db_manager = DatabaseManager()


async def get_database() -> AsyncIOMotorDatabase:
    """Get database instance (dependency injection)."""
    return await db_manager.get_database()


async def get_client() -> AsyncIOMotorClient:
    """Get MongoDB client instance."""
    return await db_manager.get_client()


async def close_database_connection():
    """Close database connection."""
    await db_manager.close_connection()


async def check_database_health() -> bool:
    """Check if database is healthy."""
    return await db_manager.health_check()
