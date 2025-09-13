from fastapi import APIRouter, UploadFile, File
import os
import uuid
from typing import Optional
from llama_parse import LlamaParse
from openai import AzureOpenAI

from dotenv import load_dotenv
load_dotenv() 

router = APIRouter()

# Configure upload directory - use absolute path for clarity
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploaded-files")
os.makedirs(UPLOAD_DIR, exist_ok=True)
print(f"Files will be uploaded to: {UPLOAD_DIR}")


parser = LlamaParse(
    api_key= os.environ.get("LAMAPARSE_API_KEY"),  # can also be set in your env as LLAMA_CLOUD_API_KEY
    result_type="markdown",  # "markdown" and "text" are available
    language="en",  # Optionally you can define a language, default=en
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

        documents = await parser.aload_data(file_path)
        
        documentText = "" 
        for indx in range(len(documents)):
            if documents[indx] and documents[indx].text:
                documentText += documents[indx].text


        
        endpoint = "https://hrish-m3zpdd19-eastus2.cognitiveservices.azure.com/"
        model_name = "gpt-5-mini"
        deployment = "hackathon-group1"


        subscription_key = os.environ.get("AZURE_OPEN_AI_KEY")
        api_version = "2024-12-01-preview"
        api_version = "2024-02-01"


        client = AzureOpenAI(
            api_version=api_version,
            azure_endpoint=endpoint,
            api_key=subscription_key,
        )


        response = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": 
                    """
                        You are a technical assistant that summarizes parsed document data into concise, informative tool descriptions.
                    """
                },
                {
                    "role": "user",
                    "content": documentText,
                },
            ],
            max_completion_tokens=16384,
            model=deployment,
        )


        print(f"response got from openai azure {response.choices[0].message.content}")

        print(f"printing final text got from lamaparse {documentText}")
        
        return {
            "filename": file.filename,
            "saved_as": unique_filename,
            "content_type": file.content_type,
            "documents": documentText,
            "size_bytes": len(file_content)
        }
    except Exception as e:
        print(f"File upload An exception occurred: {e}")
        return {
            "error": str(e)
        }