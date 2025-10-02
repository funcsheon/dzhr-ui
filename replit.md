# Genius UI - AI-Powered Design Generator

## Overview

Genius UI is a professional design tool that generates responsive UI mockups from text prompts, website templates, and design systems. The application allows users to create designs for multiple device types (phone, tablet, desktop, watch, VR/AR), analyze existing websites and design systems for style extraction, and export designs as Figma files, images, or code (HTML/CSS).

The application follows a clean, professional design philosophy inspired by Linear and Figma, emphasizing workspace efficiency with a three-panel layout (controls → canvas → properties) and subdued colors that don't compete with user-generated designs.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework:** React 18 with TypeScript, using Vite as the build tool and development server.

**Routing:** Wouter for client-side routing (lightweight alternative to React Router).

**State Management:** React hooks for local state, TanStack Query (React Query) for server state management and data fetching with automatic caching and refetching capabilities.

**UI Components:** Custom component library built on Radix UI primitives with shadcn/ui styling system. Uses the "new-york" style variant with extensive Radix UI components including dialogs, dropdowns, popovers, tooltips, tabs, accordions, and form controls.

**Styling:** Tailwind CSS with custom design tokens for colors, spacing, and typography. Supports both light and dark modes with CSS variables for theming. Custom elevation system using `hover-elevate` and `active-elevate-2` classes for interactive feedback.

**Design System:**
- Color palette based on HSL values with separate light/dark mode configurations
- Typography using Inter font family (via Google Fonts) and JetBrains Mono for code
- Custom border radius scale (9px, 6px, 3px)
- Professional restraint principle - subdued colors that don't compete with user designs

### Backend Architecture

**Runtime:** Node.js with Express.js server framework.

**Language:** TypeScript with ES modules.

**API Design:** RESTful endpoints under `/api` prefix:
- `POST /api/analyze-template` - Analyzes website URLs to extract design patterns
- `POST /api/analyze-design-system` - Analyzes design system documentation

**Request Validation:** Zod schemas for runtime type checking and validation.

**Development Server:** Vite middleware integration for hot module replacement in development mode. Custom logging middleware that captures request/response information for API routes.

**Build Process:** 
- Frontend: Vite builds React app to `dist/public`
- Backend: esbuild bundles server code to `dist/index.js` with external packages

### Data Storage Solutions

**Primary Strategy:** In-memory storage implementation via `MemStorage` class (currently active).

**Database Schema:** Drizzle ORM configured for PostgreSQL with schema defined in `shared/schema.ts`:
- **Projects table** with fields for:
  - Project metadata (name, prompt, creation timestamp)
  - Device selection (phone, tablet, desktop, watch, VR)
  - Design system components and URLs
  - Template URLs and extracted styles
  - Generated designs with HTML/CSS/images per device

**Migration Strategy:** Database migrations configured in `drizzle.config.ts` with output to `/migrations` directory.

**Rationale:** In-memory storage provides fast development iteration. PostgreSQL schema is prepared for production scaling when data persistence becomes necessary.

### Authentication and Authorization

**Current State:** No authentication implemented. Storage interface includes user-related methods (`getUser`, `getUserByUsername`, `createUser`) but they are not actively used in routes.

**Future Consideration:** Architecture supports adding authentication layer through the storage interface without major refactoring.

### External Dependencies

**AI/ML Services:**
- **OpenAI GPT-5** - AI analysis and design generation
  - Template analysis: Extracts design patterns, colors, typography from URLs
  - Design system analysis: Identifies components, tokens, principles from documentation
  - Design generation: Creates responsive HTML/CSS from prompts and constraints
  - Configuration: Requires `OPENAI_API_KEY` environment variable

**Web Scraping:**
- **Puppeteer** - Headless browser for website analysis
  - Launches in headless mode with sandbox disabled for Replit compatibility
  - Extracts computed styles (colors, fonts, layouts) from live websites
  - 30-second timeout for page loads
- **Cheerio** - HTML parsing for static analysis
  - Complementary to Puppeteer for DOM structure analysis

**Database:**
- **Neon Database** - Serverless PostgreSQL (via `@neondatabase/serverless`)
  - Configured via `DATABASE_URL` environment variable
  - Drizzle ORM for type-safe database queries

**Session Management:**
- **connect-pg-simple** - PostgreSQL session store for Express sessions (configured but not actively used in current implementation)

**Image Export:**
- **html-to-image** - Converts HTML/CSS to PNG for design exports
  - Used in `toPng` function for generating preview images

**UI Libraries:**
- **Radix UI** - Unstyled, accessible component primitives (20+ components)
- **Lucide React** - Icon library
- **cmdk** - Command menu component
- **react-day-picker** - Calendar/date picker
- **recharts** - Charting library
- **embla-carousel-react** - Carousel component

**Utilities:**
- **class-variance-authority** - CSS class composition
- **clsx & tailwind-merge** - Conditional class name handling
- **date-fns** - Date manipulation
- **zod** - Runtime type validation

**Development Tools:**
- **Replit-specific plugins** - Runtime error overlay, cartographer, dev banner for Replit environment
- **TypeScript** - Static type checking with strict mode enabled
- **ESLint & Prettier** - Code quality and formatting (implied by project structure)