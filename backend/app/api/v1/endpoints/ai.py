# app/api/v1/endpoints/ai.py
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from app.core.dependencies import get_database
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List, Dict, Any, Optional
import uuid
from datetime import datetime

router = APIRouter()

@router.post("/chat")
async def ai_chat(
    message: str = Form(...),
    files: List[UploadFile] = File(default=[]),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Send a message to AI for analysis"""
    try:
        # Process uploaded files
        file_info = []
        for file in files:
            file_info.append({
                "filename": file.filename,
                "content_type": file.content_type,
                "size": file.size
            })
        
        # Simulate AI response (replace with actual AI service)
        file_analysis = ""
        if files:
            file_list = '\n'.join([f"- {f['filename']} uploaded successfully" for f in file_info])
            file_analysis = f"**File Analysis:**\n{file_list}\n- Document structure validation: ✅ Passed\n- Compliance check: ⚠️ 2 minor issues found\n- Recommendations: Update document ID format and add revision history\n\n"
        
        files_prefix = "uploaded files and " if files else ""
        
        response_content = f"""I've analyzed your {files_prefix}message. Here's what I found:

{file_analysis}
**Response to your query:** "{message}"
Based on regulatory guidelines, I recommend reviewing the document structure and ensuring all mandatory sections are present. Consider implementing the following:

1. **Document Structure**: Ensure all mandatory sections are present
2. **Version Control**: Implement proper revision history tracking
3. **Approval Process**: Add required signature lines
4. **Reference Management**: Update stale references with current versions
5. **Quality Control**: Remove placeholder text and ensure completeness

Would you like me to provide more specific guidance on any of these areas?"""

        # Save chat interaction to database
        chat_record = {
            "chat_id": str(uuid.uuid4()),
            "message": message,
            "files": file_info,
            "response": response_content,
            "created_at": datetime.now()
        }
        
        await db.chat_history.insert_one(chat_record)
        
        return {"response": response_content, "files": file_info}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/chat/history/{user_id}")
async def get_chat_history(
    user_id: str,
    limit: int = 50,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get AI chat history for a user"""
    try:
        # In a real application, you would filter by user_id
        # For now, we'll just get the most recent chats
        cursor = db.chat_history.find().sort("created_at", -1).limit(limit)
        chats = await cursor.to_list(length=limit)
        
        # Convert ObjectId to string for JSON serialization
        for chat in chats:
            chat["_id"] = str(chat["_id"])
            
        return {"chats": chats}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
