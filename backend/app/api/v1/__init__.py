# app/api/v1/__init__.py or wherever you combine your routers
from fastapi import APIRouter
from app.api.v1.endpoints import chat  # Import the new chat module

api_router = APIRouter()
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])

# Include your other routers here