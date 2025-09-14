"""
Health check endpoints.
Provides system health and status information.
"""
from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any
from datetime import datetime

# from app.core.dependencies import get_database, check_database_health
from app.core.logging import get_logger
from app.core.config import settings

router = APIRouter()
logger = get_logger(__name__)


@router.get("/health")
async def health_check() -> Dict[str, Any]:
    """Basic health check endpoint."""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION
    }


# @router.get("/health/detailed")
# async def detailed_health_check(
#     db_health: bool = Depends(check_database_health)
# ) -> Dict[str, Any]:
#     """Detailed health check with system status."""
#     try:
#         health_status = {
#             "status": "healthy",
#             "timestamp": datetime.now().isoformat(),
#             "service": settings.APP_NAME,
#             "version": settings.APP_VERSION,
#             "components": {
#                 "database": "healthy" if db_health else "unhealthy",
#                 "api": "healthy",
#                 "websocket": "healthy"
#             },
#             "environment": {
#                 "debug": settings.DEBUG,
#                 "log_level": settings.LOG_LEVEL
#             }
#         }
        
#         # Determine overall status
#         if not db_health:
#             health_status["status"] = "degraded"
#             health_status["message"] = "Database connection issues detected"
        
#         return health_status
        
#     except Exception as e:
#         logger.error(f"Health check failed: {e}")
#         raise HTTPException(
#             status_code=503,
#             detail={
#                 "status": "unhealthy",
#                 "timestamp": datetime.now().isoformat(),
#                 "error": str(e)
#             }
#         )


# @router.get("/health/ready")
# async def readiness_check() -> Dict[str, Any]:
#     """Readiness check for load balancers."""
#     try:
#         # Check if all critical services are ready
#         db_ready = await check_database_health()
        
#         if not db_ready:
#             raise HTTPException(
#                 status_code=503,
#                 detail="Service not ready - database unavailable"
#             )
        
#         return {
#             "status": "ready",
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"Readiness check failed: {e}")
#         raise HTTPException(
#             status_code=503,
#             detail="Service not ready"
#         )


@router.get("/health/live")
async def liveness_check() -> Dict[str, Any]:
    """Liveness check for container orchestration."""
    return {
        "status": "alive",
        "timestamp": datetime.now().isoformat()
    }
