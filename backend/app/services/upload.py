from fastapi import APIRouter, UploadFile, File, HTTPException
import os
import uuid
from typing import Optional
from llama_parse import LlamaParse
from openai import AzureOpenAI
from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__) 

router = APIRouter()

# Configure upload directory - use absolute path for clarity
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploaded-files")
os.makedirs(UPLOAD_DIR, exist_ok=True)
print(f"Files will be uploaded to: {UPLOAD_DIR}")


# Initialize parser with proper error handling
def get_parser():
    api_key = os.environ.get("LAMAPARSE_API_KEY")
    if not api_key:
        logger.warning("LAMAPARSE_API_KEY not found in environment variables")
        return None
    
    return LlamaParse(
        api_key=api_key,
        result_type="markdown",
        language="en"
    )


@router.get('/upload-health')
async def get_health_status():
    return {
        "res":"Got call for upload health"
    }

@router.post("/")
async def upload_file(file: UploadFile = File(...)):
    """
    Upload a file to the server
    """
    # Create a unique filename

    try:

        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
    
        
        # Save the file
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        file_content = await file.read()
        
        with open(file_path, "wb") as f:
            f.write(file_content)

        # Parse document with error handling
        parser = get_parser()
        if not parser:
            logger.warning("Document parsing unavailable - LAMAPARSE_API_KEY not configured")
            documentText = "Document parsing unavailable"
        else:
            try:
                documents = await parser.aload_data(file_path)
                documentText = ""
                for doc in documents:
                    if doc and doc.text:
                        documentText += doc.text
            except Exception as e:
                logger.error(f"Error parsing document: {e}")
                documentText = "Error parsing document"
        
        # Document text is now handled in the parsing section above


        
        # Get Azure OpenAI configuration from environment
        endpoint = os.environ.get("AZURE_OPENAI_ENDPOINT")
        deployment = os.environ.get("AZURE_OPENAI_DEPLOYMENT", "gpt-35-turbo")
        subscription_key = os.environ.get("AZURE_OPENAI_KEY")
        api_version = "2024-02-15-preview"
        
        # Validate required environment variables
        if not all([endpoint, subscription_key]):
            logger.error("Missing required Azure OpenAI environment variables")
            raise HTTPException(
                status_code=500,
                detail="Azure OpenAI configuration incomplete"
            )


        client = AzureOpenAI(
            api_version=api_version,
            azure_endpoint=endpoint,
            api_key=subscription_key,
        )


        # Generate AI summary with error handling
        ai_summary = None
        try:
            response = client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": "You are a technical assistant that summarizes parsed document data into concise, informative tool descriptions."
                    },
                    {
                        "role": "user",
                        "content": documentText[:8000],  # Limit content length
                    },
                ],
                max_tokens=1000,  # Use max_tokens instead of max_completion_tokens
                model=deployment,
            )
            ai_summary = response.choices[0].message.content
            logger.info("AI summary generated successfully")
        except Exception as e:
            logger.error(f"Error generating AI summary: {e}")
            ai_summary = "AI summary unavailable"


        logger.info(f"Document processed successfully: {file.filename}")
        
        return {
            "filename": file.filename,
            "saved_as": unique_filename,
            "content_type": file.content_type,
            "parsed_content": documentText,
            "ai_summary": ai_summary,
            "size_bytes": len(file_content),
            "status": "success"
        }
    except Exception as e:
        logger.error(f"File upload error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"File upload failed: {str(e)}"
        )