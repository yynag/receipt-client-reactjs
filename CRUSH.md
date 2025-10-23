# React + TypeScript + Vite Project Guide

## Build & Development Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production (runs TypeScript check + Vite build)
- `npm run lint` - Run ESLint on all TypeScript files
- `npm run preview` - Preview production build locally

## Code Style Guidelines

### Import Organization
- React imports first: `import { lazy, StrictMode } from "react"`
- Third-party libraries next: `import { createBrowserRouter } from "react-router"`
- Relative imports last: `import { LazyLoad } from "./components/LazyLoad"`
- Use type imports for types only: `import type { MenuProps, type MenuTheme } from "antd"`

### TypeScript & Formatting
- Use TypeScript for all files (.ts/.tsx extensions)
- Follow Prettier config: 120 char line width, 2-space tabs, no trailing commas
- Use strict null checks and non-null assertions sparingly
- Type React components with explicit return types

### Component Structure
- Use function components with hooks
- Lazy load routes with React.lazy() and Suspense
- Store components in domain-based folders under `src/domains/`
- Shared components in `src/components/`
- Follow existing patterns: Admin domain uses store pattern, Home domain is simple

### UI Framework
- Use Ant Design components for UI
- Use Tailwind CSS for custom styling
- Flex components for layout: `<Flex justify="center" align="center">`

### Naming Conventions
- Components: PascalCase (e.g., `AdminEntry`, `LazyLoad`)
- Functions/variables: camelCase
- Files: kebab-case for utilities, PascalCase for components
- Constants: UPPER_SNAKE_CASE

### Error Handling
- Use conditional rendering for auth checks: `if (user == null || user.role !== "admin")`
- Wrap lazy components in Suspense with fallback UI