"use client";

import { BarChart3, MessageSquare, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navigationItems = [
  {
    id: "home",
    label: "Dashboard",
    icon: BarChart3,
    description: "View document analytics and manage files"
  },
  {
    id: "analysis",
    label: "Analysis",
    icon: MessageSquare,
    description: "Chat with AI assistant for compliance analysis"
  },
  {
    id: "setup",
    label: "Setup",
    icon: Settings,
    description: "Configure document types and validation rules"
  }
];

export function Sidebar({ activeTab, onTabChange }) {
  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Sidebar Navigation */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <nav className="space-y-2" role="navigation" aria-label="Main navigation">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                  isActive
                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                )}
                aria-current={isActive ? "page" : undefined}
                aria-describedby={`${item.id}-description`}
              >
                <Icon className="w-5 h-5" aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Quick Info Section */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">
              Quick Info
            </h3>
            <div className="space-y-3">
              {navigationItems.map((item) => (
                <div key={item.id} className="text-sm">
                  <p className="font-medium text-gray-900 dark:text-white mb-1">
                    {item.label}
                  </p>
                  <p 
                    id={`${item.id}-description`}
                    className="text-xs text-gray-600 dark:text-gray-400"
                  >
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
