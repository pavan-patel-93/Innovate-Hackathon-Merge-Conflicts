"""
Improved main application file with industry-standard patterns.
"""
from datetime import datetime
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import json
from typing import Dict, Any

from app.core.config import settings
from app.core.database import close_database_connection, check_database_health
from app.core.dependencies import get_chat_service, get_websocket_service
from app.core.exceptions import BaseAPIException, create_http_exception
from app.core.logging import get_logger
from app.api.v1 import api_router
from app.services.chat_service import ChatService
from app.services.websocket_service import WebSocketService
from app.domain.entities.message import Message, User, MessageType

# Initialize logger
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    # Startup
    logger.info("Starting FasiAPI application...")
    logger.info(f"Environment: {'Development' if settings.DEBUG else 'Production'}")
    logger.info(f"Database: {settings.MONGODB_DB_NAME}")
    
    # Health check on startup
    try:
        db_healthy = await check_database_health()
        if not db_healthy:
            logger.warning("Database health check failed on startup")
        else:
            logger.info("Database connection established successfully")
    except Exception as e:
        logger.error(f"Failed to establish database connection: {e}")
    
    yield
    
    # Shutdown
    logger.info("Shutting down FasiAPI application...")
    await close_database_connection()
    logger.info("Application shutdown complete")


# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    description="Industry-standard backend API for document compliance and chat system",
    version=settings.APP_VERSION,
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    openapi_url="/openapi.json" if settings.DEBUG else None,
    lifespan=lifespan
)

# Add security middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"] if settings.DEBUG else ["localhost", "127.0.0.1"]
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
    allow_methods=settings.CORS_ALLOW_METHODS,
    allow_headers=settings.CORS_ALLOW_HEADERS,
)


# Global exception handlers
@app.exception_handler(BaseAPIException)
async def base_api_exception_handler(request, exc: BaseAPIException):
    """Handle custom API exceptions."""
    logger.error(f"API Exception: {exc.message}", extra={"details": exc.details})
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "message": exc.message,
                "details": exc.details,
                "type": exc.__class__.__name__
            }
        }
    )


@app.exception_handler(Exception)
async def general_exception_handler(request, exc: Exception):
    """Handle general exceptions."""
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": {
                "message": "Internal server error",
                "type": "InternalServerError"
            }
        }
    )


# Include API routers
app.include_router(api_router, prefix="/api/v1")


# WebSocket endpoints
@app.websocket("/ws/{client_id}/{room_name}/{username}")
async def websocket_endpoint(
    websocket: WebSocket, 
    client_id: str, 
    room_name: str, 
    username: str
):
    """WebSocket endpoint for real-time chat."""
    # Create services manually since WebSocket endpoints don't support Depends()
    websocket_service = WebSocketService()
    chat_service = await get_chat_service()
    
    try:
        # Connect to WebSocket
        await websocket_service.connect(websocket, client_id, room_name)
        logger.info(f"Client {client_id} connected to room {room_name} as {username}")
        
        # Notify other users
        await websocket_service.notify_user_joined(room_name, username)
        
        # Send previous messages
        try:
            previous_messages = await chat_service.get_messages_by_room(room_name, limit=50)
            await websocket_service.send_personal_message(
                {
                    "type": "previous_messages",
                    "data": [msg.to_dict() for msg in previous_messages]
                },
                websocket
            )
        except Exception as e:
            logger.error(f"Error sending previous messages: {e}")
        
        # Handle incoming messages
        while True:
            try:
                data = await websocket.receive_text()
                message_data = json.loads(data)
                
                # Validate message data
                if not message_data.get("content"):
                    continue
                
                # Create user object
                user = User(
                    id=client_id,
                    name=username
                )
                
                # Send message
                message = await chat_service.send_message(
                    content=message_data["content"],
                    room_name=room_name,
                    user=user,
                    message_type=MessageType(message_data.get("type", "text")),
                    metadata=message_data.get("metadata", {})
                )
                
                # Broadcast to other clients
                await websocket_service.broadcast_message(
                    room_name,
                    {
                        "type": "message",
                        "data": message.to_dict()
                    },
                    exclude_client=client_id
                )
                
            except json.JSONDecodeError:
                logger.warning(f"Invalid JSON received from client {client_id}")
                continue
            except Exception as e:
                logger.error(f"Error processing message from client {client_id}: {e}")
                break
                
    except WebSocketDisconnect:
        logger.info(f"Client {client_id} disconnected from room {room_name}")
        await websocket_service.disconnect(client_id)
        await websocket_service.notify_user_left(room_name, username)
    except Exception as e:
        logger.error(f"WebSocket error for client {client_id}: {e}")
        await websocket_service.disconnect(client_id)
        await websocket_service.notify_user_left(room_name, username)


@app.websocket("/ws/test")
async def test_websocket(websocket: WebSocket):
    """Test WebSocket endpoint."""
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_text(f"Echo: {data}")
    except WebSocketDisconnect:
        logger.info("Test WebSocket client disconnected")


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": f"Welcome to {settings.APP_NAME}",
        "version": settings.APP_VERSION,
        "docs_url": "/docs" if settings.DEBUG else None,
        "health_check": "/api/v1/health"
    }


# Application info endpoint
@app.get("/info")
async def app_info():
    """Application information endpoint."""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": "development" if settings.DEBUG else "production",
        "features": {
            "chat": True,
            "documents": True,
            "ai_analysis": settings.ENABLE_AI_ANALYSIS,
            "websocket": True
        },
        "database": {
            "type": "mongodb",
            "name": settings.MONGODB_DB_NAME
        }
    }


@app.get("/health")
async def health_check() -> Dict[str, Any]:
    """Basic health check endpoint."""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION
    }