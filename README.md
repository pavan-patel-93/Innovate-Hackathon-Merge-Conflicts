# AI-Powered Document Compliance Platform

A comprehensive full-stack application that combines intelligent document processing, AI-powered compliance analysis, and real-time collaborative features. Built with modern technologies and enterprise-grade architecture for the Innovate Hackathon.

## 🚀 Project Overview

This platform revolutionizes document compliance management by leveraging cutting-edge AI technology to automatically analyze documents, identify compliance issues, and provide detailed reports. The system includes real-time chat functionality, advanced document configuration, and a modern, responsive user interface.

### 🎯 Key Features

#### 📄 AI-Powered Document Analysis
- **Multi-Format Support**: PDF, Word, Excel, and other document formats
- **Intelligent Compliance Checking**: Azure OpenAI GPT-4 integration
- **Real-time Processing**: Instant analysis with progress tracking
- **Comprehensive Reports**: Detailed markdown reports with categorized issues
- **Compliance Scoring**: Automated scoring with confidence metrics

#### 💬 Real-Time Communication
- **WebSocket Chat**: High-performance real-time messaging
- **Multi-Room Support**: Organized chat rooms with user presence
- **Message History**: Persistent chat with full-text search
- **File Sharing**: Document sharing within chat rooms

#### ⚙️ Document Configuration
- **Custom Document Types**: Configurable document structures
- **Section Management**: Define required/optional sections
- **Rule Configuration**: Custom validation rules with severity levels
- **Template System**: Reusable document templates

#### 🎨 Modern User Interface
- **Responsive Design**: Mobile-first approach with desktop optimization
- **Dark/Light Mode**: Theme switching with system preference detection
- **Component Library**: Built with shadcn/ui and Radix UI
- **Accessibility**: WCAG compliant with keyboard navigation

## 🏗 Architecture Overview

### Backend (FastAPI)
```
backend/
├── app/
│   ├── api/v1/endpoints/     # RESTful API endpoints
│   ├── core/                 # Configuration & infrastructure
│   ├── domain/entities/      # Business domain models
│   ├── middleware/           # Cross-cutting concerns
│   ├── repositories/         # Data access layer
│   ├── services/             # Business logic (12 modules)
│   └── main.py              # FastAPI application
├── tests/                    # Comprehensive test suite
└── requirements.txt          # Python dependencies
```

### Frontend (Next.js)
```
frontend/
├── src/
│   ├── app/                  # Next.js App Router
│   ├── components/           # Reusable UI components
│   │   ├── features/         # Feature-specific components
│   │   ├── layout/           # Layout components
│   │   └── ui/               # Base UI components
│   ├── hooks/                # Custom React hooks
│   ├── services/             # API integration
│   └── store/                # State management
├── public/                   # Static assets
└── package.json              # Node.js dependencies
```

## 🛠 Technology Stack

### Backend Technologies
- **FastAPI 0.115.6**: High-performance async web framework
- **Python 3.8+**: Modern Python with async/await support
- **MongoDB**: Document-oriented database with Motor driver
- **Azure OpenAI**: GPT-4 integration for document analysis
- **LlamaParse**: Advanced document parsing
- **WebSocket**: Real-time communication
- **JWT**: Stateless authentication
- **Pydantic**: Data validation and serialization

### Frontend Technologies
- **Next.js 14**: React framework with App Router
- **React 18**: Latest React with concurrent features
- **TypeScript**: Full type safety
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Modern component library
- **Zustand**: Lightweight state management
- **SWR**: Data fetching with caching
- **WebSocket**: Real-time communication

## 📋 Prerequisites

Before setting up the project locally, ensure you have the following installed:

### System Requirements
- **Node.js**: Version 18.17 or later
- **Python**: Version 3.8 or later
- **MongoDB**: Version 4.4 or later
- **Git**: Latest version

### API Keys Required
- **Azure OpenAI API Key**: For document analysis
- **LlamaParse API Key**: For document parsing (optional)

## 🚦 Local Development Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Innovate-Hackathon-Merge-Conflicts
```

### 2. Backend Setup

#### Install Python Dependencies
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

#### Configure Environment Variables
```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your configuration
```

**Backend Environment Variables (.env):**
```env
# Application
APP_NAME="AI Document Compliance Platform"
DEBUG=true
HOST=0.0.0.0
PORT=8000
LOG_LEVEL=INFO

# Security
SECRET_KEY=your-secret-key-change-this-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Database
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=compliance_platform

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# AI Services
AZURE_OPENAI_KEY=your_azure_openai_key_here
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=gpt-4
LAMAPARSE_API_KEY=your_lamaparse_api_key_here

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=app/uploaded-files

# Analysis
ENABLE_AI_ANALYSIS=true
ANALYSIS_TIMEOUT=300
```

#### Start MongoDB
```bash
# Start MongoDB service
# On Windows (if installed as service):
net start MongoDB

# On macOS (with Homebrew):
brew services start mongodb-community

# On Linux (with systemd):
sudo systemctl start mongod
```

#### Run Backend Server
```bash
# From backend directory
python server.py

# Or using uvicorn directly
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The backend will be available at:
- **API**: http://localhost:8000
- **Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/api/v1/health

### 3. Frontend Setup

#### Install Node.js Dependencies
```bash
cd frontend

# Install dependencies
npm install
# or
yarn install
# or
pnpm install
```

#### Configure Environment Variables
```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local file with your configuration
```


#### Run Frontend Development Server
```bash
# From frontend directory
npm run dev
# or
yarn dev
# or
pnpm dev
```

The frontend will be available at:
- **Application**: http://localhost:3000


#### Health & Monitoring
- `GET /api/v1/health` - System health check
- `GET /api/v1/health/database` - Database connectivity

#### Document Processing
- `POST /api/v1/documents/upload/` - Upload and analyze documents
- `GET /api/v1/documents/{id}` - Get document details


#### Document Configuration
- `GET /api/v1/setup/document-types` - List document types
- `POST /api/v1/setup/document-types` - Create document type
- `PUT /api/v1/setup/document-types/{id}` - Update document type


## 🔒 Security Considerations

### Production Security Checklist
- [ ] Change default secret keys
- [ ] Use environment-specific configuration
- [ ] Enable HTTPS in production
- [ ] Configure proper CORS origins
- [ ] Set up rate limiting
- [ ] Implement proper authentication
- [ ] Secure database connections
- [ ] Validate all inputs
- [ ] Enable security headers

## 🚀 Deployment

### Backend Deployment
```bash
# Build for production
pip install -r requirements.txt

# Set production environment variables
export DEBUG=false
export SECRET_KEY=your-production-secret

# Run with production server
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Frontend Deployment
```bash
# Build for production
npm run build

# Start production server
npm run start

# Or deploy to Vercel/Netlify
```

### Docker Deployment
```bash
# Backend Dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["python", "server.py"]

# Frontend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🐛 Troubleshooting

### Common Issues

#### Backend Issues
1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in .env file
   - Verify database permissions

2. **Azure OpenAI API Error**
   - Verify API key and endpoint
   - Check API quota and limits
   - Ensure correct deployment name

3. **Port Already in Use**
   - Change PORT in .env file
   - Kill existing processes: `lsof -ti:8000 | xargs kill`

#### Frontend Issues
1. **API Connection Error**
   - Verify backend is running
   - Check NEXT_PUBLIC_API_URL in .env.local
   - Verify CORS configuration

2. **Build Errors**
   - Clear node_modules and reinstall
   - Check TypeScript errors
   - Verify environment variables

### Debug Mode
```bash
# Backend debug mode
export DEBUG=true
export LOG_LEVEL=DEBUG
python server.py

# Frontend debug mode
npm run dev
```

## 📈 Performance Optimization

### Backend Optimization
- Enable MongoDB indexing
- Implement Redis caching
- Use connection pooling
- Optimize database queries
- Enable compression

### Frontend Optimization
- Enable Next.js image optimization
- Implement code splitting
- Use SWR for data caching
- Optimize bundle size
- Enable compression

## 🤝 Contributing

### Development Guidelines
1. Follow existing code style and patterns
2. Write comprehensive tests
3. Update documentation
4. Use meaningful commit messages
5. Create feature branches for new development

### Code Style
- **Backend**: Follow PEP 8 and use type hints
- **Frontend**: Use TypeScript and ESLint configuration
- **Git**: Use conventional commit messages

## 📞 Support

### Getting Help
- Check existing documentation
- Review API documentation at `/docs`
- Check troubleshooting section
- Review logs for error details

### Resources
- **Backend Documentation**: http://localhost:8000/docs
- **Frontend Components**: Storybook (if configured)
- **Database**: MongoDB Compass for GUI
- **API Testing**: Use Postman or curl

## 🎉 Features Showcase

### Document Analysis Demo
1. Navigate to the dashboard
2. Upload a document (PDF/Word)
3. Watch real-time analysis progress
4. Review compliance report with categorized issues
5. Download detailed analysis report

### Real-Time Chat Demo
1. Open multiple browser tabs
2. Join the same chat room
3. Send messages and see real-time updates
4. Test file sharing functionality
5. Search through message history

### Document Configuration Demo
1. Go to Setup section
2. Create a new document type
3. Add custom sections and rules
4. Test with document upload
5. See custom validation in action

---

**Built with ❤️ for the Innovate Hackathon - Showcasing the future of AI-powered document compliance**

## 📊 Project Statistics

- **Backend Modules**: 63 well-organized modules
- **Frontend Components**: 26+ reusable components
- **API Endpoints**: 15+ RESTful endpoints
- **WebSocket Endpoints**: Real-time communication
- **Test Coverage**: Comprehensive test suite
- **Documentation**: Complete API and user documentation
