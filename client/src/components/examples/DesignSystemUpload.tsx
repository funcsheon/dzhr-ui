import { DesignSystemUpload } from '../DesignSystemUpload';
import { useState } from 'react';

export default function DesignSystemUploadExample() {
  const [components, setComponents] = useState<{ name: string; url: string }[]>([]);
  const [designSystemUrl, setDesignSystemUrl] = useState('');

  const handleAnalyze = () => {
    console.log('Analyzing design system:', designSystemUrl);
  };

  return (
    <DesignSystemUpload
      components={components}
      onComponentsChange={setComponents}
      designSystemUrl={designSystemUrl}
      onDesignSystemUrlChange={setDesignSystemUrl}
      onAnalyzeDesignSystem={handleAnalyze}
    />
  );
}
