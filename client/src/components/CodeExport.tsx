import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Check, Download } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface CodeExportProps {
  html: string;
  css: string;
  device?: string;
}

export function CodeExport({ html, css, device }: CodeExportProps) {
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [copiedCss, setCopiedCss] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const { toast } = useToast();

  const jsonData = JSON.stringify({ 
    device: device || 'unknown',
    html, 
    css 
  }, null, 2);

  const copyToClipboard = async (text: string, type: 'html' | 'css' | 'json') => {
    await navigator.clipboard.writeText(text);
    
    if (type === 'html') {
      setCopiedHtml(true);
      setTimeout(() => setCopiedHtml(false), 2000);
    } else if (type === 'css') {
      setCopiedCss(true);
      setTimeout(() => setCopiedCss(false), 2000);
    } else {
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2000);
    }

    toast({
      title: "Copied to clipboard",
      description: `${type.toUpperCase()} code copied successfully`,
    });
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "File downloaded",
      description: `${filename} has been downloaded`,
    });
  };

  const downloadHtml = () => {
    downloadFile(html, 'design.html', 'text/html');
  };

  const downloadCss = () => {
    downloadFile(css, 'design.css', 'text/css');
  };

  const downloadJson = () => {
    downloadFile(jsonData, 'design.json', 'application/json');
  };

  const downloadBoth = () => {
    downloadFile(html, 'design.html', 'text/html');
    setTimeout(() => {
      downloadFile(css, 'design.css', 'text/css');
    }, 100);
    setTimeout(() => {
      downloadFile(jsonData, 'design.json', 'application/json');
    }, 200);
  };

  return (
    <div className="space-y-4 flex flex-col h-full">
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h3 className="text-sm font-medium">Generated Code</h3>
          <p className="text-xs text-muted-foreground">Copy or download HTML/CSS/JSON</p>
        </div>
        <Button
          size="sm"
          onClick={downloadBoth}
          data-testid="button-download-all-code"
        >
          <Download className="h-4 w-4 mr-2" />
          Download All
        </Button>
      </div>
      
      <Tabs defaultValue="html" className="w-full flex-1 flex flex-col">
        <TabsList className="w-full flex-shrink-0">
          <TabsTrigger value="html" className="flex-1">HTML</TabsTrigger>
          <TabsTrigger value="css" className="flex-1">CSS</TabsTrigger>
          <TabsTrigger value="json" className="flex-1">JSON</TabsTrigger>
        </TabsList>
        
        <TabsContent value="html" className="space-y-2 flex-1 flex flex-col">
          <div className="flex justify-end gap-2 flex-shrink-0">
            <Button
              size="sm"
              variant="outline"
              onClick={downloadHtml}
              data-testid="button-download-html"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
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
                  Copy
                </>
              )}
            </Button>
          </div>
          <Card className="p-4 flex-1 overflow-hidden">
            <pre className="text-xs font-mono overflow-auto h-full">
              <code>{html}</code>
            </pre>
          </Card>
        </TabsContent>
        
        <TabsContent value="css" className="space-y-2 flex-1 flex flex-col">
          <div className="flex justify-end gap-2 flex-shrink-0">
            <Button
              size="sm"
              variant="outline"
              onClick={downloadCss}
              data-testid="button-download-css"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
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
                  Copy
                </>
              )}
            </Button>
          </div>
          <Card className="p-4 flex-1 overflow-hidden">
            <pre className="text-xs font-mono overflow-auto h-full">
              <code>{css}</code>
            </pre>
          </Card>
        </TabsContent>

        <TabsContent value="json" className="space-y-2 flex-1 flex flex-col">
          <div className="flex justify-end gap-2 flex-shrink-0">
            <Button
              size="sm"
              variant="outline"
              onClick={downloadJson}
              data-testid="button-download-json"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => copyToClipboard(jsonData, 'json')}
              data-testid="button-copy-json"
            >
              {copiedJson ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </>
              )}
            </Button>
          </div>
          <Card className="p-4 flex-1 overflow-hidden">
            <pre className="text-xs font-mono overflow-auto h-full">
              <code>{jsonData}</code>
            </pre>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
