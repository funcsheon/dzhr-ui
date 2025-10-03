import OpenAI from "openai";

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is not set. Please add your OpenAI API key to continue.');
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
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
- Ensure high contrast for readability (4.5:1 minimum)
- Create designs that feel polished, professional, and trustworthy

TECHNICAL REQUIREMENTS FOR ${device.name} (${device.width}x${device.height}px):
1. Return COMPLETE, PRODUCTION-READY HTML with real, meaningful content
2. Include ALL necessary CSS with modern best practices (flexbox, grid, custom properties)
3. Use semantic HTML5 elements (header, nav, main, article, section, footer)
4. Ensure perfect responsive behavior within device constraints
5. Add micro-interactions and hover states for interactive elements
6. Use CSS variables for colors, spacing, and typography for consistency`;

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

  systemContext += `\n\nOUTPUT FORMAT:
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
- Professional color scheme with intentional color choices
- Hover states and interactive element styling
- Polished details (shadows, borders, transitions)

QUALITY STANDARDS:
✓ Visual hierarchy is immediately clear
✓ Text is highly readable with proper contrast
✓ Spacing creates visual breathing room
✓ Design feels cohesive and intentional
✓ All interactive elements are obvious and accessible
✓ Layout works perfectly within ${device.width}x${device.height}px

Return JSON: {"html": "<your complete HTML>", "css": "your complete CSS"}`
      }
    ],
    response_format: { type: "json_object" },
    max_completion_tokens: 16000,
    temperature: 0.75,
  });

  const result = JSON.parse(response.choices[0].message.content || '{"html":"","css":""}');
  
  console.log('OpenAI response:', {
    hasHtml: !!result.html,
    htmlLength: result.html?.length || 0,
    cssLength: result.css?.length || 0
  });

  // If OpenAI returns empty, provide a fallback
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

TECHNICAL REQUIREMENTS FOR ${device.name} (${device.width}x${device.height}px):
1. Modify the HTML/CSS based PRECISELY on the refinement instructions
2. Preserve the overall structure and content unless explicitly asked to change
3. Maintain semantic HTML5 and accessibility standards
4. Keep the design within device constraints
5. Return COMPLETE, WORKING HTML with all necessary CSS`;

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

  systemContext += `\n\nOUTPUT FORMAT:
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

Return JSON: {"html": "<refined complete HTML>", "css": "refined complete CSS"}`
      }
    ],
    response_format: { type: "json_object" },
    max_completion_tokens: 16000,
    temperature: 0.55,
  });

  const result = JSON.parse(response.choices[0].message.content || '{"html":"","css":""}');
  
  console.log('OpenAI refine response:', {
    hasHtml: !!result.html,
    htmlLength: result.html?.length || 0,
    cssLength: result.css?.length || 0
  });

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
