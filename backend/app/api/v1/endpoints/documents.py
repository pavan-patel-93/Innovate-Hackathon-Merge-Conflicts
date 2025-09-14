# app/api/v1/endpoints/documents.py
from fastapi import APIRouter, Depends, UploadFile, File, Form, Query, HTTPException
from typing import List, Dict, Any

from app.core.dependencies import get_document_service
from app.services.document_service import DocumentService
from app.core.exceptions import ValidationError, NotFoundError, FileUploadError
from app.core.logging import get_logger

router = APIRouter()
logger = get_logger(__name__)


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    user_id: str = Form(...),
    document_service: DocumentService = Depends(get_document_service)
) -> Dict[str, Any]:
    """Upload a document for analysis"""
    try:
        # Validate file
        if not file.filename:
            raise HTTPException(status_code=400, detail="No file provided")
        
        # Read file content
        file_content = await file.read()
        
        if not file_content:
            raise HTTPException(status_code=400, detail="Empty file provided")
        
        document = await document_service.upload_document(
            filename=file.filename,
            content_type=file.content_type,
            size=len(file_content),
            user_id=user_id,
            file_content=file_content
        )
        
        return {
            "message": "Document uploaded successfully",
            "document": document.to_dict()
        }
        
    except ValidationError as e:
        logger.warning(f"Validation error during upload: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except FileUploadError as e:
        logger.warning(f"File upload error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error during upload: {e}")
        raise HTTPException(status_code=500, detail="Failed to upload document")


@router.post("/{document_id}/analyze")
async def analyze_document(
    document_id: str,
    document_service: DocumentService = Depends(get_document_service)
) -> Dict[str, Any]:
    """Analyze a document for compliance issues"""

    try:
        document = await document_service.analyze_document(document_id)
        return {
            "message": "Document analysis completed",
            "document": document.to_dict()
        }
    except NotFoundError as e:
        logger.warning(f"Document not found for analysis: {e}")
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error analyzing document {document_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to analyze document")


@router.get("/{document_id}/analysis")
async def get_analysis_results(
    document_id: str,
    document_service: DocumentService = Depends(get_document_service)
) -> Dict[str, Any]:
    """Get analysis results for a document"""
    try:
        document = await document_service.get_by_id(document_id)
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        return {
            "document_id": document_id,
            "status": document.status.value,
            "compliance_score": document.compliance_score,
            "issues": [issue.to_dict() for issue in document.issues],
            "analyzed_at": document.analyzed_at.isoformat() if document.analyzed_at else None
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting analysis results for {document_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to get analysis results")


@router.get("/user/{user_id}")
async def get_user_documents(
    user_id: str,
    skip: int = Query(0, ge=0, description="Number of documents to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of documents to retrieve"),
    document_service: DocumentService = Depends(get_document_service)
) -> List[Dict[str, Any]]:
    """Get all documents for a user"""
    try:
        documents = await document_service.get_documents_by_user(user_id, skip=skip, limit=limit)
        return [doc.to_dict() for doc in documents]
    except Exception as e:
        logger.error(f"Error getting documents for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve documents")


@router.delete("/{document_id}")
async def delete_document(
    document_id: str,
    document_service: DocumentService = Depends(get_document_service)
) -> Dict[str, str]:
    """Delete a document"""
    try:
        result = await document_service.delete(document_id)
        if result:
            return {"message": "Document deleted successfully"}
        else:
            raise HTTPException(status_code=404, detail="Document not found")
    except NotFoundError as e:
        logger.warning(f"Document not found for deletion: {e}")
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error deleting document {document_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete document")


@router.get("/stats/overview")
async def get_document_stats(
    document_service: DocumentService = Depends(get_document_service)
) -> Dict[str, Any]:
    """Get document statistics overview"""
    try:
        stats = await document_service.get_document_statistics()
        return stats
    except Exception as e:
        logger.error(f"Error getting document stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve document statistics")
