"use client";

import { useState } from "react";
import { IdeaGalleryCard } from "./idea-gallery-card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import type { Idea } from "@/lib/types";

interface IdeasGalleryProps {
  initialIdeas: Idea[];
}

export function IdeasGallery({ initialIdeas }: IdeasGalleryProps) {
  const [ideas] = useState<Idea[]>(initialIdeas);

  return (
    <div className="flex flex-1 flex-col min-h-0">
      <div className="mb-4 flex items-center justify-end">
        <Button asChild>
          <Link href="/ideas/new">
            <Plus className="mr-2 h-4 w-4" />
            New Idea
          </Link>
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {ideas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            <p className="text-lg font-medium">No ideas yet</p>
            <p className="text-sm mt-1">Start by creating your first idea</p>
            <Button asChild className="mt-4">
              <Link href="/ideas/new">
                <Plus className="mr-2 h-4 w-4" />
                New Idea
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {ideas.map((idea) => (
              <IdeaGalleryCard key={idea.id} idea={idea} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
