"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Save } from "lucide-react";
import type { Idea } from "@/lib/types";

const LINKEDIN_CHAR_LIMIT = 1300;

function NewDraftForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("status") === "ready_for_review" ? "ready_for_review" : "draft";

  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [content, setContent] = useState("");
  const [notes, setNotes] = useState("");
  const [sourceIdea, setSourceIdea] = useState("");

  const characterCount = content.length;
  const isOverLimit = characterCount > LINKEDIN_CHAR_LIMIT;

  useEffect(() => {
    async function fetchIdeas() {
      try {
        const response = await fetch("/api/ideas");
        if (response.ok) {
          const data = await response.json();
          setIdeas(data);
        }
      } catch (err) {
        console.error("Failed to fetch ideas:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchIdeas();
  }, []);

  const handleSave = async () => {
    if (!content.trim()) {
      setError("Content is required");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/drafts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: content.trim(),
          notes: notes.trim(),
          sourceIdea: sourceIdea || "",
          version: 1,
          characterCount,
          author: "User",
          status: initialStatus,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create draft");
      }

      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6">
      <Header
        title={initialStatus === "ready_for_review" ? "New Draft (Ready for Review)" : "New Draft"}
        backHref="/"
        action={
          <Button onClick={handleSave} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Creating..." : "Create Draft"}
          </Button>
        }
      />

      {error && (
        <Card className="border-destructive mb-6">
          <CardContent className="pt-4">
            <p className="text-destructive text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Source Idea (optional)</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={sourceIdea} onValueChange={setSourceIdea}>
              <SelectTrigger>
                <SelectValue placeholder="Select an idea" />
              </SelectTrigger>
              <SelectContent>
                {loading ? (
                  <SelectItem value="loading" disabled>
                    Loading ideas...
                  </SelectItem>
                ) : ideas.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No ideas available
                  </SelectItem>
                ) : (
                  ideas.map((idea) => (
                    <SelectItem key={idea.id} value={idea.id}>
                      {idea.title || "Untitled idea"}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Content</span>
              <span
                className={cn(
                  "text-sm font-normal",
                  isOverLimit ? "text-destructive" : "text-muted-foreground"
                )}
              >
                {characterCount} / {LINKEDIN_CHAR_LIMIT}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your LinkedIn post content here..."
                className={cn(
                  "min-h-[200px] resize-y",
                  isOverLimit && "border-destructive focus-visible:ring-destructive"
                )}
              />
              {isOverLimit && (
                <p className="text-sm text-destructive">
                  Your post exceeds the LinkedIn character limit for full display.
                  Consider shortening it.
                </p>
              )}

              {/* Character count bar */}
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all",
                    isOverLimit ? "bg-destructive" : "bg-primary"
                  )}
                  style={{
                    width: `${Math.min((characterCount / LINKEDIN_CHAR_LIMIT) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notes (Internal)</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any internal notes or reminders..."
              className="min-h-[100px]"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function NewDraftPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <NewDraftForm />
    </Suspense>
  );
}
