# Copilot Instructions for LexiMind Knowledge Hub

## Project Overview

This is a React/TypeScript knowledge management application built with Vite, shadcn/ui, and Tailwind CSS. It provides a banking-themed interface for searching and managing regulatory/compliance documentation with Spanish language support.

## Core Architecture

### Tech Stack

- **Framework**: React 18 + TypeScript, bundled with Vite
- **UI Library**: shadcn/ui (Radix UI primitives) + Tailwind CSS
- **Routing**: React Router v6 with standard pages: Index, Search, Documents, NotFound
- **State**: React Query for server state, React Hook Form for forms
- **Styling**: Dark mode by default with banking-themed custom CSS patterns

### Key Directories Structure

```
src/
├── components/
│   ├── chat/          # Search interfaces with typing animations
│   ├── layout/        # MainLayout with sidebar + topbar pattern
│   └── ui/            # shadcn/ui components (DO NOT MODIFY manually)
├── pages/             # Route components (Index, Search, Documents, NotFound)
├── hooks/             # Custom hooks (use-toast, use-mobile)
└── lib/               # Utilities (cn function for className merging)
```

## Development Patterns

### Import Conventions

- Always use `@/` alias for internal imports: `import { Button } from "@/components/ui/button"`
- External imports first, then internal imports with blank line separation
- Path aliases configured in `tsconfig.json` and `vite.config.ts`

### Component Architecture

- **MainLayout**: Core layout with `SidebarProvider` + responsive sidebar trigger
- **SearchInterface**: Features animated placeholder text cycling and loading states
- All page components should be wrapped in `<MainLayout>` for consistent structure

### Styling System

- **Banking Theme**: Custom CSS variables for banking colors in `src/index.css`
- **Banking Pattern**: Use `.banking-pattern` class for main backgrounds (see MainLayout)
- **Dark Mode**: Enforced by default in App.tsx with `document.documentElement.classList.add("dark")`
- **Component Styling**: Use `cn()` utility from `@/lib/utils` for className merging

### TypeScript Configuration

- Relaxed rules: `noImplicitAny: false`, `strictNullChecks: false`
- Skip lib checks enabled for faster builds
- Use interface props with optional parameters and clear naming

## Spanish Language Support

The app includes Spanish placeholder texts and regulatory compliance terminology:

- CNBV regulations, compliance procedures, risk management
- When adding content, consider bilingual support (English/Spanish)

## Key Development Commands

```bash
npm run dev          # Development server (port 8080)
npm run build        # Production build
npm run build:dev    # Development mode build
npm run lint         # ESLint check
```

## Testing & Quality

- Uses ESLint with React hooks and refresh plugins
- No test framework currently configured
- Lovable-tagger plugin for component identification in development

## Routing Notes

- Add all custom routes ABOVE the catch-all `"*"` route in App.tsx
- Use `<NavLink>` from react-router-dom for navigation in sidebar
- All routes should render through MainLayout for consistency

## UI Component Guidelines

- **Never manually edit** shadcn/ui components in `src/components/ui/`
- Use shadcn CLI to add/update components: `npx shadcn@latest add [component]`
- Prefer composition over modification for customizations
- Use Radix UI props and variants for styling variations

## Performance Considerations

- Vite SWC plugin for fast React compilation
- React Query for efficient data fetching and caching
- Component lazy loading not currently implemented but recommended for larger features
