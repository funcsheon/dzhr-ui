import { Link, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface TemplateUrlInputProps {
  templateUrl: string;
  onUrlChange: (url: string) => void;
  templateStyles?: {
    colors?: string[];
    fonts?: string[];
    spacing?: string[];
    layouts?: string[];
  };
  onAnalyze: () => void;
}

export function TemplateUrlInput({ 
  templateUrl, 
  onUrlChange, 
  templateStyles,
  onAnalyze 
}: TemplateUrlInputProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    onAnalyze();
    setTimeout(() => setIsAnalyzing(false), 2000);
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium">Template Reference</h3>
      
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="url"
            placeholder="https://example.com"
            value={templateUrl}
            onChange={(e) => onUrlChange(e.target.value)}
            className="pl-9"
            data-testid="input-template-url"
          />
        </div>
        <Button
          onClick={handleAnalyze}
          disabled={!templateUrl || isAnalyzing}
          data-testid="button-analyze-template"
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

      {templateStyles && (
        <Card className="p-4 space-y-3">
          <h4 className="text-xs font-medium text-muted-foreground">Extracted Styles</h4>
          
          {templateStyles.colors && templateStyles.colors.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">Colors</p>
              <div className="flex gap-2 flex-wrap">
                {templateStyles.colors.map((color, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div 
                      className="h-6 w-6 rounded border border-border" 
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-xs font-mono">{color}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {templateStyles.fonts && templateStyles.fonts.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">Fonts</p>
              <div className="flex gap-2 flex-wrap">
                {templateStyles.fonts.map((font, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {font}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
