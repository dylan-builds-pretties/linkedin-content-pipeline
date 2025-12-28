"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, X, Trash2, Calendar, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Post, PostStatus } from "@/lib/types";

interface PostFullViewProps {
  post: Post;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (updates: Partial<Post>) => Promise<void>;
  onDelete?: () => Promise<void>;
}

const STATUS_OPTIONS: { value: PostStatus; label: string; color: string }[] = [
  { value: "draft", label: "Draft", color: "bg-gray-100 text-gray-700" },
  { value: "ready_for_review", label: "Ready for Review", color: "bg-blue-100 text-blue-700" },
  { value: "scheduled", label: "Scheduled", color: "bg-orange-100 text-orange-700" },
  { value: "published", label: "Published", color: "bg-green-100 text-green-700" },
];

const TIMEZONES = [
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
];

export function PostFullView({
  post,
  open,
  onOpenChange,
  onSave,
  onDelete,
}: PostFullViewProps) {
  const router = useRouter();
  const [content, setContent] = useState(post.content);
  const [title, setTitle] = useState(post.title || "");
  const [status, setStatus] = useState<PostStatus>(post.status);
  const [scheduledDate, setScheduledDate] = useState(post.scheduledDate || "");
  const [scheduledTime, setScheduledTime] = useState(post.scheduledTime || "");
  const [timezone, setTimezone] = useState(post.timezone || "America/New_York");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const hasChanges =
    content !== post.content ||
    title !== (post.title || "") ||
    status !== post.status ||
    scheduledDate !== (post.scheduledDate || "") ||
    scheduledTime !== (post.scheduledTime || "") ||
    timezone !== (post.timezone || "America/New_York");

  const characterCount = content.length;

  const handleSave = async () => {
    if (!onSave) return;
    setIsSaving(true);
    try {
      await onSave({
        content,
        title: title || undefined,
        status,
        scheduledDate: status === "scheduled" ? scheduledDate : undefined,
        scheduledTime: status === "scheduled" ? scheduledTime : undefined,
        timezone: status === "scheduled" ? timezone : undefined,
        characterCount,
      });
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete();
      onOpenChange(false);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setContent(post.content);
      setTitle(post.title || "");
      setStatus(post.status);
      setScheduledDate(post.scheduledDate || "");
      setScheduledTime(post.scheduledTime || "");
      setTimezone(post.timezone || "America/New_York");
      setShowDeleteConfirm(false);
    }
    onOpenChange(newOpen);
  };

  const currentStatusOption = STATUS_OPTIONS.find((s) => s.value === status);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <div className="flex items-center justify-between pr-8">
            <DialogTitle className="text-xl font-semibold">
              Edit Post
            </DialogTitle>
            <Badge className={currentStatusOption?.color}>
              {currentStatusOption?.label}
            </Badge>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-6">
            {/* Title (optional) */}
            <div>
              <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                Title (optional)
              </Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg font-medium"
                placeholder="Add a title..."
              />
            </div>

            {/* Content */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium text-muted-foreground">
                  Content
                </Label>
                <span className={`text-xs ${characterCount > 1300 ? "text-red-500" : "text-muted-foreground"}`}>
                  {characterCount}/1300 characters
                </span>
              </div>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[250px] resize-none"
                placeholder="Write your post content..."
              />
            </div>

            {/* Status */}
            <div>
              <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                Status
              </Label>
              <Select value={status} onValueChange={(v) => setStatus(v as PostStatus)}>
                <SelectTrigger>
                  <SelectValue />
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

            {/* Scheduling fields (shown when status is scheduled) */}
            {status === "scheduled" && (
              <div className="space-y-4 p-4 rounded-lg border bg-muted/30">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Calendar className="h-4 w-4" />
                  Schedule Details
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground mb-2 block">
                      Date
                    </Label>
                    <Input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground mb-2 block">
                      Time
                    </Label>
                    <Input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground mb-2 block">
                    Timezone
                  </Label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger>
                      <SelectValue />
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
              </div>
            )}

            {/* Published info (read-only) */}
            {post.status === "published" && post.publishedAt && (
              <div className="p-4 rounded-lg border bg-green-50">
                <div className="flex items-center gap-2 text-sm font-medium text-green-700 mb-2">
                  <Clock className="h-4 w-4" />
                  Published
                </div>
                <p className="text-sm text-green-600">
                  {new Date(post.publishedAt).toLocaleString()}
                </p>
                {post.linkedinUrl && (
                  <a
                    href={post.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline mt-1 block"
                  >
                    View on LinkedIn
                  </a>
                )}
              </div>
            )}

            {/* Metadata */}
            <div className="text-xs text-muted-foreground border-t pt-4 space-y-1">
              <p>Created: {new Date(post.createdAt).toLocaleString()}</p>
              <p>Updated: {new Date(post.updatedAt).toLocaleString()}</p>
              <p>Version: {post.version}</p>
              {post.sourceIdea && <p>Source Idea: {post.sourceIdea}</p>}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t shrink-0 flex justify-between">
          <div>
            {onDelete && !showDeleteConfirm && (
              <Button
                variant="ghost"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
            {showDeleteConfirm && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-red-600">Delete this post?</span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Yes, Delete"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
            {onSave && (
              <Button onClick={handleSave} disabled={!hasChanges || isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
