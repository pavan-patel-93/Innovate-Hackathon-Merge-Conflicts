# app/api/v1/endpoints/chat.py
from fastapi import APIRouter, Depends, HTTPException, Query, Path
from typing import List, Dict, Any, Optional
from datetime import datetime

from app.core.dependencies import get_chat_service
from app.services.chat_service import ChatService
from app.domain.entities.message import Message, MessageType, User
from app.core.exceptions import NotFoundError, ValidationError
from app.core.logging import get_logger

router = APIRouter()
logger = get_logger(__name__)


@router.get("/rooms/{room_name}/messages")
async def get_messages(
    room_name: str = Path(..., description="Room name"),
    limit: int = Query(default=50, ge=1, le=100, description="Number of messages to retrieve"),
    skip: int = Query(default=0, ge=0, description="Number of messages to skip"),
    chat_service: ChatService = Depends(get_chat_service)
) -> List[Dict[str, Any]]:
    """Get chat messages for a specific room."""
    try:
        messages = await chat_service.get_messages_by_room(room_name, limit, skip)
        return [message.to_dict() for message in messages]
        
    except Exception as e:
        logger.error(f"Error getting messages for room {room_name}: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve messages")


@router.get("/users/{user_id}/messages")
async def get_user_messages(
    user_id: str = Path(..., description="User ID"),
    limit: int = Query(default=50, ge=1, le=100, description="Number of messages to retrieve"),
    skip: int = Query(default=0, ge=0, description="Number of messages to skip"),
    chat_service: ChatService = Depends(get_chat_service)
) -> List[Dict[str, Any]]:
    """Get messages by a specific user."""
    try:
        messages = await chat_service.get_messages_by_user(user_id, limit, skip)
        return [message.to_dict() for message in messages]
        
    except Exception as e:
        logger.error(f"Error getting messages for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve user messages")


@router.get("/rooms/{room_name}/search")
async def search_messages(
    room_name: str = Path(..., description="Room name"),
    q: str = Query(..., min_length=1, description="Search query"),
    limit: int = Query(default=50, ge=1, le=100, description="Number of messages to retrieve"),
    chat_service: ChatService = Depends(get_chat_service)
) -> List[Dict[str, Any]]:
    """Search messages in a room."""
    try:
        messages = await chat_service.search_messages(room_name, q, limit)
        return [message.to_dict() for message in messages]
        
    except Exception as e:
        logger.error(f"Error searching messages in room {room_name}: {e}")
        raise HTTPException(status_code=500, detail="Failed to search messages")


@router.get("/rooms/{room_name}/stats")
async def get_room_statistics(
    room_name: str = Path(..., description="Room name"),
    chat_service: ChatService = Depends(get_chat_service)
) -> Dict[str, Any]:
    """Get room statistics."""
    try:
        stats = await chat_service.get_room_statistics(room_name)
        return stats
        
    except Exception as e:
        logger.error(f"Error getting room statistics for {room_name}: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve room statistics")


@router.post("/messages")
async def create_message(
    message_data: Dict[str, Any],
    chat_service: ChatService = Depends(get_chat_service)
) -> Dict[str, Any]:
    """Create a new message."""
    try:
        message = await chat_service.create(message_data)
        return message.to_dict()
        
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating message: {e}")
        raise HTTPException(status_code=500, detail="Failed to create message")


@router.put("/messages/{message_id}")
async def update_message(
    message_id: str = Path(..., description="Message ID"),
    update_data: Dict[str, Any] = None,
    chat_service: ChatService = Depends(get_chat_service)
) -> Dict[str, Any]:
    """Update a message."""
    try:
        if update_data is None:
            update_data = {}
            
        message = await chat_service.update(message_id, update_data)
        return message.to_dict()
        
    except NotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating message {message_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to update message")


@router.delete("/messages/{message_id}")
async def delete_message(
    message_id: str = Path(..., description="Message ID"),
    chat_service: ChatService = Depends(get_chat_service)
) -> Dict[str, str]:
    """Delete a message."""
    try:
        await chat_service.delete(message_id)
        return {"message": "Message deleted successfully"}
        
    except NotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error deleting message {message_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete message")