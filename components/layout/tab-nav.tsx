"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { name: "Guidelines", href: "/guidelines" },
  { name: "Ideas", href: "/ideas" },
  { name: "Posts", href: "/" },
];

export function TabNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/" || pathname.startsWith("/drafts") || pathname.startsWith("/scheduled") || pathname.startsWith("/published");
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="border-b">
      <div className="grid grid-cols-3 h-14 items-center px-6">
        <h1 className="text-lg font-semibold">Content Pipeline</h1>
        <nav className="flex items-center justify-center">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "px-4 py-4 text-sm font-medium transition-colors border-b-2 -mb-px",
                isActive(tab.href)
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/50"
              )}
            >
              {tab.name}
            </Link>
          ))}
        </nav>
        <div />
      </div>
    </header>
  );
}
