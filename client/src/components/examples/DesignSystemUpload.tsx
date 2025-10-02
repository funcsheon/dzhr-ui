import { DesignSystemUpload } from '../DesignSystemUpload';
import { useState } from 'react';

export default function DesignSystemUploadExample() {
  const [components, setComponents] = useState<{ name: string; url: string }[]>([]);

  return (
    <DesignSystemUpload
      components={components}
      onComponentsChange={setComponents}
    />
  );
}
