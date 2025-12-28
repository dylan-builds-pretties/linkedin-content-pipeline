"use client";

import { LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ViewToggleProps {
  view: "kanban" | "feed";
  onViewChange: (view: "kanban" | "feed") => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex items-center rounded-lg border bg-muted p-1">
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "h-8 px-3",
          view === "kanban" && "bg-background shadow-sm"
        )}
        onClick={() => onViewChange("kanban")}
      >
        <LayoutGrid className="h-4 w-4 mr-2" />
        Board
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "h-8 px-3",
          view === "feed" && "bg-background shadow-sm"
        )}
        onClick={() => onViewChange("feed")}
      >
        <List className="h-4 w-4 mr-2" />
        Feed
      </Button>
    </div>
  );
}
