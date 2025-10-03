import { Upload, X, Link, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCallback, useState } from "react";
import { FigmaMcpInput } from "./FigmaMcpInput";

interface DesignSystemUploadProps {
  components: { name: string; url: string }[];
  onComponentsChange: React.Dispatch<React.SetStateAction<{ name: string; url: string }[]>>;
  designSystemUrl?: string;
  onDesignSystemUrlChange?: (url: string) => void;
  onAnalyzeDesignSystem?: () => void;
  isAnalyzing?: boolean;
}

export function DesignSystemUpload({ 
  components, 
  onComponentsChange,
  designSystemUrl = '',
  onDesignSystemUrlChange,
  onAnalyzeDesignSystem,
  isAnalyzing = false
}: DesignSystemUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [manualComponentName, setManualComponentName] = useState('');
  const [manualComponentUrl, setManualComponentUrl] = useState('');

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    
    for (const file of files) {
      const extension = file.name.split('.').pop()?.toLowerCase();
      const codeExtensions = ['css', 'scss', 'less', 'js', 'jsx', 'ts', 'tsx', 'json'];
      
      if (codeExtensions.includes(extension || '')) {
        const formData = new FormData();
        formData.append('file', file);
        
        try {
          const response = await fetch('/api/parse-code-file', {
            method: 'POST',
            body: formData,
          });
          
          if (response.ok) {
            const data = await response.json();
            const newComponents = data.components.map((comp: any) => ({
              name: comp.name,
              url: comp.url || '',
            }));
            onComponentsChange(prev => [...prev, ...newComponents]);
          }
        } catch (error) {
          console.error('Failed to parse code file:', error);
        }
      } else if (
        file.type.startsWith('image/') || 
        file.name.endsWith('.fig') || 
        file.name.endsWith('.sketch')
      ) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            const newComponent = {
              name: file.name.replace(/\.[^/.]+$/, ""),
              url: event.target.result as string,
            };
            onComponentsChange(prev => [...prev, newComponent]);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  }, [onComponentsChange]);

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    for (const file of files) {
      const extension = file.name.split('.').pop()?.toLowerCase();
      const codeExtensions = ['css', 'scss', 'less', 'js', 'jsx', 'ts', 'tsx', 'json'];
      
      if (codeExtensions.includes(extension || '')) {
        const formData = new FormData();
        formData.append('file', file);
        
        try {
          const response = await fetch('/api/parse-code-file', {
            method: 'POST',
            body: formData,
          });
          
          if (response.ok) {
            const data = await response.json();
            const newComponents = data.components.map((comp: any) => ({
              name: comp.name,
              url: comp.url || '',
            }));
            onComponentsChange(prev => [...prev, ...newComponents]);
          }
        } catch (error) {
          console.error('Failed to parse code file:', error);
        }
      } else {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            const newComponent = {
              name: file.name.replace(/\.[^/.]+$/, ""),
              url: event.target.result as string,
            };
            onComponentsChange(prev => [...prev, newComponent]);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const removeComponent = (index: number) => {
    onComponentsChange(components.filter((_, i) => i !== index));
  };

  const handleAddManualComponent = () => {
    if (manualComponentName.trim() && manualComponentUrl.trim()) {
      onComponentsChange(prev => [...prev, { 
        name: manualComponentName.trim(), 
        url: manualComponentUrl.trim() 
      }]);
      setManualComponentName('');
      setManualComponentUrl('');
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium">Design System</h3>
      
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="url">Analyze</TabsTrigger>
          <TabsTrigger value="figma">Figma</TabsTrigger>
          <TabsTrigger value="manual">Add Links</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="mt-3">
          <Card
            className={`border-2 border-dashed transition-colors ${
              isDragging ? 'border-primary bg-accent/50' : 'border-border'
            }`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <label className="flex flex-col items-center justify-center p-8 cursor-pointer">
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground text-center">
                Drop code files (.css, .js, .ts, .tsx) or design files here
              </span>
              <input
                type="file"
                multiple
                accept="image/*,.fig,.sketch,.json,.css,.scss,.less,.js,.jsx,.ts,.tsx"
                className="hidden"
                onChange={handleFileInput}
                data-testid="input-design-system-upload"
              />
            </label>
          </Card>
        </TabsContent>

        <TabsContent value="url" className="mt-3 space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="url"
                placeholder="https://example.com/design-system"
                value={designSystemUrl}
                onChange={(e) => onDesignSystemUrlChange?.(e.target.value)}
                className="pl-9"
                data-testid="input-design-system-url"
              />
            </div>
            <Button
              onClick={onAnalyzeDesignSystem}
              disabled={!designSystemUrl || isAnalyzing}
              data-testid="button-analyze-design-system"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Analyze'
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Provide a link to your design system documentation or component library
          </p>
        </TabsContent>

        <TabsContent value="figma" className="mt-3">
          <FigmaMcpInput onComponentsExtracted={(newComponents: { name: string; url: string }[]) => {
            onComponentsChange(prev => [...prev, ...newComponents]);
          }} />
        </TabsContent>

        <TabsContent value="manual" className="mt-3 space-y-3">
          <div className="space-y-2">
            <Input
              placeholder="Component name (e.g., Button, Card)"
              value={manualComponentName}
              onChange={(e) => setManualComponentName(e.target.value)}
              data-testid="input-manual-component-name"
            />
            <Input
              placeholder="Component URL or identifier"
              value={manualComponentUrl}
              onChange={(e) => setManualComponentUrl(e.target.value)}
              data-testid="input-manual-component-url"
            />
            <Button
              className="w-full"
              onClick={handleAddManualComponent}
              disabled={!manualComponentName.trim() || !manualComponentUrl.trim()}
              data-testid="button-add-manual-component"
            >
              <Upload className="h-4 w-4 mr-2" />
              Add Component
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Manually add component references by name and URL
          </p>
        </TabsContent>
      </Tabs>

      {components.length > 0 && (
        <Card className="p-3 space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            {components.length} component{components.length !== 1 ? 's' : ''} analyzed and ready to apply
          </p>
          <div className="space-y-1">
            {components.map((component, index) => (
              <div key={index} className="flex items-center justify-between gap-2 text-xs p-2 rounded bg-muted/50">
                <span className="truncate font-medium">{component.name}</span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-5 w-5 flex-shrink-0"
                  onClick={() => removeComponent(index)}
                  data-testid={`button-remove-component-${index}`}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
