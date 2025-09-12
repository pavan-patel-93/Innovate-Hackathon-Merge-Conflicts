import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';

export function useAuth() {
  const router = useRouter();
  const { user, isAuthenticated, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  return { user, isAuthenticated };
}

export function useRequireAuth(redirectTo = '/login') {
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth().then(() => {
      if (!isAuthenticated) {
        router.push(redirectTo);
      }
    });
  }, [isAuthenticated, router, redirectTo]);

  return { isAuthenticated };
}
