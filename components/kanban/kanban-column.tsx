"use client";

import { Droppable } from "@hello-pangea/dnd";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PostStatus } from "@/lib/types";

interface KanbanColumnProps {
  title: string;
  count: number;
  color: "purple" | "yellow" | "blue" | "orange" | "green" | "gray";
  children: React.ReactNode;
  droppableId?: string;
  status: PostStatus;
  onCreatePost: (status: PostStatus) => void;
}

const colorClasses = {
  purple: "border-t-purple-500",
  yellow: "border-t-yellow-500",
  blue: "border-t-blue-500",
  orange: "border-t-orange-500",
  green: "border-t-green-500",
  gray: "border-t-gray-500",
};

const badgeClasses = {
  purple: "bg-purple-100 text-purple-700",
  yellow: "bg-yellow-100 text-yellow-700",
  blue: "bg-blue-100 text-blue-700",
  orange: "bg-orange-100 text-orange-700",
  green: "bg-green-100 text-green-700",
  gray: "bg-gray-100 text-gray-700",
};

const dropHighlightClasses = {
  purple: "bg-purple-50",
  yellow: "bg-yellow-50",
  blue: "bg-blue-50",
  orange: "bg-orange-50",
  green: "bg-green-50",
  gray: "bg-gray-50",
};

export function KanbanColumn({
  title,
  count,
  color,
  children,
  droppableId,
  status,
  onCreatePost,
}: KanbanColumnProps) {
  const content = (
    <>
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h3 className="font-semibold text-sm">{title}</h3>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-xs font-medium",
              badgeClasses[color]
            )}
          >
            {count}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-foreground"
            onClick={() => onCreatePost(status)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Cards */}
      {droppableId ? (
        <Droppable droppableId={droppableId}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={cn(
                "flex-1 space-y-3 overflow-y-auto p-3 transition-colors",
                snapshot.isDraggingOver && dropHighlightClasses[color]
              )}
            >
              {children}
              {provided.placeholder}
              {/* Full-width add button */}
              <button
                onClick={() => onCreatePost(status)}
                className="w-full rounded-lg border-2 border-dashed border-muted-foreground/25 py-3 text-sm text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add
              </button>
            </div>
          )}
        </Droppable>
      ) : (
        <div className="flex-1 space-y-3 overflow-y-auto p-3">
          {children}
          {/* Full-width add button */}
          <button
            onClick={() => onCreatePost(status)}
            className="w-full rounded-lg border-2 border-dashed border-muted-foreground/25 py-3 text-sm text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>
      )}
    </>
  );

  return (
    <div
      className={cn(
        "flex w-72 min-w-72 flex-col rounded-lg border border-t-4 bg-card min-h-0",
        colorClasses[color]
      )}
    >
      {content}
    </div>
  );
}
