# app/api/v1/endpoints/setup.py
from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from app.db.mongodb import get_database
from app.services.document_type_service import DocumentTypeService
from app.models.chat import (
    DocumentTypeCreate, 
    DocumentTypeUpdate, 
    DocumentTypeResponse,
    DocumentSection,
    SectionRule
)

router = APIRouter()

async def get_document_type_service():
    """Dependency to get document type service"""
    db = await get_database()
    return DocumentTypeService(db)

@router.get("/document-types", response_model=List[DocumentTypeResponse])
async def get_document_types(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    service: DocumentTypeService = Depends(get_document_type_service)
):
    """Get all document type configurations"""
    try:
        document_types = await service.get_document_types(skip=skip, limit=limit)
        return document_types
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching document types: {str(e)}")

@router.get("/document-types/{doc_type_id}", response_model=DocumentTypeResponse)
async def get_document_type(
    doc_type_id: str,
    service: DocumentTypeService = Depends(get_document_type_service)
):
    """Get a specific document type by ID"""
    try:
        document_type = await service.get_document_type_by_id(doc_type_id)
        if not document_type:
            raise HTTPException(status_code=404, detail="Document type not found")
        return document_type
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching document type: {str(e)}")

@router.get("/document-types/code/{code}", response_model=DocumentTypeResponse)
async def get_document_type_by_code(
    code: str,
    service: DocumentTypeService = Depends(get_document_type_service)
):
    """Get a specific document type by code"""
    try:
        document_type = await service.get_document_type_by_code(code)
        if not document_type:
            raise HTTPException(status_code=404, detail="Document type not found")
        return document_type
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching document type: {str(e)}")

@router.post("/document-types", response_model=DocumentTypeResponse)
async def create_document_type(
    doc_type: DocumentTypeCreate,
    created_by: str = Query(None),
    service: DocumentTypeService = Depends(get_document_type_service)
):
    """Create a new document type configuration"""
    try:
        # Check if code already exists
        existing = await service.get_document_type_by_code(doc_type.code)
        if existing:
            raise HTTPException(status_code=400, detail="Document type code already exists")
        
        document_type = await service.create_document_type(doc_type, created_by)
        return document_type
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating document type: {str(e)}")

@router.put("/document-types/{doc_type_id}", response_model=DocumentTypeResponse)
async def update_document_type(
    doc_type_id: str,
    doc_type_update: DocumentTypeUpdate,
    service: DocumentTypeService = Depends(get_document_type_service)
):
    """Update a document type configuration"""
    try:
        document_type = await service.update_document_type(doc_type_id, doc_type_update)
        if not document_type:
            raise HTTPException(status_code=404, detail="Document type not found")
        return document_type
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating document type: {str(e)}")

@router.delete("/document-types/{doc_type_id}")
async def delete_document_type(
    doc_type_id: str,
    service: DocumentTypeService = Depends(get_document_type_service)
):
    """Delete a document type configuration"""
    try:
        success = await service.delete_document_type(doc_type_id)
        if not success:
            raise HTTPException(status_code=404, detail="Document type not found")
        return {"message": "Document type deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting document type: {str(e)}")

@router.put("/document-types/{doc_type_id}/sections/reorder")
async def reorder_sections(
    doc_type_id: str,
    section_orders: List[dict],
    service: DocumentTypeService = Depends(get_document_type_service)
):
    """Reorder sections in a document type"""
    try:
        document_type = await service.reorder_sections(doc_type_id, section_orders)
        if not document_type:
            raise HTTPException(status_code=404, detail="Document type not found")
        return {"message": "Sections reordered successfully", "document_type": document_type}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reordering sections: {str(e)}")

@router.post("/document-types/{doc_type_id}/sections/{section_name}/rules")
async def add_section_rule(
    doc_type_id: str,
    section_name: str,
    rule_data: SectionRule,
    service: DocumentTypeService = Depends(get_document_type_service)
):
    """Add a rule to a specific section"""
    try:
        document_type = await service.add_section_rule(doc_type_id, section_name, rule_data.dict())
        if not document_type:
            raise HTTPException(status_code=404, detail="Document type or section not found")
        return {"message": "Rule added successfully", "document_type": document_type}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding rule: {str(e)}")

@router.put("/document-types/{doc_type_id}/sections/{section_name}/rules/{rule_id}")
async def update_section_rule(
    doc_type_id: str,
    section_name: str,
    rule_id: str,
    rule_data: SectionRule,
    service: DocumentTypeService = Depends(get_document_type_service)
):
    """Update a rule in a specific section"""
    try:
        document_type = await service.update_section_rule(doc_type_id, section_name, rule_id, rule_data.dict())
        if not document_type:
            raise HTTPException(status_code=404, detail="Document type, section, or rule not found")
        return {"message": "Rule updated successfully", "document_type": document_type}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating rule: {str(e)}")

@router.delete("/document-types/{doc_type_id}/sections/{section_name}/rules/{rule_id}")
async def delete_section_rule(
    doc_type_id: str,
    section_name: str,
    rule_id: str,
    service: DocumentTypeService = Depends(get_document_type_service)
):
    """Delete a rule from a specific section"""
    try:
        document_type = await service.delete_section_rule(doc_type_id, section_name, rule_id)
        if not document_type:
            raise HTTPException(status_code=404, detail="Document type, section, or rule not found")
        return {"message": "Rule deleted successfully", "document_type": document_type}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting rule: {str(e)}")

# Predefined rules that can be applied to sections
@router.get("/predefined-rules")
async def get_predefined_rules():
    """Get list of predefined rules that can be applied to document sections"""
    predefined_rules = [
        {
            "rule_id": "CONTENT-001",
            "name": "Minimum Content Length",
            "description": "Ensures section has minimum character count",
            "severity": "major",
            "parameters": {
                "min_chars": {"type": "number", "default": 100, "description": "Minimum character count"}
            }
        },
        {
            "rule_id": "CONTENT-002",
            "name": "Maximum Content Length",
            "description": "Ensures section doesn't exceed maximum character count",
            "severity": "minor",
            "parameters": {
                "max_chars": {"type": "number", "default": 5000, "description": "Maximum character count"}
            }
        },
        {
            "rule_id": "FORMAT-001",
            "name": "Required Keywords",
            "description": "Ensures section contains specific keywords",
            "severity": "critical",
            "parameters": {
                "keywords": {"type": "array", "default": [], "description": "Required keywords"}
            }
        },
        {
            "rule_id": "FORMAT-002",
            "name": "Forbidden Keywords",
            "description": "Ensures section doesn't contain forbidden keywords",
            "severity": "major",
            "parameters": {
                "forbidden_keywords": {"type": "array", "default": [], "description": "Forbidden keywords"}
            }
        },
        {
            "rule_id": "STRUCTURE-001",
            "name": "Required Subsections",
            "description": "Ensures section contains specific subsections",
            "severity": "critical",
            "parameters": {
                "subsections": {"type": "array", "default": [], "description": "Required subsections"}
            }
        },
        {
            "rule_id": "STRUCTURE-002",
            "name": "Table Format",
            "description": "Ensures section contains properly formatted table",
            "severity": "major",
            "parameters": {
                "min_rows": {"type": "number", "default": 2, "description": "Minimum table rows"},
                "required_columns": {"type": "array", "default": [], "description": "Required table columns"}
            }
        }
    ]
    return predefined_rules
