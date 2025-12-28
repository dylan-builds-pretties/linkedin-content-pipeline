"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn, truncate } from "@/lib/utils";
import { Inbox, Lightbulb, FileText, Calendar, ArrowRight } from "lucide-react";

interface StageData {
  count: number;
  items: Array<{
    id: string;
    title?: string;
    preview?: string;
  }>;
}

interface PipelineOverviewProps {
  braindumps: StageData;
  ideas: StageData;
  drafts: StageData;
  scheduled: StageData;
}

const stages = [
  {
    key: "braindumps",
    title: "Braindumps",
    icon: Inbox,
    href: "/braindumps",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    key: "ideas",
    title: "Ideas",
    icon: Lightbulb,
    href: "/ideas",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    key: "drafts",
    title: "Drafts",
    icon: FileText,
    href: "/drafts",
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
  },
  {
    key: "scheduled",
    title: "Scheduled",
    icon: Calendar,
    href: "/scheduled",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
] as const;

export function PipelineOverview({
  braindumps,
  ideas,
  drafts,
  scheduled,
}: PipelineOverviewProps) {
  const data = { braindumps, ideas, drafts, scheduled };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Pipeline Overview</h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stages.map((stage, index) => {
          const stageData = data[stage.key];
          const Icon = stage.icon;

          return (
            <Card key={stage.key} className="relative overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div
                    className={cn(
                      "rounded-lg p-2",
                      stage.bgColor
                    )}
                  >
                    <Icon className={cn("h-5 w-5", stage.color)} />
                  </div>
                  <span className="text-3xl font-bold">{stageData?.count ?? 0}</span>
                </div>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stage.title}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-2">
                {(stageData?.items ?? []).slice(0, 2).map((item) => (
                  <Link
                    key={item.id}
                    href={`${stage.href}/${item.id}`}
                    className="block rounded-md border p-2 text-sm hover:bg-muted transition-colors"
                  >
                    <div className="font-medium truncate">{item.title || truncate(item.preview || "Untitled", 40)}</div>
                    {item.preview && (
                      <div className="text-xs text-muted-foreground truncate">
                        {truncate(item.preview, 50)}
                      </div>
                    )}
                  </Link>
                ))}

                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="w-full mt-2"
                >
                  <Link href={stage.href}>
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>

              {index < stages.length - 1 && (
                <div className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 lg:block">
                  <ArrowRight className="h-6 w-6 text-muted-foreground/30" />
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
