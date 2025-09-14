"""
User repository implementation.
Handles user-related database operations.
"""
from typing import List, Optional, Dict, Any
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime

from app.repositories.base_repository import BaseRepository
from app.domain.entities.user import User, UserRole, UserStatus
from app.core.logging import get_logger

logger = get_logger(__name__)


class UserRepository(BaseRepository[User]):
    """Repository for users."""
    
    def __init__(self, database: AsyncIOMotorDatabase):
        super().__init__(database, "users")
    
    def _entity_to_dict(self, entity: User) -> Dict[str, Any]:
        """Convert User entity to dictionary."""
        return {
            "id": entity.id,
            "username": entity.username,
            "email": entity.email,
            "role": entity.role.value,
            "status": entity.status.value,
            "last_login": entity.last_login,
            "preferences": entity.preferences
        }
    
    def _dict_to_entity(self, data: Dict[str, Any]) -> User:
        """Convert dictionary to User entity."""
        # Convert ObjectId to string
        data = self._convert_object_id(data)
        
        # Convert datetime strings back to datetime objects
        if isinstance(data.get('created_at'), str):
            data['created_at'] = datetime.fromisoformat(data['created_at'].replace('Z', '+00:00'))
        if isinstance(data.get('updated_at'), str):
            data['updated_at'] = datetime.fromisoformat(data['updated_at'].replace('Z', '+00:00'))
        if isinstance(data.get('last_login'), str):
            data['last_login'] = datetime.fromisoformat(data['last_login'].replace('Z', '+00:00'))
        
        return User(
            id=data['id'],
            username=data['username'],
            email=data['email'],
            role=UserRole(data.get('role', 'user')),
            status=UserStatus(data.get('status', 'active')),
            created_at=data.get('created_at', datetime.now()),
            updated_at=data.get('updated_at', datetime.now()),
            last_login=data.get('last_login'),
            preferences=data.get('preferences', {})
        )
    
    async def get_by_username(self, username: str) -> Optional[User]:
        """Get user by username."""
        try:
            return await self.get_by_field("username", username)
        except Exception as e:
            logger.error(f"Error getting user by username {username}: {e}")
            raise
    
    async def get_by_email(self, email: str) -> Optional[User]:
        """Get user by email."""
        try:
            return await self.get_by_field("email", email)
        except Exception as e:
            logger.error(f"Error getting user by email {email}: {e}")
            raise
    
    async def get_active_users(self, limit: int = 100) -> List[User]:
        """Get all active users."""
        try:
            return await self.get_all(
                filter_dict={"status": UserStatus.ACTIVE.value},
                limit=limit
            )
        except Exception as e:
            logger.error(f"Error getting active users: {e}")
            raise
    
    async def get_users_by_role(
        self, 
        role: UserRole, 
        limit: int = 100
    ) -> List[User]:
        """Get users by role."""
        try:
            return await self.get_all(
                filter_dict={"role": role.value},
                limit=limit
            )
        except Exception as e:
            logger.error(f"Error getting users by role {role.value}: {e}")
            raise
    
    async def update_last_login(self, user_id: str) -> bool:
        """Update user's last login timestamp."""
        try:
            return await self.update(user_id, {"last_login": datetime.now()})
        except Exception as e:
            logger.error(f"Error updating last login for user {user_id}: {e}")
            raise
    
    async def update_user_status(
        self, 
        user_id: str, 
        status: UserStatus
    ) -> bool:
        """Update user status."""
        try:
            return await self.update(user_id, {"status": status.value})
        except Exception as e:
            logger.error(f"Error updating user status {user_id}: {e}")
            raise
    
    async def update_user_role(
        self, 
        user_id: str, 
        role: UserRole
    ) -> bool:
        """Update user role."""
        try:
            return await self.update(user_id, {"role": role.value})
        except Exception as e:
            logger.error(f"Error updating user role {user_id}: {e}")
            raise
    
    async def update_user_preferences(
        self, 
        user_id: str, 
        preferences: Dict[str, Any]
    ) -> bool:
        """Update user preferences."""
        try:
            return await self.update(user_id, {"preferences": preferences})
        except Exception as e:
            logger.error(f"Error updating user preferences {user_id}: {e}")
            raise
    
    async def search_users(
        self, 
        search_term: str,
        limit: int = 50
    ) -> List[User]:
        """Search users by username or email."""
        try:
            # Create text search query
            query = {
                "$or": [
                    {"username": {"$regex": search_term, "$options": "i"}},
                    {"email": {"$regex": search_term, "$options": "i"}}
                ]
            }
            
            cursor = self.collection.find(query)
            cursor = cursor.sort("username", 1).limit(limit)
            
            documents = await cursor.to_list(length=limit)
            return [self._dict_to_entity(doc) for doc in documents]
        except Exception as e:
            logger.error(f"Error searching users: {e}")
            raise
    
    async def get_user_statistics(self) -> Dict[str, Any]:
        """Get user statistics."""
        try:
            pipeline = [
                {"$group": {
                    "_id": "$status",
                    "count": {"$sum": 1}
                }}
            ]
            
            cursor = self.collection.aggregate(pipeline)
            results = await cursor.to_list(length=None)
            
            stats = {
                "total_users": await self.count(),
                "by_status": {result["_id"]: result["count"] for result in results},
                "active_users": await self.count({"status": UserStatus.ACTIVE.value})
            }
            
            return stats
        except Exception as e:
            logger.error(f"Error getting user statistics: {e}")
            raise
