"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "./button";
import { useTheme } from "@/contexts/ThemeContext";

export function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useTheme();

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" className="w-9 h-9">
        <div className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="w-9 h-9 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? (
        <Moon className="w-4 h-4" />
      ) : (
        <Sun className="w-4 h-4" />
      )}
    </Button>
  );
}

export function ThemeToggleWithText() {
  const { theme, toggleTheme, mounted } = useTheme();

  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" className="flex items-center space-x-2">
        <div className="w-4 h-4" />
        <span>Theme</span>
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
    >
      {theme === "light" ? (
        <Moon className="w-4 h-4" />
      ) : (
        <Sun className="w-4 h-4" />
      )}
      <span>{theme === "light" ? "Dark" : "Light"}</span>
    </Button>
  );
}
