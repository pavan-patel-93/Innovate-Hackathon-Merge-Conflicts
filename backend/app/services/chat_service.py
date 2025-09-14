"""
Chat service implementation.
Handles chat-related business logic.
"""
from typing import List, Optional, Dict, Any
from datetime import datetime

from app.services.base_service import BaseService
from app.repositories.chat_repository import ChatRepository
from app.domain.entities.message import Message, MessageType, User
from app.core.exceptions import ValidationError, NotFoundError
from app.core.logging import get_logger

logger = get_logger(__name__)


class ChatService(BaseService[Message]):
    """Service for chat operations."""
    
    def __init__(self, chat_repository: ChatRepository, websocket_service=None):
        super().__init__()
        self.chat_repository = chat_repository
        self.websocket_service = websocket_service
    
    async def create(self, data: Dict[str, Any]) -> Message:
        """Create a new message."""
        try:
            # Validate required fields
            self.validate_required_fields(data, ['content', 'room_name', 'user'])
            
            # Validate content length
            self.validate_field_length(data['content'], 'content', 1000)
            
            # Sanitize content
            content = self.sanitize_string(data['content'])
            
            # Create user object
            user_data = data['user']
            user = User(
                id=user_data.get('id', self.generate_id()),
                name=self.sanitize_string(user_data['name']),
                avatar=user_data.get('avatar')
            )
            
            # Create message
            message = Message(
                id=self.generate_id(),
                content=content,
                room_name=data['room_name'],
                user=user,
                message_type=MessageType(data.get('message_type', 'text')),
                metadata=data.get('metadata', {}),
                reply_to=data.get('reply_to')
            )
            
            # Save to repository
            await self.chat_repository.create(message)
            
            self.log_operation("create_message", {
                "message_id": message.id,
                "room_name": message.room_name,
                "user_id": user.id
            })
            
            return message
            
        except Exception as e:
            self.log_error("create_message", e, {"data": data})
            raise
    
    async def get_by_id(self, message_id: str) -> Optional[Message]:
        """Get message by ID."""
        try:
            return await self.chat_repository.get_by_id(message_id)
        except Exception as e:
            self.log_error("get_message_by_id", e, {"message_id": message_id})
            raise
    
    async def update(self, message_id: str, data: Dict[str, Any]) -> Message:
        """Update message."""
        try:
            message = await self.get_by_id(message_id)
            if not message:
                raise NotFoundError("Message", message_id)
            
            # Update content if provided
            if 'content' in data:
                self.validate_field_length(data['content'], 'content', 1000)
                message.edit_content(self.sanitize_string(data['content']))
            
            # Update metadata if provided
            if 'metadata' in data:
                for key, value in data['metadata'].items():
                    message.add_metadata(key, value)
            
            # Save updated message
            await self.chat_repository.update(message_id, {
                "content": message.content,
                "is_edited": message.is_edited,
                "updated_at": message.updated_at,
                "metadata": message.metadata
            })
            
            self.log_operation("update_message", {
                "message_id": message_id,
                "is_edited": message.is_edited
            })
            
            return message
            
        except Exception as e:
            self.log_error("update_message", e, {"message_id": message_id, "data": data})
            raise
    
    async def delete(self, message_id: str) -> bool:
        """Delete message."""
        try:
            result = await self.chat_repository.delete(message_id)
            
            self.log_operation("delete_message", {"message_id": message_id})
            
            return result
            
        except Exception as e:
            self.log_error("delete_message", e, {"message_id": message_id})
            raise
    
    async def get_messages_by_room(
        self, 
        room_name: str, 
        limit: int = 50,
        skip: int = 0
    ) -> List[Message]:
        """Get messages for a specific room."""
        try:
            messages = await self.chat_repository.get_messages_by_room(
                room_name, limit, skip
            )
            
            self.log_operation("get_messages_by_room", {
                "room_name": room_name,
                "limit": limit,
                "count": len(messages)
            })
            
            return messages
            
        except Exception as e:
            self.log_error("get_messages_by_room", e, {
                "room_name": room_name,
                "limit": limit
            })
            raise
    
    async def get_messages_by_user(
        self, 
        user_id: str, 
        limit: int = 50,
        skip: int = 0
    ) -> List[Message]:
        """Get messages by user."""
        try:
            messages = await self.chat_repository.get_messages_by_user(
                user_id, limit, skip
            )
            
            self.log_operation("get_messages_by_user", {
                "user_id": user_id,
                "limit": limit,
                "count": len(messages)
            })
            
            return messages
            
        except Exception as e:
            self.log_error("get_messages_by_user", e, {
                "user_id": user_id,
                "limit": limit
            })
            raise
    
    async def search_messages(
        self, 
        room_name: str, 
        search_term: str,
        limit: int = 50
    ) -> List[Message]:
        """Search messages in a room."""
        try:
            if not search_term.strip():
                return []
            
            messages = await self.chat_repository.search_messages(
                room_name, search_term, limit
            )
            
            self.log_operation("search_messages", {
                "room_name": room_name,
                "search_term": search_term,
                "count": len(messages)
            })
            
            return messages
            
        except Exception as e:
            self.log_error("search_messages", e, {
                "room_name": room_name,
                "search_term": search_term
            })
            raise
    
    async def get_recent_messages(
        self, 
        room_name: str, 
        since: datetime,
        limit: int = 100
    ) -> List[Message]:
        """Get recent messages since a specific time."""
        try:
            messages = await self.chat_repository.get_recent_messages(
                room_name, since, limit
            )
            
            self.log_operation("get_recent_messages", {
                "room_name": room_name,
                "since": since.isoformat(),
                "count": len(messages)
            })
            
            return messages
            
        except Exception as e:
            self.log_error("get_recent_messages", e, {
                "room_name": room_name,
                "since": since.isoformat()
            })
            raise
    
    async def send_message(
        self, 
        content: str, 
        room_name: str, 
        user: User,
        message_type: MessageType = MessageType.TEXT,
        metadata: Dict[str, Any] = None
    ) -> Message:
        """Send a message and broadcast it."""
        try:
            # Create message
            message_data = {
                "content": content,
                "room_name": room_name,
                "user": {
                    "id": user.id,
                    "name": user.name,
                    "avatar": user.avatar
                },
                "message_type": message_type.value,
                "metadata": metadata or {}
            }
            
            message = await self.create(message_data)
            
            # Broadcast message if WebSocket service is available
            if self.websocket_service:
                await self.websocket_service.broadcast_message(room_name, message)
            
            return message
            
        except Exception as e:
            self.log_error("send_message", e, {
                "room_name": room_name,
                "user_id": user.id,
                "message_type": message_type.value
            })
            raise
    
    async def get_room_statistics(self, room_name: str) -> Dict[str, Any]:
        """Get room statistics."""
        try:
            total_messages = await self.chat_repository.get_message_count_by_room(room_name)
            
            # Get recent messages for activity analysis
            recent_messages = await self.get_recent_messages(
                room_name, 
                datetime.now().replace(hour=0, minute=0, second=0, microsecond=0),
                limit=1000
            )
            
            # Count messages by type
            message_types = {}
            for message in recent_messages:
                msg_type = message.message_type.value
                message_types[msg_type] = message_types.get(msg_type, 0) + 1
            
            stats = {
                "total_messages": total_messages,
                "messages_today": len(recent_messages),
                "message_types": message_types,
                "last_activity": recent_messages[-1].created_at if recent_messages else None
            }
            
            return stats
            
        except Exception as e:
            self.log_error("get_room_statistics", e, {"room_name": room_name})
            raise