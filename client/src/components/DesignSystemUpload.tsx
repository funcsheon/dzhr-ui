import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCallback, useState } from "react";

interface DesignSystemUploadProps {
  components: { name: string; url: string }[];
  onComponentsChange: (components: { name: string; url: string }[]) => void;
}

export function DesignSystemUpload({ components, onComponentsChange }: DesignSystemUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const newComponent = {
            name: file.name.replace(/\.[^/.]+$/, ""),
            url: event.target.result as string,
          };
          onComponentsChange([...components, newComponent]);
        }
      };
      reader.readAsDataURL(file);
    });
  }, [components, onComponentsChange]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const newComponent = {
            name: file.name.replace(/\.[^/.]+$/, ""),
            url: event.target.result as string,
          };
          onComponentsChange([...components, newComponent]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeComponent = (index: number) => {
    onComponentsChange(components.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium">Design System Components</h3>
      
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
            Drop component images here or click to browse
          </span>
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleFileInput}
            data-testid="input-design-system-upload"
          />
        </label>
      </Card>

      {components.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {components.map((component, index) => (
            <Card key={index} className="p-2 relative group">
              <div className="aspect-square rounded-md bg-muted flex items-center justify-center overflow-hidden">
                <img 
                  src={component.url} 
                  alt={component.name}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <p className="text-xs mt-1 truncate">{component.name}</p>
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeComponent(index)}
                data-testid={`button-remove-component-${index}`}
              >
                <X className="h-3 w-3" />
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
