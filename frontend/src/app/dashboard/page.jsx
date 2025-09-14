'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import { AuthGuard, UserProfile } from '@/components/AuthComponents';

export default function DashboardPage() {
  const { user, isLoading } = useUser({ redirectIfNotFound: true });
  const [userData, setUserData] = useState(null);
  const [isLoadingUserData, setIsLoadingUserData] = useState(false);

  // Fetch user data from API when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoadingUserData(true);
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUserData(data.user);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoadingUserData(false);
      }
    };

    if (user && !isLoading) {
      fetchUserData();
    }
  }, [user, isLoading]);

  // If still loading, show loading state
  if (isLoading || isLoadingUserData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    ComplianceAI
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    AI-Powered Compliance Assistant
                  </p>
                </div>
              </div>
              
              {/* User Profile */}
              <UserProfile />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Welcome, {userData?.username || user?.username}!</h2>
            
            {userData ? (
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300">
                  You are now authenticated with our secure session-based authentication system.
                </p>
                
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-2">Your Profile</h3>
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Username</dt>
                      <dd className="mt-1 text-gray-900 dark:text-white">{userData.username}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</dt>
                      <dd className="mt-1 text-gray-900 dark:text-white">{userData.email}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Role</dt>
                      <dd className="mt-1 text-gray-900 dark:text-white">{userData.role}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Department</dt>
                      <dd className="mt-1 text-gray-900 dark:text-white">{userData.department}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Member Since</dt>
                      <dd className="mt-1 text-gray-900 dark:text-white">
                        {new Date(userData.createdAt).toLocaleDateString()}
                      </dd>
                    </div>
                  </dl>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-blue-800 dark:text-blue-300 mb-2">Authentication Details</h3>
                  <p className="text-blue-700 dark:text-blue-400">
                    This application uses MongoDB for user storage and Redis for secure session management.
                    Your session is protected with httpOnly secure cookies.
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">Loading your profile data...</p>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}