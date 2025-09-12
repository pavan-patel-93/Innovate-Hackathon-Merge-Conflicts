# app/api/v1/endpoints/documents.py
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from app.db.mongodb import get_database
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List, Dict, Any, Optional
import uuid
from datetime import datetime
import os

router = APIRouter()

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    user_id: str = Form(...),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Upload a document for analysis"""
    try:
        # Validate file type
        allowed_types = ['application/pdf', 'application/msword', 
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                        'text/plain']
        
        if file.content_type not in allowed_types:
            raise HTTPException(status_code=400, detail="File type not supported")
        
        # Generate document ID
        document_id = str(uuid.uuid4())
        
        # Create document record
        document_data = {
            "document_id": document_id,
            "filename": file.filename,
            "content_type": file.content_type,
            "size": file.size,
            "user_id": user_id,
            "status": "uploaded",
            "created_at": datetime.now(),
            "compliance_score": None,
            "issues": []
        }
        
        # Save to database
        result = await db.documents.insert_one(document_data)
        
        return {
            "document_id": document_id,
            "filename": file.filename,
            "status": "uploaded",
            "message": "Document uploaded successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading document: {str(e)}")

@router.post("/{document_id}/analyze")
async def analyze_document(
    document_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Analyze a document for compliance issues"""
    try:
        # Find document
        document = await db.documents.find_one({"document_id": document_id})
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        # Simulate AI analysis (replace with actual AI service)
        mock_issues = [
            {"type": "critical", "message": "Missing Document ID (SOP-###)", "severity": 3},
            {"type": "major", "message": "Incomplete revision history table", "severity": 2},
            {"type": "minor", "message": "Missing approval signature line", "severity": 1},
            {"type": "critical", "message": "Contains placeholder text 'TBD'", "severity": 3},
            {"type": "major", "message": "Stale reference: 'ICH Q7' missing year", "severity": 2}
        ]
        
        # Calculate compliance score
        score = max(0, 100 - (sum(issue["severity"] * 10 for issue in mock_issues)))
        
        # Update document with analysis results
        await db.documents.update_one(
            {"document_id": document_id},
            {
                "$set": {
                    "status": "analyzed",
                    "compliance_score": score,
                    "issues": mock_issues,
                    "analyzed_at": datetime.now()
                }
            }
        )
        
        return {
            "document_id": document_id,
            "score": score,
            "issues": mock_issues,
            "status": "analyzed"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing document: {str(e)}")

@router.get("/{document_id}/analysis")
async def get_analysis_results(
    document_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get analysis results for a document"""
    try:
        document = await db.documents.find_one({"document_id": document_id})
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        return {
            "document_id": document_id,
            "score": document.get("compliance_score"),
            "issues": document.get("issues", []),
            "status": document.get("status"),
            "analyzed_at": document.get("analyzed_at")
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching analysis results: {str(e)}")

@router.get("/user/{user_id}")
async def get_user_documents(
    user_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get all documents for a user"""
    try:
        cursor = db.documents.find({"user_id": user_id}).sort("created_at", -1)
        documents = await cursor.to_list(length=None)
        
        # Convert ObjectId to str for JSON serialization
        for doc in documents:
            doc["_id"] = str(doc["_id"])
            if isinstance(doc.get("created_at"), datetime):
                doc["created_at"] = doc["created_at"].isoformat()
            if isinstance(doc.get("analyzed_at"), datetime):
                doc["analyzed_at"] = doc["analyzed_at"].isoformat()
        
        return documents
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching user documents: {str(e)}")

@router.delete("/{document_id}")
async def delete_document(
    document_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Delete a document"""
    try:
        result = await db.documents.delete_one({"document_id": document_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Document not found")
        
        return {"message": "Document deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting document: {str(e)}")
