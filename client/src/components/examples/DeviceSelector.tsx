import { DeviceSelector } from '../DeviceSelector';
import { useState } from 'react';

export default function DeviceSelectorExample() {
  const [selectedDevices, setSelectedDevices] = useState<string[]>(['phone', 'desktop']);

  const handleDeviceToggle = (deviceId: string) => {
    setSelectedDevices(prev =>
      prev.includes(deviceId)
        ? prev.filter(id => id !== deviceId)
        : [...prev, deviceId]
    );
  };

  return (
    <DeviceSelector
      selectedDevices={selectedDevices}
      onDeviceToggle={handleDeviceToggle}
    />
  );
}
