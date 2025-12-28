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
  const [notes, setNotes] = useState(idea.notes);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (updates?: { title: string; braindump: string; notes: string }) => {
    const saveTitle = updates?.title ?? title;
    const saveBraindump = updates?.braindump ?? braindump;
    const saveNotes = updates?.notes ?? notes;

    setIsSaving(true);
    try {
      const res = await fetch(`/api/ideas/${idea.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: saveTitle, braindump: saveBraindump, notes: saveNotes }),
      });
      if (!res.ok) throw new Error("Failed to save");
      // Update local state if save came from full view
      if (updates) {
        setTitle(updates.title);
        setBraindump(updates.braindump);
        setNotes(updates.notes);
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
        className="rounded-lg border bg-background p-4 shadow-sm transition-all hover:shadow-md cursor-pointer min-h-[180px]"
        onClick={() => setIsFullViewOpen(true)}
      >
        <h4 className="font-medium text-sm line-clamp-2">
          {title || "Untitled Idea"}
        </h4>

        <p className="mt-3 text-sm text-muted-foreground line-clamp-5 whitespace-pre-wrap">
          {notes || <span className="italic">No notes yet...</span>}
        </p>
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
