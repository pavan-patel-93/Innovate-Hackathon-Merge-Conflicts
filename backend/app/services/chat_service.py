# app/services/chat_service.py
from typing import List, Dict, Any
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.models.chat import MessageInDB, MessageCreate, UserModel
from datetime import datetime
import uuid

class ChatService:
    def __init__(self, database: AsyncIOMotorDatabase):
        self.database = database
        self.collection = database.messages

    async def get_messages(self, room_name: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Get messages for a specific room"""
        cursor = self.collection.find({"room_name": room_name})
        cursor = cursor.sort("created_at", 1).limit(limit)
        messages = await cursor.to_list(length=limit)
        
        # Convert ObjectId to str for JSON serialization
        for message in messages:
            message["_id"] = str(message["_id"])
            if isinstance(message["created_at"], datetime):
                message["created_at"] = message["created_at"].isoformat()
        
        return messages

    async def save_message(self, message_data: Dict[str, Any], username: str) -> Dict[str, Any]:
        """Save a new message to the database"""
        message_dict = {
            "id": str(uuid.uuid4()),
            "content": message_data.get("content", ""),
            "room_name": message_data.get("room_name", ""),
            "user": {"name": username},
            "created_at": datetime.now()
        }
        
        result = await self.collection.insert_one(message_dict)
        message_dict["_id"] = str(result.inserted_id)
        
        return message_dict