"""
Document domain entity.
Represents a document in the system.
"""
from datetime import datetime
from typing import Optional, List, Dict, Any
from dataclasses import dataclass, field
from enum import Enum


class DocumentStatus(Enum):
    """Document processing status."""
    UPLOADED = "uploaded"
    PROCESSING = "processing"
    ANALYZED = "analyzed"
    ERROR = "error"
    ARCHIVED = "archived"


class DocumentType(Enum):
    """Document types."""
    PDF = "pdf"
    WORD = "word"
    TEXT = "text"
    EXCEL = "excel"
    POWERPOINT = "powerpoint"


class IssueSeverity(Enum):
    """Issue severity levels."""
    CRITICAL = "critical"
    MAJOR = "major"
    MINOR = "minor"
    INFO = "info"


@dataclass
class ComplianceIssue:
    """Compliance issue in a document."""
    id: str
    type: str
    message: str
    severity: IssueSeverity
    line_number: Optional[int] = None
    section: Optional[str] = None
    suggestions: List[str] = field(default_factory=list)
    created_at: datetime = field(default_factory=datetime.now)
    
    def to_dict(self) -> dict:
        """Convert to dictionary."""
        return {
            "id": self.id,
            "type": self.type,
            "message": self.message,
            "severity": self.severity.value,
            "line_number": self.line_number,
            "section": self.section,
            "suggestions": self.suggestions,
            "created_at": self.created_at.isoformat()
        }


@dataclass
class Document:
    """Document domain entity."""
    id: str
    filename: str
    content_type: str
    size: int
    user_id: str
    status: DocumentStatus = DocumentStatus.UPLOADED
    document_type: Optional[DocumentType] = None
    file_path: Optional[str] = None
    content: Optional[str] = None
    compliance_score: Optional[float] = None
    issues: List[ComplianceIssue] = field(default_factory=list)
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)
    analyzed_at: Optional[datetime] = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def is_analyzed(self) -> bool:
        """Check if document is analyzed."""
        return self.status == DocumentStatus.ANALYZED
    
    def has_critical_issues(self) -> bool:
        """Check if document has critical issues."""
        return any(issue.severity == IssueSeverity.CRITICAL for issue in self.issues)
    
    def get_issues_by_severity(self, severity: IssueSeverity) -> List[ComplianceIssue]:
        """Get issues by severity level."""
        return [issue for issue in self.issues if issue.severity == severity]
    
    def calculate_compliance_score(self) -> float:
        """Calculate compliance score based on issues."""
        if not self.issues:
            return 100.0
        
        total_penalty = 0
        for issue in self.issues:
            if issue.severity == IssueSeverity.CRITICAL:
                total_penalty += 20
            elif issue.severity == IssueSeverity.MAJOR:
                total_penalty += 10
            elif issue.severity == IssueSeverity.MINOR:
                total_penalty += 5
            else:  # INFO
                total_penalty += 1
        
        return max(0.0, 100.0 - total_penalty)
    
    def add_issue(self, issue: ComplianceIssue):
        """Add a compliance issue."""
        self.issues.append(issue)
        self.updated_at = datetime.now()
    
    def mark_as_analyzed(self, issues: List[ComplianceIssue] = None):
        """Mark document as analyzed."""
        self.status = DocumentStatus.ANALYZED
        self.analyzed_at = datetime.now()
        self.updated_at = datetime.now()
        
        if issues:
            self.issues = issues
            self.compliance_score = self.calculate_compliance_score()
    
    def to_dict(self) -> dict:
        """Convert to dictionary."""
        return {
            "id": self.id,
            "filename": self.filename,
            "content_type": self.content_type,
            "size": self.size,
            "user_id": self.user_id,
            "status": self.status.value,
            "document_type": self.document_type.value if self.document_type else None,
            "file_path": self.file_path,
            "compliance_score": self.compliance_score,
            "issues": [issue.to_dict() for issue in self.issues],
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "analyzed_at": self.analyzed_at.isoformat() if self.analyzed_at else None,
            "metadata": self.metadata
        }
