"use client";

import { useState, useEffect } from "react";
import { KanbanBoard } from "@/components/kanban";
import { ViewToggle, FeedView, FeedFilters, type FilterType } from "@/components/feed";
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
  const [activeFilters, setActiveFilters] = useState<FilterType[]>([
    "draft",
    "ready_for_review",
    "scheduled",
    "published",
  ]);

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

  // Filter posts for feed view
  const filteredPosts = posts.filter((post) => activeFilters.includes(post.status as FilterType));

  return (
    <div className="flex flex-1 flex-col min-h-0">
      {/* Header with filters and controls */}
      <div className="mb-4 flex items-center justify-end gap-4 relative">
        {/* Center: Filters (absolute positioned when in feed view) */}
        {view === "feed" && (
          <div className="absolute left-1/2 -translate-x-1/2">
            <FeedFilters activeFilters={activeFilters} onFilterChange={setActiveFilters} />
          </div>
        )}

        {/* Right: Toggle and Button */}
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
        <div className="flex-1 overflow-y-auto min-h-0">
          <FeedView posts={filteredPosts} />
        </div>
      )}

      {/* New Post Dialog */}
      <PostFullView
        open={isNewPostDialogOpen}
        onOpenChange={setIsNewPostDialogOpen}
      />
    </div>
  );
}
