
"""
Startup script for the WebSocket server
"""
import uvicorn
import os
from app.core.config import settings

if __name__ == "__main__":
    print("Starting WebSocket server...")
    print(f"MongoDB URI: {settings.MONGODB_URI}")
    print(f"MongoDB Database: {settings.MONGODB_DB_NAME}")
    print("WebSocket endpoints:")
    print("  - Test: ws://localhost:8000/ws/test")
    print("  - Chat: ws://localhost:8000/ws/{client_id}/{room_name}/{username}")
    print("API Documentation: http://localhost:8000/docs")
    print("Test Page: Open backend/test.html in your browser")
    print("-" * 50)
    
    uvicorn.run(
        "app.main:app", 
        host="0.0.0.0", 
        port=8000, 
        reload=True,
        log_level="info"
    )