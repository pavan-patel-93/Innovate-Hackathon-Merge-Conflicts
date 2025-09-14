# app/api/v1/endpoints/setup.py
from fastapi import APIRouter, Query, HTTPException
from typing import List, Dict, Any

from app.models.chat import (
    DocumentTypeCreate, 
    DocumentTypeUpdate, 
    DocumentTypeResponse,
    DocumentSection,
    SectionRule
)

router = APIRouter()

@router.get("/document-types", response_model=List[DocumentTypeResponse])
async def get_document_types(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000)
):
    """Get all document type configurations"""
    # TODO: Implement actual document type service
    # For now, return mock data
    mock_document_types = [
        DocumentTypeResponse(
            id="1",
            code="SOP",
            name="Standard Operating Procedure",
            description="Standard operating procedure document type",
            id_format="SOP-###",
            sections=[
                DocumentSection(
                    name="Title Page",
                    description="Document title and identification",
                    order=1,
                    is_required=True,
                    rules=[]
                ),
                DocumentSection(
                    name="Table of Contents",
                    description="Document structure overview",
                    order=2,
                    is_required=True,
                    rules=[]
                )
            ],
            created_at="2024-01-01T00:00:00Z",
            updated_at="2024-01-01T00:00:00Z",
            created_by="system"
        )
    ]
    return mock_document_types[skip:skip+limit]

@router.get("/document-types/{doc_type_id}", response_model=DocumentTypeResponse)
async def get_document_type(doc_type_id: str):
    """Get a specific document type by ID"""
    # TODO: Implement actual document type service
    if doc_type_id == "1":
        return DocumentTypeResponse(
            id="1",
            code="SOP",
            name="Standard Operating Procedure",
            description="Standard operating procedure document type",
            id_format="SOP-###",
            sections=[],
            created_at="2024-01-01T00:00:00Z",
            updated_at="2024-01-01T00:00:00Z",
            created_by="system"
        )
    raise HTTPException(status_code=404, detail="Document type not found")

@router.get("/document-types/code/{code}", response_model=DocumentTypeResponse)
async def get_document_type_by_code(code: str):
    """Get a specific document type by code"""
    # TODO: Implement actual document type service
    if code == "SOP":
        return DocumentTypeResponse(
            id="1",
            code="SOP",
            name="Standard Operating Procedure",
            description="Standard operating procedure document type",
            id_format="SOP-###",
            sections=[],
            created_at="2024-01-01T00:00:00Z",
            updated_at="2024-01-01T00:00:00Z",
            created_by="system"
        )
    raise HTTPException(status_code=404, detail="Document type not found")

@router.post("/document-types", response_model=DocumentTypeResponse)
async def create_document_type(
    doc_type: DocumentTypeCreate,
    created_by: str = Query(None)
):
    """Create a new document type configuration"""
    # TODO: Implement actual document type service
    return DocumentTypeResponse(
        id="new-id",
        code=doc_type.code,
        name=doc_type.name,
        description=doc_type.description,
        id_format=doc_type.id_format,
        sections=doc_type.sections,
        created_at="2024-01-01T00:00:00Z",
        updated_at="2024-01-01T00:00:00Z",
        created_by=created_by or "system"
    )

@router.put("/document-types/{doc_type_id}", response_model=DocumentTypeResponse)
async def update_document_type(
    doc_type_id: str,
    doc_type_update: DocumentTypeUpdate
):
    """Update a document type configuration"""
    # TODO: Implement actual document type service
    if doc_type_id == "1":
        return DocumentTypeResponse(
            id=doc_type_id,
            code="SOP",
            name=doc_type_update.name or "Standard Operating Procedure",
            description=doc_type_update.description or "Standard operating procedure document type",
            id_format=doc_type_update.id_format or "SOP-###",
            sections=doc_type_update.sections or [],
            created_at="2024-01-01T00:00:00Z",
            updated_at="2024-01-01T00:00:00Z",
            created_by="system"
        )
    raise HTTPException(status_code=404, detail="Document type not found")

@router.delete("/document-types/{doc_type_id}")
async def delete_document_type(doc_type_id: str):
    """Delete a document type configuration"""
    # TODO: Implement actual document type service
    if doc_type_id == "1":
        return {"message": "Document type deleted successfully"}
    raise HTTPException(status_code=404, detail="Document type not found")

@router.put("/document-types/{doc_type_id}/sections/reorder")
async def reorder_sections(
    doc_type_id: str,
    section_orders: List[dict]
):
    """Reorder sections in a document type"""
    # TODO: Implement actual document type service
    if doc_type_id == "1":
        return {"message": "Sections reordered successfully", "document_type": {"id": doc_type_id}}
    raise HTTPException(status_code=404, detail="Document type not found")

@router.post("/document-types/{doc_type_id}/sections/{section_name}/rules")
async def add_section_rule(
    doc_type_id: str,
    section_name: str,
    rule_data: SectionRule
):
    """Add a rule to a specific section"""
    # TODO: Implement actual document type service
    if doc_type_id == "1":
        return {"message": "Rule added successfully", "document_type": {"id": doc_type_id}}
    raise HTTPException(status_code=404, detail="Document type or section not found")

@router.put("/document-types/{doc_type_id}/sections/{section_name}/rules/{rule_id}")
async def update_section_rule(
    doc_type_id: str,
    section_name: str,
    rule_id: str,
    rule_data: SectionRule
):
    """Update a rule in a specific section"""
    # TODO: Implement actual document type service
    if doc_type_id == "1":
        return {"message": "Rule updated successfully", "document_type": {"id": doc_type_id}}
    raise HTTPException(status_code=404, detail="Document type, section, or rule not found")

@router.delete("/document-types/{doc_type_id}/sections/{section_name}/rules/{rule_id}")
async def delete_section_rule(
    doc_type_id: str,
    section_name: str,
    rule_id: str
):
    """Delete a rule from a specific section"""
    # TODO: Implement actual document type service
    if doc_type_id == "1":
        return {"message": "Rule deleted successfully", "document_type": {"id": doc_type_id}}
    raise HTTPException(status_code=404, detail="Document type, section, or rule not found")

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