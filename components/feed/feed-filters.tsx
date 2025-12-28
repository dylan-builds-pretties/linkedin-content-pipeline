"use client";

import { cn } from "@/lib/utils";

export type FilterType = "draft" | "ready_for_review" | "scheduled" | "published";

interface FeedFiltersProps {
  activeFilters: FilterType[];
  onFilterChange: (filters: FilterType[]) => void;
}

const FILTERS: { value: FilterType; label: string; className: string }[] = [
  { value: "draft", label: "Drafts", className: "bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200" },
  { value: "ready_for_review", label: "Ready for Review", className: "bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200" },
  { value: "scheduled", label: "Scheduled", className: "bg-orange-100 text-orange-800 border-orange-300 hover:bg-orange-200" },
  { value: "published", label: "Published", className: "bg-green-100 text-green-800 border-green-300 hover:bg-green-200" },
];

export function FeedFilters({ activeFilters, onFilterChange }: FeedFiltersProps) {
  const toggleFilter = (filter: FilterType) => {
    if (activeFilters.includes(filter)) {
      // Don't allow deselecting all filters
      if (activeFilters.length > 1) {
        onFilterChange(activeFilters.filter((f) => f !== filter));
      }
    } else {
      onFilterChange([...activeFilters, filter]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map((filter) => {
        const isActive = activeFilters.includes(filter.value);
        return (
          <button
            key={filter.value}
            onClick={() => toggleFilter(filter.value)}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-full border transition-all",
              isActive
                ? filter.className
                : "bg-muted text-muted-foreground border-transparent hover:bg-muted/80 opacity-50"
            )}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
