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
5. Make touch targets at least 44px height/width (mobile) or 24px (desktop)`;

  if (designSystemUrl) {
    systemContext += `\n\nDESIGN SYSTEM CONSTRAINTS:
Follow the design system guidelines at: ${designSystemUrl}
- Match component patterns and naming conventions
- Use the system's established visual language
- Maintain consistency with existing design tokens`;
  }

  if (templateStyles) {
    systemContext += `\n\nSTYLE REQUIREMENTS (must follow exactly):
- Color Palette: ${templateStyles.colors?.join(', ')} (use these as primary palette)
- Typography: ${templateStyles.fonts?.join(', ')} (use these font families)
- Spacing System: ${templateStyles.spacing?.join(', ')} (maintain consistent spacing)
- Layout Patterns: ${templateStyles.layouts?.join(', ')} (follow these layout approaches)`;
  }

  if (designSystemComponents && designSystemComponents.length > 0) {
    systemContext += `\n\nCOMPONENT LIBRARY:
Incorporate and reference these design system components: ${designSystemComponents.map(c => c.name).join(', ')}
Design components that feel native to this system.`;
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

Return JSON: {"html": "<your complete HTML>", "css": "your complete CSS"}`
      }
    ],
    response_format: { type: "json_object" },
    max_completion_tokens: 16000,
    temperature: 0.75,
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
- Touch targets: 44px (mobile) or 24px (desktop) minimum`;

  if (designSystemUrl) {
    systemContext += `\n\nDESIGN SYSTEM CONSTRAINTS:
Continue following the design system at: ${designSystemUrl}
Ensure refinements stay consistent with the system's guidelines.`;
  }

  if (templateStyles) {
    systemContext += `\n\nSTYLE REQUIREMENTS (maintain consistency):
- Color Palette: ${templateStyles.colors?.join(', ')}
- Typography: ${templateStyles.fonts?.join(', ')}
- Spacing System: ${templateStyles.spacing?.join(', ')}
- Layout Patterns: ${templateStyles.layouts?.join(', ')}`;
  }

  if (designSystemComponents && designSystemComponents.length > 0) {
    systemContext += `\n\nCOMPONENT LIBRARY:
Stay aligned with these components: ${designSystemComponents.map(c => c.name).join(', ')}`;
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

Return JSON: {"html": "<refined complete HTML>", "css": "refined complete CSS"}`
      }
    ],
    response_format: { type: "json_object" },
    max_completion_tokens: 16000,
    temperature: 0.55,
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
