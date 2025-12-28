"use client";

import { Droppable } from "@hello-pangea/dnd";
import { cn } from "@/lib/utils";

interface KanbanColumnProps {
  title: string;
  count: number;
  color: "purple" | "yellow" | "blue" | "orange" | "green" | "gray";
  children: React.ReactNode;
  footer?: React.ReactNode;
  droppableId?: string;
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
  footer,
  droppableId,
}: KanbanColumnProps) {
  const content = (
    <>
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h3 className="font-semibold text-sm">{title}</h3>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-xs font-medium",
            badgeClasses[color]
          )}
        >
          {count}
        </span>
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
            </div>
          )}
        </Droppable>
      ) : (
        <div className="flex-1 space-y-3 overflow-y-auto p-3">
          {children}
        </div>
      )}

      {/* Footer */}
      {footer && (
        <div className="border-t p-2">
          {footer}
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
