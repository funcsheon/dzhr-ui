import { DesignCanvas } from '../DesignCanvas';

export default function DesignCanvasExample() {
  const mockDesigns = [
    {
      device: 'phone',
      html: `
        <div style="padding: 24px; font-family: Inter, sans-serif;">
          <h1 style="font-size: 28px; font-weight: 700; margin-bottom: 16px; color: #6366f1;">AI Design Generator</h1>
          <p style="color: #64748b; margin-bottom: 24px;">Create stunning responsive designs with AI</p>
          <button style="background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; border: none; font-weight: 600; cursor: pointer;">Get Started</button>
        </div>
      `,
      css: '',
    },
    {
      device: 'desktop',
      html: `
        <div style="padding: 64px; font-family: Inter, sans-serif; max-width: 1200px; margin: 0 auto;">
          <h1 style="font-size: 48px; font-weight: 700; margin-bottom: 24px; color: #6366f1;">AI Design Generator</h1>
          <p style="font-size: 20px; color: #64748b; margin-bottom: 32px;">Create stunning responsive designs with AI-powered tools</p>
          <div style="display: flex; gap: 16px;">
            <button style="background: #6366f1; color: white; padding: 16px 32px; border-radius: 8px; border: none; font-weight: 600; cursor: pointer; font-size: 16px;">Get Started</button>
            <button style="background: transparent; color: #6366f1; padding: 16px 32px; border-radius: 8px; border: 2px solid #6366f1; font-weight: 600; cursor: pointer; font-size: 16px;">Learn More</button>
          </div>
        </div>
      `,
      css: '',
    },
  ];

  return <DesignCanvas designs={mockDesigns} />;
}
