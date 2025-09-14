"""
Message domain entity.
Represents a chat message in the system.
"""
from datetime import datetime
from typing import Optional, Dict, Any
from dataclasses import dataclass, field
from enum import Enum


class MessageType(Enum):
    """Message types."""
    TEXT = "text"
    FILE = "file"
    SYSTEM = "system"
    AI_RESPONSE = "ai_response"


@dataclass
class User:
    """User information in message context."""
    id: str
    name: str
    avatar: Optional[str] = None


@dataclass
class Message:
    """Message domain entity."""
    id: str
    content: str
    room_name: str
    user: User
    message_type: MessageType = MessageType.TEXT
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)
    metadata: Dict[str, Any] = field(default_factory=dict)
    is_edited: bool = False
    reply_to: Optional[str] = None
    
    def is_system_message(self) -> bool:
        """Check if message is a system message."""
        return self.message_type == MessageType.SYSTEM
    
    def is_ai_message(self) -> bool:
        """Check if message is from AI."""
        return self.message_type == MessageType.AI_RESPONSE
    
    def edit_content(self, new_content: str):
        """Edit message content."""
        self.content = new_content
        self.is_edited = True
        self.updated_at = datetime.now()
    
    def add_metadata(self, key: str, value: Any):
        """Add metadata to message."""
        self.metadata[key] = value
        self.updated_at = datetime.now()
    
    def to_dict(self) -> dict:
        """Convert to dictionary."""
        return {
            "id": self.id,
            "content": self.content,
            "room_name": self.room_name,
            "user": {
                "id": self.user.id,
                "name": self.user.name,
                "avatar": self.user.avatar
            },
            "message_type": self.message_type.value,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "metadata": self.metadata,
            "is_edited": self.is_edited,
            "reply_to": self.reply_to
        }
