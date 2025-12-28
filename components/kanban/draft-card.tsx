"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Draft } from "@/lib/types";

interface DraftCardProps {
  draft: Draft;
  showScheduleButton?: boolean;
}

export function DraftCard({ draft, showScheduleButton }: DraftCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [content, setContent] = useState(draft.content);
  const [isSaving, setIsSaving] = useState(false);
  const hasChanges = content !== draft.content;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/drafts/${draft.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error("Failed to save");
    } catch (error) {
      console.error("Failed to save draft:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-lg border bg-background p-3 shadow-sm transition-all hover:shadow-md cursor-grab active:cursor-grabbing">
      {isExpanded ? (
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="text-sm min-h-[200px] resize-none border-0 p-0 focus-visible:ring-0 shadow-none"
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <p className="text-sm whitespace-pre-wrap line-clamp-2">{content}</p>
      )}

      <div className="flex items-center gap-2 mt-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-6 flex-1 text-xs text-muted-foreground"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-3 w-3 mr-1" />
              Collapse
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3 mr-1" />
              Expand
            </>
          )}
        </Button>

        {isExpanded && hasChanges && (
          <Button
            size="sm"
            className="h-6 text-xs"
            onClick={handleSave}
            disabled={isSaving}
          >
            <Save className="h-3 w-3 mr-1" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
        )}
      </div>
    </div>
  );
}
