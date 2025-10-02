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

  let systemContext = `You are an expert web designer creating responsive HTML/CSS designs. 
Create a complete, production-ready design for a ${device.name} (${device.width}x${device.height}px).`;

  if (templateStyles) {
    systemContext += `\n\nUse these design styles from the template:
- Colors: ${templateStyles.colors?.join(', ')}
- Fonts: ${templateStyles.fonts?.join(', ')}
- Spacing: ${templateStyles.spacing?.join(', ')}
- Layouts: ${templateStyles.layouts?.join(', ')}`;
  }

  if (designSystemUrl) {
    systemContext += `\n\nThe design should follow the design system at: ${designSystemUrl}`;
  }

  if (designSystemComponents && designSystemComponents.length > 0) {
    systemContext += `\n\nAvailable design system components: ${designSystemComponents.map(c => c.name).join(', ')}`;
  }

  systemContext += `\n\nRespond with JSON containing "html" and "css" fields. The HTML should be complete and self-contained. The CSS should be modern and responsive.`;

  const response = await openai.chat.completions.create({
    model: "gpt-5",
    messages: [
      {
        role: "system",
        content: systemContext
      },
      {
        role: "user",
        content: `Create a ${device.name} design for: ${prompt}. Make it visually stunning, modern, and professional. Return JSON with format: { "html": "...", "css": "..." }`
      }
    ],
    response_format: { type: "json_object" },
    max_completion_tokens: 4096,
  });

  const result = JSON.parse(response.choices[0].message.content || '{"html":"","css":""}');
  
  return {
    device: device.id,
    html: result.html || '',
    css: result.css || '',
  };
}
