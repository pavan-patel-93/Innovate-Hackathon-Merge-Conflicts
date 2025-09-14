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

      const response = await api.post('/api/v1/documents/upload/', formData, {
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
      console.log('[AI API] Sending message:', message);
      console.log('[AI API] Files to send:', files.length, files.map(f => f.name || f.filename || 'unknown'));
      
      let uploadResults = [];
      let aiResponse = null;
      
      // If files are provided, upload them one by one
      if (files.length > 0) {
        for (const file of files) {
          const formData = new FormData();
          formData.append('file', file);
          
          console.log(`[AI API] Uploading file:`, file.name || file.filename, file.size);
          
          const response = await api.post('/api/v1/documents/upload/', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          
          uploadResults.push(response.data);
        }
      }
      
      // Always save the chat interaction to database for persistence
      const chatFormData = new FormData();
      chatFormData.append('message', message);
      files.forEach(file => {
        chatFormData.append('files', file);
      });
      
      const chatResponse = await api.post('/api/v1/ai/chat', chatFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      aiResponse = chatResponse.data;
      
      return {
        message: message,
        response: aiResponse.response,
        uploads: uploadResults,
        status: 'success'
      };
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
  },

  // Get chat messages (alias for getChatHistory for compatibility)
  getChatMessages: async (userId = 'default') => {
    try {
      const response = await api.get(`/api/v1/ai/chat/history/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      throw error;
    }
  }
};

// Setup API functions for document type configuration (using Next.js API routes)
export const setupAPI = {
  // Get all document types
  getDocumentTypes: async (skip = 0, limit = 100) => {
    try {
      const response = await fetch(`/api/setup/document-types?skip=${skip}&limit=${limit}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching document types:', error);
      throw error;
    }
  },

  // Get document type by ID
  getDocumentType: async (docTypeId) => {
    try {
      const response = await fetch(`/api/setup/document-types/${docTypeId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching document type:', error);
      throw error;
    }
  },

  // Get document type by code
  getDocumentTypeByCode: async (code) => {
    try {
      const response = await fetch(`/api/setup/document-types/code/${code}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching document type by code:', error);
      throw error;
    }
  },

  // Create document type
  createDocumentType: async (documentType, createdBy = null) => {
    try {
      const response = await fetch('/api/setup/document-types', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...documentType,
          created_by: createdBy
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating document type:', error);
      throw error;
    }
  },

  // Update document type
  updateDocumentType: async (docTypeId, documentType) => {
    try {
      const response = await fetch(`/api/setup/document-types/${docTypeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(documentType),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating document type:', error);
      throw error;
    }
  },

  // Delete document type
  deleteDocumentType: async (docTypeId) => {
    try {
      const response = await fetch(`/api/setup/document-types/${docTypeId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error deleting document type:', error);
      throw error;
    }
  },

  // Add section rule
  addSectionRule: async (docTypeId, sectionName, ruleData) => {
    try {
      const response = await fetch(`/api/setup/document-types/${docTypeId}/sections/${encodeURIComponent(sectionName)}/rules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ruleData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error adding section rule:', error);
      throw error;
    }
  },

  // Update section rule
  updateSectionRule: async (docTypeId, sectionName, ruleId, ruleData) => {
    try {
      const response = await fetch(`/api/setup/document-types/${docTypeId}/sections/${encodeURIComponent(sectionName)}/rules/${encodeURIComponent(ruleId)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ruleData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating section rule:', error);
      throw error;
    }
  },

  // Delete section rule
  deleteSectionRule: async (docTypeId, sectionName, ruleId) => {
    try {
      const response = await fetch(`/api/setup/document-types/${docTypeId}/sections/${encodeURIComponent(sectionName)}/rules/${encodeURIComponent(ruleId)}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error deleting section rule:', error);
      throw error;
    }
  },

  // Get predefined rules
  getPredefinedRules: async () => {
    try {
      const response = await fetch('/api/setup/predefined-rules');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching predefined rules:', error);
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
