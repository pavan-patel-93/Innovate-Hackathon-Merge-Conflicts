"""
Document type service for document type configuration business logic
"""
from typing import List, Dict, Any, Optional
from app.repositories.document_type_repository import DocumentTypeRepository
from app.services.base_service import BaseService
from app.core.exceptions import ValidationError, NotFoundError, ConflictError
from app.models.chat import DocumentTypeCreate, DocumentTypeUpdate, DocumentSection, SectionRule


class DocumentTypeService(BaseService):
    """Service for document type configuration business logic"""
    
    def __init__(self, document_type_repository: DocumentTypeRepository):
        super().__init__()
        self.document_type_repository = document_type_repository
    
    async def create_document_type(
        self,
        doc_type_data: DocumentTypeCreate,
        created_by: Optional[str] = None
    ) -> Dict[str, Any]:
        """Create a new document type configuration"""
        try:
            # Validate required fields
            self.validate_required_fields(doc_type_data.dict(), ["code", "name"])
            
            # Sanitize inputs
            doc_type_dict = doc_type_data.dict()
            doc_type_dict["code"] = self.sanitize_string(doc_type_dict["code"], max_length=50).upper()
            doc_type_dict["name"] = self.sanitize_string(doc_type_dict["name"], max_length=200)
            
            if doc_type_dict.get("description"):
                doc_type_dict["description"] = self.sanitize_string(doc_type_dict["description"], max_length=1000)
            
            if doc_type_dict.get("id_format"):
                doc_type_dict["id_format"] = self.sanitize_string(doc_type_dict["id_format"], max_length=100)
            
            # Validate code format (alphanumeric and hyphens only)
            if not doc_type_dict["code"].replace("-", "").replace("_", "").isalnum():
                raise ValidationError("Code must contain only alphanumeric characters, hyphens, and underscores")
            
            # Check if code already exists
            existing = await self.document_type_repository.get_by_code(doc_type_dict["code"])
            if existing:
                raise ConflictError(f"Document type with code '{doc_type_dict['code']}' already exists")
            
            # Validate sections if provided
            if doc_type_dict.get("sections"):
                await self._validate_sections(doc_type_dict["sections"])
            
            # Create document type
            created_doc_type = await self.document_type_repository.create_document_type(
                doc_type_data=doc_type_dict,
                created_by=created_by
            )
            
            self.logger.info(f"Document type created: {doc_type_dict['code']} by {created_by}")
            return created_doc_type
            
        except (ValidationError, ConflictError):
            raise
        except Exception as e:
            self.logger.error(self.format_error_message("create_document_type", str(e)))
            raise
    
    async def get_document_types(
        self,
        skip: int = 0,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """Get all document type configurations"""
        try:
            if skip < 0:
                raise ValidationError("Skip must be non-negative")
            
            if limit <= 0 or limit > 1000:
                raise ValidationError("Limit must be between 1 and 1000")
            
            document_types = await self.document_type_repository.get_all_document_types(
                skip=skip,
                limit=limit
            )
            
            self.logger.info(f"Retrieved {len(document_types)} document types")
            return document_types
            
        except ValidationError:
            raise
        except Exception as e:
            self.logger.error(self.format_error_message("get_document_types", str(e)))
            raise
    
    async def get_document_type_by_id(self, doc_type_id: str) -> Dict[str, Any]:
        """Get a specific document type by ID"""
        try:
            if not doc_type_id or not isinstance(doc_type_id, str):
                raise ValidationError("Document type ID is required and must be a string")
            
            doc_type_id = self.sanitize_string(doc_type_id, max_length=100)
            
            document_type = await self.document_type_repository.get_by_field("id", doc_type_id)
            if not document_type:
                raise NotFoundError("Document type", doc_type_id)
            
            self.logger.info(f"Retrieved document type: {doc_type_id}")
            return document_type
            
        except (ValidationError, NotFoundError):
            raise
        except Exception as e:
            self.logger.error(self.format_error_message("get_document_type_by_id", str(e)))
            raise
    
    async def get_document_type_by_code(self, code: str) -> Dict[str, Any]:
        """Get a specific document type by code"""
        try:
            if not code or not isinstance(code, str):
                raise ValidationError("Code is required and must be a string")
            
            code = self.sanitize_string(code, max_length=50).upper()
            
            document_type = await self.document_type_repository.get_by_code(code)
            if not document_type:
                raise NotFoundError("Document type", code)
            
            self.logger.info(f"Retrieved document type by code: {code}")
            return document_type
            
        except (ValidationError, NotFoundError):
            raise
        except Exception as e:
            self.logger.error(self.format_error_message("get_document_type_by_code", str(e)))
            raise
    
    async def update_document_type(
        self,
        doc_type_id: str,
        doc_type_update: DocumentTypeUpdate
    ) -> Dict[str, Any]:
        """Update a document type configuration"""
        try:
            if not doc_type_id or not isinstance(doc_type_id, str):
                raise ValidationError("Document type ID is required and must be a string")
            
            doc_type_id = self.sanitize_string(doc_type_id, max_length=100)
            
            # Check if document type exists
            existing = await self.document_type_repository.get_by_field("id", doc_type_id)
            if not existing:
                raise NotFoundError("Document type", doc_type_id)
            
            # Prepare update data
            update_data = doc_type_update.dict(exclude_unset=True)
            
            # Sanitize string fields
            if "name" in update_data:
                update_data["name"] = self.sanitize_string(update_data["name"], max_length=200)
            
            if "description" in update_data:
                update_data["description"] = self.sanitize_string(update_data["description"], max_length=1000)
            
            if "id_format" in update_data:
                update_data["id_format"] = self.sanitize_string(update_data["id_format"], max_length=100)
            
            # Validate sections if being updated
            if "sections" in update_data:
                await self._validate_sections(update_data["sections"])
            
            # Update document type
            success = await self.document_type_repository.update_document_type(
                doc_type_id=doc_type_id,
                update_data=update_data
            )
            
            if not success:
                raise NotFoundError("Document type", doc_type_id)
            
            # Return updated document type
            updated_doc_type = await self.document_type_repository.get_by_field("id", doc_type_id)
            
            self.logger.info(f"Document type updated: {doc_type_id}")
            return updated_doc_type
            
        except (ValidationError, NotFoundError):
            raise
        except Exception as e:
            self.logger.error(self.format_error_message("update_document_type", str(e)))
            raise
    
    async def delete_document_type(self, doc_type_id: str) -> Dict[str, str]:
        """Delete a document type configuration"""
        try:
            if not doc_type_id or not isinstance(doc_type_id, str):
                raise ValidationError("Document type ID is required and must be a string")
            
            doc_type_id = self.sanitize_string(doc_type_id, max_length=100)
            
            # Check if document type exists
            existing = await self.document_type_repository.get_by_field("id", doc_type_id)
            if not existing:
                raise NotFoundError("Document type", doc_type_id)
            
            # Delete document type
            success = await self.document_type_repository.delete_by_id(doc_type_id)
            if not success:
                raise NotFoundError("Document type", doc_type_id)
            
            self.logger.info(f"Document type deleted: {doc_type_id}")
            return {"message": "Document type deleted successfully"}
            
        except (ValidationError, NotFoundError):
            raise
        except Exception as e:
            self.logger.error(self.format_error_message("delete_document_type", str(e)))
            raise
    
    async def reorder_sections(
        self,
        doc_type_id: str,
        section_orders: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Reorder sections in a document type"""
        try:
            if not doc_type_id or not isinstance(doc_type_id, str):
                raise ValidationError("Document type ID is required and must be a string")
            
            if not section_orders or not isinstance(section_orders, list):
                raise ValidationError("Section orders must be a non-empty list")
            
            doc_type_id = self.sanitize_string(doc_type_id, max_length=100)
            
            # Validate section orders
            for order_info in section_orders:
                if not isinstance(order_info, dict) or "name" not in order_info or "order" not in order_info:
                    raise ValidationError("Each section order must have 'name' and 'order' fields")
                
                if not isinstance(order_info["order"], int) or order_info["order"] < 0:
                    raise ValidationError("Section order must be a non-negative integer")
            
            # Reorder sections
            success = await self.document_type_repository.reorder_sections(
                doc_type_id=doc_type_id,
                section_orders=section_orders
            )
            
            if not success:
                raise NotFoundError("Document type", doc_type_id)
            
            # Return updated document type
            updated_doc_type = await self.document_type_repository.get_by_field("id", doc_type_id)
            
            self.logger.info(f"Sections reordered for document type: {doc_type_id}")
            return {
                "message": "Sections reordered successfully",
                "document_type": updated_doc_type
            }
            
        except (ValidationError, NotFoundError):
            raise
        except Exception as e:
            self.logger.error(self.format_error_message("reorder_sections", str(e)))
            raise
    
    async def _validate_sections(self, sections: List[Dict[str, Any]]) -> None:
        """Validate document sections"""
        if not isinstance(sections, list):
            raise ValidationError("Sections must be a list")
        
        section_names = set()
        for i, section in enumerate(sections):
            if not isinstance(section, dict):
                raise ValidationError(f"Section {i} must be a dictionary")
            
            if "name" not in section or not section["name"]:
                raise ValidationError(f"Section {i} must have a name")
            
            section_name = self.sanitize_string(section["name"], max_length=100)
            if section_name in section_names:
                raise ValidationError(f"Duplicate section name: {section_name}")
            
            section_names.add(section_name)
            
            # Validate rules if present
            if "rules" in section and section["rules"]:
                await self._validate_section_rules(section["rules"])
    
    async def _validate_section_rules(self, rules: List[Dict[str, Any]]) -> None:
        """Validate section rules"""
        if not isinstance(rules, list):
            raise ValidationError("Rules must be a list")
        
        rule_ids = set()
        for i, rule in enumerate(rules):
            if not isinstance(rule, dict):
                raise ValidationError(f"Rule {i} must be a dictionary")
            
            if "rule_id" not in rule or not rule["rule_id"]:
                raise ValidationError(f"Rule {i} must have a rule_id")
            
            rule_id = self.sanitize_string(rule["rule_id"], max_length=50)
            if rule_id in rule_ids:
                raise ValidationError(f"Duplicate rule ID: {rule_id}")
            
            rule_ids.add(rule_id)