# FasiAPI Backend Architecture

## Overview

This document describes the comprehensive architecture of the FasiAPI backend, a modern FastAPI-based application designed for document processing, AI-powered compliance analysis, and real-time chat functionality. The architecture follows industry-standard patterns and best practices for scalability, maintainability, and testability.

## Core Technologies

- **Framework**: FastAPI 0.115.6
- **Database**: MongoDB with Motor (async driver)
- **AI Integration**: Azure OpenAI, LlamaParse
- **WebSocket**: Native FastAPI WebSocket support
- **Authentication**: JWT with python-jose
- **File Processing**: aiofiles, python-multipart
- **Validation**: Pydantic 2.5.3
- **Testing**: pytest

## Architecture Patterns Implemented

### 1. Clean Architecture
- **Layers**: Domain, Application (Services), Infrastructure (Repositories), Presentation (API)
- **Dependency Rule**: Dependencies point inward toward the domain
- **Benefits**: Framework independence, testability, maintainability

### 2. Domain-Driven Design (DDD)
- **Domain Entities**: Located in `app/domain/entities/`
- **Business Logic**: Encapsulated in domain entities and services
- **Ubiquitous Language**: Consistent terminology across codebase

### 3. Repository Pattern
- **Purpose**: Abstracts data access logic from business logic
- **Location**: `app/repositories/`
- **Implementation**: Generic base repository with specific implementations
- **Benefits**: Database independence, testability, separation of concerns

### 4. Service Layer Pattern
- **Purpose**: Contains business logic and orchestrates between repositories
- **Location**: `app/services/`
- **Benefits**: Reusable business logic, transaction management, validation

### 5. Dependency Injection
- **Purpose**: Manages object creation and dependencies
- **Location**: `app/core/dependencies.py`
- **Implementation**: FastAPI's built-in dependency injection system
- **Benefits**: Loose coupling, easy testing, configuration management

### 6. Strategy Pattern
- **Purpose**: Different document analysis strategies
- **Location**: `app/services/analysis/`
- **Benefits**: Runtime strategy selection, extensibility

## Directory Structure

```
backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── __init__.py         # API router configuration
│   │       └── endpoints/          # API endpoints (thin layer)
│   │           ├── ai.py           # AI-related endpoints
│   │           ├── chat.py         # Chat endpoints
│   │           └── health.py       # Health check endpoints
│   ├── core/
│   │   ├── config.py              # Pydantic settings configuration
│   │   ├── database.py            # MongoDB connection management
│   │   ├── dependencies.py        # Dependency injection setup
│   │   ├── exceptions.py          # Custom exception hierarchy
│   │   └── logging.py             # Structured logging configuration
│   ├── db/                        # Database utilities (legacy)
│   ├── domain/
│   │   └── entities/              # Domain entities
│   │       ├── document.py        # Document domain model
│   │       ├── message.py         # Message domain model
│   │       └── user.py            # User domain model
│   ├── middleware/
│   │   ├── error_handler.py       # Global error handling
│   │   └── logging_middleware.py  # Request/response logging
│   ├── models/
│   │   └── chat.py                # Pydantic models for API
│   ├── repositories/
│   │   ├── base_repository.py     # Generic base repository
│   │   ├── chat_repository.py     # Chat data access
│   │   └── user_repository.py     # User data access
│   ├── services/
│   │   ├── ai_service.py          # AI integration service
│   │   ├── base_service.py        # Base service class
│   │   ├── chat_service.py        # Chat business logic
│   │   ├── document_config_service.py # Document configuration
│   │   ├── file_upload_service.py # File handling service
│   │   ├── upload.py              # Document upload & analysis
│   │   ├── websocket_service.py   # WebSocket management
│   │   └── analysis/              # Analysis strategies
│   ├── uploaded-files/            # File storage directory
│   ├── utils/                     # Utility functions
│   └── main.py                    # FastAPI application setup
├── .env.example                   # Environment variables template
├── requirements.txt               # Python dependencies
├── server.py                      # Application entry point
└── setup.py                       # Package setup configuration
```

## Key Components

### 1. Application Entry Point (`app/main.py`)
- FastAPI application factory with lifespan management
- CORS middleware configuration
- WebSocket endpoint registration
- Global error handling setup
- Database connection management

### 2. Configuration Management (`app/core/config.py`)
- Pydantic Settings-based configuration
- Environment variable validation
- CORS, database, and AI service settings
- Type-safe configuration with defaults

### 3. Database Layer (`app/core/database.py`)
- MongoDB connection using Motor (async)
- Connection pooling and health checks
- Database lifecycle management
- Error handling for database operations

### 4. Domain Entities (`app/domain/entities/`)
- **Document**: Document processing lifecycle, compliance analysis
- **Message**: Chat message structure with user information
- **User**: User representation for chat and document operations
- Rich domain models with business logic

### 5. Repository Layer (`app/repositories/`)
- **BaseRepository**: Generic CRUD operations with MongoDB
- **ChatRepository**: Message persistence and retrieval
- **UserRepository**: User data management
- Type-safe database operations with error handling

### 6. Service Layer (`app/services/`)
- **AIService**: Azure OpenAI integration for document analysis
- **ChatService**: Real-time messaging business logic
- **DocumentConfigService**: Document type configuration management
- **FileUploadService**: File processing and storage
- **WebSocketService**: Real-time communication management
- **Upload Service**: Document upload, parsing, and compliance analysis

### 7. API Layer (`app/api/v1/endpoints/`)
- **AI Endpoints**: Document analysis and AI-powered features
- **Chat Endpoints**: Message retrieval and room management
- **Health Endpoints**: System health monitoring
- RESTful API design with proper HTTP status codes

### 8. Middleware (`app/middleware/`)
- **Error Handler**: Global exception handling and logging
- **Logging Middleware**: Request/response logging with correlation IDs
- Centralized error response formatting

## Core Features

### 1. Document Processing & AI Analysis
- **File Upload**: Support for multiple document formats (PDF, Word, etc.)
- **Content Extraction**: LlamaParse integration for document parsing
- **Compliance Analysis**: Azure OpenAI-powered compliance checking
- **Report Generation**: Markdown-formatted compliance reports
- **Document Configuration**: Flexible document type management

### 2. Real-time Chat System
- **WebSocket Communication**: Real-time messaging with connection management
- **Room-based Chat**: Multi-room chat functionality
- **Message Persistence**: MongoDB-based message storage
- **User Management**: User profiles and authentication
- **Message Search**: Full-text search across chat history

### 3. AI Integration
- **Azure OpenAI**: GPT-4 integration for document analysis
- **Structured Responses**: JSON-formatted AI responses
- **Compliance Scoring**: Automated compliance assessment
- **Issue Categorization**: Systematic issue classification
- **Report Customization**: Configurable report formats

### 4. WebSocket Architecture
- **Connection Management**: Client connection lifecycle
- **Room Management**: Multi-room support with user presence
- **Message Broadcasting**: Real-time message distribution
- **Error Handling**: Graceful connection error recovery

## Design Principles

### 1. SOLID Principles
- **Single Responsibility**: Each service handles one business domain
- **Open/Closed**: Extensible through strategy patterns and interfaces
- **Liskov Substitution**: Repository implementations are interchangeable
- **Interface Segregation**: Focused interfaces for specific use cases
- **Dependency Inversion**: Services depend on abstractions, not implementations

### 2. Clean Architecture
- **Domain-Centric**: Business logic isolated in domain entities
- **Dependency Inversion**: Infrastructure depends on application layer
- **Framework Independence**: Core logic independent of FastAPI
- **Database Independence**: Repository pattern abstracts data access

### 3. Async-First Design
- **Non-blocking Operations**: Async/await throughout the stack
- **Concurrent Processing**: Multiple document processing
- **Real-time Communication**: WebSocket-based real-time features
- **Database Operations**: Motor for async MongoDB operations

## API Endpoints

### Health & Monitoring
- `GET /api/v1/health` - System health check
- `GET /api/v1/health/database` - Database connectivity check

### Document Processing
- `POST /api/v1/documents/upload/` - Upload and analyze documents
- Document analysis with compliance scoring
- Structured JSON responses with detailed reports

### AI Services
- `POST /api/v1/ai/analyze` - AI-powered document analysis
- `POST /api/v1/ai/chat` - AI chat interactions

### Chat System
- `GET /api/v1/chat/rooms/{room_name}/messages` - Retrieve room messages
- `GET /api/v1/chat/users/{user_id}/messages` - Get user messages
- `GET /api/v1/chat/rooms/{room_name}/search` - Search messages

### WebSocket Endpoints
- `ws://localhost:8000/ws/test` - WebSocket test endpoint
- `ws://localhost:8000/ws/{client_id}/{room_name}/{username}` - Chat WebSocket

## Environment Configuration

### Required Environment Variables
```bash
# Database
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=chatapp

# AI Services
AZURE_OPENAI_ENDPOINT=https://your-endpoint.openai.azure.com/
AZURE_OPEN_AI_KEY=your-api-key
LAMAPARSE_API_KEY=your-llamaparse-key

# Application
DEBUG=true
LOG_LEVEL=INFO
HOST=0.0.0.0
PORT=8000

# CORS
CORS_ORIGINS=["http://localhost:3000", "http://localhost:3001"]
```

## Benefits of This Architecture

### 1. Scalability
- **Microservice-Ready**: Clear service boundaries for future decomposition
- **Async Processing**: Non-blocking operations for high concurrency
- **Horizontal Scaling**: Stateless design supports load balancing
- **Resource Efficiency**: Async I/O minimizes resource consumption

### 2. Maintainability
- **Domain-Driven Design**: Business logic clearly separated and organized
- **Consistent Patterns**: Uniform approach across all components
- **Type Safety**: Pydantic models ensure data integrity
- **Clear Dependencies**: Explicit dependency injection

### 3. Testability
- **Dependency Injection**: Easy mocking of external dependencies
- **Repository Pattern**: Database operations easily testable
- **Service Layer**: Business logic isolated and testable
- **Domain Entities**: Pure business logic without framework dependencies

### 4. Developer Experience
- **Auto-generated Documentation**: FastAPI's automatic OpenAPI docs
- **Type Hints**: Full type safety with modern Python
- **Hot Reload**: Development server with automatic reloading
- **Structured Logging**: Comprehensive logging for debugging

### 5. Production Readiness
- **Error Handling**: Comprehensive exception handling and logging
- **Health Checks**: Database and system health monitoring
- **Configuration Management**: Environment-based configuration
- **Security**: CORS, input validation, and error sanitization

## Getting Started

### 1. Prerequisites
- Python 3.8+
- MongoDB 4.4+
- Azure OpenAI API access
- LlamaParse API key (optional)

### 2. Installation
```bash
# Clone the repository
git clone <repository-url>
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
# Set MongoDB URI, Azure OpenAI credentials, etc.
```

### 4. Database Setup
```bash
# Ensure MongoDB is running
# The application will create collections automatically
```

### 5. Run the Application
```bash
# Development mode with hot reload
python server.py

# Or using uvicorn directly
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 6. Access the Application
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/api/v1/health
- **WebSocket Test**: ws://localhost:8000/ws/test

## Testing Strategy

### Unit Tests
- **Domain Entities**: Test business logic in isolation
- **Services**: Mock repository dependencies
- **Repositories**: Test with in-memory database
- **API Endpoints**: Test with FastAPI TestClient

### Integration Tests
- **Database Operations**: Test with real MongoDB instance
- **External Services**: Test AI service integrations
- **WebSocket**: Test real-time communication

### Test Files
- `test_app.py` - Application-level tests
- `test_architecture.py` - Architecture validation tests

## Deployment Considerations

### Production Setup
- **Environment Variables**: Secure credential management
- **Database**: MongoDB Atlas or self-hosted cluster
- **File Storage**: Consider cloud storage for uploaded files
- **Logging**: Centralized logging with ELK stack or similar
- **Monitoring**: Application performance monitoring

### Docker Deployment
```dockerfile
# Example Dockerfile structure
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["python", "server.py"]
```

## Security Considerations

### Input Validation
- Pydantic models for request validation
- File type and size restrictions
- Content sanitization

### Error Handling
- No sensitive information in error responses
- Proper HTTP status codes
- Comprehensive logging without exposing secrets

### CORS Configuration
- Restricted origins in production
- Proper credential handling
- Security headers

## Future Enhancements

### 1. Enhanced Security
- JWT authentication implementation
- Role-based access control (RBAC)
- API rate limiting
- Input sanitization improvements

### 2. Performance Optimization
- Redis caching layer
- Database query optimization
- File processing optimization
- Connection pooling tuning

### 3. Monitoring & Observability
- Prometheus metrics integration
- Distributed tracing with Jaeger
- Application performance monitoring
- Custom health check endpoints

### 4. Feature Extensions
- Multi-language document support
- Advanced AI analysis features
- Document version control
- Collaborative editing capabilities

### 5. Infrastructure
- Kubernetes deployment manifests
- CI/CD pipeline setup
- Automated testing integration
- Database migration system

## Conclusion

This architecture represents a modern, scalable backend solution that combines document processing, AI-powered analysis, and real-time communication. The clean architecture principles, domain-driven design, and async-first approach provide a solid foundation for current requirements while maintaining flexibility for future enhancements.

The separation of concerns, comprehensive error handling, and type safety make the codebase maintainable and developer-friendly. The integration of cutting-edge AI services with traditional web application patterns demonstrates a balanced approach to modern software development.
