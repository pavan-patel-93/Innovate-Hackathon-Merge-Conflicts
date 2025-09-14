"""
Base repository class.
Provides common repository functionality and abstract interface.
"""
from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional, TypeVar, Generic
from motor.motor_asyncio import AsyncIOMotorDatabase, AsyncIOMotorCollection
from bson import ObjectId
from datetime import datetime

from app.core.exceptions import DatabaseError, NotFoundError
from app.core.logging import get_logger

T = TypeVar('T')
logger = get_logger(__name__)


class BaseRepository(ABC, Generic[T]):
    """Base repository class with common database operations."""
    
    def __init__(self, database: AsyncIOMotorDatabase, collection_name: str):
        self.database = database
        self.collection: AsyncIOMotorCollection = database[collection_name]
        self.collection_name = collection_name
    
    async def create(self, entity: T) -> str:
        """Create a new entity."""
        try:
            entity_dict = self._entity_to_dict(entity)
            entity_dict['created_at'] = datetime.now()
            entity_dict['updated_at'] = datetime.now()
            
            result = await self.collection.insert_one(entity_dict)
            return str(result.inserted_id)
        except Exception as e:
            logger.error(f"Error creating {self.collection_name}: {e}")
            raise DatabaseError(f"Failed to create {self.collection_name}", {"error": str(e)})
    
    async def get_by_id(self, entity_id: str) -> Optional[T]:
        """Get entity by ID."""
        try:
            # Try to find by string ID first (for UUID-based entities)
            document = await self.collection.find_one({"id": entity_id})
            if document:
                return self._dict_to_entity(document)
            
            # Fallback to ObjectId if it's a valid ObjectId
            if ObjectId.is_valid(entity_id):
                document = await self.collection.find_one({"_id": ObjectId(entity_id)})
                if document:
                    return self._dict_to_entity(document)
            
            return None
        except Exception as e:
            logger.error(f"Error getting {self.collection_name} by ID {entity_id}: {e}")
            raise DatabaseError(f"Failed to get {self.collection_name}", {"id": entity_id, "error": str(e)})
    
    async def get_by_field(self, field: str, value: Any) -> Optional[T]:
        """Get entity by field value."""
        try:
            document = await self.collection.find_one({field: value})
            if document:
                return self._dict_to_entity(document)
            return None
        except Exception as e:
            logger.error(f"Error getting {self.collection_name} by {field}={value}: {e}")
            raise DatabaseError(f"Failed to get {self.collection_name}", {"field": field, "value": value, "error": str(e)})
    
    async def get_all(
        self, 
        filter_dict: Optional[Dict[str, Any]] = None,
        skip: int = 0,
        limit: int = 100,
        sort_field: str = "created_at",
        sort_direction: int = -1
    ) -> List[T]:
        """Get all entities with optional filtering and pagination."""
        try:
            filter_dict = filter_dict or {}
            cursor = self.collection.find(filter_dict)
            cursor = cursor.sort(sort_field, sort_direction).skip(skip).limit(limit)
            
            documents = await cursor.to_list(length=limit)
            return [self._dict_to_entity(doc) for doc in documents]
        except Exception as e:
            logger.error(f"Error getting {self.collection_name} list: {e}")
            raise DatabaseError(f"Failed to get {self.collection_name} list", {"error": str(e)})
    
    async def update(self, entity_id: str, update_data: Dict[str, Any]) -> bool:
        """Update entity by ID."""
        try:
            update_data['updated_at'] = datetime.now()
            
            # Try to update by string ID first (for UUID-based entities)
            result = await self.collection.update_one(
                {"id": entity_id},
                {"$set": update_data}
            )
            
            if result.matched_count > 0:
                return result.modified_count > 0
            
            # Fallback to ObjectId if it's a valid ObjectId
            if ObjectId.is_valid(entity_id):
                result = await self.collection.update_one(
                    {"_id": ObjectId(entity_id)},
                    {"$set": update_data}
                )
                
                if result.matched_count == 0:
                    raise NotFoundError(self.collection_name, entity_id)
                
                return result.modified_count > 0
            else:
                raise NotFoundError(self.collection_name, entity_id)
                
        except NotFoundError:
            raise
        except Exception as e:
            logger.error(f"Error updating {self.collection_name} {entity_id}: {e}")
            raise DatabaseError(f"Failed to update {self.collection_name}", {"id": entity_id, "error": str(e)})
    
    async def delete(self, entity_id: str) -> bool:
        """Delete entity by ID."""
        try:
            # Try to delete by string ID first (for UUID-based entities)
            result = await self.collection.delete_one({"id": entity_id})
            
            if result.deleted_count > 0:
                return True
            
            # Fallback to ObjectId if it's a valid ObjectId
            if ObjectId.is_valid(entity_id):
                result = await self.collection.delete_one({"_id": ObjectId(entity_id)})
                
                if result.deleted_count == 0:
                    raise NotFoundError(self.collection_name, entity_id)
                
                return True
            else:
                raise NotFoundError(self.collection_name, entity_id)
                
        except NotFoundError:
            raise
        except Exception as e:
            logger.error(f"Error deleting {self.collection_name} {entity_id}: {e}")
            raise DatabaseError(f"Failed to delete {self.collection_name}", {"id": entity_id, "error": str(e)})
    
    async def count(self, filter_dict: Optional[Dict[str, Any]] = None) -> int:
        """Count entities with optional filtering."""
        try:
            filter_dict = filter_dict or {}
            return await self.collection.count_documents(filter_dict)
        except Exception as e:
            logger.error(f"Error counting {self.collection_name}: {e}")
            raise DatabaseError(f"Failed to count {self.collection_name}", {"error": str(e)})
    
    async def exists(self, filter_dict: Dict[str, Any]) -> bool:
        """Check if entity exists with given filter."""
        try:
            count = await self.collection.count_documents(filter_dict, limit=1)
            return count > 0
        except Exception as e:
            logger.error(f"Error checking existence in {self.collection_name}: {e}")
            raise DatabaseError(f"Failed to check existence in {self.collection_name}", {"error": str(e)})
    
    @abstractmethod
    def _entity_to_dict(self, entity: T) -> Dict[str, Any]:
        """Convert entity to dictionary for database storage."""
        pass
    
    @abstractmethod
    def _dict_to_entity(self, data: Dict[str, Any]) -> T:
        """Convert dictionary from database to entity."""
        pass
    
    def _convert_object_id(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Convert ObjectId to string in dictionary."""
        if '_id' in data:
            data['_id'] = str(data['_id'])
        return data