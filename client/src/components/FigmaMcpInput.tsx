import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, Figma } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FigmaMcpInputProps {
  onComponentsExtracted: (components: { name: string; url: string }[]) => void;
}

export function FigmaMcpInput({ onComponentsExtracted }: FigmaMcpInputProps) {
  const [figmaUrl, setFigmaUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const extractFileKey = (url: string): string | null => {
    const match = url.match(/figma\.com\/(?:file|design)\/([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
  };

  const handleAnalyze = async () => {
    const fileKey = extractFileKey(figmaUrl);
    
    if (!fileKey) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid Figma file URL",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      const response = await fetch("/api/figma/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileKey }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze Figma file");
      }

      const data = await response.json();
      
      const components: { name: string; url: string }[] = [];
      
      if (data.components?.content) {
        const content = Array.isArray(data.components.content) 
          ? data.components.content 
          : [data.components.content];
        
        content.forEach((item: any) => {
          if (item.text && typeof item.text === 'string') {
            const componentMatches = item.text.matchAll(/Component:\s*([^\n]+)/g);
            for (const match of componentMatches) {
              components.push({
                name: match[1].trim(),
                url: figmaUrl,
              });
            }
          }
        });
      }

      if (components.length === 0) {
        toast({
          title: "No components found",
          description: "Could not extract components from this Figma file",
          variant: "destructive",
        });
        return;
      }

      onComponentsExtracted(components);

      toast({
        title: "Success",
        description: `Extracted ${components.length} component${components.length > 1 ? 's' : ''} from Figma`,
      });

      setFigmaUrl("");
    } catch (error) {
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Could not analyze Figma file",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Figma className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-medium">Import from Figma</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Paste a Figma file URL to extract components via MCP
        </p>
        <div className="flex gap-2">
          <Input
            type="url"
            placeholder="https://figma.com/file/..."
            value={figmaUrl}
            onChange={(e) => setFigmaUrl(e.target.value)}
            disabled={isAnalyzing}
            data-testid="input-figma-url"
          />
          <Button
            onClick={handleAnalyze}
            disabled={!figmaUrl || isAnalyzing}
            data-testid="button-analyze-figma"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Analyzing
              </>
            ) : (
              "Analyze"
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
