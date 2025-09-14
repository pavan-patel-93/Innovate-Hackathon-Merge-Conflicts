from fastapi import APIRouter, UploadFile, File, HTTPException
import os
import uuid
import json
import time
from datetime import datetime
from typing import Optional
from bson import ObjectId
from llama_parse import LlamaParse
from openai import AzureOpenAI
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
from app.core.logging import get_logger
from app.services.document_config_service import DocumentConfigService

logger = get_logger(__name__) 

router = APIRouter()

# MongoDB client for document configuration and storage
mongo_client = None
document_config_service = None
database = None

async def get_mongo_client():
    global mongo_client, document_config_service, database
    if mongo_client is None:
        mongo_client = AsyncIOMotorClient(settings.MONGODB_URI)
        database = mongo_client[settings.MONGODB_DB_NAME]
        document_config_service = DocumentConfigService(database)
    return document_config_service

async def get_database():
    global database
    if database is None:
        await get_mongo_client()  # This will initialize the database
    return database


def generate_markdown_report(compliance_analysis: dict, document_config: dict) -> str:
    """Generate a concise compliance report focusing on critical issues"""
    
    # Extract data from analysis
    compliance_score = compliance_analysis.get("compliance_score", 0)
    overall_status = compliance_analysis.get("overall_status", "unknown")
    sections_analyzed = compliance_analysis.get("sections_analyzed", [])
    
    # Status indicator
    if compliance_score >= 80:
        status_emoji = "✅"
    elif compliance_score >= 60:
        status_emoji = "⚠️"
    else:
        status_emoji = "❌"
    
    # Start building concise report
    markdown_lines = [
        f"# Compliance Report {status_emoji}",
        f"**Score: {compliance_score}/100** | Status: {overall_status.replace('_', ' ').title()}",
        f""
    ]
    
    # Categorize issues by type
    missing_sections = []
    metadata_issues = []
    stale_references = []
    other_issues = []
    
    for section in sections_analyzed:
        section_name = section.get("section_name", "")
        section_status = section.get("status", "")
        issues = section.get("issues", [])
        
        if section_status == "missing":
            missing_sections.append(section_name)
        
        for issue in issues:
            issue_lower = issue.lower()
            if any(keyword in issue_lower for keyword in ["metadata", "document id", "version", "effective date", "revision"]):
                metadata_issues.append(issue)
            elif any(keyword in issue_lower for keyword in ["reference", "stale", "year", "ich", "iso", "cfr"]):
                stale_references.append(issue)
            else:
                other_issues.append(issue)
    
    # Missing Sections
    if missing_sections:
        markdown_lines.extend([
            f"## ❌ Missing Sections ({len(missing_sections)})",
            ""
        ])
        for section in missing_sections:
            markdown_lines.append(f"• {section}")
        markdown_lines.append("")
    
    # Metadata Issues
    if metadata_issues:
        markdown_lines.extend([
            f"## 📋 Metadata Issues ({len(metadata_issues)})",
            ""
        ])
        for issue in metadata_issues:
            markdown_lines.append(f"• {issue}")
        markdown_lines.append("")
    
    # Stale References
    if stale_references:
        markdown_lines.extend([
            f"## 📚 Reference Issues ({len(stale_references)})",
            ""
        ])
        for issue in stale_references:
            markdown_lines.append(f"• {issue}")
        markdown_lines.append("")
    
    # Other Critical Issues
    if other_issues:
        markdown_lines.extend([
            f"## ⚠️ Other Issues ({len(other_issues)})",
            ""
        ])
        for issue in other_issues:
            markdown_lines.append(f"• {issue}")
        markdown_lines.append("")
    
    # Summary if no issues found
    if not any([missing_sections, metadata_issues, stale_references, other_issues]):
        markdown_lines.extend([
            f"## ✅ No Critical Issues Found",
            f"Document appears to meet basic compliance requirements.",
            f""
        ])
    
    return "\n".join(markdown_lines)

# Configure upload directory - use absolute path for clarity
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploaded-files")
os.makedirs(UPLOAD_DIR, exist_ok=True)
print(f"Files will be uploaded to: {UPLOAD_DIR}")


# Initialize parser with proper error handling
def get_parser():
    api_key = settings.LAMAPARSE_API_KEY
    if not api_key:
        logger.warning("LAMAPARSE_API_KEY not found in settings")
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


        
        # Get Azure OpenAI configuration from settings
        endpoint = settings.AZURE_OPENAI_ENDPOINT
        deployment = settings.AZURE_OPENAI_DEPLOYMENT
        subscription_key = settings.AZURE_OPENAI_KEY
        api_version = settings.AZURE_OPENAI_API_VERSION
        
        # Validate required environment variables
        if not all([endpoint, subscription_key]):
            logger.error("Missing required Azure OpenAI configuration in settings")
            raise HTTPException(
                status_code=500,
                detail="Azure OpenAI configuration incomplete"
            )


        client = AzureOpenAI(
            api_version=api_version,
            azure_endpoint=endpoint,
            api_key=subscription_key,
        )


        # Get document configuration and perform compliance analysis
        config_service = await get_mongo_client()
        document_config = await config_service.get_document_config_by_code("SOP")

        compliance_analysis = None
        compliance_score = 0.0
        compliance_report = "Compliance analysis unavailable"
        
        if document_config:
            # Generate system prompt based on document configuration
            system_prompt = config_service.generate_system_prompt(document_config)
            
            try:
                # Call Azure OpenAI with the dynamic system prompt
                response = client.chat.completions.create(
                    messages=[
                        {
                            "role": "system",
                            "content": system_prompt + "\n\nFocus specifically on these critical compliance areas:\n1. MISSING SECTIONS: Title, Purpose, Scope, Responsibilities, Definitions, Procedure, References, Revision History, Approvals\n2. METADATA ISSUES: Document ID (SOP-###), Version/Revision, Effective Date (YYYY-MM-DD)\n3. STALE REFERENCES: Missing years in citations (ICH Q7, ISO 13485:2016, 21 CFR Part 11)\n4. CONTENT QUALITY: Prohibited placeholders (TBD, lorem ipsum), insufficient procedure steps (<3 numbered steps), missing signature lines\n\nReturn analysis as JSON:\n{\n  \"compliance_score\": <0-100 based on severity weights: Critical=3, Major=2, Minor=1>,\n  \"overall_status\": \"compliant|non_compliant|partially_compliant\",\n  \"sections_analyzed\": [\n    {\n      \"section_name\": \"string\",\n      \"status\": \"compliant|non_compliant|missing\",\n      \"issues\": [\"specific issues found - be concise and direct\"]\n    }\n  ]\n}"
                        },
                        {
                            "role": "user",
                            "content": f"Please analyze the following document content for compliance:\n\n{documentText}"  # Use full content without trimming
                        },
                    ],
                    model=deployment,
                    response_format={"type": "json_object"},
                )
                
                ai_response = response.choices[0].message.content
                logger.info("AI compliance analysis generated successfully")
                
                # Parse JSON response and generate structured markdown
                try:
                    compliance_analysis = json.loads(ai_response)
                    compliance_score = compliance_analysis.get("compliance_score", 0.0)
                    
                    # Generate structured markdown report
                    compliance_report = generate_markdown_report(compliance_analysis, document_config)
                    
                    logger.info(f"Successfully parsed compliance analysis with score: {compliance_score}")
                    
                except json.JSONDecodeError as je:
                    logger.warning(f"Could not parse AI response as JSON: {je}")
                    logger.debug(f"Raw AI response: {ai_response}")
                    
                    # Fallback: create a basic analysis structure
                    compliance_analysis = {
                        "compliance_score": 50.0,
                        "overall_status": "analysis_error",
                        "summary": "Failed to parse AI analysis response",
                        "sections_analyzed": [],
                        "key_findings": ["Analysis parsing failed"],
                        "action_items": ["Review document analysis configuration"]
                    }
                    compliance_score = 50.0
                    compliance_report = f"# Document Analysis Report\n\n## Analysis Error\n\nFailed to parse AI response. Raw response:\n\n```\n{ai_response}\n```"
                    
            except Exception as e:
                logger.error(f"Error generating compliance analysis: {e}")
                compliance_report = "Compliance analysis unavailable due to AI service error"
        else:
            logger.warning("No document configuration found, skipping compliance analysis")
            compliance_report = "No document configuration available for compliance analysis"


        # Store document in MongoDB document_store collection
        db = await get_database()
        document_store = db.document_store
        
        # Generate unique document ID using timestamp
        document_id = f"{int(time.time() * 1000000)}"
        current_time = datetime.utcnow()
        
        # Create document record in the specified format
        document_record = {
            "_id": ObjectId(),
            "filename": unique_filename,
            "original_filename": file.filename,
            "content_type": file.content_type,
            "size_bytes": len(file_content),
            "parsed_content": documentText,
            "compliance_analysis": compliance_report,  # Store the markdown report
            "compliance_score": int(compliance_score),
            "metadata": {
                "status": "success",
                "upload_timestamp": current_time.isoformat()
            },
            "id": document_id,
            "created_at": current_time,
            "updated_at": current_time
        }
        
        try:
            # Insert document into MongoDB
            result = await document_store.insert_one(document_record)
            logger.info(f"Document stored in MongoDB with ID: {result.inserted_id}")
            
            logger.info(f"Document processed successfully: {file.filename}")
            
            return {
                "_id": str(result.inserted_id),
                "filename": unique_filename,
                "original_filename": file.filename,
                "content_type": file.content_type,
                "size_bytes": len(file_content),
                "parsed_content": documentText,
                "compliance_analysis": compliance_report,
                "compliance_score": int(compliance_score),
                "metadata": {
                    "status": "success",
                    "upload_timestamp": current_time.isoformat()
                },
                "id": document_id,
                "created_at": current_time.isoformat(),
                "updated_at": current_time.isoformat()
            }
        except Exception as mongo_error:
            logger.error(f"Error storing document in MongoDB: {mongo_error}")
            # Still return success response even if MongoDB storage fails
            return {
                "filename": file.filename,
                "saved_as": unique_filename,
                "content_type": file.content_type,
                "parsed_content": documentText,
                "compliance_analysis": compliance_report,
                "compliance_score": int(compliance_score),
                "size_bytes": len(file_content),
                "status": "success",
                "warning": "Document processed but not stored in database"
            }
    except Exception as e:
        logger.error(f"File upload error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"File upload failed: {str(e)}"
        )