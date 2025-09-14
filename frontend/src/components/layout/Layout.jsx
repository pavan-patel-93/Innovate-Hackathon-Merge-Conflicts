"use client";

import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import LoadingSpinner  from "@/components/common/LoadingSpinner";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function Layout({ children, activeTab, onTabChange }) {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuthStore();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="flex h-[calc(100vh-80px)]">
        <Sidebar activeTab={activeTab} onTabChange={onTabChange} />
        <main className="flex-1 flex flex-col" role="main">
          {children}
        </main>
      </div>
    </div>
  );
}
