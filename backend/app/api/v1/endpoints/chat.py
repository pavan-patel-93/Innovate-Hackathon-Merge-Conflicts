# app/api/v1/endpoints/chat.py
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException, Query
from app.db.mongodb import get_database
from app.services.chat_service import ChatService
from app.utils.websocket_manager import manager
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List, Dict, Any
import json
import uuid

router = APIRouter()

@router.get("/rooms/{room_name}/messages")
async def get_messages(
    room_name: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get chat messages for a specific room"""
    chat_service = ChatService(db)
    messages = await chat_service.get_messages(room_name)
    return messages

# WebSocket endpoint is now registered in main.py to avoid duplication