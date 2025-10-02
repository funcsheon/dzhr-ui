import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { deviceTypes } from "@shared/schema";
import { useState } from "react";

interface DesignCanvasProps {
  designs: {
    device: string;
    html: string;
    css: string;
    imageUrl?: string;
  }[];
}

export function DesignCanvas({ designs }: DesignCanvasProps) {
  const [zoom, setZoom] = useState(100);
  const [activeDevice, setActiveDevice] = useState(designs[0]?.device || 'phone');

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 10, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 10, 50));
  const handleResetZoom = () => setZoom(100);

  if (designs.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-24 h-24 mx-auto rounded-full bg-muted flex items-center justify-center">
            <Maximize2 className="h-12 w-12 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">No Designs Yet</h3>
            <p className="text-sm text-muted-foreground">
              Configure your settings and click "Generate Designs" to create responsive mockups
            </p>
          </div>
        </div>
      </div>
    );
  }

  const activeDesign = designs.find(d => d.device === activeDevice) || designs[0];
  const deviceInfo = deviceTypes.find(d => d.id === activeDesign.device);

  return (
    <div className="h-full flex flex-col">
      <div className="border-b p-4 flex items-center justify-between">
        <Tabs value={activeDevice} onValueChange={setActiveDevice}>
          <TabsList>
            {designs.map(design => {
              const device = deviceTypes.find(d => d.id === design.device);
              return (
                <TabsTrigger 
                  key={design.device} 
                  value={design.device}
                  data-testid={`tab-device-${design.device}`}
                >
                  {device?.name}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={handleZoomOut}
            disabled={zoom <= 50}
            data-testid="button-zoom-out"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium w-12 text-center">{zoom}%</span>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleZoomIn}
            disabled={zoom >= 200}
            data-testid="button-zoom-in"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleResetZoom}
            data-testid="button-reset-zoom"
          >
            Reset
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-muted/30 p-8">
        <div className="flex items-center justify-center min-h-full">
          <Card 
            className="shadow-2xl overflow-hidden"
            style={{
              width: deviceInfo ? `${deviceInfo.width * (zoom / 100)}px` : 'auto',
              height: deviceInfo ? `${deviceInfo.height * (zoom / 100)}px` : 'auto',
            }}
          >
            <div 
              className="w-full h-full bg-background overflow-auto"
              dangerouslySetInnerHTML={{ __html: activeDesign.html }}
              data-testid="design-preview"
            />
            <style>{activeDesign.css}</style>
          </Card>
        </div>
      </div>
    </div>
  );
}
