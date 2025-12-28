"use client";

import { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { KanbanColumn } from "./kanban-column";
import { PostCard } from "./post-card";
import { PostFullView } from "./post-full-view";
import { ScheduleDialog } from "@/components/content/schedule-dialog";
import type { Post, PostStatus } from "@/lib/types";

interface KanbanBoardProps {
  initialPosts?: Post[];
}

export function KanbanBoard({ initialPosts = [] }: KanbanBoardProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);

  // Schedule dialog state
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [postToSchedule, setPostToSchedule] = useState<Post | null>(null);

  // New post dialog state
  const [newPostDialogOpen, setNewPostDialogOpen] = useState(false);
  const [createPostStatus, setCreatePostStatus] = useState<PostStatus>("draft");

  const handleCreatePost = (status: PostStatus) => {
    setCreatePostStatus(status);
    setNewPostDialogOpen(true);
  };

  // Filter posts by status
  const draftItems = posts.filter((p) => p.status === "draft");
  const readyForReview = posts.filter((p) => p.status === "ready_for_review");
  const scheduled = posts.filter((p) => p.status === "scheduled");
  const published = posts.filter((p) => p.status === "published");

  const handleScheduled = () => {
    if (postToSchedule) {
      // Refresh posts from server
      fetch("/api/posts")
        .then((res) => res.json())
        .then((data) => setPosts(data))
        .catch(console.error);
    }
    setPostToSchedule(null);
  };

  const handlePublish = async (postId: string) => {
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "published" }),
      });
      if (res.ok) {
        const updated = await res.json();
        setPosts((prev) => prev.map((p) => (p.id === postId ? updated : p)));
      }
    } catch (error) {
      console.error("Failed to publish:", error);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    // Dropped outside a valid area
    if (!destination) return;

    // Dropped in the same position
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    // Map droppable IDs to status values
    const statusMap: Record<string, PostStatus> = {
      drafts: "draft",
      ready_for_review: "ready_for_review",
      scheduled: "scheduled",
      published: "published",
    };

    const sourceStatus = statusMap[source.droppableId];
    const destStatus = statusMap[destination.droppableId];

    // Handle moves between Drafts and Ready for Review
    if (
      (sourceStatus === "draft" || sourceStatus === "ready_for_review") &&
      (destStatus === "draft" || destStatus === "ready_for_review")
    ) {
      // Optimistically update UI
      setPosts((prev) =>
        prev.map((p) => (p.id === draggableId ? { ...p, status: destStatus } : p))
      );

      // Persist to server
      try {
        const res = await fetch(`/api/posts/${draggableId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: destStatus }),
        });
        if (!res.ok) {
          // Revert on failure
          setPosts((prev) =>
            prev.map((p) => (p.id === draggableId ? { ...p, status: sourceStatus } : p))
          );
        }
      } catch (error) {
        console.error("Failed to update post status:", error);
        // Revert on error
        setPosts((prev) =>
          prev.map((p) => (p.id === draggableId ? { ...p, status: sourceStatus } : p))
        );
      }
    }

    // Handle move to Scheduled (open schedule dialog)
    if (
      (sourceStatus === "draft" || sourceStatus === "ready_for_review") &&
      destStatus === "scheduled"
    ) {
      const post = posts.find((p) => p.id === draggableId);
      if (post) {
        setPostToSchedule(post);
        setScheduleDialogOpen(true);
      }
    }

    // Handle move to Published
    if (sourceStatus === "scheduled" && destStatus === "published") {
      await handlePublish(draggableId);
    }
  };

  return (
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex flex-1 gap-4 overflow-x-auto min-h-0">
          {/* Drafts Column */}
          <KanbanColumn
            title="Drafts"
            count={draftItems.length}
            color="yellow"
            droppableId="drafts"
            status="draft"
            onCreatePost={handleCreatePost}
          >
            {draftItems.map((post, index) => (
              <Draggable key={post.id} draggableId={post.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={snapshot.isDragging ? "opacity-90" : ""}
                  >
                    <PostCard post={post} />
                  </div>
                )}
              </Draggable>
            ))}
          </KanbanColumn>

          {/* Ready for Review Column */}
          <KanbanColumn
            title="Ready for Review"
            count={readyForReview.length}
            color="blue"
            droppableId="ready_for_review"
            status="ready_for_review"
            onCreatePost={handleCreatePost}
          >
            {readyForReview.map((post, index) => (
              <Draggable key={post.id} draggableId={post.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={snapshot.isDragging ? "opacity-90" : ""}
                  >
                    <PostCard post={post} showScheduleButton />
                  </div>
                )}
              </Draggable>
            ))}
          </KanbanColumn>

          {/* Scheduled Column */}
          <KanbanColumn
            title="Scheduled"
            count={scheduled.length}
            color="orange"
            droppableId="scheduled"
            status="scheduled"
            onCreatePost={handleCreatePost}
          >
            {scheduled.map((post, index) => (
              <Draggable key={post.id} draggableId={post.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={snapshot.isDragging ? "opacity-90" : ""}
                  >
                    <PostCard post={post} showScheduleInfo />
                  </div>
                )}
              </Draggable>
            ))}
          </KanbanColumn>

          {/* Published Column */}
          <KanbanColumn
            title="Published"
            count={published.length}
            color="green"
            droppableId="published"
            status="published"
            onCreatePost={handleCreatePost}
          >
            {published.map((post, index) => (
              <Draggable key={post.id} draggableId={post.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={snapshot.isDragging ? "opacity-90" : ""}
                  >
                    <PostCard post={post} showMetrics />
                  </div>
                )}
              </Draggable>
            ))}
          </KanbanColumn>
        </div>
      </DragDropContext>

      {/* Schedule Dialog */}
      {postToSchedule && (
        <ScheduleDialog
          postId={postToSchedule.id}
          postTitle={postToSchedule.title || "Untitled Post"}
          open={scheduleDialogOpen}
          onOpenChange={setScheduleDialogOpen}
          onScheduled={handleScheduled}
        />
      )}

      {/* New Post Dialog */}
      <PostFullView
        open={newPostDialogOpen}
        onOpenChange={setNewPostDialogOpen}
        initialStatus={createPostStatus}
        onCreate={(newPost) => {
          setPosts((prev) => [newPost, ...prev]);
        }}
      />
    </>
  );
}
