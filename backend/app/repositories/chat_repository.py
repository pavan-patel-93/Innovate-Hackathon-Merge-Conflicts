"""
Chat repository implementation.
Handles chat-related database operations.
"""
from typing import List, Optional, Dict, Any
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime

from app.repositories.base_repository import BaseRepository
from app.domain.entities.message import Message, MessageType, User
from app.core.logging import get_logger

logger = get_logger(__name__)


class ChatRepository(BaseRepository[Message]):
    """Repository for chat messages."""
    
    def __init__(self, database: AsyncIOMotorDatabase):
        super().__init__(database, "messages")
    
    def _entity_to_dict(self, entity: Message) -> Dict[str, Any]:
        """Convert Message entity to dictionary."""
        return {
            "id": entity.id,
            "content": entity.content,
            "room_name": entity.room_name,
            "user": {
                "id": entity.user.id,
                "name": entity.user.name,
                "avatar": entity.user.avatar
            },
            "message_type": entity.message_type.value,
            "metadata": entity.metadata,
            "is_edited": entity.is_edited,
            "reply_to": entity.reply_to
        }
    
    def _dict_to_entity(self, data: Dict[str, Any]) -> Message:
        """Convert dictionary to Message entity."""
        # Convert ObjectId to string
        data = self._convert_object_id(data)
        
        # Convert datetime strings back to datetime objects
        if isinstance(data.get('created_at'), str):
            data['created_at'] = datetime.fromisoformat(data['created_at'].replace('Z', '+00:00'))
        if isinstance(data.get('updated_at'), str):
            data['updated_at'] = datetime.fromisoformat(data['updated_at'].replace('Z', '+00:00'))
        
        return Message(
            id=data['id'],
            content=data['content'],
            room_name=data['room_name'],
            user=User(
                id=data['user']['id'],
                name=data['user']['name'],
                avatar=data['user'].get('avatar')
            ),
            message_type=MessageType(data.get('message_type', 'text')),
            created_at=data.get('created_at', datetime.now()),
            updated_at=data.get('updated_at', datetime.now()),
            metadata=data.get('metadata', {}),
            is_edited=data.get('is_edited', False),
            reply_to=data.get('reply_to')
        )
    
    async def get_messages_by_room(
        self, 
        room_name: str, 
        limit: int = 50,
        skip: int = 0
    ) -> List[Message]:
        """Get messages for a specific room."""
        try:
            cursor = self.collection.find({"room_name": room_name})
            cursor = cursor.sort("created_at", 1).skip(skip).limit(limit)
            
            documents = await cursor.to_list(length=limit)
            return [self._dict_to_entity(doc) for doc in documents]
        except Exception as e:
            logger.error(f"Error getting messages for room {room_name}: {e}")
            raise
    
    async def get_messages_by_user(
        self, 
        user_id: str, 
        limit: int = 50,
        skip: int = 0
    ) -> List[Message]:
        """Get messages by a specific user."""
        try:
            cursor = self.collection.find({"user.id": user_id})
            cursor = cursor.sort("created_at", -1).skip(skip).limit(limit)
            
            documents = await cursor.to_list(length=limit)
            return [self._dict_to_entity(doc) for doc in documents]
        except Exception as e:
            logger.error(f"Error getting messages for user {user_id}: {e}")
            raise
    
    async def search_messages(
        self, 
        room_name: str, 
        search_term: str,
        limit: int = 50
    ) -> List[Message]:
        """Search messages in a room."""
        try:
            # Create text search query
            query = {
                "room_name": room_name,
                "$text": {"$search": search_term}
            }
            
            cursor = self.collection.find(query)
            cursor = cursor.sort("created_at", -1).limit(limit)
            
            documents = await cursor.to_list(length=limit)
            return [self._dict_to_entity(doc) for doc in documents]
        except Exception as e:
            logger.error(f"Error searching messages in room {room_name}: {e}")
            raise
    
    async def get_recent_messages(
        self, 
        room_name: str, 
        since: datetime,
        limit: int = 100
    ) -> List[Message]:
        """Get recent messages since a specific time."""
        try:
            query = {
                "room_name": room_name,
                "created_at": {"$gte": since}
            }
            
            cursor = self.collection.find(query)
            cursor = cursor.sort("created_at", 1).limit(limit)
            
            documents = await cursor.to_list(length=limit)
            return [self._dict_to_entity(doc) for doc in documents]
        except Exception as e:
            logger.error(f"Error getting recent messages for room {room_name}: {e}")
            raise
    
    async def delete_messages_by_room(self, room_name: str) -> int:
        """Delete all messages in a room."""
        try:
            result = await self.collection.delete_many({"room_name": room_name})
            return result.deleted_count
        except Exception as e:
            logger.error(f"Error deleting messages for room {room_name}: {e}")
            raise
    
    async def get_message_count_by_room(self, room_name: str) -> int:
        """Get message count for a room."""
        try:
            return await self.collection.count_documents({"room_name": room_name})
        except Exception as e:
            logger.error(f"Error counting messages for room {room_name}: {e}")
            raise