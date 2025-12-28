"use client";

import { useState } from "react";
import { IdeaFullView } from "@/components/ideas/idea-full-view";
import type { Idea } from "@/lib/types";

interface IdeaGalleryCardProps {
  idea: Idea;
}

export function IdeaGalleryCard({ idea }: IdeaGalleryCardProps) {
  const [isFullViewOpen, setIsFullViewOpen] = useState(false);
  const [title, setTitle] = useState(idea.title);
  const [braindump, setBraindump] = useState(idea.braindump);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (updates?: { title: string; braindump: string }) => {
    const saveTitle = updates?.title ?? title;
    const saveBraindump = updates?.braindump ?? braindump;

    setIsSaving(true);
    try {
      const res = await fetch(`/api/ideas/${idea.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: saveTitle, braindump: saveBraindump }),
      });
      if (!res.ok) throw new Error("Failed to save");
      // Update local state if save came from full view
      if (updates) {
        setTitle(updates.title);
        setBraindump(updates.braindump);
      }
    } catch (error) {
      console.error("Failed to save idea:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div
        className="rounded-lg border bg-background p-4 shadow-sm transition-all hover:shadow-md cursor-pointer"
        onClick={() => setIsFullViewOpen(true)}
      >
        <h4 className="font-medium text-sm line-clamp-2">
          {title || "Untitled Idea"}
        </h4>

        <p className="mt-3 text-sm text-muted-foreground line-clamp-3 whitespace-pre-wrap">
          {braindump || "No content yet..."}
        </p>

        {idea.notes && (
          <div className="mt-2 text-xs text-muted-foreground/70 line-clamp-2">
            {idea.notes}
          </div>
        )}
      </div>

      <IdeaFullView
        idea={idea}
        open={isFullViewOpen}
        onOpenChange={setIsFullViewOpen}
        onSave={handleSave}
      />
    </>
  );
}
