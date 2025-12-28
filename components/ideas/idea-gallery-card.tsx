"use client";

import { useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChevronDown, ChevronUp, ExternalLink, ArrowRight, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { IdeaFullView } from "@/components/ideas/idea-full-view";
import type { Idea } from "@/lib/types";

interface IdeaGalleryCardProps {
  idea: Idea;
}

export function IdeaGalleryCard({ idea }: IdeaGalleryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFullViewOpen, setIsFullViewOpen] = useState(false);
  const [title, setTitle] = useState(idea.title);
  const [braindump, setBraindump] = useState(idea.braindump);
  const [isSaving, setIsSaving] = useState(false);

  const hasChanges = title !== idea.title || braindump !== idea.braindump;

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
      {isExpanded ? (
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="font-medium text-sm border-0 p-0 h-auto focus-visible:ring-0 shadow-none"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        />
      ) : (
        <div className="flex items-start justify-between gap-2">
          <h4
            className="font-medium text-sm line-clamp-2 cursor-pointer flex-1"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {title || "Untitled Idea"}
          </h4>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="mt-3 text-sm text-muted-foreground">
        {isExpanded ? (
          <Textarea
            value={braindump}
            onChange={(e) => setBraindump(e.target.value)}
            className="min-h-[150px] resize-none border-0 p-0 focus-visible:ring-0 shadow-none text-sm"
            placeholder="Write your braindump here..."
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          />
        ) : (
          <p className="line-clamp-3 whitespace-pre-wrap">{braindump || "No content yet..."}</p>
        )}
      </div>

      {idea.notes && !isExpanded && (
        <div className="mt-2 text-xs text-muted-foreground/70 line-clamp-2">
          {idea.notes}
        </div>
      )}

      {isExpanded && idea.notes && (
        <div className="mt-3 pt-3 border-t">
          <p className="text-xs font-medium text-muted-foreground mb-1">Notes</p>
          <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{idea.notes}</ReactMarkdown>
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-muted-foreground"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
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
              className="h-7 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                handleSave();
              }}
              disabled={isSaving}
            >
              <Save className="h-3 w-3 mr-1" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={(e) => e.stopPropagation()}
            asChild
          >
            <Link href={`/ideas/${idea.id}`}>
              <ExternalLink className="h-3 w-3 mr-1" />
              Edit
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={(e) => e.stopPropagation()}
            asChild
          >
            <Link href={`/drafts/new?idea=${idea.id}`}>
              <ArrowRight className="h-3 w-3 mr-1" />
              Draft
            </Link>
          </Button>
        </div>
      </div>
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
