"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Inbox,
  Lightbulb,
  FileText,
  Calendar,
  CheckCircle,
  LayoutDashboard,
  Plus,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
}

interface SidebarProps {
  counts?: {
    braindumps: number;
    ideas: number;
    drafts: number;
    scheduled: number;
    published: number;
  };
}

export function Sidebar({ counts }: SidebarProps) {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    {
      title: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
    },
    {
      title: "Braindumps",
      href: "/braindumps",
      icon: Inbox,
      count: counts?.braindumps,
    },
    {
      title: "Ideas",
      href: "/ideas",
      icon: Lightbulb,
      count: counts?.ideas,
    },
    {
      title: "Drafts",
      href: "/drafts",
      icon: FileText,
      count: counts?.drafts,
    },
    {
      title: "Scheduled",
      href: "/scheduled",
      icon: Calendar,
      count: counts?.scheduled,
    },
    {
      title: "Published",
      href: "/published",
      icon: CheckCircle,
      count: counts?.published,
    },
    {
      title: "Guidelines",
      href: "/guidelines",
      icon: BookOpen,
    },
  ];

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <FileText className="h-6 w-6 text-primary" />
          <span>Social Media Writer</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              <span className="flex-1">{item.title}</span>
              {item.count !== undefined && (
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs",
                    isActive
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-muted-foreground/20 text-muted-foreground"
                  )}
                >
                  {item.count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4">
        <Button asChild className="w-full">
          <Link href="/braindumps/new">
            <Plus className="mr-2 h-4 w-4" />
            New Braindump
          </Link>
        </Button>
      </div>
    </aside>
  );
}
