import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";

interface PromptInputProps {
  prompt: string;
  onPromptChange: (prompt: string) => void;
  onGenerate: () => void;
  onRefine?: () => void;
  isGenerating?: boolean;
  disabled?: boolean;
  hasExistingDesign?: boolean;
}

export function PromptInput({ 
  prompt, 
  onPromptChange, 
  onGenerate,
  onRefine,
  isGenerating = false,
  disabled = false,
  hasExistingDesign = false
}: PromptInputProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium">Design Prompt</h3>
      
      <Textarea
        placeholder={hasExistingDesign 
          ? "Describe changes to refine your design... e.g., 'Make the header larger and add a call-to-action button'"
          : "Describe the design you want to generate... e.g., 'Create a modern landing page for a SaaS product with hero section, features, and pricing'"
        }
        value={prompt}
        onChange={(e) => onPromptChange(e.target.value)}
        className="min-h-48 resize-none"
        data-testid="textarea-prompt"
      />

      {hasExistingDesign ? (
        <div className="flex gap-2">
          <Button
            onClick={onRefine}
            disabled={disabled || isGenerating || !prompt.trim()}
            className="flex-1"
            size="lg"
            data-testid="button-refine-design"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Refining...
              </>
            ) : (
              <>
                <RefreshCw className="h-5 w-5 mr-2" />
                Refine Design
              </>
            )}
          </Button>
          <Button
            onClick={onGenerate}
            disabled={disabled || isGenerating || !prompt.trim()}
            variant="outline"
            size="lg"
            data-testid="button-generate-new"
          >
            <Sparkles className="h-5 w-5 mr-2" />
            Generate New
          </Button>
        </div>
      ) : (
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
      )}
    </div>
  );
}
