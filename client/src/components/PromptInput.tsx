import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, RefreshCw, Lightbulb } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";

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
  const [showExamples, setShowExamples] = useState(false);

  const examplePrompts = [
    "Create a modern landing page for an eco-friendly fashion brand with a hero section showcasing sustainable materials, a product grid, customer testimonials, and newsletter signup",
    "Design a SaaS dashboard for analytics with sidebar navigation, data visualization charts, KPI cards, and a user profile menu in the header",
    "Build a restaurant website with mouth-watering food imagery, menu sections, online reservation form, location map, and customer reviews",
    "Create a portfolio website for a photographer with full-width image gallery, project case studies, about section, and contact form",
    "Design a mobile app landing page for a fitness tracker with feature highlights, app screenshots, pricing tiers, and download buttons"
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Design Prompt</h3>
        <Collapsible open={showExamples} onOpenChange={setShowExamples}>
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-1 text-xs"
              data-testid="button-toggle-examples"
            >
              <Lightbulb className="h-3 w-3" />
              {showExamples ? 'Hide' : 'Show'} Examples
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 space-y-2">
            <p className="text-xs text-muted-foreground">Click any example to use it:</p>
            {examplePrompts.map((example, index) => (
              <button
                key={index}
                onClick={() => onPromptChange(example)}
                className="w-full text-left text-xs p-2 rounded border border-border hover-elevate active-elevate-2 bg-muted/30 transition-colors"
                data-testid={`button-example-${index}`}
              >
                {example}
              </button>
            ))}
          </CollapsibleContent>
        </Collapsible>
      </div>
      
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
