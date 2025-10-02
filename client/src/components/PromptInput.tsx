import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";

interface PromptInputProps {
  prompt: string;
  onPromptChange: (prompt: string) => void;
  onGenerate: () => void;
  isGenerating?: boolean;
  disabled?: boolean;
}

export function PromptInput({ 
  prompt, 
  onPromptChange, 
  onGenerate,
  isGenerating = false,
  disabled = false
}: PromptInputProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium">Design Prompt</h3>
      
      <Textarea
        placeholder="Describe the design you want to generate... e.g., 'Create a modern landing page for a SaaS product with hero section, features, and pricing'"
        value={prompt}
        onChange={(e) => onPromptChange(e.target.value)}
        className="min-h-48 resize-none"
        data-testid="textarea-prompt"
      />

      <Button
        onClick={onGenerate}
        disabled={disabled || isGenerating || !prompt.trim()}
        className="w-full"
        size="lg"
        data-testid="button-generate-designs"
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Generating Designs...
          </>
        ) : (
          <>
            <Sparkles className="h-5 w-5 mr-2" />
            Generate Designs
          </>
        )}
      </Button>
    </div>
  );
}
