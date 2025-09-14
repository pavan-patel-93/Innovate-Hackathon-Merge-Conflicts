"""
Analysis strategies for different document types
"""
from abc import ABC, abstractmethod
from typing import Dict, List, Any, Optional
from app.core.logging import LoggerMixin


class AnalysisStrategy(ABC, LoggerMixin):
    """Abstract base class for analysis strategies"""
    
    @abstractmethod
    async def analyze(self, document: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze a document and return results"""
        pass
    
    @abstractmethod
    def get_strategy_name(self) -> str:
        """Get the name of this strategy"""
        pass


class MockAnalysisStrategy(AnalysisStrategy):
    """Mock analysis strategy for testing and development"""
    
    async def analyze(self, document: Dict[str, Any]) -> Dict[str, Any]:
        """Perform mock analysis"""
        self.logger.info(f"Performing mock analysis on document {document.get('document_id')}")
        
        # Simulate analysis delay
        import asyncio
        await asyncio.sleep(0.1)
        
        # Generate mock issues
        mock_issues = [
            {
                "type": "critical",
                "message": "Missing Document ID (SOP-###)",
                "severity": 3,
                "line": 1,
                "section": "header"
            },
            {
                "type": "major",
                "message": "Incomplete revision history table",
                "severity": 2,
                "line": 5,
                "section": "revision_history"
            },
            {
                "type": "minor",
                "message": "Missing approval signature line",
                "severity": 1,
                "line": 20,
                "section": "approval"
            },
            {
                "type": "critical",
                "message": "Contains placeholder text 'TBD'",
                "severity": 3,
                "line": 15,
                "section": "content"
            },
            {
                "type": "major",
                "message": "Stale reference: 'ICH Q7' missing year",
                "severity": 2,
                "line": 12,
                "section": "references"
            }
        ]
        
        # Calculate compliance score
        total_severity = sum(issue["severity"] for issue in mock_issues)
        score = max(0, 100 - (total_severity * 10))
        
        return {
            "score": score,
            "issues": mock_issues,
            "strategy_used": self.get_strategy_name(),
            "analysis_metadata": {
                "total_issues": len(mock_issues),
                "critical_issues": len([i for i in mock_issues if i["severity"] == 3]),
                "major_issues": len([i for i in mock_issues if i["severity"] == 2]),
                "minor_issues": len([i for i in mock_issues if i["severity"] == 1])
            }
        }
    
    def get_strategy_name(self) -> str:
        return "mock_analysis"


class PDFAnalysisStrategy(AnalysisStrategy):
    """PDF-specific analysis strategy"""
    
    async def analyze(self, document: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze PDF document"""
        self.logger.info(f"Performing PDF analysis on document {document.get('document_id')}")
        
        # TODO: Implement actual PDF analysis
        # This would involve:
        # 1. Extracting text from PDF
        # 2. Parsing document structure
        # 3. Applying compliance rules
        # 4. Generating issues and score
        
        # For now, return mock results
        return await MockAnalysisStrategy().analyze(document)
    
    def get_strategy_name(self) -> str:
        return "pdf_analysis"


class WordAnalysisStrategy(AnalysisStrategy):
    """Word document-specific analysis strategy"""
    
    async def analyze(self, document: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze Word document"""
        self.logger.info(f"Performing Word analysis on document {document.get('document_id')}")
        
        # TODO: Implement actual Word document analysis
        # This would involve:
        # 1. Extracting text and structure from Word document
        # 2. Parsing document sections
        # 3. Applying compliance rules
        # 4. Generating issues and score
        
        # For now, return mock results
        return await MockAnalysisStrategy().analyze(document)
    
    def get_strategy_name(self) -> str:
        return "word_analysis"


class TextAnalysisStrategy(AnalysisStrategy):
    """Plain text analysis strategy"""
    
    async def analyze(self, document: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze plain text document"""
        self.logger.info(f"Performing text analysis on document {document.get('document_id')}")
        
        # TODO: Implement actual text analysis
        # This would involve:
        # 1. Parsing text content
        # 2. Identifying document sections
        # 3. Applying compliance rules
        # 4. Generating issues and score
        
        # For now, return mock results
        return await MockAnalysisStrategy().analyze(document)
    
    def get_strategy_name(self) -> str:
        return "text_analysis"


class AnalysisStrategyFactory:
    """Factory for creating analysis strategies"""
    
    def __init__(self):
        self._strategies = {
            "application/pdf": PDFAnalysisStrategy(),
            "application/msword": WordAnalysisStrategy(),
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document": WordAnalysisStrategy(),
            "text/plain": TextAnalysisStrategy(),
        }
        self._default_strategy = MockAnalysisStrategy()
    
    def get_strategy(self, content_type: str) -> AnalysisStrategy:
        """Get analysis strategy for content type"""
        return self._strategies.get(content_type, self._default_strategy)
    
    def get_available_strategies(self) -> List[str]:
        """Get list of available strategy names"""
        return list(self._strategies.keys()) + [self._default_strategy.get_strategy_name()]
