# app/utils/websocket_manager.py
from fastapi import WebSocket
from typing import Dict, List, Any, Optional
import json

class ConnectionManager:
    def __init__(self):
        # Structure: {room_name: {client_id: websocket}}
        self.active_connections: Dict[str, Dict[str, WebSocket]] = {}
        
    async def connect(self, websocket: WebSocket, client_id: str, room_name: str):
        await websocket.accept()
        if room_name not in self.active_connections:
            self.active_connections[room_name] = {}
        self.active_connections[room_name][client_id] = websocket
        
    def disconnect(self, client_id: str, room_name: str):
        if room_name in self.active_connections:
            if client_id in self.active_connections[room_name]:
                del self.active_connections[room_name][client_id]
            if not self.active_connections[room_name]:
                del self.active_connections[room_name]
    
    async def send_personal_message(self, message: Any, websocket: WebSocket):
        await websocket.send_text(json.dumps(message))
    
    async def broadcast(self, message: Any, room_name: str, exclude_client: Optional[str] = None):
        if room_name in self.active_connections:
            for client_id, connection in self.active_connections[room_name].items():
                if exclude_client != client_id:
                    await connection.send_text(json.dumps(message))

# Create a global instance
manager = ConnectionManager()