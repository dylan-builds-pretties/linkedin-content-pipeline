"use client";

import Link from "next/link";
import { Edit, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ScheduledPost } from "@/lib/types";

interface ScheduledCardProps {
  post: ScheduledPost;
}

export function ScheduledCard({ post }: ScheduledCardProps) {
  // Format the scheduled date
  const date = new Date(post.scheduledDate);
  const formattedDate = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  // Get preview of content
  const preview = post.content.split("\n")[0].slice(0, 50);

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  };

  return (
    <div className="rounded-lg border bg-background p-3 shadow-sm transition-shadow hover:shadow-md cursor-grab active:cursor-grabbing">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium">
            <Clock className="h-3.5 w-3.5 text-orange-500" />
            {formattedDate}
          </div>
          <div className="text-xs text-muted-foreground">
            {post.scheduledTime}
          </div>
        </div>
        <Badge
          variant="secondary"
          className={cn("text-xs", statusColors[post.status])}
        >
          {post.status}
        </Badge>
      </div>

      <p className="mt-2 text-sm line-clamp-2 text-muted-foreground">
        {preview}...
      </p>

      <div className="mt-3 flex justify-end">
        <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
          <Link href={`/scheduled/${post.id}`}>
            <Edit className="mr-1 h-3 w-3" />
            Edit
          </Link>
        </Button>
      </div>
    </div>
  );
}
