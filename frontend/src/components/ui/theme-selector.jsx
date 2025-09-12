"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "./button";
import { useTheme } from "@/contexts/ThemeContext";

export function ThemeSelector() {
  const { theme, setLightTheme, setDarkTheme, mounted } = useTheme();

  if (!mounted) {
    return (
      <div className="flex items-center space-x-1">
        <Button variant="ghost" size="sm" className="w-8 h-8">
          <div className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" className="w-8 h-8">
          <div className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" className="w-8 h-8">
          <div className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
      <Button
        variant={theme === "light" ? "default" : "ghost"}
        size="sm"
        onClick={setLightTheme}
        className="w-8 h-8 p-0"
        aria-label="Light theme"
      >
        <Sun className="w-4 h-4" />
      </Button>
      <Button
        variant={theme === "dark" ? "default" : "ghost"}
        size="sm"
        onClick={setDarkTheme}
        className="w-8 h-8 p-0"
        aria-label="Dark theme"
      >
        <Moon className="w-4 h-4" />
      </Button>
    </div>
  );
}
