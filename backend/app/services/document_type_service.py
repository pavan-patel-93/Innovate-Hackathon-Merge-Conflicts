# app/services/document_type_service.py
from typing import List, Optional
from app.db.mongodb import get_database
from app.models.chat import DocumentTypeInDB, DocumentTypeCreate, DocumentTypeUpdate
from datetime import datetime
import uuid

class DocumentTypeService:
    def __init__(self, db):
        self.db = db
        self.collection = db.document_type_configuration

    async def create_document_type(self, doc_type: DocumentTypeCreate, created_by: str = None) -> DocumentTypeInDB:
        """Create a new document type configuration"""
        doc_type_dict = doc_type.dict()
        doc_type_dict["id"] = str(uuid.uuid4())
        doc_type_dict["created_at"] = datetime.now()
        doc_type_dict["updated_at"] = datetime.now()
        doc_type_dict["created_by"] = created_by
        
        # Ensure sections have proper order
        for i, section in enumerate(doc_type_dict["sections"]):
            section["order"] = i
        
        result = await self.collection.insert_one(doc_type_dict)
        doc_type_dict["_id"] = result.inserted_id
        
        return DocumentTypeInDB(**doc_type_dict)

    async def get_document_types(self, skip: int = 0, limit: int = 100) -> List[DocumentTypeInDB]:
        """Get all document type configurations"""
        cursor = self.collection.find().skip(skip).limit(limit).sort("created_at", -1)
        document_types = []
        async for doc_type in cursor:
            doc_type["id"] = str(doc_type["_id"])
            document_types.append(DocumentTypeInDB(**doc_type))
        return document_types

    async def get_document_type_by_id(self, doc_type_id: str) -> Optional[DocumentTypeInDB]:
        """Get a document type by ID"""
        doc_type = await self.collection.find_one({"id": doc_type_id})
        if doc_type:
            doc_type["id"] = str(doc_type["_id"])
            return DocumentTypeInDB(**doc_type)
        return None

    async def get_document_type_by_code(self, code: str) -> Optional[DocumentTypeInDB]:
        """Get a document type by code"""
        doc_type = await self.collection.find_one({"code": code})
        if doc_type:
            doc_type["id"] = str(doc_type["_id"])
            return DocumentTypeInDB(**doc_type)
        return None

    async def update_document_type(self, doc_type_id: str, doc_type_update: DocumentTypeUpdate) -> Optional[DocumentTypeInDB]:
        """Update a document type configuration"""
        update_data = doc_type_update.dict(exclude_unset=True)
        update_data["updated_at"] = datetime.now()
        
        # If updating sections, ensure proper order
        if "sections" in update_data:
            for i, section in enumerate(update_data["sections"]):
                section["order"] = i
        
        result = await self.collection.update_one(
            {"id": doc_type_id},
            {"$set": update_data}
        )
        
        if result.modified_count:
            return await self.get_document_type_by_id(doc_type_id)
        return None

    async def delete_document_type(self, doc_type_id: str) -> bool:
        """Delete a document type configuration"""
        result = await self.collection.delete_one({"id": doc_type_id})
        return result.deleted_count > 0

    async def reorder_sections(self, doc_type_id: str, section_orders: List[dict]) -> Optional[DocumentTypeInDB]:
        """Reorder sections in a document type"""
        doc_type = await self.get_document_type_by_id(doc_type_id)
        if not doc_type:
            return None
        
        # Update section orders
        for order_info in section_orders:
            section_name = order_info["name"]
            new_order = order_info["order"]
            
            for section in doc_type.sections:
                if section.name == section_name:
                    section.order = new_order
                    break
        
        # Sort sections by order
        doc_type.sections.sort(key=lambda x: x.order)
        
        # Update in database
        update_data = {
            "sections": [section.dict() for section in doc_type.sections],
            "updated_at": datetime.now()
        }
        
        await self.collection.update_one(
            {"id": doc_type_id},
            {"$set": update_data}
        )
        
        return await self.get_document_type_by_id(doc_type_id)

    async def add_section_rule(self, doc_type_id: str, section_name: str, rule_data: dict) -> Optional[DocumentTypeInDB]:
        """Add a rule to a specific section"""
        doc_type = await self.get_document_type_by_id(doc_type_id)
        if not doc_type:
            return None
        
        # Find the section and add the rule
        for section in doc_type.sections:
            if section.name == section_name:
                section.rules.append(rule_data)
                break
        
        # Update in database
        update_data = {
            "sections": [section.dict() for section in doc_type.sections],
            "updated_at": datetime.now()
        }
        
        await self.collection.update_one(
            {"id": doc_type_id},
            {"$set": update_data}
        )
        
        return await self.get_document_type_by_id(doc_type_id)

    async def update_section_rule(self, doc_type_id: str, section_name: str, rule_id: str, rule_data: dict) -> Optional[DocumentTypeInDB]:
        """Update a rule in a specific section"""
        doc_type = await self.get_document_type_by_id(doc_type_id)
        if not doc_type:
            return None
        
        # Find the section and update the rule
        for section in doc_type.sections:
            if section.name == section_name:
                for i, rule in enumerate(section.rules):
                    if rule.rule_id == rule_id:
                        section.rules[i] = rule_data
                        break
                break
        
        # Update in database
        update_data = {
            "sections": [section.dict() for section in doc_type.sections],
            "updated_at": datetime.now()
        }
        
        await self.collection.update_one(
            {"id": doc_type_id},
            {"$set": update_data}
        )
        
        return await self.get_document_type_by_id(doc_type_id)

    async def delete_section_rule(self, doc_type_id: str, section_name: str, rule_id: str) -> Optional[DocumentTypeInDB]:
        """Delete a rule from a specific section"""
        doc_type = await self.get_document_type_by_id(doc_type_id)
        if not doc_type:
            return None
        
        # Find the section and remove the rule
        for section in doc_type.sections:
            if section.name == section_name:
                section.rules = [rule for rule in section.rules if rule.rule_id != rule_id]
                break
        
        # Update in database
        update_data = {
            "sections": [section.dict() for section in doc_type.sections],
            "updated_at": datetime.now()
        }
        
        await self.collection.update_one(
            {"id": doc_type_id},
            {"$set": update_data}
        )
        
        return await self.get_document_type_by_id(doc_type_id)
