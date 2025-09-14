
"""
Startup script for the FasiAPI server
"""
import uvicorn
from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

if __name__ == "__main__":
    logger.info("Starting FasiAPI server...")
    logger.info(f"Environment: {'Development' if settings.DEBUG else 'Production'}")
    logger.info(f"MongoDB URI: {settings.MONGODB_URI}")
    logger.info(f"MongoDB Database: {settings.MONGODB_DB_NAME}")
    logger.info("API Endpoints:")
    logger.info(f"  - Health Check: http://{settings.HOST}:{settings.PORT}/api/v1/health")
    logger.info(f"  - API Documentation: http://{settings.HOST}:{settings.PORT}/docs")
    logger.info("WebSocket Endpoints:")
    logger.info(f"  - Test: ws://{settings.HOST}:{settings.PORT}/ws/test")
    logger.info(f"  - Chat: ws://{settings.HOST}:{settings.PORT}/ws/{{client_id}}/{{room_name}}/{{username}}")
    logger.info("-" * 50)
    
    uvicorn.run(
        "app.main:app", 
        host=settings.HOST, 
        port=settings.PORT, 
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower()
    )