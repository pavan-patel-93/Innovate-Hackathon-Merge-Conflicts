# app/api/v1/__init__.py
from fastapi import APIRouter
from app.api.v1.endpoints import ai, health
from app.services.upload import router as upload_router

# Create main API router
api_router = APIRouter()

api_router.include_router(ai.router, prefix="/ai", tags=["ai"])
api_router.include_router(upload_router, prefix="/documents/upload", tags=["upload"])
api_router.include_router(health.router, tags=["health"])