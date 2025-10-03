import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, RefreshCw, Lightbulb, Globe, LayoutDashboard, UtensilsCrossed, Camera, Smartphone } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
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
    {
      icon: Globe,
      category: "E-commerce",
      title: "Fashion Brand",
      prompt: "Create a modern landing page for an eco-friendly fashion brand with a hero section showcasing sustainable materials, a product grid, customer testimonials, and newsletter signup"
    },
    {
      icon: LayoutDashboard,
      category: "SaaS",
      title: "Analytics Dashboard",
      prompt: "Design a SaaS dashboard for analytics with sidebar navigation, data visualization charts, KPI cards, and a user profile menu in the header"
    },
    {
      icon: UtensilsCrossed,
      category: "Restaurant",
      title: "Food Website",
      prompt: "Build a restaurant website with mouth-watering food imagery, menu sections, online reservation form, location map, and customer reviews"
    },
    {
      icon: Camera,
      category: "Portfolio",
      title: "Photography",
      prompt: "Create a portfolio website for a photographer with full-width image gallery, project case studies, about section, and contact form"
    },
    {
      icon: Smartphone,
      category: "Mobile App",
      title: "Fitness Tracker",
      prompt: "Design a mobile app landing page for a fitness tracker with feature highlights, app screenshots, pricing tiers, and download buttons"
    }
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
          <CollapsibleContent className="mt-3 space-y-2">
            <p className="text-xs text-muted-foreground mb-3">Choose a template to get started:</p>
            <div className="grid gap-2">
              {examplePrompts.map((example, index) => {
                const Icon = example.icon;
                return (
                  <button
                    key={index}
                    onClick={() => onPromptChange(example.prompt)}
                    className="w-full text-left p-3 rounded-md border hover-elevate active-elevate-2 transition-all group"
                    data-testid={`button-example-${index}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="rounded-md bg-primary/10 p-2 group-hover:bg-primary/20 transition-colors">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium">{example.title}</p>
                          <Badge variant="secondary" className="text-xs no-default-hover-elevate no-default-active-elevate">
                            {example.category}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {example.prompt}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
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
