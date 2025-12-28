"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowRight, Save, X, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Idea } from "@/lib/types";

interface IdeaFullViewProps {
  idea?: Idea;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (updates: { title: string; braindump: string; notes: string }) => Promise<void>;
  onCreate?: (idea: Idea) => void;
}

export function IdeaFullView({
  idea,
  open,
  onOpenChange,
  onSave,
  onCreate,
}: IdeaFullViewProps) {
  const router = useRouter();
  const isCreateMode = !idea;

  const [title, setTitle] = useState(idea?.title || "");
  const [braindump, setBraindump] = useState(idea?.braindump || "");
  const [notes, setNotes] = useState(idea?.notes || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  const hasChanges = isCreateMode
    ? title.trim().length > 0 || braindump.trim().length > 0
    : title !== idea.title || braindump !== idea.braindump || notes !== idea.notes;

  const handleSave = async () => {
    if (isCreateMode) {
      if (!title.trim() || !braindump.trim()) return;
      setIsSaving(true);
      try {
        const res = await fetch("/api/ideas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title.trim(),
            braindump: braindump.trim(),
          }),
        });
        if (!res.ok) throw new Error("Failed to create idea");
        const newIdea = await res.json();
        onCreate?.(newIdea);
        onOpenChange(false);
        router.refresh();
      } finally {
        setIsSaving(false);
      }
    } else {
      if (!onSave) return;
      setIsSaving(true);
      try {
        await onSave({ title, braindump, notes });
      } finally {
        setIsSaving(false);
      }
    }
  };

  // Reset state when dialog opens
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setTitle(idea?.title || "");
      setBraindump(idea?.braindump || "");
      setNotes(idea?.notes || "");
      setIsEditingNotes(false);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <div className="flex items-center justify-between pr-8">
            <DialogTitle className="text-xl font-semibold">
              {isCreateMode ? "New Idea" : "View Idea"}
            </DialogTitle>
            {!isCreateMode && idea && (
              <Button variant="default" size="sm" asChild>
                <Link href={`/drafts/new?idea=${idea.id}`}>
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Create Draft
                </Link>
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Title
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg font-medium"
                placeholder="Untitled Idea"
              />
            </div>

            {/* Notes (click to edit, shows markdown by default) */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Notes
              </label>
              {isEditingNotes ? (
                <Textarea
                  autoFocus
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  onBlur={() => setIsEditingNotes(false)}
                  className="min-h-[250px] resize-none font-mono text-sm"
                  placeholder="Add notes here... (supports Markdown)"
                />
              ) : (
                <div
                  onClick={() => setIsEditingNotes(true)}
                  className="rounded-lg border bg-muted/30 p-4 min-h-[250px] cursor-text hover:border-primary/50 transition-colors"
                >
                  {notes.trim() ? (
                    <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {notes}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      Click to add notes... (supports Markdown)
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Braindump */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Braindump
              </label>
              <Textarea
                value={braindump}
                onChange={(e) => setBraindump(e.target.value)}
                className="min-h-[100px] resize-none"
                placeholder="Write your braindump here..."
              />
            </div>

            {/* Metadata */}
            {!isCreateMode && idea && (
              <div className="text-xs text-muted-foreground border-t pt-4">
                <p>Created: {new Date(idea.createdAt).toLocaleString()}</p>
                <p>Updated: {new Date(idea.updatedAt).toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer with save button */}
        <div className="px-6 py-4 border-t shrink-0 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
          {isCreateMode ? (
            <Button
              onClick={handleSave}
              disabled={!title.trim() || !braindump.trim() || isSaving}
            >
              <Plus className="h-4 w-4 mr-2" />
              {isSaving ? "Creating..." : "Create Idea"}
            </Button>
          ) : (
            onSave && (
              <Button
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            )
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
