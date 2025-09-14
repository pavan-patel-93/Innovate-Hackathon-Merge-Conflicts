// Client-side hook for authentication using SWR
'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { useRouter } from 'next/navigation';

// Fetcher function for SWR
const fetcher = async (url) => {
  const res = await fetch(url);
  
  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.');
    error.info = await res.json();
    error.status = res.status;
    throw error;
  }
  
  return res.json();
};

/**
 * Hook to get the current authenticated user
 * @param {Object} options - SWR options
 * @param {boolean} options.redirectIfNotFound - Redirect to login if user is not found
 * @param {string} options.redirectUrl - URL to redirect to if user is not found
 * @returns {Object} The user data, loading state, error, and mutate function
 */
export function useUser({
  redirectIfNotFound = false,
  redirectUrl = '/login',
} = {}) {
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  // Fetch the user data with SWR
  const { data, error, isLoading, mutate } = useSWR('/api/auth/me', fetcher, {
    revalidateOnFocus: true,
    revalidateIfStale: true,
    shouldRetryOnError: false,
  });

  // Redirect logic
  useEffect(() => {
    if (
      redirectIfNotFound && 
      !isLoading && 
      (error || !data?.user) && 
      !isRedirecting
    ) {
      setIsRedirecting(true);
      router.push(redirectUrl);
    }
  }, [data, error, isLoading, redirectIfNotFound, redirectUrl, router, isRedirecting]);

  // Extract user from response
  const user = data?.user;
  
  return {
    user,
    isLoading,
    error,
    mutate,
    isLoggedIn: !!user,
  };
}

/**
 * Hook to handle login process
 * @param {string} redirectTo - URL to redirect to after successful login
 * @returns {Object} Login handler and related states
 */
export function useLogin(redirectTo = '/dashboard') {
  const router = useRouter();
  const { mutate } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (credentials) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Update the user cache
      await mutate();
      
      // Redirect to dashboard or specified URL
      router.push(redirectTo);
      
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { login, isLoading, error };
}

/**
 * Hook to handle signup process
 * @param {string} redirectTo - URL to redirect to after successful signup
 * @returns {Object} Signup handler and related states
 */
export function useSignup(redirectTo = '/dashboard') {
  const router = useRouter();
  const { mutate } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const signup = async (userData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      // Update the user cache
      await mutate();
      
      // Redirect to dashboard or specified URL
      router.push(redirectTo);
      
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { signup, isLoading, error };
}

/**
 * Hook to handle logout process
 * @param {string} redirectTo - URL to redirect to after successful logout
 * @returns {Object} Logout handler and related states
 */
export function useLogout(redirectTo = '/login') {
  const router = useRouter();
  const { mutate } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const logout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Logout failed');
      }

      // Update the user cache
      await mutate(null);
      
      // Redirect to login or specified URL
      router.push(redirectTo);
      
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { logout, isLoading, error };
}