import { PromptInput } from '../PromptInput';
import { useState } from 'react';

export default function PromptInputExample() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    console.log('Generating designs with prompt:', prompt);
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 3000);
  };

  return (
    <PromptInput
      prompt={prompt}
      onPromptChange={setPrompt}
      onGenerate={handleGenerate}
      isGenerating={isGenerating}
    />
  );
}
