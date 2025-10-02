import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Download, FileCode, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ExportPanelProps {
  onExportFigma: () => void;
  onExportImage: () => void;
  onExportCode: () => void;
  disabled?: boolean;
}

export function ExportPanel({ onExportFigma, onExportImage, onExportCode, disabled }: ExportPanelProps) {
  const [open, setOpen] = useState(false);
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const { toast } = useToast();

  const exportOptions = [
    {
      id: "figma",
      label: "Figma File",
      description: "Editable design file for Figma",
      icon: FileCode,
      handler: onExportFigma,
    },
    {
      id: "image",
      label: "PNG/SVG",
      description: "High-quality images for presentations",
      icon: ImageIcon,
      handler: onExportImage,
    },
    {
      id: "code",
      label: "HTML/CSS",
      description: "Production-ready code for developers",
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

    setOpen(false);
    setSelectedFormats([]);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setSelectedFormats([]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          className="w-full"
          size="lg"
          disabled={disabled}
          data-testid="button-export"
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent data-testid="dialog-export-formats">
        <DialogHeader>
          <DialogTitle>Export Designs</DialogTitle>
          <DialogDescription>
            Select one or more formats to export your designs
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {exportOptions.map((option) => {
            const Icon = option.icon;
            return (
              <div
                key={option.id}
                className="flex items-start gap-3 p-3 rounded-lg hover-elevate cursor-pointer"
                onClick={() => handleToggleFormat(option.id)}
                data-testid={`option-export-${option.id}`}
              >
                <div onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selectedFormats.includes(option.id)}
                    onCheckedChange={() => handleToggleFormat(option.id)}
                    data-testid={`checkbox-export-${option.id}`}
                  />
                </div>
                <div className="p-2 rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{option.label}</p>
                  <p className="text-xs text-muted-foreground">{option.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            data-testid="button-cancel-export"
          >
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={selectedFormats.length === 0}
            data-testid="button-confirm-export"
          >
            Export {selectedFormats.length > 0 && `(${selectedFormats.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
