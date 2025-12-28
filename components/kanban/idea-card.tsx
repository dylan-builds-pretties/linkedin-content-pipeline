"use client";

import { useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowRight, ChevronDown, ChevronUp, ExternalLink, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IdeaFullView } from "@/components/ideas/idea-full-view";
import type { Idea } from "@/lib/types";

interface IdeaCardProps {
  idea: Idea;
}

export function IdeaCard({ idea }: IdeaCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFullViewOpen, setIsFullViewOpen] = useState(false);

  return (
    <>
      <div
        className="rounded-lg border bg-background p-3 shadow-sm transition-all hover:shadow-md cursor-pointer"
        onClick={() => setIsFullViewOpen(true)}
      >
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium text-sm line-clamp-2 flex-1">
            {idea.title}
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
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>

        {idea.notes && (
          <div className="mt-2 text-xs text-muted-foreground">
            {isExpanded ? (
              <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none prose-headings:text-sm prose-headings:font-semibold prose-p:my-1 prose-ul:my-1 prose-li:my-0 prose-table:text-xs prose-th:px-2 prose-th:py-1 prose-td:px-2 prose-td:py-1">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{idea.notes}</ReactMarkdown>
              </div>
            ) : (
              <p className="line-clamp-2">{idea.notes}</p>
            )}
          </div>
        )}

        <div className="mt-3 flex justify-between items-center">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={(e) => e.stopPropagation()}
            asChild
          >
            <Link href={`/ideas/${idea.id}`}>
              <ExternalLink className="mr-1 h-3 w-3" />
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
              <ArrowRight className="mr-1 h-3 w-3" />
              Draft
            </Link>
          </Button>
        </div>
      </div>

      <IdeaFullView
        idea={idea}
        open={isFullViewOpen}
        onOpenChange={setIsFullViewOpen}
      />
    </>
  );
}
