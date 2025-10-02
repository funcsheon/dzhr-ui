import { CodeExport } from '../CodeExport';
import { Toaster } from "@/components/ui/toaster";

export default function CodeExportExample() {
  const mockHtml = `<div class="hero">
  <h1>Welcome to AI Design Generator</h1>
  <p>Create beautiful designs instantly</p>
  <button>Get Started</button>
</div>`;

  const mockCss = `.hero {
  padding: 64px;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

h1 {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 16px;
}`;

  return (
    <>
      <CodeExport html={mockHtml} css={mockCss} />
      <Toaster />
    </>
  );
}
