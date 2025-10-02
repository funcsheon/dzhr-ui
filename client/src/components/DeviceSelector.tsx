import { Smartphone, Tablet, Monitor, Watch, Glasses } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { deviceTypes } from "@shared/schema";

interface DeviceSelectorProps {
  selectedDevices: string[];
  onDeviceToggle: (deviceId: string) => void;
}

const iconMap = {
  Smartphone,
  Tablet,
  Monitor,
  Watch,
  Glasses,
};

export function DeviceSelector({ selectedDevices, onDeviceToggle }: DeviceSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Device Types</h3>
        <Badge variant="secondary" className="text-xs">
          {selectedDevices.length} selected
        </Badge>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {deviceTypes.map((device) => {
          const Icon = iconMap[device.icon as keyof typeof iconMap];
          const isSelected = selectedDevices.includes(device.id);
          
          return (
            <Card
              key={device.id}
              className={`p-4 cursor-pointer transition-all hover-elevate active-elevate-2 ${
                isSelected ? 'border-primary' : ''
              }`}
              onClick={() => onDeviceToggle(device.id)}
              data-testid={`device-card-${device.id}`}
            >
              <div className="flex flex-col items-center gap-2 text-center">
                <Icon className={`h-6 w-6 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className="text-xs font-medium">{device.name}</span>
                <span className="text-xs text-muted-foreground">
                  {device.width}×{device.height}
                </span>
              </div>
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
