# app/models/chat.py
from pydantic import BaseModel, Field
from datetime import datetime
import uuid
from typing import Optional, List, Dict, Any

class UserModel(BaseModel):
    name: str

class MessageBase(BaseModel):
    content: str
    room_name: str
    user: UserModel

class MessageCreate(MessageBase):
    pass

class MessageInDB(MessageBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.now)

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class MessageResponse(MessageInDB):
    pass

# Document Type Configuration Models
class RuleParameter(BaseModel):
    """Rule parameter configuration"""
    key: str
    value: Any
    description: Optional[str] = None

class SectionRule(BaseModel):
    """Rule applied to a document section"""
    rule_id: str
    name: str
    description: Optional[str] = None
    is_active: bool = True
    severity: str = "minor"  # critical, major, minor
    parameters: Dict[str, Any] = Field(default_factory=dict)

class DocumentSection(BaseModel):
    """Document section configuration"""
    name: str
    description: Optional[str] = None
    order: int = 0
    is_required: bool = True
    rules: List[SectionRule] = Field(default_factory=list)

class DocumentTypeBase(BaseModel):
    """Base document type configuration"""
    code: str
    name: str
    description: Optional[str] = None
    id_format: Optional[str] = None  # e.g., "SOP-###"

class DocumentTypeCreate(DocumentTypeBase):
    """Document type creation schema"""
    sections: List[DocumentSection] = Field(default_factory=list)
    document_rules: List[SectionRule] = Field(default_factory=list)

class DocumentTypeUpdate(BaseModel):
    """Document type update schema"""
    name: Optional[str] = None
    description: Optional[str] = None
    id_format: Optional[str] = None
    sections: Optional[List[DocumentSection]] = None
    document_rules: Optional[List[SectionRule]] = None

class DocumentTypeInDB(DocumentTypeBase):
    """Document type in database"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    sections: List[DocumentSection] = Field(default_factory=list)
    document_rules: List[SectionRule] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    created_by: Optional[str] = None

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class DocumentTypeResponse(DocumentTypeInDB):
    """Document type response schema"""
    pass