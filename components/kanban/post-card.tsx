"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, ThumbsUp, MessageSquare, Share2, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PostFullView } from "./post-full-view";
import type { Post } from "@/lib/types";

interface PostCardProps {
  post: Post;
  showScheduleButton?: boolean;
  showScheduleInfo?: boolean;
  showMetrics?: boolean;
  onRefresh?: () => void;
}

export function PostCard({ post, showScheduleButton, showScheduleInfo, showMetrics, onRefresh }: PostCardProps) {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPost, setCurrentPost] = useState(post);

  // Format scheduled date if present
  const formattedScheduleDate = currentPost.scheduledDate
    ? new Date(currentPost.scheduledDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : null;

  // Get preview of content
  const preview = currentPost.content.split("\n")[0].slice(0, 50);

  const handleSave = async (updates: Partial<Post>) => {
    const res = await fetch(`/api/posts/${currentPost.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error("Failed to save");

    const updatedPost = await res.json();
    setCurrentPost(updatedPost);
    onRefresh?.();
    router.refresh();
  };

  const handleDelete = async () => {
    const res = await fetch(`/api/posts/${currentPost.id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete");

    onRefresh?.();
    router.refresh();
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't open dialog if clicking on drag handle areas during drag
    if ((e.target as HTMLElement).closest('[data-no-click]')) return;
    setIsDialogOpen(true);
  };

  return (
    <>
      <div
        className="rounded-lg border bg-background p-3 shadow-sm transition-all hover:shadow-md cursor-pointer"
        onClick={handleCardClick}
      >
        {/* Schedule info header for scheduled posts */}
        {showScheduleInfo && currentPost.scheduledDate && (
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <div className="flex items-center gap-2 text-sm font-medium">
                <Clock className="h-3.5 w-3.5 text-orange-500" />
                {formattedScheduleDate}
              </div>
              {currentPost.scheduledTime && (
                <div className="text-xs text-muted-foreground">
                  {currentPost.scheduledTime}
                </div>
              )}
            </div>
            <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">
              Scheduled
            </Badge>
          </div>
        )}

        {/* Metrics for published posts */}
        {showMetrics && currentPost.metrics && (
          <div className="flex items-center gap-3 mb-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <ThumbsUp className="h-3 w-3" />
              {currentPost.metrics.likes}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              {currentPost.metrics.comments}
            </span>
            <span className="flex items-center gap-1">
              <Share2 className="h-3 w-3" />
              {currentPost.metrics.shares}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {currentPost.metrics.impressions}
            </span>
          </div>
        )}

        {/* Content area */}
        <p className="text-sm whitespace-pre-wrap line-clamp-2">
          {showScheduleInfo || showMetrics ? `${preview}...` : currentPost.content}
        </p>
      </div>

      <PostFullView
        post={currentPost}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </>
  );
}
