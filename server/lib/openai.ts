import OpenAI from "openai";

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is not set. Please add your OpenAI API key to continue.');
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

interface ValidationResult {
  isValid: boolean;
  score: number;
  issues: string[];
}

function validateDesign(html: string, css: string): ValidationResult {
  const issues: string[] = [];
  let score = 100;

  if (!html || html.length < 100) {
    issues.push('HTML content is too short or empty');
    score -= 50;
  }

  if (html.includes('lorem ipsum') || html.includes('Lorem Ipsum')) {
    issues.push('Contains placeholder Lorem Ipsum text');
    score -= 15;
  }

  if (html.includes('placeholder') && html.includes('content')) {
    issues.push('Contains placeholder content markers');
    score -= 10;
  }

  const htmlLower = html.toLowerCase();
  const hasSemanticTags = htmlLower.includes('<header') || 
                          htmlLower.includes('<main') || 
                          htmlLower.includes('<section') ||
                          htmlLower.includes('<article') ||
                          htmlLower.includes('<nav');
  
  if (!hasSemanticTags) {
    issues.push('Missing semantic HTML5 elements');
    score -= 10;
  }

  if (!css || css.length < 50) {
    issues.push('CSS content is too short or empty');
    score -= 30;
  }

  const hasModernCSS = css.includes('flex') || 
                       css.includes('grid') || 
                       css.includes('var(--');
  
  if (!hasModernCSS) {
    issues.push('Missing modern CSS features (flexbox, grid, or CSS variables)');
    score -= 10;
  }

  const hasColorStyling = css.includes('color') || 
                          css.includes('background') ||
                          css.includes('rgb') ||
                          css.includes('#');
  
  if (!hasColorStyling) {
    issues.push('Missing color styling');
    score -= 15;
  }

  const isValid = score >= 70;
  
  return {
    isValid,
    score: Math.max(0, score),
    issues
  };
}

export async function analyzeWebsiteTemplate(url: string) {
  const openai = getOpenAIClient();
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are a design analysis expert. Analyze the provided website URL and extract key design patterns, color schemes, typography, spacing, and layout structures. Return the analysis in JSON format."
      },
      {
        role: "user",
        content: `Analyze this website and extract its design system: ${url}. Provide colors (hex codes), fonts (font families), spacing patterns (px/rem values), and layout structures (grid/flexbox patterns). Respond with JSON in this format: { "colors": ["#hex1", "#hex2"], "fonts": ["Font1", "Font2"], "spacing": ["16px", "24px"], "layouts": ["Grid", "Flexbox"] }`
      }
    ],
    response_format: { type: "json_object" },
  });

  return JSON.parse(response.choices[0].message.content || '{}');
}

export async function analyzeDesignSystem(url: string) {
  const openai = getOpenAIClient();
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are a design system analysis expert. Analyze the provided design system documentation URL and extract component patterns, color palettes, typography systems, and design principles. Return the analysis in JSON format."
      },
      {
        role: "user",
        content: `Analyze this design system documentation and extract key information: ${url}. Provide component types, color tokens, typography scale, spacing system, and design principles. Respond with JSON in this format: { "components": ["Button", "Card"], "colors": ["#primary", "#secondary"], "typography": ["heading-1", "body"], "spacing": ["xs", "sm", "md"], "principles": ["Consistency", "Clarity"] }`
      }
    ],
    response_format: { type: "json_object" },
  });

  return JSON.parse(response.choices[0].message.content || '{}');
}

interface GenerateDesignParams {
  prompt: string;
  device: {
    id: string;
    name: string;
    width: number;
    height: number;
  };
  designSystemUrl?: string;
  designSystemComponents?: { name: string; url: string }[];
  templateStyles?: {
    colors?: string[];
    fonts?: string[];
    spacing?: string[];
    layouts?: string[];
  };
}

export async function generateDesign(params: GenerateDesignParams) {
  const openai = getOpenAIClient();
  const { prompt, device, designSystemUrl, designSystemComponents, templateStyles } = params;

  let systemContext = `You are a senior UI/UX designer with 15+ years of experience in modern web design. You specialize in:
- Creating visually stunning, conversion-optimized interfaces
- Following design systems and brand guidelines meticulously
- Writing semantic, accessible HTML5 (WCAG 2.1 AA compliant)
- Modern CSS with attention to typography, whitespace, and visual hierarchy
- Mobile-first responsive design principles

DESIGN PHILOSOPHY:
- Prioritize clarity and user experience over decoration
- Use whitespace intentionally to create visual breathing room
- Establish clear visual hierarchy through size, weight, and color
- Ensure high contrast for readability (4.5:1 minimum for normal text, 3:1 for large text)
- Create designs that feel polished, professional, and trustworthy
- Design for all users, including those with disabilities

WCAG 2.1 LEVEL AA ACCESSIBILITY REQUIREMENTS (MANDATORY):

1. COLOR & CONTRAST:
   - Normal text: minimum 4.5:1 contrast ratio
   - Large text (18pt+/14pt+ bold): minimum 3:1 contrast ratio
   - Interactive elements: minimum 3:1 contrast against background
   - Never use color as the ONLY way to convey information

2. SEMANTIC HTML & STRUCTURE:
   - Use proper heading hierarchy (h1 → h2 → h3, no skipping levels)
   - Use semantic elements: <header>, <nav>, <main>, <article>, <section>, <footer>, <aside>
   - Use <button> for actions, <a> for navigation
   - Use proper list elements (<ul>, <ol>, <li>) for lists
   - Use <label> elements for all form inputs

3. KEYBOARD NAVIGATION:
   - All interactive elements must be keyboard accessible (tab, enter, space)
   - Visible focus indicators with minimum 3:1 contrast (use outline or box-shadow)
   - Logical tab order that follows visual flow
   - Skip to main content link for long pages

4. FORMS & INPUTS:
   - Every input has an associated <label> (for/id relationship or wrapping)
   - Use aria-describedby for help text
   - Use aria-required="true" or required attribute for required fields
   - Clear error messages with aria-live="polite" announcements
   - Placeholder text is NOT a replacement for labels

5. IMAGES & MEDIA:
   - All images MUST have descriptive alt text
   - Decorative images use alt="" (empty alt)
   - Complex images (charts, graphs) need detailed descriptions

6. TEXT & READABILITY:
   - Minimum 16px font size for body text
   - Line height of at least 1.5 for body text
   - Paragraph spacing at least 1.5x the line height
   - Text can be resized up to 200% without loss of functionality
   - Avoid ALL CAPS for long text (harder to read)

7. INTERACTIVE ELEMENTS:
   - Minimum touch target size: 44x44px (mobile) or 24x24px (desktop)
   - Hover states must also have focus states
   - Links must be distinguishable from regular text
   - Buttons must look clickable with clear affordances

8. ARIA LANDMARKS & ROLES:
   - Use role="banner" for header (or <header> in page context)
   - Use role="navigation" for nav (or <nav>)
   - Use role="main" for main content (or <main>)
   - Use role="complementary" for sidebars (or <aside>)
   - Use role="contentinfo" for footer (or <footer> in page context)
   - Use aria-label or aria-labelledby to distinguish multiple landmarks of same type

TECHNICAL REQUIREMENTS FOR ${device.name} (${device.width}x${device.height}px):
1. Return COMPLETE, PRODUCTION-READY HTML with real, meaningful content
2. Include ALL necessary CSS with modern best practices (flexbox, grid, custom properties)
3. Use semantic HTML5 elements (header, nav, main, article, section, footer)
4. Ensure perfect responsive behavior within device constraints
5. Add micro-interactions and hover states for interactive elements
6. Use CSS variables for colors, spacing, and typography for consistency
7. IMPLEMENT ALL WCAG 2.1 AA REQUIREMENTS listed above

MANDATORY CSS ACCESSIBILITY REQUIREMENTS:
1. Set base font-size to 16px minimum:
   body { font-size: 16px; } OR html { font-size: 100%; }
2. Include visible focus states for ALL interactive elements:
   button:focus, input:focus, textarea:focus, select:focus, a:focus {
     outline: 2px solid [high-contrast-color];
     outline-offset: 2px;
   }
3. Set line-height to 1.5 minimum for body text:
   body { line-height: 1.5; }
4. Ensure paragraph spacing (margin-bottom) is at least 1.5x line-height
5. Make touch targets at least 44px height/width (mobile) or 24px (desktop)

MODERN WEB DESIGN PATTERNS (2024/2025):
Draw inspiration from contemporary websites to create modern, beautiful layouts:

1. LAYOUT TRENDS:
   • Bento Grid Layouts - Asymmetric card grids with varying sizes (inspired by Apple, Arc browser)
   • Split Screen Designs - Dramatic 50/50 divisions with contrasting content
   • Floating Elements - Cards and components with depth using shadows and transforms
   • Generous Whitespace - Spacious designs that breathe (Linear, Stripe approach)
   • Asymmetric Compositions - Breaking the grid intentionally for visual interest
   • Full-Bleed Sections - Content that stretches edge-to-edge for impact

2. TYPOGRAPHY TRENDS:
   • Bold, Oversized Headings - Hero text at 64px-96px+ for impact
   • Tight Letter Spacing - -0.02em to -0.05em on large headings for modern feel
   • Font Pairing - Sans-serif headlines + serif body, or vice versa
   • Variable Fonts - Smooth weight transitions for polish
   • Monospace Accents - Code-style fonts for tech/data elements
   • Gradient Text - Subtle color transitions on headings (use background-clip: text)

3. COLOR & VISUAL STYLE:
   • Subtle Gradients - Soft, multi-color backgrounds (not harsh)
   • Dark Mode First - Design with dark themes as primary consideration
   • Accent Color System - Bold accent color against neutral palette
   • Glassmorphism - Frosted glass effects with backdrop-filter: blur()
   • Elevated Cards - Subtle shadows with hover lift animations
   • Color Overlays - Tinted layers over images for text readability

4. INTERACTIVE ELEMENTS:
   • Micro-animations - Subtle scale/opacity changes on hover (transform: scale(1.02))
   • Smooth Transitions - All state changes animated with ease-in-out
   • Progress Indicators - Visual feedback for loading/processing states
   • Skeleton Screens - Placeholder content while loading (not spinners)
   • Hover Lift Effect - Cards rise on hover (transform: translateY(-4px))
   • Focus Rings - Modern, rounded focus indicators with offset

5. COMPONENT PATTERNS (ALWAYS ACCESSIBLE & MODERN):
   • Pill-Shaped Buttons - Fully rounded (border-radius: 9999px) for modern feel
   • Ghost Buttons - Transparent background with border, fills on hover
   • Input Groups - Combined inputs with shared borders (search + button)
   • Badge Clusters - Small, colored labels for categorization
   • Avatar Stacks - Overlapping circular avatars for team/users
   • Stats Cards - Large numbers with small labels, minimal decoration
   • Modals/Dialogs - Backdrop blur, centered, smooth entrance animation, proper ARIA attributes
   • Dropdowns/Menus - Subtle elevation, slide-in animation, keyboard navigation support
   • Tooltips - High contrast, arrow pointer, aria-describedby for accessibility
   • Alerts/Toasts - Color-coded, icon support, aria-live announcements, dismissible
   • Tabs - Active indicator (underline or pill), keyboard arrow navigation, aria-selected
   • Progress Bars - Smooth animation, accessible labels with aria-valuenow/aria-valuemax
   • Accordions - Chevron indicators, aria-expanded, smooth height transitions

6. MODERN CSS TECHNIQUES:
   • CSS Grid with grid-template-areas - Named grid areas for clarity
   • Flexbox Gap Property - Spacing between items (gap: 1rem)
   • CSS Custom Properties - Variables for theming (--color-primary)
   • Clamp() for Responsive Type - fluid typography (clamp(1rem, 2vw, 2rem))
   • Aspect Ratio - aspect-ratio: 16/9 for media containers
   • Container Queries - @container for component-level responsiveness (when supported)

7. REFERENCE INSPIRATION (visual style, not content):
   • Linear - Minimal, clean, generous spacing, subtle animations
   • Stripe - Professional, clear hierarchy, excellent use of whitespace
   • Vercel - Modern gradients, sharp typography, dark mode excellence
   • Apple - Bento grids, bold imagery, asymmetric layouts
   • Figma - Playful colors, clear CTAs, excellent component design
   • Notion - Clean cards, soft shadows, intuitive information hierarchy

8. LAYOUT RECIPES TO USE:
   • Hero Section: Full-height, centered content, background image/gradient, large heading
   • Feature Grid: 3-column grid (desktop) → 1-column (mobile), icon + heading + description
   • Testimonial Carousel: Horizontal scroll, snap points, card-based
   • Pricing Cards: 3 tiers, highlight middle option, clear CTAs
   • Dashboard Stats: Bento grid, varying card sizes, data visualization
   • Blog Layout: Featured post large, grid of smaller posts
   • Navigation: Sticky header, blur background, minimal logo + links + CTA

IMPLEMENTATION CHECKLIST:
✓ Use modern CSS (Grid, Flexbox, Custom Properties, Clamp)
✓ Include micro-interactions (hover states, smooth transitions)
✓ Apply contemporary spacing (generous whitespace, consistent rhythm)
✓ Implement modern typography (bold headings, readable body, proper scale)
✓ Create depth with subtle shadows and layering
✓ Design responsive-first (mobile → desktop)
✓ Add visual interest through asymmetry or unique layouts
✓ Ensure design feels current and polished (2024/2025 aesthetic)`;

  if (designSystemUrl || templateStyles || (designSystemComponents && designSystemComponents.length > 0)) {
    systemContext += `\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  CRITICAL: DESIGN SYSTEM COMPLIANCE REQUIRED (95%+ ACCURACY MANDATORY)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This project has a DEFINED DESIGN SYSTEM. You MUST achieve 95%+ accuracy in following it.
Failure to comply with these guidelines is NOT acceptable.`;
  }

  if (designSystemUrl) {
    systemContext += `\n\nDESIGN SYSTEM SOURCE: ${designSystemUrl}

MANDATORY COMPLIANCE STEPS:
1. ANALYZE the design system thoroughly before designing
2. EXTRACT exact specifications:
   - Color tokens (primary, secondary, accent, neutral scales)
   - Typography scale (font families, sizes, weights, line heights)
   - Spacing scale (margin/padding values, grid system)
   - Border radius values (small, medium, large, full)
   - Shadow/elevation system (if present)
   - Component patterns and variants
3. REPLICATE the visual language exactly:
   - Match button styles (padding, border, radius, hover states)
   - Match input field styles (border, focus states, sizing)
   - Match card/container styles (background, borders, shadows)
   - Match heading styles (sizes, weights, letter spacing)
   - Match color usage patterns (when to use primary vs secondary)
4. MAINTAIN design system naming conventions
5. USE design system spacing values exclusively (no arbitrary values)

VERIFICATION BEFORE SUBMITTING:
✓ Every color used exists in the design system palette
✓ Every font size matches the design system typography scale
✓ Every spacing value follows the design system spacing scale
✓ Component styles match design system component patterns
✓ No arbitrary values that deviate from the design system`;
  }

  if (templateStyles) {
    systemContext += `\n\nEXTRACTED DESIGN TOKENS (MUST USE EXACTLY):

COLOR PALETTE (use ONLY these colors):
${templateStyles.colors?.map((color, i) => `- Color ${i + 1}: ${color}`).join('\n')}
→ Primary actions: Use the first color
→ Secondary elements: Use complementary colors from the palette
→ Text colors: Derive from palette with proper contrast (4.5:1+)
→ Backgrounds: Use lightest/darkest values from palette

TYPOGRAPHY SYSTEM (use ONLY these fonts):
${templateStyles.fonts?.map((font, i) => `- Font ${i + 1}: ${font}`).join('\n')}
→ Headings: Use the primary font (first in list)
→ Body text: Use the primary or secondary font
→ Code/monospace: Use monospace font if available

SPACING SCALE (use ONLY these values):
${templateStyles.spacing?.map((space, i) => `- Spacing level ${i + 1}: ${space}`).join('\n')}
→ Apply consistently: margins, padding, gaps
→ Larger spacing for sections, smaller for inline elements
→ Never use arbitrary spacing values (e.g., random px values)

LAYOUT PATTERNS (follow these approaches):
${templateStyles.layouts?.map((layout, i) => `- Pattern ${i + 1}: ${layout}`).join('\n')}
→ Use specified layout method (Grid, Flexbox, etc.)
→ Match the structural patterns from the design system

⚠️  CRITICAL: Any deviation from these exact values is a FAILURE.`;
  }

  if (designSystemComponents && designSystemComponents.length > 0) {
    systemContext += `\n\nCOMPONENT LIBRARY (reference these components):
${designSystemComponents.map((c, i) => `${i + 1}. ${c.name}${c.url ? ` (${c.url})` : ''}`).join('\n')}

COMPONENT USAGE RULES:
1. Design NEW components that visually match the EXISTING components listed above
2. Analyze the component list to understand the design system's visual style:
   - If you see "Material Button" → use Material Design principles
   - If you see "Shadcn Card" → use Shadcn styling patterns
   - If you see company-specific components → match their brand style
3. Extract patterns from component names:
   - Button variants (primary, secondary, outline, ghost)
   - Component sizing (sm, md, lg)
   - Component states (hover, active, disabled)
4. Create components that feel NATIVE to this design system
5. Match the naming conventions and structure patterns

FILLING DESIGN SYSTEM GAPS (CRITICAL):
When your design requires components NOT in the provided list, you MUST create them following these rules:

1. ANALYZE THE EXISTING COMPONENTS FIRST:
   - Study the visual language of provided components
   - Identify patterns: border radius style, shadow usage, color application, spacing rhythm
   - Note the level of detail/complexity in existing components
   - Understand the design system's personality (minimal, playful, corporate, modern, etc.)

2. CREATE MATCHING COMPONENTS:
   - Build missing components (modals, dropdowns, tooltips, badges, alerts, tabs, etc.) that look like they belong
   - Use the SAME visual patterns: if existing buttons have 8px border radius, new components use 8px
   - Apply the SAME color system: match how primary/secondary/accent colors are used
   - Maintain the SAME spacing scale: if cards use 16px padding, modals should too
   - Keep the SAME interaction patterns: hover effects, transitions, focus states

3. ACCESSIBILITY FOR ALL COMPONENTS (NEW & EXISTING):
   - Every component MUST meet WCAG 2.1 AA standards (already detailed above)
   - Focus indicators on ALL interactive elements (3:1 contrast minimum)
   - Proper ARIA attributes: aria-label, aria-expanded, aria-selected, aria-controls as needed
   - Semantic HTML: use native elements when possible (<dialog>, <details>, proper button/link usage)
   - Keyboard navigation: Enter/Space for buttons, Arrow keys for lists/tabs, Escape to close modals
   - Screen reader support: announce state changes with aria-live when appropriate

4. MODERN, UP-TO-DATE STYLING:
   - Use contemporary component patterns (2024/2025 standards):
     * Modals: Backdrop blur (backdrop-filter: blur(8px)), centered with smooth entrance animation
     * Dropdowns: Subtle shadow elevation, smooth slide-in animation, proper z-index layering
     * Tooltips: Dark background with light text (or vice versa for high contrast), arrow pointer, appears on hover/focus
     * Alerts: Icon + message layout, color-coded (success=green, error=red, info=blue, warning=yellow), dismissible
     * Badges: Pill-shaped or rounded rectangular, small size, subtle backgrounds, high contrast text
     * Tabs: Underline indicator or pill-style active state, smooth transition animation
     * Progress bars: Smooth animation, gradient fill option, percentage indicator
     * Skeleton loaders: Pulse animation, match content shape, subtle gray gradient
   
5. COMPONENT DESIGN PATTERNS:
   ✓ Cards: Consistent padding (16-24px), subtle borders or shadows, hover lift effect optional
   ✓ Buttons: Clear hierarchy (primary=filled, secondary=outline, tertiary=ghost), consistent height (40-44px)
   ✓ Inputs: Clear focus state, label positioning, error state styling, helper text support
   ✓ Modals: Centered overlay, backdrop, header/body/footer structure, close button, max-width constraint
   ✓ Dropdowns: Align with trigger, max-height with scroll, keyboard navigation, checkmarks for selected items
   ✓ Tooltips: Position aware (flip if near edge), small arrow pointer, brief text only, show on hover/focus

6. QUALITY CHECKLIST FOR GAP-FILLING COMPONENTS:
   ✓ Visual style matches existing components (could fool the design system creator)
   ✓ Uses same color tokens, typography scale, spacing values as existing components
   ✓ Includes all necessary states (default, hover, active, focus, disabled, error)
   ✓ Fully accessible with WCAG 2.1 AA compliance
   ✓ Modern interaction patterns with smooth animations
   ✓ Keyboard navigable and screen reader friendly
   ✓ Works perfectly within device constraints (${device.width}x${device.height}px)

VISUAL CONSISTENCY REQUIREMENTS:
✓ Button styles match the design system's button component patterns
✓ Card/container styles match the design system's card patterns
✓ Input styles match the design system's form component patterns
✓ Typography hierarchy matches the design system's text components
✓ Color application matches the design system's color usage
✓ Spacing patterns match the design system's layout components
✓ ALL gap-filling components are indistinguishable from native design system components

⚠️  Your design should look like it was built BY the design system team, including any components you create to fill gaps.`;
  }

  systemContext += `\n\nIMAGE REQUIREMENTS:
When the design needs images (hero images, product photos, avatars, illustrations):
- Use Picsum Photos service: https://picsum.photos/[width]/[height]
- Example hero image: <img src="https://picsum.photos/1200/600" alt="Hero image">
- Example product: <img src="https://picsum.photos/400/400" alt="Product">
- Example avatar: <img src="https://picsum.photos/100/100" alt="User avatar">
- Add ?random=[number] to get different images: https://picsum.photos/400/400?random=1
- Always include descriptive alt text for accessibility
- Set proper width/height in the URL to match your design needs
- For multiple different images, use different random numbers (e.g., ?random=1, ?random=2, ?random=3)

OUTPUT FORMAT:
Return ONLY valid JSON with this exact structure: {"html": "complete HTML markup", "css": "complete CSS styles"}
No explanations, no markdown, just pure JSON.`;

  // Lower temperature for better design system compliance when constraints are provided
  const hasDesignSystemConstraints = !!(designSystemUrl || templateStyles || (designSystemComponents && designSystemComponents.length > 0));
  const temperature = hasDesignSystemConstraints ? 0.65 : 0.75;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: systemContext
      },
      {
        role: "user",
        content: `DESIGN BRIEF: ${prompt}

STEP-BY-STEP APPROACH:
1. First, analyze the design requirements and identify the key user goals
2. Plan the information architecture and content hierarchy
3. Choose an appropriate layout structure for ${device.name}
4. Select a cohesive color scheme with proper contrast ratios
5. Design the interface with attention to typography, spacing, and visual flow
6. Add polish through subtle shadows, borders, and transitions

DELIVERABLES:
Create a stunning, professional ${device.name} interface featuring:
- Complete HTML structure (semantic elements: header, nav, main, sections, footer as appropriate)
- Beautiful, modern CSS with thoughtful typography and spacing
- Real, contextually appropriate content (no Lorem Ipsum - use actual relevant text)
- High-quality placeholder images (hero images, product photos, avatars as needed)
- Professional color scheme with intentional color choices
- Hover states and interactive element styling
- Polished details (shadows, borders, transitions)

QUALITY STANDARDS:
✓ Visual hierarchy is immediately clear
✓ Text is highly readable with proper contrast (4.5:1+ normal, 3:1+ large)
✓ Spacing creates visual breathing room
✓ Design feels cohesive and intentional
✓ All interactive elements are obvious and accessible
✓ Layout works perfectly within ${device.width}x${device.height}px

ACCESSIBILITY CHECKLIST (VERIFY ALL BEFORE SUBMITTING):
✓ Proper heading hierarchy (h1 → h2 → h3, no skipping)
✓ All images have descriptive alt text
✓ All form inputs have associated <label> elements with for/id
✓ Color contrast meets 4.5:1 (normal text) and 3:1 (large text)
✓ CSS includes focus states: button:focus, input:focus, a:focus with visible outline
✓ Semantic HTML used throughout (<header>, <nav>, <main>, <button>, etc.)
✓ CSS sets body { font-size: 16px; line-height: 1.5; }
✓ Touch targets have min-height: 44px (mobile) or min-height: 24px (desktop)
✓ ARIA landmarks for page regions (role attributes or semantic tags)
✓ Keyboard navigation fully functional (tab order, enter/space work)

${designSystemUrl || templateStyles || (designSystemComponents && designSystemComponents.length > 0) ? `
DESIGN SYSTEM COMPLIANCE CHECKLIST (95%+ ACCURACY REQUIRED):
✓ ALL colors are from the design system palette (no random colors)
✓ ALL font sizes match the design system typography scale (no arbitrary sizes)
✓ ALL spacing values follow the design system spacing scale (no random margins/padding)
✓ Button styles exactly match design system button patterns (padding, border, radius, colors)
✓ Input/form styles exactly match design system form component patterns
✓ Card/container styles exactly match design system container patterns
✓ Component naming follows design system conventions
✓ Visual hierarchy matches design system principles
✓ Color application (primary/secondary/accent) follows design system usage patterns
✓ Layout structure follows design system grid/spacing system

⚠️  FINAL VERIFICATION: Review your design against the design system.
If ANY element deviates from the design system specifications, FIX IT before submitting.
Design system compliance is MANDATORY, not optional.
` : ''}
Return JSON: {"html": "<your complete HTML>", "css": "your complete CSS"}`
      }
    ],
    response_format: { type: "json_object" },
    max_completion_tokens: 16000,
    temperature: temperature,
  });

  const result = JSON.parse(response.choices[0].message.content || '{"html":"","css":""}');
  
  const validation = validateDesign(result.html || '', result.css || '');
  
  console.log('OpenAI response:', {
    hasHtml: !!result.html,
    htmlLength: result.html?.length || 0,
    cssLength: result.css?.length || 0,
    validationScore: validation.score,
    isValid: validation.isValid,
    issues: validation.issues
  });

  if (!validation.isValid) {
    console.warn(`Design validation failed (score: ${validation.score}/100). Issues:`, validation.issues);
  }

  if (!result.html || result.html.length === 0) {
    console.error('OpenAI returned empty HTML, using fallback');
    return {
      device: device.id,
      html: `<div style="padding: 20px; font-family: system-ui, -apple-system, sans-serif;">
        <h1 style="color: #333; margin-bottom: 16px;">${prompt}</h1>
        <p style="color: #666; line-height: 1.6;">Design generation incomplete. Please try again with a more specific prompt.</p>
      </div>`,
      css: `body { margin: 0; padding: 0; box-sizing: border-box; }`
    };
  }
  
  return {
    device: device.id,
    html: result.html,
    css: result.css || '',
  };
}

interface RefineDesignParams {
  currentHtml: string;
  currentCss: string;
  refinementPrompt: string;
  device: {
    id: string;
    name: string;
    width: number;
    height: number;
  };
  designSystemUrl?: string;
  designSystemComponents?: { name: string; url: string }[];
  templateStyles?: {
    colors?: string[];
    fonts?: string[];
    spacing?: string[];
    layouts?: string[];
  };
}

export async function refineDesign(params: RefineDesignParams) {
  const openai = getOpenAIClient();
  const { currentHtml, currentCss, refinementPrompt, device, designSystemUrl, designSystemComponents, templateStyles } = params;

  let systemContext = `You are a senior UI/UX designer with expert skills in iterative design refinement. Your approach:
- Analyze existing design to understand its structure and intent
- Make precise, targeted changes that improve the design
- Preserve what's working well while addressing feedback
- Maintain design consistency and cohesion
- Ensure all changes enhance user experience

REFINEMENT PRINCIPLES:
- Understand the "why" behind the feedback before making changes
- Make surgical improvements without disrupting the overall design
- Enhance visual hierarchy and clarity through refinement
- Test changes mentally for unintended side effects
- Preserve the design system's visual language
- ALWAYS maintain WCAG 2.1 AA accessibility compliance

WCAG 2.1 LEVEL AA ACCESSIBILITY REQUIREMENTS (MAINTAIN AT ALL TIMES):
- Color contrast: 4.5:1 (normal text), 3:1 (large text, interactive elements)
- Proper heading hierarchy (h1 → h2 → h3, no skipping)
- All images have descriptive alt text
- Form inputs have associated labels
- Visible focus states (3:1 contrast minimum)
- Semantic HTML (<header>, <nav>, <main>, <button>, etc.)
- Minimum 16px body text, 1.5 line-height
- Touch targets 44x44px (mobile) or 24x24px (desktop)
- ARIA landmarks and roles for page regions
- Keyboard navigation fully functional

TECHNICAL REQUIREMENTS FOR ${device.name} (${device.width}x${device.height}px):
1. Modify the HTML/CSS based PRECISELY on the refinement instructions
2. Preserve the overall structure and content unless explicitly asked to change
3. Maintain semantic HTML5 and WCAG 2.1 AA accessibility standards
4. Keep the design within device constraints
5. Return COMPLETE, WORKING HTML with all necessary CSS
6. NEVER compromise accessibility during refinement

MANDATORY CSS ACCESSIBILITY (must preserve/add if missing):
- Base font-size: 16px minimum (body { font-size: 16px; })
- Visible focus states: button:focus, input:focus, etc. with outline or box-shadow
- Line-height: 1.5 minimum for body text
- Touch targets: 44px (mobile) or 24px (desktop) minimum

MODERN WEB DESIGN PATTERNS (2024/2025 - apply during refinement when relevant):
When enhancing the design, consider these contemporary approaches:

1. LAYOUT ENHANCEMENTS:
   • Bento Grid Layouts - Asymmetric card grids with varying sizes (inspired by Apple, Arc browser)
   • Split Screen Designs - Dramatic 50/50 divisions with contrasting content
   • Floating Elements - Cards and components with depth using shadows and transforms
   • Generous Whitespace - Spacious designs that breathe (Linear, Stripe approach)
   • Asymmetric Compositions - Breaking the grid intentionally for visual interest
   • Full-Bleed Sections - Content that stretches edge-to-edge for impact

2. TYPOGRAPHY IMPROVEMENTS:
   • Bold, Oversized Headings - Hero text at 64px-96px+ for impact
   • Tight Letter Spacing - -0.02em to -0.05em on large headings for modern feel
   • Font Pairing - Sans-serif headlines + serif body, or vice versa
   • Variable Fonts - Smooth weight transitions for polish
   • Monospace Accents - Code-style fonts for tech/data elements
   • Gradient Text - Subtle color transitions on headings (use background-clip: text)

3. VISUAL POLISH:
   • Subtle Gradients - Soft, multi-color backgrounds (not harsh)
   • Dark Mode Consideration - Ensure refinements work in dark themes
   • Accent Color System - Bold accent color against neutral palette
   • Glassmorphism - Frosted glass effects with backdrop-filter: blur()
   • Elevated Cards - Subtle shadows with hover lift animations
   • Color Overlays - Tinted layers over images for text readability

4. MICRO-INTERACTIONS:
   • Subtle Animations - Scale/opacity changes on hover (transform: scale(1.02))
   • Smooth Transitions - All state changes animated with ease-in-out
   • Progress Indicators - Visual feedback for loading/processing states
   • Skeleton Screens - Placeholder content while loading (not spinners)
   • Hover Lift Effect - Cards rise on hover (transform: translateY(-4px))
   • Focus Rings - Modern, rounded focus indicators with offset

5. MODERN COMPONENTS:
   • Pill-Shaped Buttons - Fully rounded (border-radius: 9999px) for modern feel
   • Ghost Buttons - Transparent background with border, fills on hover
   • Input Groups - Combined inputs with shared borders (search + button)
   • Badge Clusters - Small, colored labels for categorization
   • Avatar Stacks - Overlapping circular avatars for team/users
   • Stats Cards - Large numbers with small labels, minimal decoration

6. CSS TECHNIQUES:
   • CSS Grid with grid-template-areas - Named grid areas for clarity
   • Flexbox Gap Property - Spacing between items (gap: 1rem)
   • CSS Custom Properties - Variables for theming (--color-primary)
   • Clamp() for Responsive Type - fluid typography (clamp(1rem, 2vw, 2rem))
   • Aspect Ratio - aspect-ratio: 16/9 for media containers
   • Modern Selectors - :has(), :is(), :where() for cleaner CSS

7. REFERENCE INSPIRATION (visual style approach, not content):
   • Linear - Minimal, clean, generous spacing, subtle animations
   • Stripe - Professional, clear hierarchy, excellent use of whitespace
   • Vercel - Modern gradients, sharp typography, dark mode excellence
   • Apple - Bento grids, bold imagery, asymmetric layouts
   • Figma - Playful colors, clear CTAs, excellent component design
   • Notion - Clean cards, soft shadows, intuitive information hierarchy

8. LAYOUT RECIPES (when adding new sections):
   • Hero Section: Full-height, centered content, background image/gradient, large heading
   • Feature Grid: 3-column grid (desktop) → 1-column (mobile), icon + heading + description
   • Testimonial Carousel: Horizontal scroll, snap points, card-based
   • Pricing Cards: 3 tiers, highlight middle option, clear CTAs
   • Dashboard Stats: Bento grid, varying card sizes, data visualization
   • Blog Layout: Featured post large, grid of smaller posts
   • Navigation: Sticky header, blur background, minimal logo + links + CTA

MODERN DESIGN IMPLEMENTATION (during refinement):
✓ Apply modern CSS where appropriate (Grid, Flexbox, Custom Properties, Clamp)
✓ Add micro-interactions if refinement calls for it (hover states, smooth transitions)
✓ Consider contemporary spacing patterns (generous whitespace, consistent rhythm)
✓ Enhance typography if requested (bold headings, readable body, proper scale)
✓ Add depth with subtle shadows and layering where fitting
✓ Ensure refinements feel current and polished (2024/2025 aesthetic)
✓ Always maintain existing design language while applying modern enhancements`;

  if (designSystemUrl || templateStyles || (designSystemComponents && designSystemComponents.length > 0)) {
    systemContext += `\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  CRITICAL: DESIGN SYSTEM COMPLIANCE REQUIRED (95%+ ACCURACY MANDATORY)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This project has a DEFINED DESIGN SYSTEM. Refinements MUST maintain 95%+ accuracy.
DO NOT introduce arbitrary values or deviate from the design system.`;
  }

  if (designSystemUrl) {
    systemContext += `\n\nDESIGN SYSTEM SOURCE: ${designSystemUrl}

REFINEMENT CONSTRAINTS (MAINTAIN STRICTLY):
- Preserve exact design system color tokens
- Preserve design system typography scale
- Preserve design system spacing values
- Preserve design system component patterns
- Only modify what the user explicitly requests
- NEVER introduce non-design-system values during refinement

VERIFICATION:
✓ Refined design still uses only design system colors
✓ Refined design still uses only design system font sizes
✓ Refined design still uses only design system spacing values
✓ Component styles still match design system patterns`;
  }

  if (templateStyles) {
    systemContext += `\n\nDESIGN TOKENS (MUST PRESERVE EXACTLY):

COLOR PALETTE (use ONLY these):
${templateStyles.colors?.map((color, i) => `- ${color}`).join('\n')}
⚠️  During refinement: ONLY use colors from this palette

TYPOGRAPHY (use ONLY these):
${templateStyles.fonts?.map((font, i) => `- ${font}`).join('\n')}
⚠️  During refinement: ONLY use fonts from this list

SPACING (use ONLY these):
${templateStyles.spacing?.map((space, i) => `- ${space}`).join('\n')}
⚠️  During refinement: ONLY use spacing values from this scale

LAYOUTS (maintain these):
${templateStyles.layouts?.map((layout, i) => `- ${layout}`).join('\n')}
⚠️  During refinement: Preserve layout patterns`;
  }

  if (designSystemComponents && designSystemComponents.length > 0) {
    systemContext += `\n\nCOMPONENT LIBRARY:
${designSystemComponents.map((c, i) => `${i + 1}. ${c.name}`).join('\n')}

REFINEMENT RULES:
- Preserve visual consistency with these components
- Maintain design system's component styling patterns
- Do NOT introduce styles that conflict with the design system
- Refined components should still feel native to the design system`;
  }

  systemContext += `\n\nIMAGE REQUIREMENTS:
When adding or modifying images in the refined design:
- Use Picsum Photos service: https://picsum.photos/[width]/[height]
- Example hero image: <img src="https://picsum.photos/1200/600" alt="Hero image">
- Example product: <img src="https://picsum.photos/400/400" alt="Product">
- Example avatar: <img src="https://picsum.photos/100/100" alt="User avatar">
- Add ?random=[number] to get different images: https://picsum.photos/400/400?random=1
- Always include descriptive alt text for accessibility
- Set proper width/height in the URL to match your design needs
- For multiple different images, use different random numbers (e.g., ?random=1, ?random=2, ?random=3)

OUTPUT FORMAT:
Return ONLY valid JSON: {"html": "refined HTML markup", "css": "refined CSS styles"}
No explanations, just pure JSON.`;

  // Lower temperature for better precision when design systems are provided
  const hasDesignSystemConstraints = !!(designSystemUrl || templateStyles || (designSystemComponents && designSystemComponents.length > 0));
  const temperature = hasDesignSystemConstraints ? 0.5 : 0.55;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: systemContext
      },
      {
        role: "user",
        content: `EXISTING DESIGN:

HTML:
${currentHtml}

CSS:
${currentCss}

REFINEMENT REQUEST: ${refinementPrompt}

REFINEMENT APPROACH:
1. Analyze the current design and understand what's working
2. Identify exactly what needs to change based on the refinement request
3. Plan the minimal changes needed to address the feedback
4. Implement the changes while preserving design consistency
5. Review to ensure no unintended consequences

DELIVERABLES:
Refine the design with:
- Targeted changes that directly address the feedback
- Preserved design structure and successful elements
- Enhanced visual polish and user experience
- Maintained semantic HTML and accessibility
- Continued adherence to design system (if applicable)

QUALITY CHECKS:
✓ Refinement request is fully addressed
✓ Design consistency is maintained
✓ No breaking changes to working elements
✓ Visual hierarchy remains clear
✓ All functionality is preserved or enhanced
✓ WCAG 2.1 AA compliance maintained (contrast, semantics, keyboard access, labels)
✓ Accessibility features not degraded during refinement

${designSystemUrl || templateStyles || (designSystemComponents && designSystemComponents.length > 0) ? `
DESIGN SYSTEM COMPLIANCE (95%+ ACCURACY REQUIRED):
✓ NO arbitrary colors introduced - all colors from design system palette
✓ NO arbitrary font sizes - all sizes from design system typography scale
✓ NO arbitrary spacing - all margins/padding from design system spacing scale
✓ Component patterns preserved and still match design system
✓ Visual language remains consistent with design system
✓ Refinements enhance design WITHOUT breaking design system compliance

⚠️  CRITICAL: Verify the refined design against design system specifications.
If you introduced ANY values not in the design system, REMOVE them and use correct values.
` : ''}
Return JSON: {"html": "<refined complete HTML>", "css": "refined complete CSS"}`
      }
    ],
    response_format: { type: "json_object" },
    max_completion_tokens: 16000,
    temperature: temperature,
  });

  const result = JSON.parse(response.choices[0].message.content || '{"html":"","css":""}');
  
  const validation = validateDesign(result.html || '', result.css || '');
  
  console.log('OpenAI refine response:', {
    hasHtml: !!result.html,
    htmlLength: result.html?.length || 0,
    cssLength: result.css?.length || 0,
    validationScore: validation.score,
    isValid: validation.isValid,
    issues: validation.issues
  });

  if (!validation.isValid) {
    console.warn(`Refined design validation failed (score: ${validation.score}/100). Issues:`, validation.issues);
  }

  if (!result.html || result.html.length === 0) {
    console.error('OpenAI returned empty refined HTML, returning original');
    return {
      device: device.id,
      html: currentHtml,
      css: currentCss,
    };
  }
  
  return {
    device: device.id,
    html: result.html,
    css: result.css || '',
  };
}
