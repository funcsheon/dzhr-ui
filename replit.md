# dzhr UI - AI-Powered Design Generator

## Overview

dzhr UI is a professional design tool that generates responsive UI mockups from text prompts, website templates, and design systems. The application allows users to create designs for multiple device types (phone, tablet, desktop, watch, VR/AR), analyze existing websites and design systems for style extraction, and export designs as Figma files, images, or code (HTML/CSS).

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
- `POST /api/parse-code-file` - Parses uploaded code files (CSS, JS, TS, TSX) to extract component definitions
- `POST /api/design-systems` - Save design system library to database
- `GET /api/design-systems` - Retrieve all saved design systems
- `DELETE /api/design-systems/:id` - Delete a design system by ID

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
- **Design Systems table** with fields for:
  - Unique name (primary key)
  - Source URL (optional)
  - Components array (JSONB) containing component definitions with name, type, and URL
  - Created timestamp

**Migration Strategy:** Database migrations configured in `drizzle.config.ts` with output to `/migrations` directory.

**Rationale:** In-memory storage provides fast development iteration. PostgreSQL schema is prepared for production scaling when data persistence becomes necessary.

### Authentication and Authorization

**Current State:** No authentication implemented. Storage interface includes user-related methods (`getUser`, `getUserByUsername`, `createUser`) but they are not actively used in routes.

**Future Consideration:** Architecture supports adding authentication layer through the storage interface without major refactoring.

### External Dependencies

**AI/ML Services:**
- **OpenAI GPT-4o** - Enhanced AI analysis and design generation
  - **Advanced Prompt Engineering**: Uses role-based prompting (senior UI/UX designer), chain-of-thought reasoning, and structured constraints for higher accuracy
  - **Temperature Control**: 0.75 for creative generation, 0.55 for precise refinement
  - **Design Validation**: Automatic quality scoring system (0-100) checks for semantic HTML5, modern CSS, real content (no Lorem Ipsum)
  - **Template analysis**: Extracts design patterns, colors, typography from URLs
  - **Design system analysis**: Identifies components, tokens, principles from documentation
  - **Design generation**: Creates responsive HTML/CSS from prompts with detailed design philosophy and quality standards
  - **Design refinement**: Surgical improvements to existing designs while preserving structure
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
- **multer** - File upload handling for code file parsing

**Code Parsing:**
- **Custom Code Parser** (`server/lib/codeParser.ts`) - Extracts components from code files:
  - **CSS/SCSS/LESS**: Identifies class names matching component patterns (btn-, card-, modal-, input-, etc.)
  - **JavaScript/TypeScript**: Extracts React component names from function/class declarations and exports
  - **JSON**: Parses component definitions from JSON structure
  - Supports batch uploads with functional state management to preserve all components

**Figma MCP Integration:**
- **Model Context Protocol (MCP)** - Direct integration with Figma files via MCP server:
  - Uses `@modelcontextprotocol/sdk` with `figma-developer-mcp` package
  - StdioClientTransport spawns MCP server process via npx
  - Authenticates using FIGMA_API_KEY environment variable
  - **API Endpoints**:
    - `POST /api/figma/analyze` - Extracts components and styles from Figma files
    - `GET /api/figma/mcp-tools` - Lists available MCP tools
  - **Response Parsing**: Handles multiple MCP payload formats (application/json, text with JSON, regex patterns)
  - **UI Integration**: New "Figma" tab in Design System section for importing components from Figma URLs
  - Normalizes MCP responses into clean `{name, url}[]` format for design system integration

**Development Tools:**
- **Replit-specific plugins** - Runtime error overlay, cartographer, dev banner for Replit environment
- **TypeScript** - Static type checking with strict mode enabled
- **ESLint & Prettier** - Code quality and formatting (implied by project structure)

### Recent Improvements (Latest Session)

**AI System Enhancements (99% Accuracy Goal):**
1. **Advanced Prompt Engineering** (`server/lib/openai.ts`):
   - Implemented role-based prompting: AI acts as senior UI/UX designer with 15+ years experience
   - Added chain-of-thought reasoning: Step-by-step approach analyzes requirements before designing
   - Structured constraints: Explicit design philosophy, technical requirements, quality standards
   - Enhanced system messages with detailed design principles (clarity, whitespace, visual hierarchy)

2. **Temperature Optimization**:
   - Generation: 0.75 for creative, varied designs
   - Refinement: 0.55 for precise, targeted improvements

3. **Design Validation System**:
   - Automatic quality scoring (0-100) with threshold of 70 for valid designs
   - Checks for: semantic HTML5 elements, modern CSS (flexbox/grid), real content, color styling
   - Validation results logged to console for monitoring

4. **UI Improvements** (`client/src/components/PromptInput.tsx`):
   - Added collapsible "Show Examples" section with 5 high-quality prompt templates
   - Examples demonstrate best practices: detailed descriptions, specific features, clear structure
   - One-click insertion of examples into prompt textarea

5. **CSS Scoping Fix** (`client/src/components/DesignCanvas.tsx`):
   - Implemented robust CSS scoping function to prevent design system styles from leaking to app UI
   - Handles root selectors (`:root`, `html`, `body`), universal selectors, media queries
   - dzhr UI interface remains visually consistent regardless of uploaded design systems
   - Only generated designs in preview canvas use design system styles

**Design System Integration:**
- Removed Figma tab from Design System section (simplified to 3 tabs: Upload, Analyze, Add Links)
- Design system components now properly scoped to generated designs only

**Image Generation:**
- Enhanced AI prompts to include real images in generated designs
- Uses Picsum Photos service (https://picsum.photos/) for reliable placeholder images
- Images automatically included in designs that need visual content (hero sections, product grids, testimonials, avatars)
- All images include proper alt text for accessibility
- Supports custom dimensions and multiple unique images via ?random parameter

**Progress Feedback System:**
- Real-time status updates during design generation and refinement
- Shows 6 stages for generation: analyzing prompt → planning layout → selecting colors → generating HTML/CSS → adding images → final polish
- Shows 5 stages for refinement: analyzing request → reviewing design → planning improvements → applying refinements → finalizing
- Visual indicator with animated pulse dot appears below prompt input
- Status messages update at timed intervals (3-5 seconds) matching the ~20-30 second generation time
- Automatically clears when generation completes or fails
- Proper timeout cleanup to prevent memory leaks

**Branding:**
- Custom logo integration using uploaded file (Group 213_1759502696335.png)
- Purple rounded square with white "dzhr" text and sparkle decorations
- Displays as 40x40px in application header
- Replaces previous placeholder icon