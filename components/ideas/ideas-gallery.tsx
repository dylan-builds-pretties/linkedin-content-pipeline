"use client";

import { useState } from "react";
import { IdeaGalleryCard } from "./idea-gallery-card";
import { IdeaFullView } from "./idea-full-view";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { Idea } from "@/lib/types";

interface IdeasGalleryProps {
  initialIdeas: Idea[];
}

export function IdeasGallery({ initialIdeas }: IdeasGalleryProps) {
  const [ideas, setIdeas] = useState<Idea[]>(initialIdeas);
  const [newIdeaDialogOpen, setNewIdeaDialogOpen] = useState(false);

  return (
    <div className="flex flex-1 flex-col min-h-0">
      <div className="mb-4 flex items-center justify-end">
        <Button onClick={() => setNewIdeaDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Idea
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {ideas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            <p className="text-lg font-medium">No ideas yet</p>
            <p className="text-sm mt-1">Start by creating your first idea</p>
            <Button className="mt-4" onClick={() => setNewIdeaDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Idea
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {ideas.map((idea) => (
              <IdeaGalleryCard key={idea.id} idea={idea} />
            ))}
            {/* Ghost add card */}
            <button
              onClick={() => setNewIdeaDialogOpen(true)}
              className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-6 text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground transition-colors min-h-[120px]"
            >
              <Plus className="h-6 w-6 mb-2" />
              <span className="text-sm font-medium">Add Idea</span>
            </button>
          </div>
        )}
      </div>

      {/* New Idea Dialog */}
      <IdeaFullView
        open={newIdeaDialogOpen}
        onOpenChange={setNewIdeaDialogOpen}
        onCreate={(newIdea) => {
          setIdeas((prev) => [newIdea, ...prev]);
        }}
      />
    </div>
  );
}
