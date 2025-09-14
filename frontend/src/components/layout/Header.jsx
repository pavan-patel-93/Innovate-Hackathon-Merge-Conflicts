"use client";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Shield, LogOut, User } from "lucide-react";
import { useUser, useLogout } from "@/hooks/useUser";
import { useRouter } from "next/navigation";

export function Header() {
  const router = useRouter();
  const { user } = useUser();
  const { logout } = useLogout();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="w-full px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
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

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <span className="text-blue-600 dark:text-blue-400 font-medium text-sm">
                  {user?.username?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {user?.username || "User"}
              </span>
            </div>
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
