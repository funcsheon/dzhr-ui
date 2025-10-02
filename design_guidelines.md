# Design Guidelines: Genius UI

## Design Approach

**Selected Approach:** Design System (Linear + Figma-inspired)

**Justification:** This is a professional design tool requiring efficiency, clarity, and reliability. The interface should fade into the background, allowing users to focus on their design work. We'll draw from Linear's exceptional typography and minimalism, Figma's canvas-based tool patterns, and modern design system principles.

**Core Principles:**
- Clarity over decoration: Every element serves a functional purpose
- Workspace efficiency: Three-panel layout (controls → canvas → properties)
- Professional restraint: Subdued colors that don't compete with user-generated designs
- Predictable interactions: Standard patterns users already know

---

## Color Palette

**Dark Mode Primary** (default):
- Background: 220 15% 8% (deep slate)
- Surface: 220 13% 12% (elevated panels)
- Surface Hover: 220 13% 15%
- Border: 220 13% 20%
- Text Primary: 220 10% 95%
- Text Secondary: 220 8% 65%
- Brand Accent: 260 80% 65% (vibrant purple)
- Success: 145 60% 50%
- Warning: 35 90% 60%

**Light Mode:**
- Background: 220 15% 98%
- Surface: 0 0% 100%
- Border: 220 13% 88%
- Text Primary: 220 15% 10%
- Text Secondary: 220 10% 45%

---

## Typography

**Font Stack:**
- Primary: 'Inter', system-ui, sans-serif (via Google Fonts)
- Monospace: 'JetBrains Mono', monospace (for code display)

**Type Scale:**
- Hero: text-4xl font-semibold (36px)
- Section Heading: text-2xl font-semibold (24px)
- Subsection: text-lg font-medium (18px)
- Body: text-sm (14px) - default for most UI
- Small: text-xs (12px) - labels, captions
- Code: text-sm font-mono

**Line Heights:** Use tight for headings (leading-tight), normal for body (leading-normal)

---

## Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, 8, 12, 16
- Micro spacing: p-2, gap-2 (8px)
- Component padding: p-4, p-6 (16-24px)
- Section spacing: p-8, py-12 (32-48px)
- Large gaps: gap-16 (64px)

**Application Structure:**
```
┌─────────────────────────────────────────────┐
│  Header (h-16): Logo, Project Name, Export  │
├──────────┬─────────────────────┬────────────┤
│          │                     │            │
│ Controls │   Canvas Preview    │ Properties │
│ (w-80)   │   (flex-1)          │ (w-96)     │
│          │                     │            │
│          │                     │            │
└──────────┴─────────────────────┴────────────┘
```

**Responsive Breakpoints:**
- Mobile: Stack vertically, collapsible panels
- Tablet: Two-panel (controls + canvas)
- Desktop: Full three-panel layout

---

## Component Library

### Header Bar
- Height: h-16
- Background: Surface color with border-b
- Content: Flex justify-between, px-6
- Left: Logo + Project title (editable inline)
- Right: Export dropdown + Settings icon + User avatar

### Left Sidebar (Controls Panel)
- Width: w-80
- Scrollable: overflow-y-auto
- Sections with collapsible accordions:
  1. **Device Selection:** Grid of device cards (2 columns) with icons and labels
  2. **Design System:** Drag-drop upload zone + component preview list
  3. **Template Reference:** URL input + "Analyze" button + extracted style preview
  4. **Generation Prompt:** Textarea (h-32) + "Generate Designs" button (w-full, primary)

### Center Canvas
- Background: Subtle grid pattern (220 15% 10%)
- Device frames: Drop shadow, rounded corners (rounded-xl)
- Zoom controls: Bottom-right floating toolbar
- Device tabs: Top navigation to switch between generated designs
- Interactive: Pan and zoom canvas

### Right Sidebar (Properties Panel)
- Width: w-96
- Tabs: "Code" | "Export" | "Variations"
- Code tab: Syntax-highlighted HTML/CSS with copy button
- Export tab: Format selector + Download button
- Variations tab: Thumbnail grid of saved variations

### Buttons
- Primary: bg-accent text-white px-6 py-2.5 rounded-lg font-medium
- Secondary: border border-border bg-surface hover:bg-surface-hover
- Ghost: hover:bg-surface text-secondary
- Icon buttons: p-2 rounded-md

### Form Elements
- Input/Textarea: bg-surface border border-border rounded-lg px-4 py-2.5 focus:border-accent
- Select: Same styling with chevron icon
- File upload: Dashed border, hover state, drag-over highlight

### Cards
- Background: bg-surface
- Border: border border-border
- Padding: p-6
- Hover: hover:border-accent transition-colors
- Rounded: rounded-xl

### Device Frame Components
- Phone: aspect-[9/19.5] max-w-sm
- Tablet: aspect-[3/4] max-w-2xl
- Desktop: aspect-[16/10] max-w-6xl
- Watch: aspect-square max-w-xs rounded-full
- VR/AR: aspect-[16/9] with gradient border effect

---

## Images

**Hero Section:** None - this is a tool interface, not a marketing site

**Component Library Previews:** Thumbnail images (w-12 h-12) showing uploaded design system components in a grid layout

**Device Mockups:** Use CSS to create device frames with realistic bezels, shadows (shadow-2xl), and status bars. Center generated designs within frames.

**Empty States:** Simple illustrations or icons (100x100px) for:
- "No design system uploaded" state
- "No designs generated yet" state  
- "No saved variations" state

---

## Animations

**Minimal Motion Philosophy:** Use only for feedback and state changes

**Allowed Animations:**
- Button hover: subtle background color transition (transition-colors duration-200)
- Panel expansion: accordion smooth height transitions (transition-all duration-300)
- Loading states: subtle pulse animation for "Generating..." state
- Drag-drop: opacity and scale feedback (opacity-50 scale-95)

**No Animations For:**
- Page loads
- Layout shifts
- Decorative effects

---

## Key Interactions

1. **File Upload:** Click or drag-and-drop with visual feedback (dashed border becomes solid accent color on hover)
2. **Device Selection:** Toggle selection with checkmarks, multi-select enabled
3. **Canvas Controls:** Mouse wheel zoom, click-drag pan, pinch-to-zoom on touch
4. **Code Export:** One-click copy with toast notification "Copied to clipboard!"
5. **Figma Export:** Download .fig file directly, show progress indicator for generation