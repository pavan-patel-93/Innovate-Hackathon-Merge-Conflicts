"use client";

import { useTheme } from "@/contexts/ThemeContext";
import { ThemeToggle, ThemeSelector } from "@/components/ui/theme-toggle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function ThemeDemo() {
  const { theme, toggleTheme, setLightTheme, setDarkTheme, mounted } = useTheme();

  if (!mounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Theme Demo</CardTitle>
          <CardDescription>Loading theme system...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Theme System Demo</CardTitle>
        <CardDescription>
          Current theme: <span className="font-medium">{theme}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium">Theme Controls</h4>
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <span className="text-sm text-gray-600 dark:text-gray-400">Toggle</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Theme Selector</h4>
            <ThemeSelector />
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">Manual Controls</h4>
          <div className="flex space-x-2">
            <Button 
              variant={theme === "light" ? "default" : "outline"} 
              size="sm" 
              onClick={setLightTheme}
            >
              Light
            </Button>
            <Button 
              variant={theme === "dark" ? "default" : "outline"} 
              size="sm" 
              onClick={setDarkTheme}
            >
              Dark
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">Theme Preview</h4>
          <div className="p-4 rounded-lg border bg-background text-foreground">
            <p className="text-sm text-muted-foreground">
              This card uses theme-aware colors that automatically adapt to the current theme.
            </p>
            <div className="mt-2 flex space-x-2">
              <div className="w-4 h-4 bg-blue-600 rounded"></div>
              <div className="w-4 h-4 bg-slate-500 rounded"></div>
              <div className="w-4 h-4 bg-indigo-500 rounded"></div>
              <div className="w-4 h-4 bg-red-500 rounded"></div>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Blue • Slate • Indigo • Red
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
