# AI-Powered Document Compliance Platform - Frontend

A modern, feature-rich Next.js application that provides AI-powered document compliance analysis, real-time chat functionality, and comprehensive document management capabilities. Built with cutting-edge technologies and modern UI/UX principles.

## 🚀 Key Features

### 📄 Document Processing & Compliance
- **AI-Powered Analysis**: Intelligent document compliance checking using Azure OpenAI
- **Multi-Format Support**: Upload and process PDF, Word, and other document formats
- **Real-time Analysis**: Instant compliance scoring and issue identification
- **Comprehensive Reports**: Detailed markdown reports with categorized issues
- **Document Configuration**: Flexible document type management and validation

### 💬 Real-Time Communication
- **WebSocket Chat**: Real-time messaging with instant updates
- **Multi-Room Support**: Organized chat rooms for different topics
- **Message History**: Persistent chat history with search functionality
- **User Management**: User profiles and authentication system
- **Presence Indicators**: Real-time user presence and activity status

### 🎨 Modern UI/UX
- **Responsive Design**: Mobile-first approach with seamless desktop experience
- **Dark/Light Mode**: Built-in theme switching with system preference detection
- **Component Library**: Comprehensive UI components using Radix UI and shadcn/ui
- **Smooth Animations**: Tailwind CSS animations and transitions
- **Accessibility**: WCAG compliant with keyboard navigation support

### 🔐 Authentication & Security
- **NextAuth Integration**: Secure authentication with multiple providers
- **JWT Tokens**: Stateless authentication with refresh token support
- **Protected Routes**: Route-level authentication guards
- **Session Management**: Automatic session handling and renewal

## 🛠 Technology Stack

### Core Framework
- **Next.js 14**: React framework with App Router and server-side rendering
- **React 18**: Latest React with concurrent features and hooks
- **TypeScript**: Full type safety throughout the application

### UI & Styling
- **Tailwind CSS 3.4**: Utility-first CSS framework with custom design system
- **Radix UI**: Unstyled, accessible UI primitives
- **shadcn/ui**: Beautiful, reusable components built on Radix UI
- **Lucide React**: Modern icon library with 1000+ icons
- **Geist Font**: Modern, readable typography

### State Management & Data
- **Zustand**: Lightweight state management solution
- **SWR**: Data fetching with caching, revalidation, and error handling
- **React Hook Form**: Performant forms with easy validation
- **Axios**: HTTP client for API communication

### Database & Backend Integration
- **MongoDB**: Document database with Mongoose ODM
- **Supabase**: Backend-as-a-Service for additional features
- **Redis**: Caching and session storage

### Development Tools
- **ESLint**: Code linting with Next.js configuration
- **PostCSS**: CSS processing with Autoprefixer
- **Class Variance Authority**: Type-safe component variants

## 📁 Project Architecture

```
frontend/
├── public/                     # Static assets
│   └── robots.txt             # SEO configuration
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── api/              # API routes (15 endpoints)
│   │   ├── dashboard/        # Dashboard pages
│   │   ├── login/           # Authentication pages
│   │   ├── signup/          # User registration
│   │   ├── globals.css      # Global styles with CSS variables
│   │   ├── layout.jsx       # Root layout with providers
│   │   ├── middleware.js    # Route protection middleware
│   │   └── page.jsx         # Home page with tab navigation
│   ├── components/           # Reusable UI components
│   │   ├── AuthComponents.jsx # Authentication components
│   │   ├── Setup/           # Setup and configuration components
│   │   ├── common/          # Shared UI components (4 items)
│   │   ├── features/        # Feature-specific components
│   │   │   ├── chat/        # Real-time chat components (3 items)
│   │   │   ├── dashboard/   # Dashboard widgets (5 items)
│   │   │   └── setup/       # Setup flow components (4 items)
│   │   ├── layout/          # Layout components (3 items)
│   │   └── ui/              # Base UI components (5 items)
│   ├── contexts/            # React contexts for global state
│   ├── hooks/               # Custom React hooks (9 hooks)
│   ├── lib/                 # Utility libraries (7 utilities)
│   ├── models/              # Data models and types (2 models)
│   ├── services/            # API services and integrations (4 services)
│   └── store/               # Zustand store configuration
├── .env.example             # Environment variables template
├── .eslintrc.json          # ESLint configuration
├── components.json         # shadcn/ui configuration
├── jsconfig.json          # JavaScript configuration
├── next.config.js         # Next.js configuration
├── package.json           # Dependencies and scripts
├── postcss.config.js      # PostCSS configuration
└── tailwind.config.js     # Tailwind CSS configuration with custom theme
```

## 🎯 Core Application Features

### Dashboard
- **Analytics Overview**: Document processing statistics and compliance metrics
- **Recent Activity**: Latest document uploads and analysis results
- **Quick Actions**: Fast access to common operations
- **Status Indicators**: Real-time system health and processing status

### Document Analysis
- **Drag & Drop Upload**: Intuitive file upload with progress indicators
- **Processing Pipeline**: Visual feedback during document analysis
- **Compliance Scoring**: AI-powered compliance assessment with detailed breakdown
- **Issue Categorization**: Organized issue reporting with severity levels
- **Export Options**: Download reports in multiple formats

### Chat System
- **Real-time Messaging**: Instant message delivery with WebSocket connection
- **Room Management**: Create and join different chat rooms
- **Message Search**: Full-text search across chat history
- **File Sharing**: Share documents and files within chat
- **User Presence**: See who's online and active

### Setup & Configuration
- **Guided Setup**: Step-by-step application configuration
- **Document Types**: Configure supported document formats and validation rules
- **AI Settings**: Customize AI analysis parameters and thresholds
- **User Preferences**: Personalize UI settings and notifications

## 🚦 Getting Started

### Prerequisites
- **Node.js**: Version 18.17 or later
- **Package Manager**: npm, yarn, or pnpm
- **Backend API**: Ensure the FastAPI backend is running

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd frontend
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Environment Configuration**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000

# Authentication
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/your-database
REDIS_URL=redis://localhost:6379

# Supabase (optional)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-key
```

### Development

**Start the development server:**
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

**Access the application:**
- **Frontend**: http://localhost:3000
- **API Documentation**: http://localhost:8000/docs (backend)

## 📋 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build optimized production bundle
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code quality checks

## 🎨 UI Components & Design System

### Component Categories
- **Layout Components**: Navigation, sidebars, headers, and page layouts
- **Form Components**: Input fields, buttons, selectors with validation
- **Data Display**: Tables, cards, lists, and charts
- **Feedback**: Alerts, toasts, loading states, and progress indicators
- **Navigation**: Tabs, breadcrumbs, pagination, and menus

### Design Tokens
- **Colors**: Comprehensive color palette with semantic naming
- **Typography**: Consistent font scales and hierarchy
- **Spacing**: Standardized spacing system
- **Shadows**: Layered shadow system for depth
- **Animations**: Smooth transitions and micro-interactions

## 🔧 Configuration & Customization

### Tailwind Configuration
The application uses a custom Tailwind configuration with:
- **Custom Color Palette**: Extended color system with semantic colors
- **Component Variants**: Predefined component styles
- **Responsive Breakpoints**: Mobile-first responsive design
- **Animation System**: Custom animations and transitions

### Component Customization
Components are built with flexibility in mind:
- **Variant System**: Multiple visual variants for each component
- **Theme Support**: Dark/light mode with CSS variables
- **Size Options**: Consistent sizing across components
- **Accessibility**: Built-in ARIA attributes and keyboard navigation

## 🚀 Deployment

### Production Build
```bash
npm run build
npm run start
```

### Deployment Options
- **Vercel**: Optimized for Next.js with automatic deployments
- **Netlify**: Static site deployment with serverless functions
- **Docker**: Containerized deployment for any platform
- **Traditional Hosting**: Build static files for any web server

### Environment Variables
Ensure all production environment variables are configured:
- API endpoints
- Authentication secrets
- Database connections
- Third-party service keys

## 🧪 Testing Strategy

### Testing Approach
- **Unit Tests**: Component logic and utility functions
- **Integration Tests**: API integration and user flows
- **E2E Tests**: Complete user journey testing
- **Accessibility Tests**: WCAG compliance validation

## 📈 Performance Optimizations

### Built-in Optimizations
- **Image Optimization**: Next.js automatic image optimization
- **Code Splitting**: Automatic route-based code splitting
- **Bundle Analysis**: Built-in bundle analyzer
- **Caching Strategy**: Intelligent caching for API responses

### Performance Features
- **Lazy Loading**: Components and routes loaded on demand
- **Prefetching**: Intelligent prefetching of likely-needed resources
- **Compression**: Gzip compression for all assets
- **CDN Ready**: Optimized for CDN deployment

## 🔒 Security Features

### Security Measures
- **Input Validation**: Comprehensive input sanitization
- **XSS Protection**: Built-in XSS prevention
- **CSRF Protection**: Cross-site request forgery protection
- **Secure Headers**: Security headers configuration
- **Authentication**: Secure JWT-based authentication

## 🤝 Contributing

### Development Guidelines
- Follow TypeScript best practices
- Use ESLint configuration for code consistency
- Implement responsive design principles
- Ensure accessibility compliance
- Write comprehensive component documentation

### Code Style
- Use functional components with hooks
- Implement proper error boundaries
- Follow naming conventions
- Use TypeScript for type safety
- Document complex logic

## 📞 Support & Documentation

### Resources
- **Component Storybook**: Interactive component documentation
- **API Documentation**: Comprehensive API reference
- **User Guide**: End-user documentation
- **Developer Guide**: Technical implementation details

## 🎉 Positive Features & Highlights

### User Experience
- **Intuitive Interface**: Clean, modern design with excellent usability
- **Fast Performance**: Optimized loading times and smooth interactions
- **Mobile Responsive**: Seamless experience across all devices
- **Accessibility**: Full keyboard navigation and screen reader support

### Developer Experience
- **Type Safety**: Full TypeScript implementation with strict typing
- **Hot Reload**: Instant feedback during development
- **Component Library**: Comprehensive, reusable component system
- **Modern Tooling**: Latest development tools and best practices

### Technical Excellence
- **Scalable Architecture**: Clean separation of concerns and modular design
- **Performance Optimized**: Built-in optimizations and best practices
- **Security Focused**: Comprehensive security measures and validation
- **Production Ready**: Robust error handling and monitoring capabilities

---

**Built with ❤️ using modern web technologies for the Innovate Hackathon**
