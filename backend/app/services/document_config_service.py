"""
Document Configuration Service
Handles fetching document type configurations from MongoDB
"""
from typing import Optional, Dict, Any, List
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.core.logging import get_logger

logger = get_logger(__name__)

class DocumentConfigService:
    """Service for managing document type configurations"""
    
    def __init__(self, database: AsyncIOMotorDatabase):
        self.database = database
        self.collection = database.document_type_configuration
    
    async def get_first_document_config(self) -> Optional[Dict[str, Any]]:
        """
        Get the first document type configuration from the database
        Returns the configuration that will be used for compliance analysis
        """
        try:
            config = await self.collection.find_one({})
            if config:
                # Convert ObjectId to string for JSON serialization
                config['_id'] = str(config['_id'])
                logger.info(f"Retrieved document config: {config.get('code', 'Unknown')}")
                return config
            else:
                logger.warning("No document type configuration found in database")
                return None
        except Exception as e:
            logger.error(f"Error fetching document configuration: {e}")
            raise
    
    async def get_document_config_by_code(self, code: str) -> Optional[Dict[str, Any]]:
        """
        Get document type configuration by code
        """
        try:
            config = await self.collection.find_one({"code": code})
            if config:
                config['_id'] = str(config['_id'])
                return config
            return None
        except Exception as e:
            logger.error(f"Error fetching document configuration by code {code}: {e}")
            raise
    
    def generate_system_prompt(self, config: Dict[str, Any]) -> str:
        """
        Generate system prompt based on document configuration
        """
        if not config:
            return "Analyze the document for general compliance issues."
        
        document_type = config.get('name', 'Document')
        description = config.get('description', '')
        sections = config.get('sections', [])
        
        prompt = f"""You are a document compliance analyzer for {document_type} documents.

Document Type: {document_type}
Description: {description}

Your task is to analyze the provided document content and check compliance against the following sections and rules:

"""
        
        for section in sections:
            section_name = section.get('name', '')
            section_desc = section.get('description', '')
            is_required = section.get('is_required', False)
            rules = section.get('rules', [])
            
            prompt += f"\n## Section: {section_name}\n"
            prompt += f"Description: {section_desc}\n"
            prompt += f"Required: {'Yes' if is_required else 'No'}\n"
            
            if rules:
                prompt += "Rules to check:\n"
                for rule in rules:
                    if rule.get('is_active', True):
                        rule_name = rule.get('name', '')
                        rule_desc = rule.get('description', '')
                        severity = rule.get('severity', 'minor')
                        prompt += f"- {rule_name} (Severity: {severity}): {rule_desc}\n"
            
            prompt += "\n"
        
        prompt += """
IMPORTANT SCORING INSTRUCTIONS:
- Start with a baseline compliance score of 100 points
- Only deduct points when you find actual compliance issues
- If NO issues are found, the score should remain 100
- Deduct points based on severity:
  * Critical issues: -3 points each
  * Major issues: -2 points each  
  * Minor issues: -1 points each

For each section, analyze if it exists in the document and if it meets the specified rules.
For each rule violation, note the severity level (critical, major, minor).
Only report issues that are actual violations - do not create issues if the document is compliant.

Provide your analysis in the following JSON format:
{
    "sections_analysis": [
        {
            "section_name": "Section Name",
            "found": true/false,
            "compliance_status": "compliant/non_compliant/missing",
            "issues": [
                {
                    "rule_name": "Rule Name",
                    "severity": "critical/major/minor",
                    "description": "Issue description",
                    "suggestion": "How to fix this issue"
                }
            ]
        }
    ],
    "overall_compliance": "compliant/partially_compliant/non_compliant",
    "summary": "Brief summary of compliance status",
    "compliance_score": 100
}

CRITICAL: Include the "compliance_score" field in your response. Calculate it as:
- Start with 100 points
- Subtract points only for actual issues found
- If no issues are found, return 100"""
        
        return prompt
    
    def calculate_compliance_score(self, analysis_result: Dict[str, Any]) -> float:
        """
        Calculate compliance score based on severity of issues
        Critical: -3 points
        Major: -2 points  
        Minor: -1 points
        Starting score: 100
        """
        # First check if AI already provided a compliance_score
        if 'compliance_score' in analysis_result:
            return float(analysis_result['compliance_score'])
        
        # Fallback calculation if AI didn't provide score
        score = 100.0
        
        sections_analysis = analysis_result.get('sections_analysis', [])
        
        for section in sections_analysis:
            issues = section.get('issues', [])
            for issue in issues:
                severity = issue.get('severity', 'minor').lower()
                if severity == 'critical':
                    score -= 3
                elif severity == 'major':
                    score -= 2
                elif severity == 'minor':
                    score -= 1
        
        # Ensure score doesn't go below 0
        return max(0.0, score)
    
    def format_compliance_report(self, analysis_result: Dict[str, Any], compliance_score: float, document_config: Dict[str, Any]) -> str:
        """
        Format the compliance analysis as a markdown report
        """
        document_type = document_config.get('name', 'Document')
        
        report = f"""# Document Compliance Analysis Report

## Document Type: {document_type}
**Compliance Score: {compliance_score:.1f}/100**

### Overall Status: {analysis_result.get('overall_compliance', 'Unknown').title()}

{analysis_result.get('summary', 'No summary available')}

## Section Analysis

"""
        
        sections_analysis = analysis_result.get('sections_analysis', [])
        
        for section in sections_analysis:
            section_name = section.get('section_name', 'Unknown Section')
            found = section.get('found', False)
            compliance_status = section.get('compliance_status', 'unknown')
            issues = section.get('issues', [])
            
            status_emoji = "✅" if compliance_status == "compliant" else "⚠️" if compliance_status == "partially_compliant" else "❌"
            
            report += f"### {status_emoji} {section_name}\n\n"
            report += f"**Status:** {compliance_status.replace('_', ' ').title()}\n"
            report += f"**Found in Document:** {'Yes' if found else 'No'}\n\n"
            
            if issues:
                report += "**Issues Found:**\n\n"
                for issue in issues:
                    severity = issue.get('severity', 'minor')
                    severity_emoji = "🔴" if severity == "critical" else "🟡" if severity == "major" else "🟠"
                    
                    report += f"- {severity_emoji} **{issue.get('rule_name', 'Unknown Rule')}** ({severity.title()})\n"
                    report += f"  - **Issue:** {issue.get('description', 'No description')}\n"
                    report += f"  - **Suggestion:** {issue.get('suggestion', 'No suggestion provided')}\n\n"
            else:
                report += "No issues found for this section.\n\n"
        
        # Add scoring breakdown
        # report += "## Scoring Breakdown\n\n"
        # report += "- Starting Score: 100 points\n"
        # report += "- Critical Issues: -20 points each\n"
        # report += "- Major Issues: -10 points each\n"
        # report += "- Minor Issues: -5 points each\n\n"
        
        # Count issues by severity
        critical_count = sum(1 for section in sections_analysis for issue in section.get('issues', []) if issue.get('severity') == 'critical')
        major_count = sum(1 for section in sections_analysis for issue in section.get('issues', []) if issue.get('severity') == 'major')
        minor_count = sum(1 for section in sections_analysis for issue in section.get('issues', []) if issue.get('severity') == 'minor')
        
        if critical_count > 0:
            report += f"- Critical Issues Found: {critical_count} (-{critical_count * 20} points)\n"
        if major_count > 0:
            report += f"- Major Issues Found: {major_count} (-{major_count * 10} points)\n"
        if minor_count > 0:
            report += f"- Minor Issues Found: {minor_count} (-{minor_count * 5} points)\n"
        
        report += f"\n**Final Score: {compliance_score:.1f}/100**\n"
        
        return report
