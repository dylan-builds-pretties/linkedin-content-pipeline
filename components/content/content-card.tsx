import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ContentCardProps {
  title: string;
  content: string;
  badges?: Array<{
    label: string;
    variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning";
  }>;
  date: string;
  href: string;
  className?: string;
}

export function ContentCard({
  title,
  content,
  badges,
  date,
  href,
  className,
}: ContentCardProps) {
  return (
    <Link href={href}>
      <Card
        className={cn(
          "transition-colors hover:bg-accent/50 cursor-pointer",
          className
        )}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg line-clamp-1">{title}</CardTitle>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {date}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {content}
          </p>
          {badges && badges.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {badges.map((badge, index) => (
                <Badge key={index} variant={badge.variant || "secondary"}>
                  {badge.label}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
