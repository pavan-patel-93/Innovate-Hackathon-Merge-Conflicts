# app/db/mongodb.py
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

class MongoDB:
    client: AsyncIOMotorClient = None

async def get_mongodb_client() -> AsyncIOMotorClient:
    """
    Get MongoDB client instance
    """
    from app.db.mongodb import MongoDB
    if MongoDB.client is None:
        MongoDB.client = AsyncIOMotorClient(settings.MONGODB_URI)
    return MongoDB.client

async def get_database():
    """
    Get database instance
    """
    client = await get_mongodb_client()
    return client[settings.MONGODB_DB_NAME]

async def close_mongodb_connection():
    """
    Close MongoDB connection
    """
    from app.db.mongodb import MongoDB
    if MongoDB.client is not None:
        MongoDB.client.close()
        MongoDB.client = None