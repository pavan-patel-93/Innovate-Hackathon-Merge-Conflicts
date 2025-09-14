import { create } from 'zustand';

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    
    try {
      // Make actual API call to authenticate user
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        credentials: 'include' // Include cookies for session-based auth
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      const { user, token } = data;

      console.log('Login - API response data:', data);
      console.log('Login - User object:', user);
      console.log('Login - User role:', user?.role);

      // Store in localStorage for persistence
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('compliance_token', token);

      set({ 
        user, 
        isAuthenticated: true, 
        isLoading: false 
      });
      
      return { user, token };
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
    
    try {
      // Make actual API call to register user
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const data = await response.json();
      const { user, token } = data;

      // Store in localStorage for persistence
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('compliance_token', token);

      set({ 
        user, 
        isAuthenticated: true, 
        isLoading: false 
      });
      
      return { user, token };
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
      localStorage.removeItem('user');
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
    
    try {
      // Always check with the API first since we use session-based auth
      const response = await fetch('/api/auth/me', {
        credentials: 'include' // Include cookies for session-based auth
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          console.log('Loaded user from API:', data.user); // Debug log
          // Store in localStorage for quick access, but API is source of truth
          localStorage.setItem('user', JSON.stringify(data.user));
          set({ user: data.user, isAuthenticated: true, isLoading: false });
          return;
        }
      }
      
      // If API check fails, try localStorage as fallback
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        console.log('Loaded user from localStorage as fallback:', user);
        set({ user, isAuthenticated: true, isLoading: false });
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch (error) {
      console.error('Auth check error:', error);
      // Try localStorage as fallback
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          set({ user, isAuthenticated: true, isLoading: false });
        } else {
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      } catch (fallbackError) {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    }
  },

  clearError: () => set({ error: null }),
}));
