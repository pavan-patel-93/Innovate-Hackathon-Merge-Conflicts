"""
Document repository implementation.
Handles document-related database operations.
"""
from typing import List, Optional, Dict, Any
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime

from app.repositories.base_repository import BaseRepository
from app.domain.entities.document import Document, DocumentStatus, DocumentType, ComplianceIssue, IssueSeverity
from app.core.logging import get_logger

logger = get_logger(__name__)


class DocumentRepository(BaseRepository[Document]):
    """Repository for documents."""
    
    def __init__(self, database: AsyncIOMotorDatabase):
        super().__init__(database, "documents")
    
    def _entity_to_dict(self, entity: Document) -> Dict[str, Any]:
        """Convert Document entity to dictionary."""
        return {
            "id": entity.id,
            "filename": entity.filename,
            "content_type": entity.content_type,
            "size": entity.size,
            "user_id": entity.user_id,
            "status": entity.status.value,
            "document_type": entity.document_type.value if entity.document_type else None,
            "file_path": entity.file_path,
            "content": entity.content,
            "compliance_score": entity.compliance_score,
            "issues": [issue.to_dict() for issue in entity.issues],
            "analyzed_at": entity.analyzed_at,
            "metadata": entity.metadata
        }
    
    def _dict_to_entity(self, data: Dict[str, Any]) -> Document:
        """Convert dictionary to Document entity."""
        # Convert ObjectId to string
        data = self._convert_object_id(data)
        
        # Convert datetime strings back to datetime objects
        if isinstance(data.get('created_at'), str):
            data['created_at'] = datetime.fromisoformat(data['created_at'].replace('Z', '+00:00'))
        if isinstance(data.get('updated_at'), str):
            data['updated_at'] = datetime.fromisoformat(data['updated_at'].replace('Z', '+00:00'))
        if isinstance(data.get('analyzed_at'), str):
            data['analyzed_at'] = datetime.fromisoformat(data['analyzed_at'].replace('Z', '+00:00'))
        
        # Convert issues
        issues = []
        for issue_data in data.get('issues', []):
            if isinstance(issue_data.get('created_at'), str):
                issue_data['created_at'] = datetime.fromisoformat(issue_data['created_at'].replace('Z', '+00:00'))
            
            issues.append(ComplianceIssue(
                id=issue_data['id'],
                type=issue_data['type'],
                message=issue_data['message'],
                severity=IssueSeverity(issue_data['severity']),
                line_number=issue_data.get('line_number'),
                section=issue_data.get('section'),
                suggestions=issue_data.get('suggestions', []),
                created_at=issue_data.get('created_at', datetime.now())
            ))
        
        return Document(
            id=data['id'],
            filename=data['filename'],
            content_type=data['content_type'],
            size=data['size'],
            user_id=data['user_id'],
            status=DocumentStatus(data.get('status', 'uploaded')),
            document_type=DocumentType(data['document_type']) if data.get('document_type') else None,
            file_path=data.get('file_path'),
            content=data.get('content'),
            compliance_score=data.get('compliance_score'),
            issues=issues,
            created_at=data.get('created_at', datetime.now()),
            updated_at=data.get('updated_at', datetime.now()),
            analyzed_at=data.get('analyzed_at'),
            metadata=data.get('metadata', {})
        )
    
    async def get_documents_by_user(
        self, 
        user_id: str, 
        status: Optional[DocumentStatus] = None,
        limit: int = 50,
        skip: int = 0
    ) -> List[Document]:
        """Get documents by user with optional status filter."""
        try:
            filter_dict = {"user_id": user_id}
            if status:
                filter_dict["status"] = status.value
            
            cursor = self.collection.find(filter_dict)
            cursor = cursor.sort("created_at", -1).skip(skip).limit(limit)
            
            documents = await cursor.to_list(length=limit)
            return [self._dict_to_entity(doc) for doc in documents]
        except Exception as e:
            logger.error(f"Error getting documents for user {user_id}: {e}")
            raise
    
    async def get_documents_by_status(
        self, 
        status: DocumentStatus,
        limit: int = 50,
        skip: int = 0
    ) -> List[Document]:
        """Get documents by status."""
        try:
            cursor = self.collection.find({"status": status.value})
            cursor = cursor.sort("created_at", -1).skip(skip).limit(limit)
            
            documents = await cursor.to_list(length=limit)
            return [self._dict_to_entity(doc) for doc in documents]
        except Exception as e:
            logger.error(f"Error getting documents by status {status.value}: {e}")
            raise
    
    async def get_documents_with_critical_issues(
        self, 
        limit: int = 50,
        skip: int = 0
    ) -> List[Document]:
        """Get documents with critical compliance issues."""
        try:
            # Query for documents with critical issues
            query = {
                "issues": {
                    "$elemMatch": {
                        "severity": IssueSeverity.CRITICAL.value
                    }
                }
            }
            
            cursor = self.collection.find(query)
            cursor = cursor.sort("created_at", -1).skip(skip).limit(limit)
            
            documents = await cursor.to_list(length=limit)
            return [self._dict_to_entity(doc) for doc in documents]
        except Exception as e:
            logger.error(f"Error getting documents with critical issues: {e}")
            raise
    
    async def search_documents(
        self, 
        search_term: str,
        user_id: Optional[str] = None,
        limit: int = 50
    ) -> List[Document]:
        """Search documents by filename or content."""
        try:
            # Create text search query
            query = {"$text": {"$search": search_term}}
            if user_id:
                query["user_id"] = user_id
            
            cursor = self.collection.find(query)
            cursor = cursor.sort("created_at", -1).limit(limit)
            
            documents = await cursor.to_list(length=limit)
            return [self._dict_to_entity(doc) for doc in documents]
        except Exception as e:
            logger.error(f"Error searching documents: {e}")
            raise
    
    async def get_document_by_filename(
        self, 
        filename: str, 
        user_id: str
    ) -> Optional[Document]:
        """Get document by filename and user."""
        try:
            document = await self.collection.find_one({
                "filename": filename,
                "user_id": user_id
            })
            
            if document:
                return self._dict_to_entity(document)
            return None
        except Exception as e:
            logger.error(f"Error getting document by filename {filename}: {e}")
            raise
    
    async def update_document_status(
        self, 
        document_id: str, 
        status: DocumentStatus
    ) -> bool:
        """Update document status."""
        try:
            return await self.update(document_id, {"status": status.value})
        except Exception as e:
            logger.error(f"Error updating document status {document_id}: {e}")
            raise
    
    async def add_compliance_issues(
        self, 
        document_id: str, 
        issues: List[ComplianceIssue]
    ) -> bool:
        """Add compliance issues to document."""
        try:
            issues_dict = [issue.to_dict() for issue in issues]
            return await self.update(document_id, {"issues": issues_dict})
        except Exception as e:
            logger.error(f"Error adding compliance issues to document {document_id}: {e}")
            raise
    
    async def get_document_statistics(self, user_id: Optional[str] = None) -> Dict[str, Any]:
        """Get document statistics."""
        try:
            filter_dict = {"user_id": user_id} if user_id else {}
            
            pipeline = [
                {"$match": filter_dict},
                {"$group": {
                    "_id": "$status",
                    "count": {"$sum": 1},
                    "avg_score": {"$avg": "$compliance_score"}
                }}
            ]
            
            cursor = self.collection.aggregate(pipeline)
            results = await cursor.to_list(length=None)
            
            stats = {
                "total_documents": await self.count(filter_dict),
                "by_status": {result["_id"]: result["count"] for result in results},
                "average_compliance_score": sum(
                    result.get("avg_score", 0) for result in results
                ) / len(results) if results else 0
            }
            
            return stats
        except Exception as e:
            logger.error(f"Error getting document statistics: {e}")
            raise