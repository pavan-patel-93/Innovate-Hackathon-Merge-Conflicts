"use client";

import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Dashboard } from "@/components/features/dashboard/Dashboard";
import { Chat } from "@/components/features/chat/Chat";
import { Setup } from "@/components/features/setup/Setup";

export default function Home() {
  const [activeTab, setActiveTab] = useState("home");

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

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </Layout>
  );
}
