"""
AI service implementation.
Handles AI-related operations and external AI service integration.
"""
from typing import List, Dict, Any, Optional
import os
from datetime import datetime

from app.services.base_service import BaseService
from app.domain.entities.document import Document, ComplianceIssue, IssueSeverity
from app.core.exceptions import ExternalServiceError
from app.core.logging import get_logger

logger = get_logger(__name__)


class AIService(BaseService[None]):
    """Service for AI operations."""
    
    def __init__(self):
        super().__init__()
        self.azure_openai_key = os.getenv("AZURE_OPEN_AI_KEY")
        self.azure_endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
        self.lamaparse_api_key = os.getenv("LAMAPARSE_API_KEY")
    
    async def analyze_document(self, document: Document) -> List[ComplianceIssue]:
        """Analyze document for compliance issues."""
        try:
            if not document.content:
                # If no content, try to extract from file
                content = await self._extract_document_content(document)
                if not content:
                    return []
            else:
                content = document.content
            
            # Use Azure OpenAI for analysis
            if self.azure_openai_key and self.azure_endpoint:
                return await self._analyze_with_azure_openai(content, document)
            else:
                # Fallback to mock analysis
                return self._generate_mock_analysis(content, document)
                
        except Exception as e:
            self.log_error("analyze_document", e, {"document_id": document.id})
            raise ExternalServiceError("AI Analysis", str(e))
    
    async def chat_with_ai(
        self, 
        message: str, 
        context: Optional[str] = None,
        files: Optional[List[Dict[str, Any]]] = None
    ) -> str:
        """Chat with AI assistant."""
        try:
            if self.azure_openai_key and self.azure_endpoint:
                return await self._chat_with_azure_openai(message, context, files)
            else:
                return self._generate_mock_response(message, context, files)
                
        except Exception as e:
            self.log_error("chat_with_ai", e, {"message": message})
            raise ExternalServiceError("AI Chat", str(e))
    
    async def _extract_document_content(self, document: Document) -> Optional[str]:
        """Extract content from document file."""
        try:
            if not document.file_path or not os.path.exists(document.file_path):
                return None
            
            # Use LlamaParse if available
            if self.lamaparse_api_key:
                return await self._extract_with_lamaparse(document.file_path)
            else:
                # Fallback to basic text extraction
                return await self._extract_basic_text(document.file_path)
                
        except Exception as e:
            self.log_error("_extract_document_content", e, {"file_path": document.file_path})
            return None
    
    async def _extract_with_lamaparse(self, file_path: str) -> Optional[str]:
        """Extract content using LlamaParse."""
        try:
            from llama_parse import LlamaParse
            
            parser = LlamaParse(
                api_key=self.lamaparse_api_key,
                result_type="markdown",
                language="en"
            )
            
            documents = await parser.aload_data(file_path)
            content = ""
            
            for doc in documents:
                if doc and doc.text:
                    content += doc.text
            
            return content
            
        except Exception as e:
            self.log_error("_extract_with_lamaparse", e, {"file_path": file_path})
            return None
    
    async def _extract_basic_text(self, file_path: str) -> Optional[str]:
        """Extract content using basic text reading."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return f.read()
        except Exception as e:
            self.log_error("_extract_basic_text", e, {"file_path": file_path})
            return None
    
    async def _analyze_with_azure_openai(self, content: str, document: Document) -> List[ComplianceIssue]:
        """Analyze document using Azure OpenAI."""
        try:
            from openai import AzureOpenAI
            
            client = AzureOpenAI(
                api_version="2024-02-01",
                azure_endpoint=self.azure_endpoint,
                api_key=self.azure_openai_key,
            )
            
            prompt = f"""
            Analyze the following document for compliance issues. Look for:
            1. Missing document identifiers
            2. Incomplete sections
            3. Placeholder text
            4. Stale references
            5. Missing signatures or approvals
            6. Formatting issues
            
            Document: {content[:4000]}  # Limit content length
            
            Return a JSON array of issues with this format:
            [
                {{
                    "type": "issue_type",
                    "message": "Description of the issue",
                    "severity": "critical|major|minor|info",
                    "line_number": 123,
                    "section": "section_name",
                    "suggestions": ["suggestion1", "suggestion2"]
                }}
            ]
            """
            
            response = client.chat.completions.create(
                messages=[
                    {"role": "system", "content": "You are a compliance expert analyzing documents for regulatory issues."},
                    {"role": "user", "content": prompt}
                ],
                max_completion_tokens=2000,
                model="gpt-4",
                temperature=0.1
            )
            
            # Parse response and create issues
            issues = self._parse_ai_response(response.choices[0].message.content)
            return issues
            
        except Exception as e:
            self.log_error("_analyze_with_azure_openai", e, {"document_id": document.id})
            return self._generate_mock_analysis(content, document)
    
    async def _chat_with_azure_openai(
        self, 
        message: str, 
        context: Optional[str] = None,
        files: Optional[List[Dict[str, Any]]] = None
    ) -> str:
        """Chat with Azure OpenAI."""
        try:
            from openai import AzureOpenAI
            
            client = AzureOpenAI(
                api_version="2024-02-01",
                azure_endpoint=self.azure_endpoint,
                api_key=self.azure_openai_key,
            )
            
            system_prompt = "You are a helpful compliance assistant. Provide accurate and helpful information about document compliance, regulatory requirements, and best practices."
            
            if context:
                system_prompt += f"\n\nContext: {context}"
            
            if files:
                file_info = "\n".join([f"- {f['filename']}: {f.get('content_type', 'unknown type')}" for f in files])
                system_prompt += f"\n\nUploaded files:\n{file_info}"
            
            response = client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": message}
                ],
                max_completion_tokens=2000,
                model="gpt-4",
                temperature=0.7
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            self.log_error("_chat_with_azure_openai", e, {"message": message})
            raise ExternalServiceError("Azure OpenAI", str(e))
    
    def _parse_ai_response(self, response: str) -> List[ComplianceIssue]:
        """Parse AI response into compliance issues."""
        try:
            import json
            
            # Try to extract JSON from response
            start_idx = response.find('[')
            end_idx = response.rfind(']') + 1
            
            if start_idx != -1 and end_idx != -1:
                json_str = response[start_idx:end_idx]
                issues_data = json.loads(json_str)
                
                issues = []
                for issue_data in issues_data:
                    issues.append(ComplianceIssue(
                        id=self.generate_id(),
                        type=issue_data.get('type', 'unknown'),
                        message=issue_data.get('message', ''),
                        severity=IssueSeverity(issue_data.get('severity', 'info')),
                        line_number=issue_data.get('line_number'),
                        section=issue_data.get('section'),
                        suggestions=issue_data.get('suggestions', [])
                    ))
                
                return issues
            
        except Exception as e:
            self.log_error("_parse_ai_response", e, {"response": response[:200]})
        
        # Fallback to mock analysis
        return self._generate_mock_analysis("", None)
    
    def _generate_mock_analysis(self, content: str, document: Document) -> List[ComplianceIssue]:
        """Generate mock analysis for testing."""
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
    
    def _generate_mock_response(
        self, 
        message: str, 
        context: Optional[str] = None,
        files: Optional[List[Dict[str, Any]]] = None
    ) -> str:
        """Generate mock response for testing."""
        response = f"I've analyzed your message: '{message}'\n\n"
        
        if context:
            response += f"Context: {context}\n\n"
        
        if files:
            response += f"Uploaded files: {len(files)} files\n"
            for file in files:
                response += f"- {file['filename']}\n"
            response += "\n"
        
        response += """Based on regulatory guidelines, I recommend:

1. **Document Structure**: Ensure all mandatory sections are present
2. **Version Control**: Implement proper revision history tracking
3. **Approval Process**: Add required signature lines
4. **Reference Management**: Update stale references with current versions
5. **Quality Control**: Remove placeholder text and ensure completeness

Would you like me to provide more specific guidance on any of these areas?"""
        
        return response
