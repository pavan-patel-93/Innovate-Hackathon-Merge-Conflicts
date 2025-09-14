# app/main.py or server.py
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import api_router
from app.db.mongodb import close_mongodb_connection
from app.utils.websocket_manager import manager
from app.services.chat_service import ChatService
from app.services.upload import router as upload_router
import json

# Create FastAPI instance
app = FastAPI(
    title="Innovate Hackathon API",
    description="Backend API for Merge Conflicts team",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "Working compilance Backend"
    }

# Include API router
# app.include_router(auth_router, prefix="/api/v1/auth")

app.include_router(api_router, prefix="/api/v1")

app.include_router(upload_router, prefix="/api/v1/documents/upload", tags=["upload"])

# Register WebSocket endpoint directly on the app
@app.websocket("/ws/{client_id}/{room_name}/{username}")
async def websocket_endpoint(websocket: WebSocket, client_id: str, room_name: str, username: str):
    """WebSocket endpoint for real-time chat"""
    try:
        # Get database connection
        from app.db.mongodb import get_database
        db = await get_database()
        chat_service = ChatService(db)
        
        await manager.connect(websocket, client_id, room_name)
        print(f"Client {client_id} connected to room {room_name} as {username}")
        
        # Send previous messages from the room
        previous_messages = await chat_service.get_messages(room_name)
        await manager.send_personal_message(
            {
                "type": "previous_messages",
                "data": previous_messages
            }, 
            websocket
        )
        
        # Handle incoming messages
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            # Save to database
            saved_message = await chat_service.save_message(
                message_data,
                username
            )
            
            # Broadcast to all clients in the room except sender
            await manager.broadcast(
                {
                    "type": "message",
                    "data": saved_message
                },
                room_name,
                exclude_client=client_id
            )
            
    except WebSocketDisconnect:
        manager.disconnect(client_id, room_name)
        await manager.broadcast(
            {
                "type": "system_message",
                "data": f"{username} has left the chat"
            },
            room_name
        )
        print(f"Client {client_id} disconnected from room {room_name}")
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(client_id, room_name)

# Simple test WebSocket endpoint
@app.websocket("/ws/test")
async def test_websocket(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_text(f"Message received: {data}")
    except WebSocketDisconnect:
        print("Test client disconnected")

# Register events
@app.on_event("shutdown")
async def shutdown_event():
    await close_mongodb_connection()

# @app.websocket("/ws/test")
# async def test_websocket(websocket: WebSocket):
#     await websocket.accept()
#     try:
#         while True:
#             data = await websocket.receive_text()
#             await websocket.send_text(f"Message received: {data}")
#     except WebSocketDisconnect:
#         print("Client disconnected")
# Your existing endpoints...