import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface HeaderProps {
  title: string;
  backHref?: string;
  backLabel?: string;
  action?: React.ReactNode;
}

export function Header({ title, backHref, backLabel, action }: HeaderProps) {
  return (
    <div className="mb-6">
      {backHref && (
        <Button variant="ghost" size="sm" asChild className="mb-2 -ml-2">
          <Link href={backHref}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {backLabel || "Back"}
          </Link>
        </Button>
      )}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{title}</h1>
        {action}
      </div>
    </div>
  );
}
