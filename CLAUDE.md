# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15.5.4 dashboard application for RE/MAX agents built with React 19, TypeScript, and Tailwind CSS v4. The project uses the App Router architecture with shadcn/ui components styled in the "New York" variant.

## Language Requirements

**IMPORTANT**: All user-facing content in the web application must be in **Spanish**. This includes:
- UI labels and buttons
- Form fields and placeholders
- Navigation menus
- Error messages and notifications
- Page titles and descriptions
- Any text visible to end users

Code, comments, variable names, and technical documentation should remain in English for maintainability.

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

The sidebar navigation (`components/app-sidebar.tsx`) is organized into sections:
1. **Admin Navigation** (`navAdmin`): Administrator panel access
2. **Main Navigation** (`navMain`): Primary app sections (General Panel, Agents, Connections, Properties, Analytics)
3. **Secondary Navigation** (`navSecondary`): Settings and Help

The sidebar uses Tabler Icons for navigation items and includes:
- RE/MAX logo in the header
- Collapsible "offcanvas" mode
- `NavUser` component in footer for user account management

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

## Application Structure

### Page Organization

The app uses Next.js App Router with the following main routes:

- `/` - Landing/home page
- `/login` - Authentication page
- `/admin-panel` - Administrator dashboard with:
  - `/admin-panel/agentes` - Agent management and listing
  - `/admin-panel/agentes/[id]` - Individual agent detail pages
  - `/admin-panel/conexiones` - Social media connections management
- `/panel-general` - General performance panel for agents
- `/privacy` - Privacy policy
- `/terms` - Terms of service
- `/data-deletion` - Data deletion instructions

### Data Layer

**Mock Data Location**: `lib/data/`
- `mock-agents.ts` - Agent sample data
- `mock-properties.ts` - Property sample data

**Type Definitions**: `lib/types/`
- `agent.ts` - Agent, metrics, and social media interfaces
- `property.ts` - Property type definitions

**Core Types**:
- `Agent`: Includes social media metrics, sales data, and performance history
- `PeriodMetrics`: Tracks followers, posts, reach, impressions, engagement
- `SocialMediaMetrics`: Platform-specific metrics (Instagram, Facebook)
- `SalesMetrics`: Sales performance tracking

### API Routes

**Social Media Authentication**: `app/api/auth/`
- Instagram OAuth flow via Facebook Graph API
- Route handlers for OAuth initiation and callbacks
- Scopes include: public_profile, email, pages permissions, Instagram basic & insights

**Environment Variables Required**:
- `NEXT_PUBLIC_META_APP_ID` - Facebook/Meta App ID
- `NEXTAUTH_URL` - Application base URL for OAuth redirects

### Charts and Visualization

The app heavily uses **Recharts** for data visualization with:
- `LineChart` - Trend analysis (monthly performance)
- `BarChart` - Comparative metrics
- `AreaChart` - Engagement over time
- Custom `ChartContainer`, `ChartTooltip`, `ChartLegend` from shadcn/ui

Chart configurations use CSS variables for theming and support:
- Multi-line comparisons (e.g., clients closed vs. publications)
- Custom tooltips with formatted data
- Responsive design with configurable margins
- Accessibility layer enabled

### Key Features

1. **Agent Performance Tracking**: Monthly/weekly metrics for social media and sales
2. **Social Media Integration**: Facebook and Instagram insights
3. **Admin Dashboard**: Overview of all agents with filterable top performers
4. **Individual Agent Views**: Detailed breakdowns with historical data
5. **Connection Management**: OAuth-based social media account linking
