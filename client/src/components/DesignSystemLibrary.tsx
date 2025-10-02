import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Save, FolderOpen, Trash2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { DesignSystem } from "@shared/schema";

interface DesignSystemLibraryProps {
  components: { name: string; url: string }[];
  onLoadDesignSystem: (system: DesignSystem) => void;
  onAddComponents: (components: { name: string; url: string }[]) => void;
}

export function DesignSystemLibrary({ 
  components, 
  onLoadDesignSystem,
  onAddComponents 
}: DesignSystemLibraryProps) {
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [saveUrl, setSaveUrl] = useState("");
  const [selectedSystemId, setSelectedSystemId] = useState<string>("");
  const { toast } = useToast();

  const { data: designSystems = [] } = useQuery<DesignSystem[]>({
    queryKey: ['/api/design-systems'],
  });

  const saveMutation = useMutation({
    mutationFn: async (data: { name: string; components: { name: string; url: string }[]; sourceUrl?: string }) => {
      return apiRequest('POST', '/api/design-systems', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/design-systems'] });
      toast({
        title: "Design system saved",
        description: "Your design system has been saved successfully",
      });
      setIsSaveDialogOpen(false);
      setSaveName("");
      setSaveUrl("");
    },
    onError: (error: Error) => {
      toast({
        title: "Save failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const addComponentsMutation = useMutation({
    mutationFn: async (data: { id: string; components: { name: string; url: string }[] }) => {
      const system = designSystems.find(s => s.id === data.id);
      if (!system) throw new Error('Design system not found');
      
      const updatedComponents = [...(system.components || []), ...data.components];
      
      return apiRequest('PATCH', `/api/design-systems/${data.id}`, { components: updatedComponents });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/design-systems'] });
      toast({
        title: "Components added",
        description: "Components have been added to the design system",
      });
      setIsAddDialogOpen(false);
      setSelectedSystemId("");
    },
    onError: (error: Error) => {
      toast({
        title: "Add failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('DELETE', `/api/design-systems/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/design-systems'] });
      toast({
        title: "Design system deleted",
        description: "The design system has been deleted",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (!saveName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for the design system",
        variant: "destructive",
      });
      return;
    }

    if (components.length === 0) {
      toast({
        title: "No components",
        description: "Please add components before saving",
        variant: "destructive",
      });
      return;
    }

    saveMutation.mutate({
      name: saveName,
      components,
      sourceUrl: saveUrl || undefined,
    });
  };

  const handleAddToExisting = () => {
    if (!selectedSystemId) {
      toast({
        title: "No system selected",
        description: "Please select a design system",
        variant: "destructive",
      });
      return;
    }

    if (components.length === 0) {
      toast({
        title: "No components",
        description: "Please add components before saving",
        variant: "destructive",
      });
      return;
    }

    addComponentsMutation.mutate({
      id: selectedSystemId,
      components,
    });
  };

  const handleLoad = (systemId: string) => {
    const system = designSystems.find(s => s.id === systemId);
    if (system) {
      onLoadDesignSystem(system);
      toast({
        title: "Design system loaded",
        description: `Loaded ${system.components?.length || 0} components from ${system.name}`,
      });
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Design System Library</h3>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsSaveDialogOpen(true)}
            disabled={components.length === 0}
            data-testid="button-save-design-system"
          >
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsAddDialogOpen(true)}
            disabled={components.length === 0}
            data-testid="button-add-to-system"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add to System
          </Button>
        </div>
      </div>

      {designSystems.length > 0 && (
        <div className="space-y-2">
          <Label>Load Saved System</Label>
          <div className="flex gap-2">
            <Select onValueChange={handleLoad} data-testid="select-design-system">
              <SelectTrigger>
                <SelectValue placeholder="Select a design system" />
              </SelectTrigger>
              <SelectContent>
                {designSystems.map((system) => (
                  <SelectItem key={system.id} value={system.id}>
                    {system.name} ({system.components?.length || 0} components)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-2">
            {designSystems.map((system) => (
              <div key={system.id} className="flex items-center gap-1 text-xs">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteMutation.mutate(system.id)}
                  data-testid={`button-delete-${system.id}`}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Design System</DialogTitle>
            <DialogDescription>
              Save your current components as a reusable design system
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="system-name">System Name</Label>
              <Input
                id="system-name"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="e.g., Material Design, Shadcn UI"
                data-testid="input-system-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="system-url">Source URL (optional)</Label>
              <Input
                id="system-url"
                value={saveUrl}
                onChange={(e) => setSaveUrl(e.target.value)}
                placeholder="https://..."
                data-testid="input-system-url"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Saving {components.length} component{components.length !== 1 ? 's' : ''}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending} data-testid="button-confirm-save">
              {saveMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Components to System</DialogTitle>
            <DialogDescription>
              Add {components.length} component{components.length !== 1 ? 's' : ''} to an existing design system
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Design System</Label>
              <Select value={selectedSystemId} onValueChange={setSelectedSystemId}>
                <SelectTrigger data-testid="select-target-system">
                  <SelectValue placeholder="Choose a system" />
                </SelectTrigger>
                <SelectContent>
                  {designSystems.map((system) => (
                    <SelectItem key={system.id} value={system.id}>
                      {system.name} ({system.components?.length || 0} components)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddToExisting} 
              disabled={addComponentsMutation.isPending}
              data-testid="button-confirm-add"
            >
              {addComponentsMutation.isPending ? "Adding..." : "Add Components"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
