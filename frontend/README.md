# Next.js Project Template

A simple and clean Next.js project template with TypeScript, ESLint, and modern React features.

## Features

- ⚡️ Next.js 14 with App Router
- 🎨 TypeScript for type safety
- 📝 ESLint for code quality
- 🎯 Modern CSS with CSS Modules support
- 📁 Organized project structure
- 🔧 Pre-configured with common settings

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm, yarn, or pnpm

### Installation

1. Clone or download this template
2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

### Development

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.

## Project Structure

```
nextjs-template/
├── public/              # Static files
├── src/
│   ├── app/            # App router pages and layouts
│   │   ├── layout.tsx  # Root layout
│   │   ├── page.tsx    # Home page
│   │   └── globals.css # Global styles
│   └── components/     # Reusable components
├── .env.example        # Environment variables example
├── .eslintrc.json      # ESLint configuration
├── .gitignore          # Git ignore file
├── next.config.js      # Next.js configuration
├── package.json        # Project dependencies
├── README.md           # Project documentation
└── tsconfig.json       # TypeScript configuration
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Environment Variables

Copy `.env.example` to `.env.local` and update the values:

```bash
cp .env.example .env.local
```

## Adding Pages

To add a new page, create a new folder in `src/app/` with a `page.tsx` file:

```tsx
// src/app/about/page.tsx
export default function AboutPage() {
  return (
    <main>
      <h1>About Page</h1>
    </main>
  )
}
```

## Creating Components

Add reusable components to `src/components/`:

```tsx
// src/components/Header.tsx
export default function Header() {
  return (
    <header>
      <nav>
        {/* Navigation items */}
      </nav>
    </header>
  )
}
```

## Styling

This template uses CSS Modules by default. Create a `.module.css` file:

```css
/* styles/Home.module.css */
.container {
  padding: 2rem;
}
```

Use in your component:

```tsx
import styles from './Home.module.css'

export default function Home() {
  return <div className={styles.container}>...</div>
}
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## Deployment

The easiest way to deploy your Next.js app is to use [Vercel](https://vercel.com):

1. Push your code to a Git repository
2. Import your project to Vercel
3. Vercel will automatically detect Next.js and configure the build settings

## License

MIT
