"use client";

import { useState } from "react";
import { useUser } from '@/hooks/useUser';
import { AuthGuard } from '@/components/AuthComponents';
import { Layout } from "@/components/layout/Layout";
import { Dashboard } from "@/components/features/dashboard/Dashboard";
import { Chat } from "@/components/features/chat/Chat";
import { Setup } from "@/components/features/setup/Setup";

export default function Home() {
  const [activeTab, setActiveTab] = useState("home");
  const { user, isLoading } = useUser({ redirectIfNotFound: true });

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <Dashboard />;
      case "analysis":
        return <Chat />;
      case "setup":
        return <Setup />;
      default:
        return <Dashboard />;
    }
  };

  if (isLoading) {
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
      <Layout activeTab={activeTab} onTabChange={setActiveTab}>
        {renderContent()}
      </Layout>
    </AuthGuard>
  );
}