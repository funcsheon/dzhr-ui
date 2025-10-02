import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface CodeExportProps {
  html: string;
  css: string;
}

export function CodeExport({ html, css }: CodeExportProps) {
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [copiedCss, setCopiedCss] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = async (text: string, type: 'html' | 'css') => {
    await navigator.clipboard.writeText(text);
    
    if (type === 'html') {
      setCopiedHtml(true);
      setTimeout(() => setCopiedHtml(false), 2000);
    } else {
      setCopiedCss(true);
      setTimeout(() => setCopiedCss(false), 2000);
    }

    toast({
      title: "Copied to clipboard",
      description: `${type.toUpperCase()} code copied successfully`,
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Generated Code</h3>
      
      <Tabs defaultValue="html" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="html" className="flex-1">HTML</TabsTrigger>
          <TabsTrigger value="css" className="flex-1">CSS</TabsTrigger>
        </TabsList>
        
        <TabsContent value="html" className="space-y-2">
          <div className="flex justify-end">
            <Button
              size="sm"
              variant="outline"
              onClick={() => copyToClipboard(html, 'html')}
              data-testid="button-copy-html"
            >
              {copiedHtml ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy HTML
                </>
              )}
            </Button>
          </div>
          <Card className="p-4">
            <pre className="text-xs font-mono overflow-auto max-h-96">
              <code>{html}</code>
            </pre>
          </Card>
        </TabsContent>
        
        <TabsContent value="css" className="space-y-2">
          <div className="flex justify-end">
            <Button
              size="sm"
              variant="outline"
              onClick={() => copyToClipboard(css, 'css')}
              data-testid="button-copy-css"
            >
              {copiedCss ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy CSS
                </>
              )}
            </Button>
          </div>
          <Card className="p-4">
            <pre className="text-xs font-mono overflow-auto max-h-96">
              <code>{css}</code>
            </pre>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
