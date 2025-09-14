"""
WebSocket service implementation.
Handles real-time communication and WebSocket connections.
"""
from typing import Dict, List, Any, Optional
from fastapi import WebSocket
import json
import asyncio
from datetime import datetime

from app.services.base_service import BaseService
from app.core.exceptions import WebSocketError
from app.core.logging import get_logger

logger = get_logger(__name__)


class WebSocketService(BaseService[None]):
    """Service for WebSocket operations."""
    
    def __init__(self):
        super().__init__()
        # Structure: {room_name: {client_id: websocket}}
        self.active_connections: Dict[str, Dict[str, WebSocket]] = {}
        self.client_rooms: Dict[str, str] = {}  # client_id -> room_name
        self._lock = asyncio.Lock()
    
    async def connect(self, websocket: WebSocket, client_id: str, room_name: str) -> bool:
        """Connect a client to a room."""
        try:
            await websocket.accept()
            
            async with self._lock:
                if room_name not in self.active_connections:
                    self.active_connections[room_name] = {}
                
                self.active_connections[room_name][client_id] = websocket
                self.client_rooms[client_id] = room_name
            
            self.log_operation("websocket_connect", {
                "client_id": client_id,
                "room_name": room_name,
                "total_connections": len(self.active_connections.get(room_name, {}))
            })
            
            return True
            
        except Exception as e:
            self.log_error("websocket_connect", e, {
                "client_id": client_id,
                "room_name": room_name
            })
            raise WebSocketError(f"Failed to connect client {client_id} to room {room_name}")
    
    async def disconnect(self, client_id: str) -> bool:
        """Disconnect a client."""
        try:
            async with self._lock:
                room_name = self.client_rooms.get(client_id)
                if room_name and room_name in self.active_connections:
                    if client_id in self.active_connections[room_name]:
                        del self.active_connections[room_name][client_id]
                    
                    # Remove empty rooms
                    if not self.active_connections[room_name]:
                        del self.active_connections[room_name]
                
                if client_id in self.client_rooms:
                    del self.client_rooms[client_id]
            
            self.log_operation("websocket_disconnect", {
                "client_id": client_id,
                "room_name": room_name
            })
            
            return True
            
        except Exception as e:
            self.log_error("websocket_disconnect", e, {"client_id": client_id})
            raise WebSocketError(f"Failed to disconnect client {client_id}")
    
    async def send_personal_message(self, message: Any, websocket: WebSocket) -> bool:
        """Send a message to a specific client."""
        try:
            await websocket.send_text(json.dumps(message))
            return True
            
        except Exception as e:
            self.log_error("send_personal_message", e, {"message_type": type(message).__name__})
            raise WebSocketError("Failed to send personal message")
    
    async def broadcast_message(self, room_name: str, message: Any, exclude_client: Optional[str] = None) -> int:
        """Broadcast a message to all clients in a room."""
        try:
            if room_name not in self.active_connections:
                return 0
            
            message_text = json.dumps(message)
            sent_count = 0
            
            for client_id, connection in self.active_connections[room_name].items():
                if exclude_client and client_id == exclude_client:
                    continue
                
                try:
                    await connection.send_text(message_text)
                    sent_count += 1
                except Exception as e:
                    self.log_error("broadcast_message_individual", e, {
                        "client_id": client_id,
                        "room_name": room_name
                    })
                    # Remove failed connection
                    await self.disconnect(client_id)
            
            self.log_operation("broadcast_message", {
                "room_name": room_name,
                "sent_count": sent_count,
                "exclude_client": exclude_client
            })
            
            return sent_count
            
        except Exception as e:
            self.log_error("broadcast_message", e, {"room_name": room_name})
            raise WebSocketError(f"Failed to broadcast message to room {room_name}")
    
    async def send_system_message(self, room_name: str, message: str) -> int:
        """Send a system message to a room."""
        try:
            system_message = {
                "type": "system_message",
                "data": message,
                "timestamp": datetime.now().isoformat()
            }
            
            return await self.broadcast_message(room_name, system_message)
            
        except Exception as e:
            self.log_error("send_system_message", e, {"room_name": room_name, "message": message})
            raise WebSocketError(f"Failed to send system message to room {room_name}")
    
    async def notify_user_joined(self, room_name: str, username: str) -> int:
        """Notify room that a user joined."""
        try:
            message = {
                "type": "user_joined",
                "data": {
                    "username": username,
                    "timestamp": datetime.now().isoformat()
                }
            }
            
            return await self.broadcast_message(room_name, message)
            
        except Exception as e:
            self.log_error("notify_user_joined", e, {"room_name": room_name, "username": username})
            raise WebSocketError(f"Failed to notify user joined in room {room_name}")
    
    async def notify_user_left(self, room_name: str, username: str) -> int:
        """Notify room that a user left."""
        try:
            message = {
                "type": "user_left",
                "data": {
                    "username": username,
                    "timestamp": datetime.now().isoformat()
                }
            }
            
            return await self.broadcast_message(room_name, message)
            
        except Exception as e:
            self.log_error("notify_user_left", e, {"room_name": room_name, "username": username})
            raise WebSocketError(f"Failed to notify user left in room {room_name}")
    
    async def get_room_connections(self, room_name: str) -> List[str]:
        """Get list of client IDs connected to a room."""
        try:
            if room_name not in self.active_connections:
                return []
            
            return list(self.active_connections[room_name].keys())
            
        except Exception as e:
            self.log_error("get_room_connections", e, {"room_name": room_name})
            return []
    
    async def get_room_count(self, room_name: str) -> int:
        """Get number of connections in a room."""
        try:
            if room_name not in self.active_connections:
                return 0
            
            return len(self.active_connections[room_name])
            
        except Exception as e:
            self.log_error("get_room_count", e, {"room_name": room_name})
            return 0
    
    async def get_all_rooms(self) -> List[str]:
        """Get list of all active rooms."""
        try:
            return list(self.active_connections.keys())
            
        except Exception as e:
            self.log_error("get_all_rooms", e)
            return []
    
    async def get_connection_stats(self) -> Dict[str, Any]:
        """Get connection statistics."""
        try:
            total_connections = sum(len(room_connections) for room_connections in self.active_connections.values())
            room_stats = {
                room_name: len(connections) 
                for room_name, connections in self.active_connections.items()
            }
            
            return {
                "total_connections": total_connections,
                "active_rooms": len(self.active_connections),
                "room_stats": room_stats
            }
            
        except Exception as e:
            self.log_error("get_connection_stats", e)
            return {
                "total_connections": 0,
                "active_rooms": 0,
                "room_stats": {}
            }
    
    async def cleanup_stale_connections(self) -> int:
        """Clean up stale connections."""
        try:
            cleaned_count = 0
            
            async with self._lock:
                for room_name in list(self.active_connections.keys()):
                    for client_id in list(self.active_connections[room_name].keys()):
                        try:
                            # Try to ping the connection
                            await self.active_connections[room_name][client_id].ping()
                        except:
                            # Connection is stale, remove it
                            del self.active_connections[room_name][client_id]
                            if client_id in self.client_rooms:
                                del self.client_rooms[client_id]
                            cleaned_count += 1
                    
                    # Remove empty rooms
                    if not self.active_connections[room_name]:
                        del self.active_connections[room_name]
            
            if cleaned_count > 0:
                self.log_operation("cleanup_stale_connections", {"cleaned_count": cleaned_count})
            
            return cleaned_count
            
        except Exception as e:
            self.log_error("cleanup_stale_connections", e)
            return 0
