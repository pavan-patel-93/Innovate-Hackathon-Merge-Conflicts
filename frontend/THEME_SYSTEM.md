# Theme System Documentation

## Overview

The ComplianceAI application now includes a comprehensive dark/light theme system that provides a consistent user experience across all components and pages.

## Features

- **Automatic Theme Detection**: Detects user's system preference on first visit
- **Persistent Theme Storage**: Remembers user's theme choice in localStorage
- **Smooth Transitions**: All theme changes are animated smoothly
- **Comprehensive Coverage**: All components support both light and dark themes
- **Accessibility**: Proper ARIA labels and keyboard navigation support

## Components

### ThemeProvider

The `ThemeProvider` component wraps the entire application and provides theme context to all child components.

**Location**: `src/contexts/ThemeContext.js`

**Usage**:
```jsx
import { ThemeProvider } from "@/contexts/ThemeContext";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### ThemeToggle

A simple toggle button that switches between light and dark themes.

**Location**: `src/components/ui/theme-toggle.jsx`

**Usage**:
```jsx
import { ThemeToggle } from "@/components/ui/theme-toggle";

function Header() {
  return (
    <header>
      <ThemeToggle />
    </header>
  );
}
```

### ThemeSelector

A more advanced theme selector with dedicated buttons for each theme.

**Location**: `src/components/ui/theme-selector.jsx`

**Usage**:
```jsx
import { ThemeSelector } from "@/components/ui/theme-selector";

function Settings() {
  return (
    <div>
      <ThemeSelector />
    </div>
  );
}
```

## Theme Context Hook

### useTheme()

Provides access to theme state and controls.

**Available Properties**:
- `theme`: Current theme ("light" or "dark")
- `toggleTheme()`: Switch between themes
- `setLightTheme()`: Set theme to light
- `setDarkTheme()`: Set theme to dark
- `mounted`: Boolean indicating if component has mounted (prevents hydration mismatch)

**Usage**:
```jsx
import { useTheme } from "@/contexts/ThemeContext";

function MyComponent() {
  const { theme, toggleTheme, mounted } = useTheme();

  if (!mounted) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
}
```

## CSS Variables

The theme system uses CSS custom properties defined in `src/app/globals.css`:

### Light Theme Variables
```css
:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 3.9%;
  --card: 0 0% 100%;
  --card-foreground: 0 0% 3.9%;
  --primary: 0 0% 9%;
  --primary-foreground: 0 0% 98%;
  /* ... more variables */
}
```

### Dark Theme Variables
```css
.dark {
  --background: 0 0% 3.9%;
  --foreground: 0 0% 98%;
  --card: 0 0% 3.9%;
  --card-foreground: 0 0% 98%;
  --primary: 0 0% 98%;
  --primary-foreground: 0 0% 9%;
  /* ... more variables */
}
```

## Tailwind Configuration

The Tailwind config is set up to use class-based dark mode:

```javascript
module.exports = {
  darkMode: ["class"],
  // ... rest of config
}
```

## Usage in Components

### Using Tailwind Classes

```jsx
function MyComponent() {
  return (
    <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
      <h1 className="text-2xl font-bold">Title</h1>
      <p className="text-gray-600 dark:text-gray-400">Description</p>
    </div>
  );
}
```

### Using CSS Variables

```jsx
function MyComponent() {
  return (
    <div className="bg-background text-foreground">
      <h1 className="text-primary">Title</h1>
      <p className="text-muted-foreground">Description</p>
    </div>
  );
}
```

## Best Practices

1. **Always use the `mounted` check** when using `useTheme()` to prevent hydration mismatches
2. **Prefer CSS variables** over hardcoded colors for better theme consistency
3. **Test both themes** during development
4. **Use semantic color names** (e.g., `text-foreground` instead of `text-gray-900`)
5. **Include proper ARIA labels** for theme toggle buttons

## Implementation Details

### Theme Persistence

Themes are automatically saved to localStorage and restored on page reload. The system also respects the user's system preference (`prefers-color-scheme`) if no saved preference exists.

### Hydration Safety

The theme system includes proper hydration handling to prevent mismatches between server and client rendering. Components using `useTheme()` should check the `mounted` property before rendering theme-dependent content.

### Performance

Theme changes are optimized for performance:
- CSS variables are used for instant theme switching
- No JavaScript-based style calculations
- Minimal re-renders during theme changes

## Troubleshooting

### Theme Not Persisting
- Check if localStorage is available
- Verify ThemeProvider is wrapping the app
- Check browser console for errors

### Hydration Mismatch
- Always use the `mounted` check from `useTheme()`
- Avoid rendering theme-dependent content before mounting

### Styles Not Updating
- Ensure Tailwind config has `darkMode: ["class"]`
- Check if CSS variables are properly defined
- Verify the `dark` class is being added to the HTML element
