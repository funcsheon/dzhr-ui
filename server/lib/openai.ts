import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is not set. Please add your OpenAI API key to continue.');
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function analyzeWebsiteTemplate(url: string) {
  const openai = getOpenAIClient();
  const response = await openai.chat.completions.create({
    model: "gpt-5",
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
    model: "gpt-5",
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

  let systemContext = `You are an expert web designer. Create a complete, functional HTML/CSS design for a ${device.name} (${device.width}x${device.height}px).

CRITICAL REQUIREMENTS:
1. Return COMPLETE, WORKING HTML with actual content (not placeholders)
2. Include ALL necessary CSS for styling
3. Make it visually beautiful and modern
4. Use semantic HTML5 elements
5. Ensure responsive design within ${device.width}x${device.height}px constraints`;

  if (designSystemUrl) {
    systemContext += `\n\nFollow the design system at: ${designSystemUrl}`;
  }

  if (templateStyles) {
    systemContext += `\n\nStyle constraints:
- Colors: ${templateStyles.colors?.join(', ')}
- Fonts: ${templateStyles.fonts?.join(', ')}
- Spacing: ${templateStyles.spacing?.join(', ')}
- Layouts: ${templateStyles.layouts?.join(', ')}`;
  }

  if (designSystemComponents && designSystemComponents.length > 0) {
    systemContext += `\n\nIncorporate these components: ${designSystemComponents.map(c => c.name).join(', ')}`;
  }

  systemContext += `\n\nReturn ONLY valid JSON: {"html": "complete HTML markup", "css": "complete CSS styles"}`;

  const response = await openai.chat.completions.create({
    model: "gpt-5",
    messages: [
      {
        role: "system",
        content: systemContext
      },
      {
        role: "user",
        content: `Design requirement: ${prompt}

Create a stunning ${device.name} interface with:
- Complete HTML structure (header, main content, footer if needed)
- Beautiful, modern CSS styling
- Actual content (not Lorem Ipsum placeholders)
- Professional color scheme and typography

Return JSON with format: {"html": "<div>...</div>", "css": "div { ... }"}`
      }
    ],
    response_format: { type: "json_object" },
    max_completion_tokens: 4096,
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
