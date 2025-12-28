"use client";

import { useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IdeaFullView } from "@/components/ideas/idea-full-view";
import type { Idea } from "@/lib/types";

interface IdeaCardProps {
  idea: Idea;
}

export function IdeaCard({ idea }: IdeaCardProps) {
  const [isFullViewOpen, setIsFullViewOpen] = useState(false);

  return (
    <>
      <div
        className="rounded-lg border bg-background p-3 shadow-sm transition-all hover:shadow-md cursor-pointer"
        onClick={() => setIsFullViewOpen(true)}
      >
        <h4 className="font-medium text-sm line-clamp-2">
          {idea.title}
        </h4>

        {idea.notes && (
          <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
            {idea.notes}
          </p>
        )}

        <div className="mt-3 flex justify-end items-center">
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
