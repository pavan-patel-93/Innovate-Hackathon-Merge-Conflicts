# app/api/v1/__init__.py
from fastapi import APIRouter
from app.api.v1.endpoints import ai, chat, documents, setup, health, messages, chat_routes
from app.services.upload import router as upload_router

# Create main API router
api_router = APIRouter()


api_router.include_router(ai.router, prefix="/ai", tags=["ai"])
api_router.include_router(documents.router, prefix="/documents", tags=["documents"])
api_router.include_router(setup.router, prefix="/setup", tags=["setup"])
api_router.include_router(upload_router, prefix="/documents/upload", tags=["upload"])
api_router.include_router(health.router, tags=["health"])