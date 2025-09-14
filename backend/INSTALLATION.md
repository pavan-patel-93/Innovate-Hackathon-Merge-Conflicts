# FasiAPI Backend Installation Guide

## Quick Start

### Option 1: Automated Setup (Recommended)

```bash
# Run the setup script
python setup.py
```

The setup script will:
- Check Python version compatibility
- Install dependencies (full or minimal)
- Create a `.env` file with default configuration
- Provide next steps

### Option 2: Manual Installation

#### 1. Install Dependencies

**For full installation (with monitoring):**
```bash
pip install -r requirements.txt
```

**For minimal installation (core features only):**
```bash
pip install -r requirements-minimal.txt
```

#### 2. Create Environment File

Create a `.env` file in the backend directory:

```bash
# Copy the example
cp .env.example .env
# Or create manually
touch .env
```

#### 3. Configure Environment

Edit the `.env` file with your settings:

```env
# Application Settings
DEBUG=true
LOG_LEVEL=INFO
SECRET_KEY=your-secret-key-change-in-production

# Database Settings
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=chatapp

# CORS Settings
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# AI Services (Optional)
AZURE_OPENAI_KEY=your_azure_openai_key_here
AZURE_OPENAI_ENDPOINT=your_azure_openai_endpoint_here
LAMAPARSE_API_KEY=your_lamaparse_api_key_here
```

## Prerequisites

### Required
- **Python 3.8+**
- **MongoDB** (running locally or accessible)

### Optional
- **Redis** (for caching)
- **Azure OpenAI** (for AI features)
- **LlamaParse** (for document processing)

## Running the Application

### Development Mode
```bash
python server.py
```

### Direct Uvicorn
```bash
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Production Mode
```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## Verification

After starting the application, verify it's working:

1. **Health Check**: http://localhost:8000/api/v1/health
2. **API Documentation**: http://localhost:8000/docs
3. **Application Info**: http://localhost:8000/info

## Troubleshooting

### Common Issues

#### 1. Dependency Installation Errors
```bash
# If you get version conflicts, try:
pip install --upgrade pip
pip install -r requirements-minimal.txt
```

#### 2. MongoDB Connection Issues
- Ensure MongoDB is running
- Check the MONGODB_URI in your .env file
- Verify MongoDB is accessible from your application

#### 3. Port Already in Use
```bash
# Use a different port
python -m uvicorn app.main:app --reload --port 8001
```

#### 4. Import Errors
```bash
# Make sure you're in the backend directory
cd backend
python server.py
```

### Getting Help

1. Check the logs for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure all dependencies are installed
4. Check MongoDB connection

## Development

### Project Structure
```
backend/
├── app/
│   ├── core/           # Core application components
│   ├── domain/         # Business entities
│   ├── repositories/   # Data access layer
│   ├── services/       # Business logic layer
│   ├── api/           # API endpoints
│   └── main.py        # Main application
├── requirements.txt   # Full dependencies
├── requirements-minimal.txt  # Minimal dependencies
├── setup.py          # Setup script
└── server.py         # Server startup script
```

### Adding New Features

1. **Domain Layer**: Add entities in `app/domain/entities/`
2. **Repository Layer**: Add data access in `app/repositories/`
3. **Service Layer**: Add business logic in `app/services/`
4. **API Layer**: Add endpoints in `app/api/v1/endpoints/`

## Production Deployment

### Environment Variables
Set these in your production environment:

```env
DEBUG=false
LOG_LEVEL=WARNING
SECRET_KEY=your-production-secret-key
MONGODB_URI=your-production-mongodb-uri
CORS_ORIGINS=your-production-frontend-urls
```

### Security Considerations
- Use strong, unique secret keys
- Restrict CORS origins to your actual domains
- Use environment variables for sensitive data
- Enable HTTPS in production
- Set up proper logging and monitoring

## Support

For issues and questions:
1. Check the documentation in `INDUSTRY_STANDARD_ARCHITECTURE.md`
2. Review the refactoring summary in `REFACTORING_SUMMARY.md`
3. Check the application logs for detailed error information
