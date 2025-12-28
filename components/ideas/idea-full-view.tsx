"use client";

import { useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowRight, ExternalLink, Save, X } from "lucide-react";
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
  idea: Idea;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (updates: { title: string; braindump: string }) => Promise<void>;
}

export function IdeaFullView({
  idea,
  open,
  onOpenChange,
  onSave,
}: IdeaFullViewProps) {
  const [title, setTitle] = useState(idea.title);
  const [braindump, setBraindump] = useState(idea.braindump);
  const [isSaving, setIsSaving] = useState(false);

  const hasChanges = title !== idea.title || braindump !== idea.braindump;

  const handleSave = async () => {
    if (!onSave) return;
    setIsSaving(true);
    try {
      await onSave({ title, braindump });
    } finally {
      setIsSaving(false);
    }
  };

  // Reset state when dialog opens with new idea
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setTitle(idea.title);
      setBraindump(idea.braindump);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <div className="flex items-center justify-between pr-8">
            <DialogTitle className="text-xl font-semibold">
              View Idea
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/ideas/${idea.id}`}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Full Edit Page
                </Link>
              </Button>
              <Button variant="default" size="sm" asChild>
                <Link href={`/drafts/new?idea=${idea.id}`}>
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Create Draft
                </Link>
              </Button>
            </div>
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

            {/* Braindump */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Braindump
              </label>
              <Textarea
                value={braindump}
                onChange={(e) => setBraindump(e.target.value)}
                className="min-h-[200px] resize-none"
                placeholder="Write your braindump here..."
              />
            </div>

            {/* Notes (read-only, rendered as markdown) */}
            {idea.notes && (
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Notes
                </label>
                <div className="rounded-lg border bg-muted/30 p-4">
                  <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {idea.notes}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="text-xs text-muted-foreground border-t pt-4">
              <p>Created: {new Date(idea.createdAt).toLocaleString()}</p>
              <p>Updated: {new Date(idea.updatedAt).toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Footer with save button */}
        {onSave && (
          <div className="px-6 py-4 border-t shrink-0 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
            <Button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
