"""
Base service class.
Provides common service functionality and abstract interface.
"""
from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional, TypeVar, Generic
from datetime import datetime

from app.core.logging import get_logger
from app.core.exceptions import BaseAPIException

T = TypeVar('T')
logger = get_logger(__name__)


class BaseService(ABC, Generic[T]):
    """Base service class with common business logic operations."""
    
    def __init__(self):
        self.logger = get_logger(self.__class__.__name__)
    
    def validate_required_fields(self, data: Dict[str, Any], required_fields: List[str]) -> None:
        """Validate that required fields are present in data."""
        missing_fields = [field for field in required_fields if field not in data or data[field] is None]
        if missing_fields:
            raise BaseAPIException(
                message=f"Missing required fields: {', '.join(missing_fields)}",
                status_code=400,
                details={"missing_fields": missing_fields}
            )
    
    def validate_field_length(self, value: str, field_name: str, max_length: int) -> None:
        """Validate field length."""
        if len(value) > max_length:
            raise BaseAPIException(
                message=f"{field_name} exceeds maximum length of {max_length} characters",
                status_code=400,
                details={"field": field_name, "max_length": max_length, "actual_length": len(value)}
            )
    
    def validate_email_format(self, email: str) -> None:
        """Validate email format."""
        import re
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, email):
            raise BaseAPIException(
                message="Invalid email format",
                status_code=400,
                details={"field": "email", "value": email}
            )
    
    def sanitize_string(self, value: str) -> str:
        """Sanitize string input."""
        if not isinstance(value, str):
            return str(value)
        
        # Remove potentially dangerous characters
        dangerous_chars = ['<', '>', '"', "'", '&', '\x00', '\r', '\n']
        for char in dangerous_chars:
            value = value.replace(char, '')
        
        return value.strip()
    
    def generate_id(self) -> str:
        """Generate a unique ID."""
        import uuid
        return str(uuid.uuid4())
    
    def get_current_timestamp(self) -> datetime:
        """Get current timestamp."""
        return datetime.now()
    
    def format_error_message(self, operation: str, error: Exception) -> str:
        """Format error message for logging."""
        return f"Error in {operation}: {str(error)}"
    
    def log_operation(self, operation: str, details: Dict[str, Any] = None):
        """Log operation details."""
        self.logger.info(f"Operation: {operation}", extra=details or {})
    
    def log_error(self, operation: str, error: Exception, details: Dict[str, Any] = None):
        """Log error details."""
        self.logger.error(
            f"Error in {operation}: {str(error)}",
            extra=details or {},
            exc_info=True
        )
    
    @abstractmethod
    async def create(self, data: Dict[str, Any]) -> T:
        """Create a new entity."""
        pass
    
    @abstractmethod
    async def get_by_id(self, entity_id: str) -> Optional[T]:
        """Get entity by ID."""
        pass
    
    @abstractmethod
    async def update(self, entity_id: str, data: Dict[str, Any]) -> T:
        """Update entity."""
        pass
    
    @abstractmethod
    async def delete(self, entity_id: str) -> bool:
        """Delete entity."""
        pass