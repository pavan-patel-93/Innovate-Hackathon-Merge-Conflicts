"""
Error handling middleware
"""
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import traceback

from app.core.exceptions import FasiAPIException
from app.core.logging import get_logger

logger = get_logger("error_handler")


async def chatapp_exception_handler(request: Request, exc: FasiAPIException) -> JSONResponse:
    """Handle FasiAPI custom exceptions"""
    logger.error(f"FasiAPI Exception: {exc.message}", extra={
        "status_code": exc.status_code,
        "details": exc.details,
        "path": str(request.url),
        "method": request.method
    })
    
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "message": exc.message,
                "status_code": exc.status_code,
                "details": exc.details,
                "type": exc.__class__.__name__
            }
        }
    )


async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """Handle FastAPI HTTP exceptions"""
    logger.warning(f"HTTP Exception: {exc.detail}", extra={
        "status_code": exc.status_code,
        "path": str(request.url),
        "method": request.method
    })
    
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "message": exc.detail,
                "status_code": exc.status_code,
                "type": "HTTPException"
            }
        }
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """Handle request validation errors"""
    logger.warning(f"Validation Error: {exc.errors()}", extra={
        "path": str(request.url),
        "method": request.method
    })
    
    return JSONResponse(
        status_code=422,
        content={
            "error": {
                "message": "Validation error",
                "status_code": 422,
                "details": exc.errors(),
                "type": "ValidationError"
            }
        }
    )


async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handle general exceptions"""
    logger.error(f"Unhandled Exception: {str(exc)}", extra={
        "path": str(request.url),
        "method": request.method,
        "traceback": traceback.format_exc()
    })
    
    return JSONResponse(
        status_code=500,
        content={
            "error": {
                "message": "Internal server error",
                "status_code": 500,
                "type": "InternalServerError"
            }
        }
    )
