# ComplianceAI - AI-Powered Compliance Assistant

A modern compliance validation platform built with Next.js, featuring AI-powered document analysis and GxP compliance checking for Healthtech companies.

## 🚀 Features

- **Authentication System**: Secure login for compliance analysts and QA professionals
- **Document Upload**: Support for Word, PDF, and text document uploads
- **AI-Powered Analysis**: Automated compliance validation using GxP rules
- **Compliance Scoring**: 0-100 scoring system with severity-weighted issues
- **Issue Detection**: Identifies missing sections, stale references, and placeholders
- **Responsive Design**: Professional dashboard that works on all devices
- **Modern UI**: Clean, compliance-focused interface with dark mode support
- **Audit Trail**: Complete document analysis history and reporting

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── login/          # Login page
│   │   ├── chat/           # Main chat application
│   │   ├── page.jsx        # Home page (redirects based on auth)
│   │   └── layout.jsx      # Root layout
│   ├── components/
│   │   ├── realTimeChat.jsx    # Chat component
│   │   ├── chatMessageItem.jsx # Message display component
│   │   └── ui/                 # Reusable UI components
│   ├── hooks/
│   │   ├── useAuth.js          # Authentication hook
│   │   ├── useRealTimeChat.jsx # WebSocket chat hook
│   │   └── useChatScroll.jsx   # Auto-scroll hook
│   ├── store/
│   │   └── auth.js             # Authentication state management
│   └── services/
│       └── auth.js             # Authentication service
```

## 🛠️ Setup & Installation

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Start the backend server:**
   ```bash
   cd ../backend
   python start_server.py
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000`

## 🔐 Authentication

The app uses a demo authentication system that accepts any username and password:

- **Login**: Enter any username and password to sign in
- **Registration**: Create a new account with username, email, and password
- **Persistence**: User sessions are stored in localStorage
- **Auto-redirect**: Automatically redirects to chat after login

## 💬 Chat Features

### Room Management
- **Default Rooms**: general, random, tech, gaming
- **Create Rooms**: Add new chat rooms with custom names
- **Search Rooms**: Find rooms by name
- **Room Switching**: Switch between different rooms instantly

### Messaging
- **Real-time**: Messages appear instantly for all users
- **Message History**: Previous messages are loaded when joining a room
- **User Identification**: Messages show sender's username
- **Timestamps**: Each message includes creation time
- **Auto-scroll**: Chat automatically scrolls to new messages

### WebSocket Integration
- **Connection Status**: Visual indicator of WebSocket connection
- **Auto-reconnect**: Automatically reconnects if connection is lost
- **Error Handling**: Graceful handling of connection errors
- **Message Broadcasting**: Messages are broadcast to all room members

## 🎨 UI Components

### Login Page (`/login`)
- Clean, centered login form
- Toggle between login and registration
- Form validation with error messages
- Loading states and animations
- Responsive design

### Chat Page (`/chat`)
- **Sidebar**: Room list, user info, and room creation
- **Main Area**: Chat messages and input field
- **Header**: Room information and settings
- **Full-screen**: Takes up entire viewport
- **Responsive**: Adapts to different screen sizes

## 🔧 Configuration

### WebSocket URL
The WebSocket connection URL is configured in:
- `src/hooks/useRealTimeChat.jsx` (default: `ws://localhost:8000`)
- Environment variable: `NEXT_PUBLIC_WS_URL`

### Backend Integration
The app expects the backend to be running on:
- **WebSocket**: `ws://localhost:8000/ws/{client_id}/{room_name}/{username}`
- **API**: `http://localhost:8000/api/v1/` (for future features)

## 🚀 Usage

1. **Start the application** and you'll be redirected to the login page
2. **Sign in** with any username and password (demo mode)
3. **Join a room** by clicking on room names in the sidebar
4. **Create new rooms** using the "Create room" input
5. **Send messages** by typing in the message input and pressing Enter
6. **Switch rooms** to chat in different channels
7. **Logout** using the logout button in the sidebar

## 🎯 Key Improvements Made

1. **Full Authentication Flow**: Complete login/registration system
2. **Full-screen Layout**: Chat now takes up the entire viewport
3. **Room Management**: Create, join, and switch between chat rooms
4. **Better UX**: Loading states, error handling, and smooth transitions
5. **Responsive Design**: Works on desktop, tablet, and mobile
6. **Modern UI**: Clean, professional interface with proper spacing
7. **WebSocket Integration**: Real-time messaging with connection management

## 🔮 Future Enhancements

- User avatars and profiles
- Message reactions and emojis
- File sharing and media messages
- Private messaging
- User presence indicators
- Message search and history
- Push notifications
- Mobile app (React Native)

## 🐛 Troubleshooting

### WebSocket Connection Issues
- Ensure backend server is running on port 8000
- Check browser console for WebSocket errors
- Verify WebSocket URL configuration

### Authentication Issues
- Clear localStorage if experiencing login problems
- Check browser console for authentication errors
- Ensure all required fields are filled

### UI Issues
- Refresh the page if components don't load properly
- Check browser console for React errors
- Ensure all dependencies are installed

---

**Note**: This is a demo application with simplified authentication. In production, you would integrate with a proper backend authentication system.
