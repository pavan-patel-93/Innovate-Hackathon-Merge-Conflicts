# app/api/v1/__init__.py or wherever you combine your routers
from fastapi import APIRouter
from app.api.v1.endpoints import chat, documents, setup

api_router = APIRouter()
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
api_router.include_router(documents.router, prefix="/documents", tags=["documents"])
api_router.include_router(setup.router, prefix="/setup", tags=["setup"])
# api_router.include_router(ai.router, prefix="/ai", tags=["ai"])

# Include your other routers here