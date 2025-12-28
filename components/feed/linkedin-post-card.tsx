"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown, ChevronUp, Save, ThumbsUp, MessageCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Draft, ScheduledPost, PublishedPost } from "@/lib/types";

export type FeedPost =
  | (Draft & { _type: "draft" })
  | (ScheduledPost & { _type: "scheduled" })
  | (PublishedPost & { _type: "published" });

interface LinkedInPostCardProps {
  post: FeedPost;
}

const MAX_CHARS = 1300;
const AUTHOR_NAME = "Dylan Goren";
const PROFILE_IMAGE = "/profile.jpeg";

function getStatusBadge(post: FeedPost) {
  if (post._type === "draft") {
    if (post.status === "ready_for_review") {
      return { label: "Ready for Review", className: "bg-blue-100 text-blue-800 border-blue-200" };
    }
    return { label: "Draft", className: "bg-yellow-100 text-yellow-800 border-yellow-200" };
  }
  if (post._type === "scheduled") {
    return { label: "Scheduled", className: "bg-orange-100 text-orange-800 border-orange-200" };
  }
  return { label: "Published", className: "bg-green-100 text-green-800 border-green-200" };
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

export function LinkedInPostCard({ post }: LinkedInPostCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [content, setContent] = useState(post.content);
  const [isSaving, setIsSaving] = useState(false);
  const hasChanges = content !== post.content;
  const charCount = content.length;

  const statusBadge = getStatusBadge(post);

  const handleSave = async () => {
    if (post._type === "published") return; // Can't edit published posts

    setIsSaving(true);
    try {
      const endpoint = post._type === "draft"
        ? `/api/drafts/${post.id}`
        : `/api/scheduled/${post.id}`;

      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error("Failed to save");
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const canEdit = post._type !== "published";

  return (
    <div className="bg-background border rounded-lg shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 pb-0">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full overflow-hidden shrink-0">
            <Image
              src={PROFILE_IMAGE}
              alt={AUTHOR_NAME}
              width={48}
              height={48}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Author info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm">{AUTHOR_NAME}</span>
              <Badge variant="outline" className={cn("text-xs", statusBadge.className)}>
                {statusBadge.label}
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {formatTime(post.createdAt)}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-3">
        {isExpanded && canEdit ? (
          <div className="space-y-2">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[200px] text-sm resize-none"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className={cn(charCount > MAX_CHARS && "text-red-500")}>
                {charCount} / {MAX_CHARS} characters
              </span>
              {hasChanges && (
                <Button size="sm" onClick={handleSave} disabled={isSaving}>
                  <Save className="h-3 w-3 mr-1" />
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              )}
            </div>
          </div>
        ) : (
          <p className={cn("text-sm whitespace-pre-wrap", !isExpanded && "line-clamp-3")}>
            {content}
          </p>
        )}

        {!isExpanded && content.length > 200 && (
          <button
            className="text-sm text-muted-foreground hover:text-foreground mt-1"
            onClick={() => setIsExpanded(true)}
          >
            see more
          </button>
        )}
      </div>

      {/* Metrics for published posts */}
      {post._type === "published" && post.metrics && (
        <div className="px-4 py-2 border-t flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <ThumbsUp className="h-4 w-4" />
            {post.metrics.likes} reactions
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="h-4 w-4" />
            {post.metrics.comments} comments
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="px-4 py-2 border-t flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          className="text-xs"
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

        <div className="flex items-center gap-1">
          {post._type === "published" && post.linkedinUrl && (
            <Button variant="ghost" size="sm" className="text-xs" asChild>
              <a href={post.linkedinUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3 w-3 mr-1" />
                View Post
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
