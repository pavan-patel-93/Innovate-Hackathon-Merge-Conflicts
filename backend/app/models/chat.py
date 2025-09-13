# app/models/chat.py
from pydantic import BaseModel, Field
from datetime import datetime
import uuid
from typing import Optional

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