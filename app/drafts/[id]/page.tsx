"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LinkedInPreview } from "@/components/content/linkedin-preview";
import { cn } from "@/lib/utils";
import { Save, Trash2, Calendar } from "lucide-react";
import type { Draft } from "@/lib/types";

const LINKEDIN_CHAR_LIMIT = 1300;

export default function EditDraftPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [draft, setDraft] = useState<Draft | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [content, setContent] = useState("");
  const [notes, setNotes] = useState("");

  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");

  const characterCount = content.length;
  const isOverLimit = characterCount > LINKEDIN_CHAR_LIMIT;

  useEffect(() => {
    async function fetchDraft() {
      try {
        const response = await fetch(`/api/drafts/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch draft");
        }

        const data = await response.json();
        setDraft(data);
        setContent(data.content);
        setNotes(data.notes || "");
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchDraft();
  }, [id]);

  const handleSave = async () => {
    if (!draft) return;

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/drafts/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: content.trim(),
          notes: notes.trim(),
          characterCount,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save draft");
      }

      router.push("/drafts");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!draft) return;

    if (!confirm("Are you sure you want to delete this draft?")) {
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/drafts/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete draft");
      }

      router.push("/drafts");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  const handleSchedule = async () => {
    if (!draft || !scheduledDate || !scheduledTime) return;

    setScheduling(true);
    setError(null);

    try {
      const response = await fetch("/api/scheduled", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          draftId: draft.id,
          content: content.trim(),
          scheduledDate,
          scheduledTime,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          reviewedBy: "",
          status: "pending",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to schedule post");
      }

      setScheduleDialogOpen(false);
      router.push("/scheduled");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to schedule");
    } finally {
      setScheduling(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <Header title="Loading..." backHref="/drafts" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="animate-pulse">
            <CardContent className="pt-6">
              <div className="h-64 bg-muted rounded" />
            </CardContent>
          </Card>
          <Card className="animate-pulse">
            <CardContent className="pt-6">
              <div className="h-64 bg-muted rounded" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error && !draft) {
    return (
      <div className="p-6">
        <Header title="Error" backHref="/drafts" />
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">Error: {error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!draft) {
    return (
      <div className="p-6">
        <Header title="Not Found" backHref="/drafts" />
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Draft not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Header
        title="Edit Draft"
        backHref="/drafts"
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {deleting ? "Deleting..." : "Delete"}
            </Button>

            <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Schedule Post</DialogTitle>
                  <DialogDescription>
                    Choose when to publish this post to LinkedIn.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="schedule-date">Date</Label>
                    <Input
                      id="schedule-date"
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="schedule-time">Time</Label>
                    <Input
                      id="schedule-time"
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setScheduleDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSchedule}
                    disabled={scheduling || !scheduledDate || !scheduledTime}
                  >
                    {scheduling ? "Scheduling..." : "Schedule Post"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button onClick={handleSave} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        }
      />

      {error && (
        <Card className="border-destructive mb-6">
          <CardContent className="pt-4">
            <p className="text-destructive text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor */}
        <div className="space-y-6">
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
            <CardContent className="space-y-3">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your LinkedIn post..."
                className={cn(
                  "min-h-[250px] resize-y",
                  isOverLimit &&
                    "border-destructive focus-visible:ring-destructive"
                )}
              />

              {/* Character count bar */}
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all",
                    isOverLimit ? "bg-destructive" : characterCount > LINKEDIN_CHAR_LIMIT * 0.9
                      ? "bg-yellow-500"
                      : "bg-primary"
                  )}
                  style={{
                    width: `${Math.min((characterCount / LINKEDIN_CHAR_LIMIT) * 100, 100)}%`,
                  }}
                />
              </div>

              {isOverLimit && (
                <p className="text-sm text-destructive">
                  Your post exceeds the LinkedIn limit. Posts over{" "}
                  {LINKEDIN_CHAR_LIMIT} characters will be truncated.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notes (Internal)</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any internal notes or reminders..."
                className="min-h-[100px]"
              />
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div>
          <div className="sticky top-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              LinkedIn Preview
            </h3>
            <LinkedInPreview content={content} authorName={draft.author} />
          </div>
        </div>
      </div>
    </div>
  );
}
