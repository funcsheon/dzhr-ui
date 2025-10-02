import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, FileCode, Image as ImageIcon } from "lucide-react";

interface ExportPanelProps {
  onExportFigma: () => void;
  onExportImage: () => void;
  onExportCode: () => void;
}

export function ExportPanel({ onExportFigma, onExportImage, onExportCode }: ExportPanelProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Export Options</h3>
      
      <div className="space-y-2">
        <Card className="p-4 hover-elevate cursor-pointer" onClick={onExportFigma}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileCode className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Figma File</p>
              <p className="text-xs text-muted-foreground">Download as .fig</p>
            </div>
            <Button size="sm" data-testid="button-export-figma">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </Card>

        <Card className="p-4 hover-elevate cursor-pointer" onClick={onExportImage}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <ImageIcon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">PNG/SVG</p>
              <p className="text-xs text-muted-foreground">Export as image</p>
            </div>
            <Button size="sm" data-testid="button-export-image">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </Card>

        <Card className="p-4 hover-elevate cursor-pointer" onClick={onExportCode}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileCode className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">HTML/CSS</p>
              <p className="text-xs text-muted-foreground">Copy code</p>
            </div>
            <Button size="sm" data-testid="button-export-code">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
