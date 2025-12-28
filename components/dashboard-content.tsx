"use client";

import { useState, useEffect } from "react";
import { KanbanBoard } from "@/components/kanban";
import { ViewToggle, FeedView } from "@/components/feed";
import { PostFullView } from "@/components/kanban/post-full-view";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { Post } from "@/lib/types";

interface DashboardContentProps {
  posts: Post[];
}

export function DashboardContent({ posts }: DashboardContentProps) {
  const [view, setView] = useState<"kanban" | "feed">("kanban");
  const [isNewPostDialogOpen, setIsNewPostDialogOpen] = useState(false);

  // Persist view preference
  useEffect(() => {
    const saved = localStorage.getItem("dashboard-view");
    if (saved === "kanban" || saved === "feed") {
      setView(saved);
    }
  }, []);

  const handleViewChange = (newView: "kanban" | "feed") => {
    setView(newView);
    localStorage.setItem("dashboard-view", newView);
  };

  return (
    <div className="flex flex-1 flex-col min-h-0">
      {/* Header with toggle */}
      <div className="mb-4 flex items-center justify-end gap-4">
        <ViewToggle view={view} onViewChange={handleViewChange} />
        <Button onClick={() => setIsNewPostDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Post
        </Button>
      </div>

      {/* Content */}
      {view === "kanban" ? (
        <KanbanBoard initialPosts={posts} />
      ) : (
        <FeedView posts={posts} />
      )}

      {/* New Post Dialog */}
      <PostFullView
        open={isNewPostDialogOpen}
        onOpenChange={setIsNewPostDialogOpen}
      />
    </div>
  );
}
