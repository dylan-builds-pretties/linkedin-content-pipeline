"use client";

import { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { KanbanColumn } from "./kanban-column";
import { DraftCard } from "./draft-card";
import { ScheduledCard } from "./scheduled-card";
import { ScheduleDialog } from "@/components/content/schedule-dialog";
import { Button } from "@/components/ui/button";
import { Plus, Archive } from "lucide-react";
import Link from "next/link";
import type { Draft, ScheduledPost } from "@/lib/types";

interface KanbanBoardProps {
  initialDrafts?: Draft[];
  initialScheduled?: ScheduledPost[];
  publishedCount?: number;
}

export function KanbanBoard({
  initialDrafts = [],
  initialScheduled = [],
  publishedCount: initialPublishedCount = 0,
}: KanbanBoardProps) {
  const [drafts, setDrafts] = useState<Draft[]>(initialDrafts);
  const [scheduled, setScheduled] = useState<ScheduledPost[]>(initialScheduled);
  const [publishedCount, setPublishedCount] = useState(initialPublishedCount);

  // Schedule dialog state
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [draftToSchedule, setDraftToSchedule] = useState<Draft | null>(null);

  // Split drafts by status
  const draftItems = drafts.filter((d) => d.status === "draft");
  const readyForReview = drafts.filter((d) => d.status === "ready_for_review");

  const handleScheduled = () => {
    if (draftToSchedule) {
      // Remove the draft from drafts list
      setDrafts((prev) => prev.filter((d) => d.id !== draftToSchedule.id));
      // Refresh scheduled posts
      fetch("/api/scheduled")
        .then((res) => res.json())
        .then((data) => setScheduled(data))
        .catch(console.error);
    }
    setDraftToSchedule(null);
  };

  const handlePublishScheduled = async (postId: string) => {
    try {
      const res = await fetch(`/api/scheduled/${postId}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        setScheduled((prev) => prev.filter((p) => p.id !== postId));
        setPublishedCount((prev) => prev + 1);
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

    // Handle draft moves between Drafts and Ready for Review
    if (
      (source.droppableId === "drafts" || source.droppableId === "ready_for_review") &&
      (destination.droppableId === "drafts" || destination.droppableId === "ready_for_review")
    ) {
      const newStatus = destination.droppableId === "drafts" ? "draft" : "ready_for_review";

      // Optimistically update UI
      setDrafts((prev) =>
        prev.map((d) =>
          d.id === draggableId ? { ...d, status: newStatus as "draft" | "ready_for_review" } : d
        )
      );

      // Persist to server
      try {
        const res = await fetch(`/api/drafts/${draggableId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });
        if (!res.ok) {
          // Revert on failure
          const oldStatus = source.droppableId === "drafts" ? "draft" : "ready_for_review";
          setDrafts((prev) =>
            prev.map((d) =>
              d.id === draggableId ? { ...d, status: oldStatus as "draft" | "ready_for_review" } : d
            )
          );
        }
      } catch (error) {
        console.error("Failed to update draft status:", error);
        // Revert on error
        const oldStatus = source.droppableId === "drafts" ? "draft" : "ready_for_review";
        setDrafts((prev) =>
          prev.map((d) =>
            d.id === draggableId ? { ...d, status: oldStatus as "draft" | "ready_for_review" } : d
          )
        );
      }
    }

    // Handle draft move to Scheduled (open schedule dialog)
    if (
      (source.droppableId === "drafts" || source.droppableId === "ready_for_review") &&
      destination.droppableId === "scheduled"
    ) {
      const draft = drafts.find((d) => d.id === draggableId);
      if (draft) {
        setDraftToSchedule(draft);
        setScheduleDialogOpen(true);
      }
    }

    // Handle scheduled post move to Published
    if (source.droppableId === "scheduled" && destination.droppableId === "published") {
      await handlePublishScheduled(draggableId);
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
            footer={
              <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground" asChild>
                <Link href="/drafts/new">
                  <Plus className="mr-2 h-4 w-4" />
                  New Draft
                </Link>
              </Button>
            }
          >
            {draftItems.map((draft, index) => (
              <Draggable key={draft.id} draggableId={draft.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={snapshot.isDragging ? "opacity-90" : ""}
                  >
                    <DraftCard draft={draft} />
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
            footer={
              <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground" asChild>
                <Link href="/drafts/new?status=ready_for_review">
                  <Plus className="mr-2 h-4 w-4" />
                  New Draft
                </Link>
              </Button>
            }
          >
            {readyForReview.map((draft, index) => (
              <Draggable key={draft.id} draggableId={draft.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={snapshot.isDragging ? "opacity-90" : ""}
                  >
                    <DraftCard draft={draft} showScheduleButton />
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
                    <ScheduledCard post={post} />
                  </div>
                )}
              </Draggable>
            ))}
          </KanbanColumn>

          {/* Published Column */}
          <KanbanColumn
            title="Published"
            count={publishedCount}
            color="green"
            droppableId="published"
          >
            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
              <Archive className="mb-2 h-8 w-8" />
              <p className="text-sm">{publishedCount} posts published</p>
              <p className="text-xs mt-1">Drag scheduled posts here to publish</p>
              <Button variant="link" size="sm" asChild className="mt-2">
                <Link href="/published">View Archive</Link>
              </Button>
            </div>
          </KanbanColumn>
        </div>
      </DragDropContext>

      {/* Schedule Dialog */}
      {draftToSchedule && (
        <ScheduleDialog
          draftId={draftToSchedule.id}
          draftTitle={draftToSchedule.title || "Untitled Draft"}
          open={scheduleDialogOpen}
          onOpenChange={setScheduleDialogOpen}
          onScheduled={handleScheduled}
        />
      )}
    </>
  );
}
