# app/services/sample_data.py
from app.db.mongodb import get_database
from app.services.document_type_service import DocumentTypeService
from app.models.chat import DocumentTypeCreate, DocumentSection, SectionRule

async def initialize_sample_data():
    """Initialize sample document type configurations"""
    db = await get_database()
    service = DocumentTypeService(db)
    
    # Check if sample data already exists
    existing_types = await service.get_document_types()
    if existing_types:
        print("Sample data already exists, skipping initialization")
        return
    
    # Create sample SOP document type
    sop_sections = [
        DocumentSection(
            name="Introduction",
            description="Overview and purpose of the SOP",
            order=1,
            is_required=True,
            rules=[
                SectionRule(
                    rule_id="CONTENT-001",
                    name="Minimum Content Length",
                    description="Ensures section has minimum character count",
                    is_active=True,
                    severity="major",
                    parameters={"min_chars": 100}
                )
            ]
        ),
        DocumentSection(
            name="Scope",
            description="Defines the scope and applicability",
            order=2,
            is_required=True,
            rules=[
                SectionRule(
                    rule_id="FORMAT-001",
                    name="Required Keywords",
                    description="Ensures section contains specific keywords",
                    is_active=True,
                    severity="critical",
                    parameters={"keywords": ["scope", "applicable", "purpose"]}
                )
            ]
        ),
        DocumentSection(
            name="Responsibilities",
            description="Defines roles and responsibilities",
            order=3,
            is_required=True,
            rules=[]
        ),
        DocumentSection(
            name="Procedure",
            description="Step-by-step procedure",
            order=4,
            is_required=True,
            rules=[
                SectionRule(
                    rule_id="STRUCTURE-001",
                    name="Required Subsections",
                    description="Ensures section contains specific subsections",
                    is_active=True,
                    severity="critical",
                    parameters={"subsections": ["steps", "verification", "documentation"]}
                )
            ]
        ),
        DocumentSection(
            name="References",
            description="Related documents and standards",
            order=5,
            is_required=False,
            rules=[]
        )
    ]
    
    sop_doc_type = DocumentTypeCreate(
        code="SOP",
        name="Standard Operating Procedures",
        description="Standard operating procedures for manufacturing and quality control processes",
        id_format="SOP-###",
        sections=sop_sections
    )
    
    # Create sample Protocol document type
    protocol_sections = [
        DocumentSection(
            name="Protocol Title",
            description="Clear and descriptive title",
            order=1,
            is_required=True,
            rules=[
                SectionRule(
                    rule_id="FORMAT-001",
                    name="Required Keywords",
                    description="Ensures title contains required keywords",
                    is_active=True,
                    severity="critical",
                    parameters={"keywords": ["protocol", "study", "clinical"]}
                )
            ]
        ),
        DocumentSection(
            name="Objectives",
            description="Study objectives and endpoints",
            order=2,
            is_required=True,
            rules=[]
        ),
        DocumentSection(
            name="Methodology",
            description="Study design and methodology",
            order=3,
            is_required=True,
            rules=[
                SectionRule(
                    rule_id="CONTENT-002",
                    name="Maximum Content Length",
                    description="Ensures section doesn't exceed maximum character count",
                    is_active=True,
                    severity="minor",
                    parameters={"max_chars": 5000}
                )
            ]
        ),
        DocumentSection(
            name="Statistical Analysis",
            description="Statistical methods and analysis plan",
            order=4,
            is_required=True,
            rules=[]
        ),
        DocumentSection(
            name="Safety Considerations",
            description="Safety monitoring and reporting",
            order=5,
            is_required=True,
            rules=[]
        )
    ]
    
    protocol_doc_type = DocumentTypeCreate(
        code="PROTOCOL",
        name="Clinical Study Protocol",
        description="Clinical study protocols for drug development and research",
        id_format="PROTOCOL-YYYY-###",
        sections=protocol_sections
    )
    
    try:
        await service.create_document_type(sop_doc_type, "system")
        await service.create_document_type(protocol_doc_type, "system")
        print("Sample data initialized successfully")
    except Exception as e:
        print(f"Error initializing sample data: {e}")

if __name__ == "__main__":
    import asyncio
    asyncio.run(initialize_sample_data())
