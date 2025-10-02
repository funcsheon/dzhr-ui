import { useState } from "react";
import { DeviceSelector } from "@/components/DeviceSelector";
import { DesignSystemUpload } from "@/components/DesignSystemUpload";
import { DesignSystemLibrary } from "@/components/DesignSystemLibrary";
import { TemplateUrlInput } from "@/components/TemplateUrlInput";
import { PromptInput } from "@/components/PromptInput";
import { DesignCanvas } from "@/components/DesignCanvas";
import { CodeExport } from "@/components/CodeExport";
import { ExportPanel } from "@/components/ExportPanel";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { toPng } from 'html-to-image';
import type { DesignSystem } from "@shared/schema";

export default function Home() {
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [components, setComponents] = useState<{ name: string; url: string }[]>([]);
  const [designSystemUrl, setDesignSystemUrl] = useState('');
  const [templateUrl, setTemplateUrl] = useState('');
  const [templateStyles, setTemplateStyles] = useState<any>();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [designs, setDesigns] = useState<any[]>([]);
  const { toast } = useToast();

  const handleDeviceToggle = (deviceId: string) => {
    setSelectedDevices(prev =>
      prev.includes(deviceId)
        ? prev.filter(id => id !== deviceId)
        : [...prev, deviceId]
    );
  };

  const handleLoadDesignSystem = (system: DesignSystem) => {
    setComponents(system.components || []);
    if (system.sourceUrl) {
      setDesignSystemUrl(system.sourceUrl);
    }
  };

  const handleAddComponents = (newComponents: { name: string; url: string }[]) => {
    setComponents(prev => [...prev, ...newComponents]);
  };

  const handleAnalyzeDesignSystem = async () => {
    if (!designSystemUrl) return;
    
    try {
      const response = await fetch('/api/analyze-design-system', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: designSystemUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze design system');
      }

      const data = await response.json();
      
      if (data.components && data.components.length > 0) {
        const newComponents = data.components.map((name: string, index: number) => ({
          name,
          url: data.componentLinks?.[index] || designSystemUrl,
        }));
        setComponents(prev => [...prev, ...newComponents]);
      }
      
      const componentCount = data.components?.length || 0;
      const linkCount = data.componentLinks?.length || 0;
      
      toast({
        title: "Design system analyzed",
        description: `Found ${componentCount} components${linkCount > 0 ? ` with ${linkCount} links` : ''}`,
      });
    } catch (error) {
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Could not analyze design system",
        variant: "destructive",
      });
    }
  };

  const handleAnalyzeTemplate = async () => {
    if (!templateUrl) return;

    try {
      const response = await fetch('/api/analyze-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: templateUrl }),
      });

      if (!response.ok) throw new Error('Failed to analyze template');

      const styles = await response.json();
      setTemplateStyles(styles);
      
      toast({
        title: "Template analyzed",
        description: "Successfully extracted styles from the website",
      });
    } catch (error) {
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Could not analyze template",
        variant: "destructive",
      });
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/generate-designs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          devices: selectedDevices,
          designSystemUrl: designSystemUrl || undefined,
          designSystemComponents: components.length > 0 ? components : undefined,
          templateStyles: templateStyles || undefined,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate designs');

      const { designs: generatedDesigns } = await response.json();
      setDesigns(generatedDesigns);
      
      toast({
        title: "Designs generated",
        description: `Created ${generatedDesigns.length} responsive designs`,
      });
    } catch (error) {
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Could not generate designs",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportFigma = async () => {
    if (designs.length === 0) return;

    try {
      const response = await fetch('/api/export-figma', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          designs,
          projectName: prompt.slice(0, 30) || 'Genius-UI',
        }),
      });

      if (!response.ok) throw new Error('Failed to export to Figma');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${prompt.slice(0, 30) || 'design'}.fig.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Exported successfully",
        description: "Your Figma file has been downloaded",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: error instanceof Error ? error.message : "Could not export to Figma",
        variant: "destructive",
      });
    }
  };

  const handleExportImage = async () => {
    if (designs.length === 0) return;

    try {
      const previewElement = document.querySelector('[data-testid="design-preview"]');
      if (!previewElement) {
        throw new Error('Design preview not found');
      }

      const dataUrl = await toPng(previewElement as HTMLElement);
      const link = document.createElement('a');
      link.download = `${prompt.slice(0, 30) || 'design'}.png`;
      link.href = dataUrl;
      link.click();

      toast({
        title: "Exported successfully",
        description: "Your design has been exported as PNG",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: error instanceof Error ? error.message : "Could not export image",
        variant: "destructive",
      });
    }
  };

  const handleExportCode = () => {
    toast({
      title: "Code ready",
      description: "Check the Code tab to copy HTML/CSS",
    });
  };

  const activeDesign = designs.find(d => d.device === selectedDevices[0]) || designs[0];

  return (
    <div className="h-screen flex flex-col">
      <header className="h-16 border-b flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Genius UI</h1>
            <p className="text-xs text-muted-foreground">Create responsive designs instantly</p>
          </div>
        </div>
        <ThemeToggle />
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-80 border-r overflow-hidden flex flex-col">
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6">
              <DeviceSelector
                selectedDevices={selectedDevices}
                onDeviceToggle={handleDeviceToggle}
              />
              
              <DesignSystemUpload
                components={components}
                onComponentsChange={setComponents}
                designSystemUrl={designSystemUrl}
                onDesignSystemUrlChange={setDesignSystemUrl}
                onAnalyzeDesignSystem={handleAnalyzeDesignSystem}
              />
              
              <DesignSystemLibrary
                components={components}
                onLoadDesignSystem={handleLoadDesignSystem}
                onAddComponents={handleAddComponents}
              />
              
              <TemplateUrlInput
                templateUrl={templateUrl}
                onUrlChange={setTemplateUrl}
                templateStyles={templateStyles}
                onAnalyze={handleAnalyzeTemplate}
              />
              
              <PromptInput
                prompt={prompt}
                onPromptChange={setPrompt}
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
                disabled={selectedDevices.length === 0}
              />
            </div>
          </ScrollArea>
        </aside>

        <main className="flex-1 overflow-hidden">
          <DesignCanvas designs={designs} />
        </main>

        <aside className="w-96 border-l overflow-hidden flex flex-col">
          <Tabs defaultValue="export" className="flex-1 flex flex-col">
            <TabsList className="mx-6 mt-6">
              <TabsTrigger value="export" className="flex-1">Export</TabsTrigger>
              <TabsTrigger value="code" className="flex-1" disabled={!activeDesign}>
                Code
              </TabsTrigger>
            </TabsList>
            
            <ScrollArea className="flex-1 p-6">
              <TabsContent value="export" className="mt-0">
                <ExportPanel
                  onExportFigma={handleExportFigma}
                  onExportImage={handleExportImage}
                  onExportCode={handleExportCode}
                />
              </TabsContent>
              
              <TabsContent value="code" className="mt-0">
                {activeDesign && (
                  <CodeExport
                    html={activeDesign.html}
                    css={activeDesign.css}
                  />
                )}
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </aside>
      </div>
    </div>
  );
}
