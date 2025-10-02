import { TemplateUrlInput } from '../TemplateUrlInput';
import { useState } from 'react';

export default function TemplateUrlInputExample() {
  const [templateUrl, setTemplateUrl] = useState('');
  const [templateStyles, setTemplateStyles] = useState<any>();

  const handleAnalyze = () => {
    console.log('Analyzing template:', templateUrl);
    setTemplateStyles({
      colors: ['#6366f1', '#8b5cf6', '#ec4899'],
      fonts: ['Inter', 'JetBrains Mono'],
    });
  };

  return (
    <TemplateUrlInput
      templateUrl={templateUrl}
      onUrlChange={setTemplateUrl}
      templateStyles={templateStyles}
      onAnalyze={handleAnalyze}
    />
  );
}
