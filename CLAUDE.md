# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15.5.4 dashboard application for RE/MAX agents built with React 19, TypeScript, and Tailwind CSS v4. The project uses the App Router architecture with shadcn/ui components styled in the "New York" variant.

## Development Commands

```bash
# Start development server (runs on http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## Architecture

### UI Component System

The project uses **shadcn/ui** with a highly customized component library:

- **Style variant**: New York
- **Base color**: Neutral
- **Icon library**: Lucide React (primary), Tabler Icons (for specific UI elements)
- **Component location**: `components/ui/`
- **Utility functions**: `lib/utils.ts` (contains `cn()` for className merging)

### Path Aliases (tsconfig.json)

All imports use the `@/*` alias pattern:
- `@/components` → components directory
- `@/lib` → lib directory
- `@/hooks` → hooks directory
- `@/app` → app directory

### Styling Architecture

- **CSS Framework**: Tailwind CSS v4 with custom configuration
- **CSS Variables**: Extensive use of CSS custom properties for theming
- **Dark Mode**: Implemented via `.dark` class with complete color token system
- **Animation**: Uses `tw-animate-css` package
- **Color System**: OKLCH color space for modern color management
- **Main stylesheet**: `app/globals.css`

### Layout System

The application uses a **sidebar-based layout** with:
- `SidebarProvider` managing global sidebar state
- `AppSidebar` component containing navigation structure
- `SiteHeader` for top navigation
- Custom CSS properties for layout dimensions:
  - `--sidebar-width`: calc(var(--spacing) * 72)
  - `--header-height`: calc(var(--spacing) * 12)

### Navigation Structure

The sidebar navigation is organized into four sections:
1. **Main Navigation** (`NavMain`): Primary app sections (Dashboard, Lifecycle, Analytics, Projects, Team)
2. **Cloud/Feature Navigation** (`navClouds`): Feature-specific areas with nested items (Capture, Proposal, Prompts)
3. **Documents** (`NavDocuments`): Quick access to data libraries and reports
4. **Secondary Navigation** (`NavSecondary`): Settings, Help, Search

### Form Handling

Forms use **React Hook Form** with:
- **Validation**: Zod schema validation via `@hookform/resolvers`
- **Form components**: Custom form components in `components/ui/form.tsx`

### Key Dependencies

- **UI Primitives**: Radix UI (complete suite of accessible components)
- **Data Tables**: TanStack Table v8
- **Drag & Drop**: dnd-kit
- **Charts**: Recharts
- **Date Handling**: date-fns, react-day-picker
- **Notifications**: Sonner (toast notifications)
- **Theming**: next-themes

## Important Notes

- The project uses **TypeScript strict mode**
- React 19 and Next.js 15 features may differ from older documentation
- Component variants use `class-variance-authority` (CVA)
- All UI components support dark mode through CSS variables
- The `use client` directive is required for any component using client-side interactivity

## Component Development

When adding new shadcn/ui components, they should:
- Use the `cn()` utility from `@/lib/utils` for className merging
- Follow the New York style variant patterns
- Support both light and dark modes
- Use Radix UI primitives where applicable
- Be placed in `components/ui/` directory
