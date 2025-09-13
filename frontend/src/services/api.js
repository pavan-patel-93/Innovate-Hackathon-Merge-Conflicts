import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await api.post('/api/v1/auth/refresh', {
            refresh_token: refreshToken,
          });
          
          const { access_token, refresh_token: newRefreshToken } = response.data;
          localStorage.setItem('access_token', access_token);
          localStorage.setItem('refresh_token', newRefreshToken);
          
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Chat API functions
export const chatAPI = {
  // Get chat messages for a room
  getMessages: async (roomName) => {
    try {
      const response = await api.get(`/api/v1/rooms/${roomName}/messages`);
      return response.data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  },

  // Send a message via WebSocket (handled by WebSocket connection)
  sendMessage: async (messageData) => {
    // This will be handled by WebSocket connection
    return messageData;
  }
};

// Document Analysis API functions
export const documentAPI = {
  // Upload and analyze a document
  uploadDocument: async (file, userId) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('user_id', userId);

      const response = await api.post('/api/v1/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  },

  // Analyze a document
  analyzeDocument: async (documentId) => {
    try {
      const response = await api.post(`/api/v1/documents/${documentId}/analyze`);
      return response.data;
    } catch (error) {
      console.error('Error analyzing document:', error);
      throw error;
    }
  },

  // Get document analysis results
  getAnalysisResults: async (documentId) => {
    try {
      const response = await api.get(`/api/v1/documents/${documentId}/analysis`);
      return response.data;
    } catch (error) {
      console.error('Error fetching analysis results:', error);
      throw error;
    }
  },

  // Get user's documents
  getUserDocuments: async (userId) => {
    try {
      const response = await api.get(`/api/v1/documents/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user documents:', error);
      throw error;
    }
  },

  // Delete a document
  deleteDocument: async (documentId) => {
    try {
      const response = await api.delete(`/api/v1/documents/${documentId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }
};

// AI Chat API functions
export const aiChatAPI = {
  // Send a message to AI for analysis
  sendAIMessage: async (message, files = []) => {
    try {
      const formData = new FormData();
      formData.append('message', message);
      
      files.forEach((file, index) => {
        formData.append(`files`, file);
      });

      const response = await api.post('/api/v1/ai/chat', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error sending AI message:', error);
      throw error;
    }
  },

  // Get chat history
  getChatHistory: async (userId) => {
    try {
      const response = await api.get(`/api/v1/ai/chat/history/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching chat history:', error);
      throw error;
    }
  }
};

// WebSocket connection manager
export class WebSocketManager {
  constructor() {
    this.ws = null;
    this.roomName = null;
    this.username = null;
    this.clientId = null;
    this.messageHandlers = [];
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect(roomName, username) {
    this.roomName = roomName;
    this.username = username;
    this.clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const wsUrl = `ws://localhost:8000/ws/${this.clientId}/${roomName}/${username}`;
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.handleReconnect();
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  handleMessage(data) {
    this.messageHandlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error('Error in message handler:', error);
      }
    });
  }

  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        if (this.roomName && this.username) {
          this.connect(this.roomName, this.username);
        }
      }, 2000 * this.reconnectAttempts);
    }
  }

  sendMessage(content) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message = {
        content,
        room_name: this.roomName,
        type: 'message'
      };
      this.ws.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected');
    }
  }

  addMessageHandler(handler) {
    this.messageHandlers.push(handler);
  }

  removeMessageHandler(handler) {
    const index = this.messageHandlers.indexOf(handler);
    if (index > -1) {
      this.messageHandlers.splice(index, 1);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.roomName = null;
    this.username = null;
    this.clientId = null;
    this.messageHandlers = [];
  }
}

export default api;
