import { useState } from "react";
import { DeviceSelector } from "@/components/DeviceSelector";
import { DesignSystemUpload } from "@/components/DesignSystemUpload";
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

export default function Home() {
  const [selectedDevices, setSelectedDevices] = useState<string[]>(['phone', 'desktop']);
  const [components, setComponents] = useState<{ name: string; url: string }[]>([]);
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

  const handleAnalyzeTemplate = () => {
    setTemplateStyles({
      colors: ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b'],
      fonts: ['Inter', 'JetBrains Mono'],
      spacing: ['16px', '24px', '32px'],
      layouts: ['Grid', 'Flexbox'],
    });
    toast({
      title: "Template analyzed",
      description: "Successfully extracted styles from the website",
    });
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    setTimeout(() => {
      const mockDesigns = selectedDevices.map(device => ({
        device,
        html: `
          <div style="padding: ${device === 'phone' ? '24px' : '64px'}; font-family: Inter, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100%; display: flex; align-items: center; justify-content: center;">
            <div style="text-align: center; color: white;">
              <h1 style="font-size: ${device === 'phone' ? '32px' : '56px'}; font-weight: 700; margin-bottom: 16px;">${prompt.slice(0, 50)}</h1>
              <p style="font-size: ${device === 'phone' ? '16px' : '20px'}; margin-bottom: 32px; opacity: 0.9;">Generated with AI Design Generator</p>
              <button style="background: white; color: #667eea; padding: ${device === 'phone' ? '12px 24px' : '16px 32px'}; border-radius: 8px; border: none; font-weight: 600; font-size: ${device === 'phone' ? '14px' : '16px'}; cursor: pointer;">Get Started</button>
            </div>
          </div>
        `,
        css: `
          body { margin: 0; font-family: Inter, sans-serif; }
          * { box-sizing: border-box; }
        `,
      }));
      
      setDesigns(mockDesigns);
      setIsGenerating(false);
      
      toast({
        title: "Designs generated",
        description: `Created ${mockDesigns.length} responsive designs`,
      });
    }, 2500);
  };

  const handleExportFigma = () => {
    toast({
      title: "Exporting to Figma",
      description: "Your .fig file will download shortly",
    });
  };

  const handleExportImage = () => {
    toast({
      title: "Exporting as image",
      description: "Generating PNG files...",
    });
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
            <h1 className="text-lg font-semibold">AI Design Generator</h1>
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
