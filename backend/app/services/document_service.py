"""
Document service implementation.
Handles document-related business logic.
"""
from typing import List, Optional, Dict, Any
from datetime import datetime
import os
import uuid

from app.services.base_service import BaseService
from app.repositories.document_repository import DocumentRepository
from app.domain.entities.document import Document, DocumentStatus, DocumentType, ComplianceIssue, IssueSeverity
from app.core.exceptions import ValidationError, NotFoundError, FileUploadError
from app.core.logging import get_logger

logger = get_logger(__name__)


class DocumentService(BaseService[Document]):
    """Service for document operations."""
    
    def __init__(self, document_repository: DocumentRepository, ai_service=None):
        super().__init__()
        self.document_repository = document_repository
        self.ai_service = ai_service
        
        # Allowed file types
        self.allowed_types = {
            'application/pdf': DocumentType.PDF,
            'application/msword': DocumentType.WORD,
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': DocumentType.WORD,
            'text/plain': DocumentType.TEXT,
            'application/vnd.ms-excel': DocumentType.EXCEL,
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': DocumentType.EXCEL,
            'application/vnd.ms-powerpoint': DocumentType.POWERPOINT,
            'application/vnd.openxmlformats-officedocument.presentationml.presentation': DocumentType.POWERPOINT
        }
        
        # Maximum file size (10MB)
        self.max_file_size = 10 * 1024 * 1024
    
    async def create(self, data: Dict[str, Any]) -> Document:
        """Create a new document."""
        try:
            # Validate required fields
            self.validate_required_fields(data, ['filename', 'content_type', 'size', 'user_id'])
            
            # Validate file type
            if data['content_type'] not in self.allowed_types:
                raise ValidationError(
                    f"File type {data['content_type']} not supported",
                    {"supported_types": list(self.allowed_types.keys())}
                )
            
            # Validate file size
            if data['size'] > self.max_file_size:
                raise ValidationError(
                    f"File size {data['size']} exceeds maximum allowed size of {self.max_file_size} bytes"
                )
            
            # Create document
            document = Document(
                id=self.generate_id(),
                filename=data['filename'],
                content_type=data['content_type'],
                size=data['size'],
                user_id=data['user_id'],
                status=DocumentStatus.UPLOADED,
                document_type=self.allowed_types[data['content_type']],
                file_path=data.get('file_path'),
                content=data.get('content'),
                metadata=data.get('metadata', {})
            )
            
            # Save to repository
            await self.document_repository.create(document)
            
            self.log_operation("create_document", {
                "document_id": document.id,
                "filename": document.filename,
                "user_id": document.user_id
            })
            
            return document
            
        except Exception as e:
            self.log_error("create_document", e, {"data": data})
            raise
    
    async def get_by_id(self, document_id: str) -> Optional[Document]:
        """Get document by ID."""
        try:
            return await self.document_repository.get_by_id(document_id)
        except Exception as e:
            self.log_error("get_document_by_id", e, {"document_id": document_id})
            raise
    
    async def update(self, document_id: str, data: Dict[str, Any]) -> Document:
        """Update document."""
        try:
            document = await self.get_by_id(document_id)
            if not document:
                raise NotFoundError("Document", document_id)
            
            # Update fields
            if 'status' in data:
                document.status = DocumentStatus(data['status'])
            
            if 'compliance_score' in data:
                document.compliance_score = data['compliance_score']
            
            if 'issues' in data:
                document.issues = data['issues']
            
            if 'metadata' in data:
                document.metadata.update(data['metadata'])
            
            document.updated_at = datetime.now()
            
            # Save updated document
            await self.document_repository.update(document_id, {
                "status": document.status.value,
                "compliance_score": document.compliance_score,
                "issues": [issue.to_dict() for issue in document.issues],
                "metadata": document.metadata,
                "updated_at": document.updated_at
            })
            
            self.log_operation("update_document", {
                "document_id": document_id,
                "status": document.status.value
            })
            
            return document
            
        except Exception as e:
            self.log_error("update_document", e, {"document_id": document_id, "data": data})
            raise
    
    async def delete(self, document_id: str) -> bool:
        """Delete document."""
        try:
            document = await self.get_by_id(document_id)
            if not document:
                raise NotFoundError("Document", document_id)
            
            # Delete file if exists
            if document.file_path and os.path.exists(document.file_path):
                os.remove(document.file_path)
            
            result = await self.document_repository.delete(document_id)
            
            self.log_operation("delete_document", {
                "document_id": document_id,
                "filename": document.filename
            })
            
            return result
            
        except Exception as e:
            self.log_error("delete_document", e, {"document_id": document_id})
            raise
    
    async def upload_document(
        self, 
        filename: str, 
        content_type: str, 
        size: int, 
        user_id: str,
        file_content: bytes = None,
        upload_dir: str = "uploaded-files"
    ) -> Document:
        """Upload a document."""
        try:
            # Create upload directory if it doesn't exist
            os.makedirs(upload_dir, exist_ok=True)
            
            # Generate unique filename
            file_extension = os.path.splitext(filename)[1]
            unique_filename = f"{uuid.uuid4()}{file_extension}"
            file_path = os.path.join(upload_dir, unique_filename)
            
            # Save file if content provided
            if file_content:
                with open(file_path, "wb") as f:
                    f.write(file_content)
            
            # Create document data
            document_data = {
                "filename": filename,
                "content_type": content_type,
                "size": size,
                "user_id": user_id,
                "file_path": file_path,
                "metadata": {
                    "original_filename": filename,
                    "uploaded_at": datetime.now().isoformat()
                }
            }
            
            document = await self.create(document_data)
            
            self.log_operation("upload_document", {
                "document_id": document.id,
                "filename": filename,
                "user_id": user_id,
                "file_path": file_path
            })
            
            return document
            
        except Exception as e:
            self.log_error("upload_document", e, {
                "filename": filename,
                "user_id": user_id
            })
            raise
    
    async def analyze_document(self, document_id: str) -> Document:
        """Analyze document for compliance issues."""
        try:
            document = await self.get_by_id(document_id)
            if not document:
                raise NotFoundError("Document", document_id)
            
            # Update status to processing
            await self.update(document_id, {"status": DocumentStatus.PROCESSING.value})
            
            try:
                # Use AI service if available
                if self.ai_service:
                    issues = await self.ai_service.analyze_document(document)
                else:
                    # Mock analysis for testing
                    issues = self._generate_mock_issues()
                
                # Calculate compliance score
                document.issues = issues
                document.compliance_score = document.calculate_compliance_score()
                document.status = DocumentStatus.ANALYZED
                document.analyzed_at = datetime.now()
                
                # Update document
                await self.update(document_id, {
                    "status": document.status.value,
                    "compliance_score": document.compliance_score,
                    "issues": [issue.to_dict() for issue in issues],
                    "analyzed_at": document.analyzed_at
                })
                
                self.log_operation("analyze_document", {
                    "document_id": document_id,
                    "compliance_score": document.compliance_score,
                    "issues_count": len(issues)
                })
                
                return document
                
            except Exception as analysis_error:
                # Mark as error if analysis fails
                await self.update(document_id, {"status": DocumentStatus.ERROR.value})
                self.log_error("analyze_document", analysis_error, {"document_id": document_id})
                raise
            
        except Exception as e:
            self.log_error("analyze_document", e, {"document_id": document_id})
            raise
    
    async def get_documents_by_user(
        self, 
        user_id: str, 
        status: Optional[DocumentStatus] = None,
        limit: int = 50,
        skip: int = 0
    ) -> List[Document]:
        """Get documents by user."""
        try:
            documents = await self.document_repository.get_documents_by_user(
                user_id, status, limit, skip
            )
            
            self.log_operation("get_documents_by_user", {
                "user_id": user_id,
                "status": status.value if status else None,
                "count": len(documents)
            })
            
            return documents
            
        except Exception as e:
            self.log_error("get_documents_by_user", e, {
                "user_id": user_id,
                "status": status.value if status else None
            })
            raise
    
    async def search_documents(
        self, 
        search_term: str,
        user_id: Optional[str] = None,
        limit: int = 50
    ) -> List[Document]:
        """Search documents."""
        try:
            documents = await self.document_repository.search_documents(
                search_term, user_id, limit
            )
            
            self.log_operation("search_documents", {
                "search_term": search_term,
                "user_id": user_id,
                "count": len(documents)
            })
            
            return documents
            
        except Exception as e:
            self.log_error("search_documents", e, {
                "search_term": search_term,
                "user_id": user_id
            })
            raise
    
    async def get_document_statistics(self, user_id: Optional[str] = None) -> Dict[str, Any]:
        """Get document statistics."""
        try:
            stats = await self.document_repository.get_document_statistics(user_id)
            
            self.log_operation("get_document_statistics", {
                "user_id": user_id,
                "total_documents": stats.get("total_documents", 0)
            })
            
            return stats
            
        except Exception as e:
            self.log_error("get_document_statistics", e, {"user_id": user_id})
            raise
    
    def _generate_mock_issues(self) -> List[ComplianceIssue]:
        """Generate mock compliance issues for testing."""
        return [
            ComplianceIssue(
                id=self.generate_id(),
                type="critical",
                message="Missing Document ID (SOP-###)",
                severity=IssueSeverity.CRITICAL,
                suggestions=["Add a unique document identifier", "Follow SOP-### format"]
            ),
            ComplianceIssue(
                id=self.generate_id(),
                type="major",
                message="Incomplete revision history table",
                severity=IssueSeverity.MAJOR,
                suggestions=["Complete the revision history", "Include all changes"]
            ),
            ComplianceIssue(
                id=self.generate_id(),
                type="minor",
                message="Missing approval signature line",
                severity=IssueSeverity.MINOR,
                suggestions=["Add signature line", "Include approver information"]
            )
        ]