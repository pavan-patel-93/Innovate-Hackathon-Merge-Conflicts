from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os, sys

# Add the current directory to the path so we can import modules from the current directory
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.routes.upload import router as upload_router


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
    allow_origins=["http://localhost:3000", "http://localhost:3001", "*"],  # In production, replace "*" with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(upload_router, prefix="/upload", tags=["upload"])

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Welcome to Innovate Hackathon API",
        "team": "Merge Conflicts",
        "docs": "/docs",
        "health": "/health"
    }

# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "FastAPI Backend"
    }

# Example API endpoint
@app.get("/api/v1/test")
async def test_endpoint():
    return {
        "message": "API is working!",
        "data": {
            "example": "This is test data",
            "timestamp": "2024-01-01"
        }
    }

# Example POST endpoint
@app.post("/api/v1/data")
async def create_data(data: dict):
    return {
        "message": "Data received",
        "received_data": data
    }