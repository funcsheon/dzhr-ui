# dzhr UI - AI-Powered Design Generator

## Overview
dzhr UI is an AI-powered design tool that generates responsive UI mockups from text prompts, website templates, and design systems. It enables users to create designs for various devices (phone, tablet, desktop, watch, VR/AR), analyze existing web assets for style extraction, and export designs as Figma files, images, or code (HTML/CSS). The application aims for a clean, professional aesthetic, inspired by tools like Linear and Figma, featuring a three-panel workspace (controls → canvas → properties) and a subdued color palette to highlight user-generated content. The project's ambition is to provide a highly efficient and accurate design generation and analysis platform with strong emphasis on accessibility and design system adherence.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework:** React 18 with TypeScript, using Vite.
- **Routing:** Wouter.
- **State Management:** React hooks for local state, TanStack Query for server state.
- **UI Components:** Custom library built on Radix UI primitives with shadcn/ui styling ("new-york" variant).
- **Styling:** Tailwind CSS with custom design tokens, supporting light/dark modes and a custom elevation system.
- **Design System:** HSL-based color palette, Inter (Google Fonts) and JetBrains Mono typography, custom border radii, and a professional, subdued aesthetic.

### Backend
- **Runtime:** Node.js with Express.js.
- **Language:** TypeScript with ES modules.
- **API Design:** RESTful endpoints for template/design system analysis, code parsing, and design system management (CRUD operations).
- **Request Validation:** Zod schemas.
- **Development:** Vite middleware for HMR, custom logging.
- **Build:** Vite for frontend (`dist/public`), esbuild for backend (`dist/index.js`).

### Data Storage
- **Primary:** In-memory storage (`MemStorage`) for development.
- **Database:** Drizzle ORM configured for PostgreSQL (via Neon Database) with a schema for projects and design systems, including metadata, device selections, generated designs, and component definitions.
- **Migrations:** Drizzle migration system configured for PostgreSQL.
- **Authentication:** Currently no active authentication, but architecture supports future integration.

### UI/UX Decisions
- Three-panel layout (controls, canvas, properties) for workspace efficiency.
- Subdued color palette to prioritize user-generated designs.
- WCAG 2.1 Level AA compliance integrated as a default requirement for all generated designs.
- Progress feedback system provides real-time status updates during design generation.
- Collapsible "Show Examples" section with high-quality prompt templates.

### Technical Implementations
- **AI Integration:** Advanced prompt engineering using GPT-4o (role-based, chain-of-thought, structured constraints), context-aware temperature optimization, and a design validation system (0-100 score).
- **Design System Compliance:** Critical enforcement mechanisms for 95%+ design system adherence, including structured token extraction, component pattern matching, and verification checklists. Enforces "zero arbitrary values" for colors, sizes, and spacing.
- **Design System Gap Filling:** AI analyzes provided components to extract visual patterns, then creates missing components (modals, dropdowns, tooltips, alerts, tabs, etc.) that match the design system's style exactly. All gap-filling components are accessible (WCAG 2.1 AA) and use modern 2024/2025 patterns.
- **Contextual Content Generation:** AI generates contextually relevant content based on the prompt context. All labels, button text, headings, descriptions, image alt text, ARIA labels, and component naming are specific to the design brief (e.g., fitness app uses workout-related terminology). No generic or placeholder content (Lorem Ipsum, "Hero image", "Click here") is generated.
- **Modern Design Pattern Training:** AI trained on 2024/2025 web design trends including bento grids, glassmorphism, bold typography (64px-96px headings), modern CSS techniques (clamp, grid-template-areas), and contemporary design inspiration from Linear, Stripe, Vercel, Apple, and Figma. Includes layout recipes, micro-interactions, and implementation checklists for modern, polished designs.
- **CSS Scoping:** Robust CSS scoping function to prevent generated design styles from affecting the main application UI.
- **Image Generation:** AI-generated designs include real images from Picsum Photos with contextually specific, descriptive alt text for accessibility.

## External Dependencies

### AI/ML Services
- **OpenAI GPT-4o:** For AI analysis, design generation, and refinement. Requires `OPENAI_API_KEY`.

### Web Scraping & Parsing
- **Puppeteer:** Headless browser for website analysis and style extraction.
- **Cheerio:** HTML parser for static DOM structure analysis.
- **Custom Code Parser (`server/lib/codeParser.ts`):** Extracts components from CSS/SCSS/LESS, JavaScript/TypeScript, and JSON files.

### Database
- **Neon Database:** Serverless PostgreSQL solution via `@neondatabase/serverless`. Configured with `DATABASE_URL`.

### Integrations
- **Figma MCP Integration:** Direct integration with Figma files via Model Context Protocol (`@modelcontextprotocol/sdk`, `figma-developer-mcp`) for extracting components and styles. Requires `FIGMA_API_KEY`.

### UI Libraries
- **Radix UI:** Unstyled, accessible component primitives.
- **Lucide React:** Icon library.
- **cmdk:** Command menu component.
- **react-day-picker:** Calendar/date picker.
- **recharts:** Charting library.
- **embla-carousel-react:** Carousel component.

### Utilities
- **class-variance-authority:** CSS class composition.
- **clsx & tailwind-merge:** Conditional class name handling.
- **date-fns:** Date manipulation.
- **zod:** Runtime type validation.
- **multer:** File upload handling.
- **html-to-image:** Converts HTML/CSS to PNG for design exports.

### Session Management
- **connect-pg-simple:** PostgreSQL session store for Express sessions (configured for future use).