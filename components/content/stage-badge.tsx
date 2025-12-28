import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Stage = "braindump" | "idea" | "draft" | "scheduled" | "published";

interface StageBadgeProps {
  stage: Stage;
  className?: string;
}

const stageConfig: Record<Stage, { label: string; className: string }> = {
  braindump: {
    label: "Braindump",
    className: "bg-blue-100 text-blue-800 hover:bg-blue-200 border-transparent",
  },
  idea: {
    label: "Idea",
    className: "bg-purple-100 text-purple-800 hover:bg-purple-200 border-transparent",
  },
  draft: {
    label: "Draft",
    className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-transparent",
  },
  scheduled: {
    label: "Scheduled",
    className: "bg-orange-100 text-orange-800 hover:bg-orange-200 border-transparent",
  },
  published: {
    label: "Published",
    className: "bg-green-100 text-green-800 hover:bg-green-200 border-transparent",
  },
};

export function StageBadge({ stage, className }: StageBadgeProps) {
  const config = stageConfig[stage];

  return (
    <Badge className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}
