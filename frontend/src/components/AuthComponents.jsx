'use client';

// Reusable authentication components
import { useState } from 'react';
import Link from 'next/link';
import { useLogin, useSignup, useUser, useLogout } from '@/hooks/useUser';

// Common input field component
export function AuthInput({
  id,
  label,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  required = false,
  autoComplete,
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <div>
        <input
          id={id}
          name={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          className={`w-full px-3 py-2 border rounded-md ${
            error ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
          } focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800`}
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

// Form error message component
export function FormError({ message }) {
  if (!message) return null;
  return (
    <div className="p-3 my-2 text-sm text-red-500 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
      {message}
    </div>
  );
}

// Login form component
export function LoginForm() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const { login, isLoading, error } = useLogin();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear field error when user types
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      await login(formData);
    } catch (err) {
      // Error is handled by the hook
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <AuthInput
        id="username"
        label="Username or Email"
        value={formData.username}
        onChange={handleChange}
        error={fieldErrors.username}
        placeholder="Enter your username or email"
        required
        autoComplete="username"
      />
      
      <AuthInput
        id="password"
        label="Password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        error={fieldErrors.password}
        placeholder="Enter your password"
        required
        autoComplete="current-password"
      />
      
      <FormError message={error} />
      
      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Signing in...' : 'Sign In'}
      </button>
      
      <p className="text-sm text-center text-gray-600 dark:text-gray-400">
        Don't have an account?{' '}
        <Link href="/signup" className="text-blue-600 hover:text-blue-500 font-medium">
          Sign up
        </Link>
      </p>
    </form>
  );
}

// Signup form component
export function SignupForm() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const { signup, isLoading, error } = useSignup();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear field error when user types
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      await signup(formData);
    } catch (err) {
      // Error is handled by the hook
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <AuthInput
        id="username"
        label="Username"
        value={formData.username}
        onChange={handleChange}
        error={fieldErrors.username}
        placeholder="Choose a username"
        required
        autoComplete="username"
      />
      
      <AuthInput
        id="email"
        label="Email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        error={fieldErrors.email}
        placeholder="Enter your email"
        required
        autoComplete="email"
      />
      
      <AuthInput
        id="password"
        label="Password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        error={fieldErrors.password}
        placeholder="Create a password"
        required
        autoComplete="new-password"
      />
      
      <AuthInput
        id="confirmPassword"
        label="Confirm Password"
        type="password"
        value={formData.confirmPassword}
        onChange={handleChange}
        error={fieldErrors.confirmPassword}
        placeholder="Confirm your password"
        required
        autoComplete="new-password"
      />
      
      <FormError message={error} />
      
      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Creating Account...' : 'Create Account'}
      </button>
      
      <p className="text-sm text-center text-gray-600 dark:text-gray-400">
        Already have an account?{' '}
        <Link href="/login" className="text-blue-600 hover:text-blue-500 font-medium">
          Sign in
        </Link>
      </p>
    </form>
  );
}

// User profile component
export function UserProfile() {
  const { user, isLoading } = useUser();
  const { logout, isLoading: isLoggingOut } = useLogout();
  
  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
        <div className="space-y-2">
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
      </div>
    );
  }
  
  if (!user) {
    return null;
  }
  
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
          <span className="text-blue-600 dark:text-blue-400 font-medium">
            {user.username.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <p className="font-medium">{user.username}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
        </div>
      </div>
      <button
        onClick={logout}
        disabled={isLoggingOut}
        className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
      >
        {isLoggingOut ? 'Signing out...' : 'Sign out'}
      </button>
    </div>
  );
}

// Auth guard component - protects content that requires authentication
export function AuthGuard({ children, fallback }) {
  const { user, isLoading } = useUser();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }
  
  if (!user) {
    return fallback || (
      <div className="text-center py-8">
        <p className="mb-4">You need to be signed in to view this content</p>
        <Link
          href="/login"
          className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Sign In
        </Link>
      </div>
    );
  }
  
  return children;
}