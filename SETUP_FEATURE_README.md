# Document Type Setup Feature

This feature allows users to configure document types with custom sections and validation rules for compliance checking.

## Features

### 1. Document Type Management
- **Create**: Add new document types with unique codes
- **Edit**: Modify existing document type configurations
- **Delete**: Remove document types (with confirmation)
- **View**: Browse all configured document types in a data table

### 2. General Settings
- **Document Code**: Unique identifier (e.g., "SOP", "PROTOCOL")
- **Document Name**: Human-readable name
- **Description**: Detailed description of the document type
- **ID Format**: Template for document IDs (e.g., "SOP-###", "PROTOCOL-YYYY-###")

### 3. Document Sections Management
- **Add Sections**: Define document structure with required/optional sections
- **Reorder Sections**: Drag-and-drop reordering (visual indicator with grip handle)
- **Section Properties**:
  - Name and description
  - Order/position in document
  - Required/Optional toggle
  - Rules configuration

### 4. Rules Management
- **Predefined Rules**: Built-in validation rules that can be applied to sections
- **Rule Types**:
  - **Content Rules**: Length validation, keyword requirements
  - **Format Rules**: Structure validation, forbidden content
  - **Structure Rules**: Required subsections, table format validation
- **Rule Configuration**:
  - Enable/disable rules per section
  - Customize rule parameters
  - Set rule severity (Critical, Major, Minor)
  - Visual severity indicators

## Database Schema

### Document Type Configuration Collection
```json
{
  "id": "uuid",
  "code": "SOP",
  "name": "Standard Operating Procedures",
  "description": "Description of the document type",
  "id_format": "SOP-###",
  "sections": [
    {
      "name": "Introduction",
      "description": "Section description",
      "order": 1,
      "is_required": true,
      "rules": [
        {
          "rule_id": "CONTENT-001",
          "name": "Minimum Content Length",
          "description": "Rule description",
          "is_active": true,
          "severity": "major",
          "parameters": {
            "min_chars": 100
          }
        }
      ]
    }
  ],
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z",
  "created_by": "username"
}
```

## API Endpoints

### Document Types
- `GET /api/v1/setup/document-types` - List all document types
- `GET /api/v1/setup/document-types/{id}` - Get specific document type
- `POST /api/v1/setup/document-types` - Create new document type
- `PUT /api/v1/setup/document-types/{id}` - Update document type
- `DELETE /api/v1/setup/document-types/{id}` - Delete document type

### Section Management
- `PUT /api/v1/setup/document-types/{id}/sections/reorder` - Reorder sections
- `POST /api/v1/setup/document-types/{id}/sections/{name}/rules` - Add section rule
- `PUT /api/v1/setup/document-types/{id}/sections/{name}/rules/{rule_id}` - Update section rule
- `DELETE /api/v1/setup/document-types/{id}/sections/{name}/rules/{rule_id}` - Delete section rule

### Predefined Rules
- `GET /api/v1/setup/predefined-rules` - Get available rule templates

## Predefined Rules

### Content Rules
- **CONTENT-001**: Minimum Content Length
- **CONTENT-002**: Maximum Content Length

### Format Rules
- **FORMAT-001**: Required Keywords
- **FORMAT-002**: Forbidden Keywords

### Structure Rules
- **STRUCTURE-001**: Required Subsections
- **STRUCTURE-002**: Table Format Validation

## Usage

1. **Access Setup**: Click "Setup" in the main navigation
2. **Create Document Type**: Click "New Document Type" button
3. **Configure General Settings**: Fill in basic information
4. **Add Sections**: Switch to "Document Sections" tab and add sections
5. **Configure Rules**: Click the settings icon next to each section to add rules
6. **Save**: Save the configuration

## Sample Data

The system includes sample data for:
- **SOP (Standard Operating Procedures)**: Manufacturing and quality control processes
- **PROTOCOL (Clinical Study Protocol)**: Drug development and research protocols

## Technical Implementation

### Backend
- **Models**: Pydantic models for data validation
- **Service Layer**: Business logic for CRUD operations
- **API Endpoints**: FastAPI routes with proper error handling
- **Database**: MongoDB for flexible document storage

### Frontend
- **React Components**: Modular component architecture
- **State Management**: Local state with React hooks
- **API Integration**: Axios-based API client
- **UI/UX**: Modern interface with Tailwind CSS

## Future Enhancements

- Drag-and-drop section reordering
- Rule templates and sharing
- Bulk import/export of configurations
- Advanced rule conditions and logic
- Integration with document analysis engine
- Audit trail and version history
