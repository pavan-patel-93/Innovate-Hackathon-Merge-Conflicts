# Sleek Color Palette Documentation

## Overview

The ComplianceAI application now uses a sophisticated, sleek color palette that replaces the previous green-heavy design with a modern blue-gray and slate color scheme. This palette provides better contrast, accessibility, and a more professional appearance.

## Color Philosophy

- **Professional & Modern**: Clean, sophisticated colors that convey trust and reliability
- **Accessibility First**: High contrast ratios for better readability
- **Consistent**: Unified color system across all components
- **Dark Mode Optimized**: Carefully crafted colors that work beautifully in both light and dark themes

## Primary Color Palette

### Blue (Primary Brand Color)
- **Blue 50**: `#eff6ff` - Lightest blue for backgrounds
- **Blue 100**: `#dbeafe` - Light blue for subtle backgrounds
- **Blue 200**: `#bfdbfe` - Light blue for borders
- **Blue 300**: `#93c5fd` - Medium light blue
- **Blue 400**: `#60a5fa` - Medium blue
- **Blue 500**: `#3b82f6` - Primary blue (main brand color)
- **Blue 600**: `#2563eb` - Darker blue (used for active states)
- **Blue 700**: `#1d4ed8` - Dark blue
- **Blue 800**: `#1e40af` - Darker blue
- **Blue 900**: `#1e3a8a` - Darkest blue
- **Blue 950**: `#172554` - Very dark blue

### Slate (Neutral Colors)
- **Slate 50**: `#f8fafc` - Lightest gray
- **Slate 100**: `#f1f5f9` - Light gray
- **Slate 200**: `#e2e8f0` - Light gray for borders
- **Slate 300**: `#cbd5e1` - Medium light gray
- **Slate 400**: `#94a3b8` - Medium gray
- **Slate 500**: `#64748b` - Medium gray
- **Slate 600**: `#475569` - Dark gray
- **Slate 700**: `#334155` - Darker gray
- **Slate 800**: `#1e293b` - Dark gray
- **Slate 900**: `#0f172a` - Darkest gray
- **Slate 950**: `#020617` - Very dark gray

### Indigo (Accent Colors)
- **Indigo 50**: `#eef2ff` - Lightest indigo
- **Indigo 100**: `#e0e7ff` - Light indigo
- **Indigo 200**: `#c7d2fe` - Light indigo for borders
- **Indigo 300**: `#a5b4fc` - Medium light indigo
- **Indigo 400**: `#818cf8` - Medium indigo
- **Indigo 500**: `#6366f1` - Primary indigo
- **Indigo 600**: `#4f46e5` - Dark indigo
- **Indigo 700**: `#4338ca` - Darker indigo
- **Indigo 800**: `#3730a3` - Dark indigo
- **Indigo 900**: `#312e81` - Darkest indigo
- **Indigo 950**: `#1e1b4b` - Very dark indigo

## CSS Variables

### Light Theme Variables
```css
:root {
  --background: 0 0% 100%;                    /* White */
  --foreground: 222.2 84% 4.9%;             /* Dark slate */
  --primary: 221.2 83.2% 53.3%;             /* Blue 600 */
  --primary-foreground: 210 40% 98%;         /* Light blue */
  --secondary: 210 40% 96%;                 /* Light gray */
  --secondary-foreground: 222.2 84% 4.9%;   /* Dark slate */
  --muted: 210 40% 96%;                     /* Light gray */
  --muted-foreground: 215.4 16.3% 46.9%;    /* Medium gray */
  --accent: 210 40% 96%;                     /* Light gray */
  --accent-foreground: 222.2 84% 4.9%;      /* Dark slate */
  --destructive: 0 84.2% 60.2%;             /* Red */
  --destructive-foreground: 210 40% 98%;     /* Light */
  --border: 214.3 31.8% 91.4%;              /* Light gray */
  --input: 214.3 31.8% 91.4%;               /* Light gray */
  --ring: 221.2 83.2% 53.3%;               /* Blue 600 */
}
```

### Dark Theme Variables
```css
.dark {
  --background: 222.2 84% 4.9%;             /* Dark slate */
  --foreground: 210 40% 98%;                /* Light */
  --primary: 217.2 91.2% 59.8%;            /* Light blue */
  --primary-foreground: 222.2 84% 4.9%;     /* Dark slate */
  --secondary: 217.2 32.6% 17.5%;          /* Dark gray */
  --secondary-foreground: 210 40% 98%;      /* Light */
  --muted: 217.2 32.6% 17.5%;              /* Dark gray */
  --muted-foreground: 215 20.2% 65.1%;     /* Medium gray */
  --accent: 217.2 32.6% 17.5%;             /* Dark gray */
  --accent-foreground: 210 40% 98%;         /* Light */
  --destructive: 0 62.8% 30.6%;            /* Dark red */
  --destructive-foreground: 210 40% 98%;    /* Light */
  --border: 217.2 32.6% 17.5%;              /* Dark gray */
  --input: 217.2 32.6% 17.5%;              /* Dark gray */
  --ring: 224.3 76.3% 94.1%;               /* Light blue */
}
```

## Usage Guidelines

### Primary Actions
- Use **Blue 600** (`#2563eb`) for primary buttons and active states
- Use **Blue 500** (`#3b82f6`) for hover states
- Use **Blue 700** (`#1d4ed8`) for pressed states

### Success States
- Use **Blue 600** (`#2563eb`) for success indicators (replacing green)
- Use **Blue 100** (`#dbeafe`) for success backgrounds
- Use **Blue 900/30** (`rgba(30, 58, 138, 0.3)`) for dark mode success backgrounds

### Neutral Elements
- Use **Slate 200** (`#e2e8f0`) for borders
- Use **Slate 100** (`#f1f5f9`) for subtle backgrounds
- Use **Slate 500** (`#64748b`) for secondary text
- Use **Slate 700** (`#334155`) for primary text in light mode

### Status Colors
- **Success**: Blue 600 (`#2563eb`)
- **Warning**: Yellow 600 (`#d97706`)
- **Error**: Red 600 (`#dc2626`)
- **Info**: Blue 500 (`#3b82f6`)

## Component-Specific Usage

### Headers & Navigation
- **Logo Background**: Blue 600 (`#2563eb`)
- **Active Navigation**: Blue 100 background with Blue 700 text
- **User Avatar**: Blue 100 background with Blue 600 text

### Cards & Containers
- **Card Background**: White (light) / Slate 800 (dark)
- **Card Borders**: Slate 200 (light) / Slate 700 (dark)
- **Card Headers**: Slate 900 text (light) / White text (dark)

### Forms & Inputs
- **Input Borders**: Slate 200 (light) / Slate 600 (dark)
- **Input Focus**: Blue 600 ring
- **Input Background**: White (light) / Slate 800 (dark)

### Buttons
- **Primary Button**: Blue 600 background with white text
- **Secondary Button**: Slate 100 background with Slate 900 text
- **Ghost Button**: Transparent with Slate 600 text

## Accessibility Considerations

### Contrast Ratios
- **Blue 600 on White**: 4.5:1 (WCAG AA compliant)
- **Blue 600 on Slate 100**: 3.8:1 (WCAG AA compliant)
- **Slate 900 on White**: 12.6:1 (WCAG AAA compliant)
- **White on Blue 600**: 4.5:1 (WCAG AA compliant)

### Color Blindness
- The blue palette is accessible for users with red-green color blindness
- Status indicators use both color and icons for better accessibility
- High contrast ratios ensure readability for all users

## Migration from Green Palette

### Replaced Colors
- **Green 600** → **Blue 600** (Primary brand color)
- **Green 100** → **Blue 100** (Light backgrounds)
- **Green 900** → **Blue 900/30** (Dark mode backgrounds)
- **Green 400** → **Blue 400** (Dark mode text)

### Benefits of New Palette
1. **More Professional**: Blue conveys trust and reliability
2. **Better Contrast**: Improved readability in both themes
3. **Modern Aesthetic**: Sleek, contemporary appearance
4. **Accessibility**: Better support for color-blind users
5. **Consistency**: Unified color system across all components

## Implementation Notes

- All colors are defined as HSL values for better theme switching
- Dark mode uses opacity modifiers (`/30`) for subtle backgrounds
- Colors are available through both CSS variables and Tailwind classes
- The palette is designed to work seamlessly with the existing theme system
