import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface PromptHistory {
  id: string;
  prompt: string;
  createdAt: string;
}

interface PromptHistoryProps {
  onSelectPrompt: (prompt: string) => void;
}

export function PromptHistory({ onSelectPrompt }: PromptHistoryProps) {
  const { data: prompts = [], isLoading } = useQuery<PromptHistory[]>({
    queryKey: ['/api/prompt-history'],
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Clock className="h-4 w-4" />
          <span>Recent Prompts</span>
        </div>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </Card>
      </div>
    );
  }

  if (prompts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Clock className="h-4 w-4" />
        <span>Recent Prompts</span>
      </div>
      <Card className="overflow-hidden">
        <ScrollArea className="h-[200px]">
          <div className="divide-y">
            {prompts.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelectPrompt(item.prompt)}
                className="w-full text-left p-3 hover-elevate active-elevate-2 transition-colors flex items-start gap-2 group"
                data-testid={`button-prompt-${item.id}`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm line-clamp-2 group-hover:text-primary transition-colors">
                    {item.prompt}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-0.5" />
              </button>
            ))}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
}
