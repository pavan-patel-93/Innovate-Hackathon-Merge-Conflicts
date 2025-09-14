"""
Document type repository for document type configuration data access
"""
from typing import List, Dict, Any, Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime

from app.repositories.base_repository import BaseRepository
from app.core.exceptions import NotFoundError
from app.core.logging import get_logger
from typing import TypeVar

T = TypeVar('T')
logger = get_logger(__name__)


class DocumentTypeRepository(BaseRepository[T]):
    """Repository for document type configuration operations"""
    
    def __init__(self, database: AsyncIOMotorDatabase):
        super().__init__(database, "document_type_configuration")
    
    async def create_document_type(
        self,
        doc_type_data: Dict[str, Any],
        created_by: Optional[str] = None
    ) -> Dict[str, Any]:
        """Create a new document type configuration"""
        try:
            # Ensure sections have proper order
            for i, section in enumerate(doc_type_data.get("sections", [])):
                section["order"] = i
            
            doc_type_data["created_by"] = created_by
            doc_type_data["created_at"] = datetime.utcnow()
            doc_type_data["updated_at"] = datetime.utcnow()
            
            result = await self.collection.insert_one(doc_type_data)
            doc_type_data["_id"] = str(result.inserted_id)
            
            return doc_type_data
        except Exception as e:
            self.logger.error(f"Error creating document type: {e}")
            raise
    
    async def get_by_code(self, code: str) -> Optional[Dict[str, Any]]:
        """Get document type by code"""
        return await self.get_by_field("code", code)
    
    async def get_all_document_types(
        self,
        skip: int = 0,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """Get all document type configurations"""
        try:
            document_types = await self.get_all(
                skip=skip,
                limit=limit,
                sort_field="created_at",
                sort_direction=-1
            )
            
            # Convert datetime fields
            for doc_type in document_types:
                if isinstance(doc_type.get("created_at"), datetime):
                    doc_type["created_at"] = doc_type["created_at"].isoformat()
                if isinstance(doc_type.get("updated_at"), datetime):
                    doc_type["updated_at"] = doc_type["updated_at"].isoformat()
            
            return document_types
        except Exception as e:
            self.logger.error(f"Error getting all document types: {e}")
            raise
    
    async def update_document_type(
        self,
        doc_type_id: str,
        update_data: Dict[str, Any]
    ) -> bool:
        """Update document type configuration"""
        try:
            # If updating sections, ensure proper order
            if "sections" in update_data:
                for i, section in enumerate(update_data["sections"]):
                    section["order"] = i
            
            update_data["updated_at"] = datetime.utcnow()
            
            result = await self.collection.update_one(
                {"id": doc_type_id},
                {"$set": update_data}
            )
            return result.modified_count > 0
        except Exception as e:
            self.logger.error(f"Error updating document type {doc_type_id}: {e}")
            raise
    
    async def reorder_sections(
        self,
        doc_type_id: str,
        section_orders: List[Dict[str, Any]]
    ) -> bool:
        """Reorder sections in a document type"""
        try:
            # Get current document type
            doc_type = await self.get_by_field("id", doc_type_id)
            if not doc_type:
                return False
            
            # Update section orders
            sections = doc_type.get("sections", [])
            for order_info in section_orders:
                section_name = order_info["name"]
                new_order = order_info["order"]
                
                for section in sections:
                    if section["name"] == section_name:
                        section["order"] = new_order
                        break
            
            # Sort sections by order
            sections.sort(key=lambda x: x["order"])
            
            # Update in database
            update_data = {
                "sections": sections,
                "updated_at": datetime.utcnow()
            }
            
            result = await self.collection.update_one(
                {"id": doc_type_id},
                {"$set": update_data}
            )
            return result.modified_count > 0
        except Exception as e:
            self.logger.error(f"Error reordering sections for document type {doc_type_id}: {e}")
            raise
    
    async def add_section_rule(
        self,
        doc_type_id: str,
        section_name: str,
        rule_data: Dict[str, Any]
    ) -> bool:
        """Add a rule to a specific section"""
        try:
            doc_type = await self.get_by_field("id", doc_type_id)
            if not doc_type:
                return False
            
            sections = doc_type.get("sections", [])
            for section in sections:
                if section["name"] == section_name:
                    if "rules" not in section:
                        section["rules"] = []
                    section["rules"].append(rule_data)
                    break
            
            update_data = {
                "sections": sections,
                "updated_at": datetime.utcnow()
            }
            
            result = await self.collection.update_one(
                {"id": doc_type_id},
                {"$set": update_data}
            )
            return result.modified_count > 0
        except Exception as e:
            self.logger.error(f"Error adding section rule: {e}")
            raise
    
    async def update_section_rule(
        self,
        doc_type_id: str,
        section_name: str,
        rule_id: str,
        rule_data: Dict[str, Any]
    ) -> bool:
        """Update a rule in a specific section"""
        try:
            doc_type = await self.get_by_field("id", doc_type_id)
            if not doc_type:
                return False
            
            sections = doc_type.get("sections", [])
            for section in sections:
                if section["name"] == section_name:
                    rules = section.get("rules", [])
                    for i, rule in enumerate(rules):
                        if rule.get("rule_id") == rule_id:
                            rules[i] = rule_data
                            break
                    break
            
            update_data = {
                "sections": sections,
                "updated_at": datetime.utcnow()
            }
            
            result = await self.collection.update_one(
                {"id": doc_type_id},
                {"$set": update_data}
            )
            return result.modified_count > 0
        except Exception as e:
            self.logger.error(f"Error updating section rule: {e}")
            raise
    
    async def delete_section_rule(
        self,
        doc_type_id: str,
        section_name: str,
        rule_id: str
    ) -> bool:
        """Delete a rule from a specific section"""
        try:
            doc_type = await self.get_by_field("id", doc_type_id)
            if not doc_type:
                return False
            
            sections = doc_type.get("sections", [])
            for section in sections:
                if section["name"] == section_name:
                    rules = section.get("rules", [])
                    section["rules"] = [rule for rule in rules if rule.get("rule_id") != rule_id]
                    break
            
            update_data = {
                "sections": sections,
                "updated_at": datetime.utcnow()
            }
            
            result = await self.collection.update_one(
                {"id": doc_type_id},
                {"$set": update_data}
            )
            return result.modified_count > 0
        except Exception as e:
            self.logger.error(f"Error deleting section rule: {e}")
            raise
    
    async def delete_by_id(self, doc_type_id: str) -> bool:
        """Delete document type by id field"""
        return await self.delete(doc_type_id)
    
    async def get_document_type_stats(self) -> Dict[str, Any]:
        """Get document type statistics"""
        try:
            total_types = await self.count()
            
            # Get sections count per document type
            pipeline = [
                {"$project": {"code": 1, "sections_count": {"$size": "$sections"}}},
                {"$group": {"_id": None, "avg_sections": {"$avg": "$sections_count"}}}
            ]
            
            cursor = self.collection.aggregate(pipeline)
            avg_sections_result = await cursor.to_list(length=1)
            avg_sections = avg_sections_result[0]["avg_sections"] if avg_sections_result else 0
            
            return {
                "total_document_types": total_types,
                "average_sections_per_type": round(avg_sections, 2)
            }
        except Exception as e:
            self.logger.error(f"Error getting document type stats: {e}")
            raise
