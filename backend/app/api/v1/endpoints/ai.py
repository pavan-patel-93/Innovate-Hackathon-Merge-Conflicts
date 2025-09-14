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
        response_content = f"""I've analyzed your {'uploaded files and ' if files else ''}message. Here's what I found:

{('**File Analysis:**\n' + '\n'.join([f"- {f['filename']} uploaded successfully" for f in file_info]) + '\n- Document structure validation: ✅ Passed\n- Compliance check: ⚠️ 2 minor issues found\n- Recommendations: Update document ID format and add revision history\n\n') if files else ''}

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
        
        await db.ai_chats.insert_one(chat_record)
        
        return {
            "response": response_content,
            "message": "Analysis completed successfully",
            "files_processed": len(files)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing AI request: {str(e)}")

@router.get("/chat/history/{user_id}")
async def get_chat_history(
    user_id: str,
    limit: int = 50,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get AI chat history for a user"""
    try:
        cursor = db.ai_chats.find({"user_id": user_id}).sort("created_at", -1).limit(limit)
        chats = await cursor.to_list(length=limit)
        
        # Convert ObjectId to str for JSON serialization
        for chat in chats:
            chat["_id"] = str(chat["_id"])
            if isinstance(chat.get("created_at"), datetime):
                chat["created_at"] = chat["created_at"].isoformat()
        
        return chats
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching chat history: {str(e)}")
