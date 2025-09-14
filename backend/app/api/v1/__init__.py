# app/api/v1/__init__.py
from fastapi import APIRouter
from app.api.v1.endpoints import chat, documents, setup, health
from app.services.upload import router as upload_router

# Create main API router
api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
api_router.include_router(documents.router, prefix="/documents", tags=["documents"])
api_router.include_router(setup.router, prefix="/setup", tags=["setup"])
api_router.include_router(upload_router, prefix="/documents/upload", tags=["upload"])
# api_router.include_router(ai.router, prefix="/ai", tags=["ai"])
api_router.include_router(health.router, tags=["health"])