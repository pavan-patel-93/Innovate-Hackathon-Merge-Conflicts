import { create } from 'zustand';

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      // Simple demo authentication - accept any username/password
      if (!credentials.username || !credentials.password) {
        throw new Error('Username and password are required');
      }

      const user = {
        id: Date.now().toString(),
        username: credentials.username,
        email: credentials.email || `${credentials.username}@example.com`,
        role: 'compliance_analyst',
        department: 'Quality Assurance',
        createdAt: new Date().toISOString()
      };

      // Store in localStorage for persistence
      localStorage.setItem('compliance_user', JSON.stringify(user));
      localStorage.setItem('compliance_token', 'demo_token_' + Date.now());

      set({ 
        user, 
        isAuthenticated: true, 
        isLoading: false 
      });
      
      return { user, token: 'demo_token' };
    } catch (error) {
      set({ 
        error: error.message || 'Login failed', 
        isLoading: false 
      });
      throw error;
    }
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
        console.log("User Data ::::: ", userData)
      if (!userData.username || !userData.password) {
        throw new Error('Username and password are required');
      }

      if (userData.password !== userData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      const user = {
        id: Date.now().toString(),
        username: userData.username,
        email: userData.email,
        role: 'compliance_analyst',
        department: 'Quality Assurance',
        createdAt: new Date().toISOString()
      };

      // Store in localStorage for persistence
      localStorage.setItem('compliance_user', JSON.stringify(user));
      localStorage.setItem('compliance_token', 'demo_token_' + Date.now());

      set({ 
        user, 
        isAuthenticated: true, 
        isLoading: false 
      });
      
      return { user, token: 'demo_token' };
    } catch (error) {
      set({ 
        error: error.message || 'Registration failed', 
        isLoading: false 
      });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      // Clear localStorage
      localStorage.removeItem('compliance_user');
      localStorage.removeItem('compliance_token');
    } finally {
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false 
      });
    }
  },

  checkAuth: async () => {
    set({ isLoading: true });
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      const storedUser = localStorage.getItem('compliance_user');
      const storedToken = localStorage.getItem('compliance_token');
      
      if (storedUser && storedToken) {
        const user = JSON.parse(storedUser);
        set({ user, isAuthenticated: true, isLoading: false });
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch (error) {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
