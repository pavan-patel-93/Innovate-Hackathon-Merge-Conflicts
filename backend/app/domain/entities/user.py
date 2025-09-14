"""
User domain entity.
Represents a user in the system.
"""
from datetime import datetime
from typing import Optional, List
from dataclasses import dataclass, field
from enum import Enum


class UserRole(Enum):
    """User roles in the system."""
    ADMIN = "admin"
    USER = "user"
    VIEWER = "viewer"


class UserStatus(Enum):
    """User status."""
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"


@dataclass
class User:
    """User domain entity."""
    id: str
    username: str
    email: str
    role: UserRole = UserRole.USER
    status: UserStatus = UserStatus.ACTIVE
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)
    last_login: Optional[datetime] = None
    preferences: dict = field(default_factory=dict)
    
    def is_active(self) -> bool:
        """Check if user is active."""
        return self.status == UserStatus.ACTIVE
    
    def can_access_room(self, room_name: str) -> bool:
        """Check if user can access a specific room."""
        if not self.is_active():
            return False
        
        # Add room access logic here
        return True
    
    def update_last_login(self):
        """Update last login timestamp."""
        self.last_login = datetime.now()
        self.updated_at = datetime.now()
    
    def to_dict(self) -> dict:
        """Convert to dictionary."""
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "role": self.role.value,
            "status": self.status.value,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "last_login": self.last_login.isoformat() if self.last_login else None,
            "preferences": self.preferences
        }
