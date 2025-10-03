import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, FileCode, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";

interface ExportPanelProps {
  onExportFigma: () => void;
  onExportImage: () => void;
  onExportCode: () => void;
  disabled?: boolean;
}

export function ExportPanel({ onExportFigma, onExportImage, onExportCode, disabled }: ExportPanelProps) {
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const { toast } = useToast();

  const exportOptions = [
    {
      id: "figma",
      label: "Figma File",
      description: "Import into Figma for editing",
      icon: FileCode,
      handler: onExportFigma,
    },
    {
      id: "image",
      label: "Image Files",
      description: "PNG/SVG for presentations",
      icon: ImageIcon,
      handler: onExportImage,
    },
    {
      id: "code",
      label: "Source Code",
      description: "HTML/CSS for development",
      icon: FileCode,
      handler: onExportCode,
    },
  ];

  const handleToggleFormat = (formatId: string) => {
    setSelectedFormats((prev) =>
      prev.includes(formatId)
        ? prev.filter((id) => id !== formatId)
        : [...prev, formatId]
    );
  };

  const handleExport = () => {
    if (selectedFormats.length === 0) {
      toast({
        title: "No format selected",
        description: "Please select at least one export format",
        variant: "destructive",
      });
      return;
    }

    exportOptions
      .filter((option) => selectedFormats.includes(option.id))
      .forEach((option) => option.handler());
    
    setSelectedFormats([]);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium mb-1">Export Options</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Select formats to export your designs
        </p>
      </div>

      <div className="space-y-2">
        {exportOptions.map((option) => {
          const Icon = option.icon;
          const isChecked = selectedFormats.includes(option.id);
          
          return (
            <Card
              key={option.id}
              className={`p-3 cursor-pointer transition-colors ${
                isChecked ? 'bg-accent/50' : ''
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover-elevate'}`}
              onClick={() => !disabled && handleToggleFormat(option.id)}
              data-testid={`option-export-${option.id}`}
            >
              <div className="flex items-start gap-3">
                <div onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={() => !disabled && handleToggleFormat(option.id)}
                    disabled={disabled}
                    data-testid={`checkbox-export-${option.id}`}
                  />
                </div>
                <div className="p-2 rounded-lg bg-primary/10">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{option.label}</p>
                  <p className="text-xs text-muted-foreground">{option.description}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Button
        className="w-full"
        size="lg"
        onClick={handleExport}
        disabled={disabled || selectedFormats.length === 0}
        data-testid="button-export"
      >
        <Download className="h-4 w-4 mr-2" />
        Export{selectedFormats.length > 0 ? ` (${selectedFormats.length})` : ''}
      </Button>
    </div>
  );
}
