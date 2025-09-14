"""
Analysis service for document compliance checking
"""
from typing import Dict, Any, List
from app.services.base_service import BaseService
from app.core.exceptions import AnalysisError, ValidationError
from app.core.config import settings
import asyncio


class AnalysisService(BaseService):
    """Service for document analysis business logic"""
    
    def __init__(self, strategy_factory):
        super().__init__()
        self.strategy_factory = strategy_factory
    
    async def analyze_document(self, document: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze a document for compliance issues"""
        try:
            # Validate document
            self._validate_document_for_analysis(document)
            
            # Get appropriate strategy based on content type
            content_type = document.get("content_type", "text/plain")
            strategy = self.strategy_factory.get_strategy(content_type)
            
            self.logger.info(f"Using {strategy.get_strategy_name()} strategy for document {document.get('document_id')}")
            
            # Perform analysis with timeout
            try:
                analysis_result = await asyncio.wait_for(
                    strategy.analyze(document),
                    timeout=settings.ANALYSIS_TIMEOUT
                )
            except asyncio.TimeoutError:
                raise AnalysisError(f"Analysis timed out after {settings.ANALYSIS_TIMEOUT} seconds")
            
            # Validate analysis result
            self._validate_analysis_result(analysis_result)
            
            # Add metadata
            analysis_result["document_id"] = document.get("document_id")
            analysis_result["analyzed_at"] = self._get_current_timestamp()
            
            self.logger.info(f"Analysis completed for document {document.get('document_id')} - Score: {analysis_result.get('score')}")
            return analysis_result
            
        except (ValidationError, AnalysisError):
            raise
        except Exception as e:
            self.logger.error(self.format_error_message("analyze_document", str(e)))
            raise AnalysisError(f"Analysis failed: {str(e)}")
    
    async def batch_analyze_documents(self, documents: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Analyze multiple documents in batch"""
        try:
            if not documents or not isinstance(documents, list):
                raise ValidationError("Documents must be a non-empty list")
            
            self.logger.info(f"Starting batch analysis of {len(documents)} documents")
            
            # Create analysis tasks
            tasks = []
            for document in documents:
                task = self.analyze_document(document)
                tasks.append(task)
            
            # Execute all analyses concurrently
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Process results
            analysis_results = []
            for i, result in enumerate(results):
                if isinstance(result, Exception):
                    self.logger.error(f"Analysis failed for document {i}: {result}")
                    analysis_results.append({
                        "document_id": documents[i].get("document_id"),
                        "error": str(result),
                        "success": False
                    })
                else:
                    analysis_results.append(result)
            
            successful_analyses = len([r for r in analysis_results if r.get("success", True)])
            self.logger.info(f"Batch analysis completed: {successful_analyses}/{len(documents)} successful")
            
            return analysis_results
            
        except ValidationError:
            raise
        except Exception as e:
            self.logger.error(self.format_error_message("batch_analyze_documents", str(e)))
            raise AnalysisError(f"Batch analysis failed: {str(e)}")
    
    def get_available_strategies(self) -> List[str]:
        """Get list of available analysis strategies"""
        return self.strategy_factory.get_available_strategies()
    
    def _validate_document_for_analysis(self, document: Dict[str, Any]) -> None:
        """Validate document before analysis"""
        required_fields = ["document_id", "content_type"]
        self.validate_required_fields(document, required_fields)
        
        if not isinstance(document.get("content_type"), str):
            raise ValidationError("Content type must be a string")
        
        if document.get("content_type") not in settings.ALLOWED_FILE_TYPES:
            raise ValidationError(f"Content type '{document.get('content_type')}' not supported for analysis")
    
    def _validate_analysis_result(self, result: Dict[str, Any]) -> None:
        """Validate analysis result"""
        required_fields = ["score", "issues"]
        self.validate_required_fields(result, required_fields)
        
        if not isinstance(result.get("score"), (int, float)):
            raise ValidationError("Analysis score must be a number")
        
        if not isinstance(result.get("issues"), list):
            raise ValidationError("Analysis issues must be a list")
        
        score = result.get("score")
        if score < 0 or score > 100:
            raise ValidationError("Analysis score must be between 0 and 100")
    
    def _get_current_timestamp(self) -> str:
        """Get current timestamp in ISO format"""
        from datetime import datetime
        return datetime.utcnow().isoformat()
