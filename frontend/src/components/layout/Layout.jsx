"use client";

import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

export function Layout({ children, activeTab, onTabChange }) {
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
