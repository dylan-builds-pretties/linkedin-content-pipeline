"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScheduledPost } from "@/lib/types";
import { Trash2, Send } from "lucide-react";

const TIMEZONES = [
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "America/Anchorage", label: "Alaska Time (AKT)" },
  { value: "Pacific/Honolulu", label: "Hawaii Time (HT)" },
];

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

export default function EditScheduledPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [post, setPost] = useState<ScheduledPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    scheduledDate: "",
    scheduledTime: "",
    timezone: "",
    reviewedBy: "",
    status: "pending" as "pending" | "approved" | "rejected",
  });

  useEffect(() => {
    async function fetchPost() {
      try {
        const response = await fetch(`/api/scheduled/${id}`);
        if (response.ok) {
          const data = await response.json();
          setPost(data);
          setFormData({
            title: data.title,
            content: data.content,
            scheduledDate: data.scheduledDate,
            scheduledTime: data.scheduledTime,
            timezone: data.timezone,
            reviewedBy: data.reviewedBy || "",
            status: data.status,
          });
        } else {
          router.push("/scheduled");
        }
      } catch (error) {
        console.error("Failed to fetch scheduled post:", error);
        router.push("/scheduled");
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
  }, [id, router]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/scheduled/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push("/scheduled");
      }
    } catch (error) {
      console.error("Failed to save scheduled post:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this scheduled post?")) {
      return;
    }

    try {
      const response = await fetch(`/api/scheduled/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/scheduled");
      }
    } catch (error) {
      console.error("Failed to delete scheduled post:", error);
    }
  };

  const handlePublish = async () => {
    if (!confirm("Mark this post as published?")) {
      return;
    }

    setPublishing(true);
    try {
      const response = await fetch(`/api/scheduled/${id}/publish`, {
        method: "POST",
      });

      if (response.ok) {
        router.push("/published");
      }
    } catch (error) {
      console.error("Failed to publish post:", error);
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <Header title="Edit Scheduled Post" backHref="/scheduled" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="p-6">
        <Header title="Edit Scheduled Post" backHref="/scheduled" />
        <p className="text-muted-foreground">Post not found.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Header title="Edit Scheduled Post" backHref="/scheduled" />

      <Card>
        <CardHeader>
          <CardTitle>Post Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Post title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              placeholder="Post content"
              rows={8}
            />
            <p className="text-sm text-muted-foreground">
              {formData.content.length} characters
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scheduledDate">Scheduled Date</Label>
              <Input
                id="scheduledDate"
                type="date"
                value={formData.scheduledDate}
                onChange={(e) =>
                  setFormData({ ...formData, scheduledDate: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduledTime">Scheduled Time</Label>
              <Input
                id="scheduledTime"
                type="time"
                value={formData.scheduledTime}
                onChange={(e) =>
                  setFormData({ ...formData, scheduledTime: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                value={formData.timezone}
                onValueChange={(value) =>
                  setFormData({ ...formData, timezone: value })
                }
              >
                <SelectTrigger id="timezone">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: "pending" | "approved" | "rejected") =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reviewedBy">Reviewed By</Label>
            <Input
              id="reviewedBy"
              value={formData.reviewedBy}
              onChange={(e) =>
                setFormData({ ...formData, reviewedBy: e.target.value })
              }
              placeholder="Reviewer name"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="destructive"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handlePublish}
                disabled={publishing}
              >
                <Send className="h-4 w-4 mr-2" />
                {publishing ? "Publishing..." : "Mark as Published"}
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
