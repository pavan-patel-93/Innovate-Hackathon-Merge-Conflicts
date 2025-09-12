import api from './api';

export const authService = {
  async login(credentials) {
    const response = await api.post('/api/v1/auth/login', credentials);
    const { access_token, refresh_token } = response.data;
    
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    
    return response.data;
  },

  async register(userData) {
    const response = await api.post('/api/v1/auth/register', userData);
    return response.data;
  },

  async logout() {
    try {
      await api.post('/api/v1/auth/logout');
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  },

  async getCurrentUser() {
    const response = await api.get('/api/v1/users/me');
    return response.data;
  },

  async updateProfile(data) {
    const response = await api.put('/api/v1/users/me', data);
    return response.data;
  },

  isAuthenticated() {
    return !!localStorage.getItem('access_token');
  },
};
