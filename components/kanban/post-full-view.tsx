"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Save,
  Trash2,
  Pencil,
  ThumbsUp,
  MessageCircle,
  Globe,
  ExternalLink
} from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
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

const STATUS_OPTIONS: { value: PostStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "ready_for_review", label: "Ready for Review" },
  { value: "scheduled", label: "Scheduled" },
  { value: "published", label: "Published" },
];

const TIMEZONES = [
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
];

const AUTHOR_NAME = "Dylan Goren";
const PROFILE_IMAGE = "/profile.jpeg";
const MAX_CHARS = 1300;

function getStatusBadge(status: PostStatus) {
  switch (status) {
    case "draft":
      return { label: "Draft", className: "bg-yellow-100 text-yellow-800 border-yellow-200" };
    case "ready_for_review":
      return { label: "Ready for Review", className: "bg-blue-100 text-blue-800 border-blue-200" };
    case "scheduled":
      return { label: "Scheduled", className: "bg-orange-100 text-orange-800 border-orange-200" };
    case "published":
      return { label: "Published", className: "bg-green-100 text-green-800 border-green-200" };
  }
}

export function PostFullView({
  post,
  open,
  onOpenChange,
  onSave,
  onDelete,
}: PostFullViewProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(post.content);
  const [status, setStatus] = useState<PostStatus>(post.status);
  const [scheduledDate, setScheduledDate] = useState(post.scheduledDate || "");
  const [scheduledTime, setScheduledTime] = useState(post.scheduledTime || "");
  const [timezone, setTimezone] = useState(post.timezone || "America/New_York");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const hasChanges =
    content !== post.content ||
    status !== post.status ||
    scheduledDate !== (post.scheduledDate || "") ||
    scheduledTime !== (post.scheduledTime || "") ||
    timezone !== (post.timezone || "America/New_York");

  const characterCount = content.length;
  const statusBadge = getStatusBadge(status);

  const handleSave = async () => {
    if (!onSave) return;
    setIsSaving(true);
    try {
      await onSave({
        content,
        status,
        scheduledDate: status === "scheduled" ? scheduledDate : undefined,
        scheduledTime: status === "scheduled" ? scheduledTime : undefined,
        timezone: status === "scheduled" ? timezone : undefined,
        characterCount,
      });
      setIsEditing(false);
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
      setStatus(post.status);
      setScheduledDate(post.scheduledDate || "");
      setScheduledTime(post.scheduledTime || "");
      setTimezone(post.timezone || "America/New_York");
      setShowDeleteConfirm(false);
      setIsEditing(false);
    }
    onOpenChange(newOpen);
  };

  const formatHeaderDate = () => {
    if (post.publishedAt) {
      return `Published on ${new Date(post.publishedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })}, ${new Date(post.publishedAt).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })}`;
    }
    if (post.scheduledDate) {
      const dateStr = new Date(post.scheduledDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      return `Scheduled for ${dateStr}${post.scheduledTime ? `, ${post.scheduledTime}` : ""}`;
    }
    return `Created ${new Date(post.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })}`;
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-xl max-h-[85vh] p-0 gap-0 overflow-hidden flex flex-col">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b pr-12 shrink-0">
          <span className="text-sm text-muted-foreground">{formatHeaderDate()}</span>
        </div>

        {/* LinkedIn Post Preview */}
        <div className="bg-background overflow-y-auto flex-1 min-h-0">
          {/* Author Header */}
          <div className="p-4 pb-0">
            <div className="flex items-start gap-3">
              {/* Avatar with LinkedIn badge */}
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  <Image
                    src={PROFILE_IMAGE}
                    alt={AUTHOR_NAME}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-[#0a66c2] rounded-full flex items-center justify-center border-2 border-white">
                  <span className="text-white text-[9px] font-bold">in</span>
                </div>
              </div>

              {/* Author Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm">{AUTHOR_NAME}</span>
                  <Badge variant="outline" className={cn("text-xs", statusBadge.className)}>
                    {statusBadge.label}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Globe className="h-3 w-3" />
                  <span>Public</span>
                </p>
              </div>
            </div>
          </div>

          {/* Post Content */}
          <div className="px-4 py-3">
            {isEditing ? (
              <div className="space-y-2">
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[200px] text-sm resize-none"
                  placeholder="Write your post content..."
                />
                <div className="flex justify-end">
                  <span className={cn("text-xs", characterCount > MAX_CHARS ? "text-red-500" : "text-muted-foreground")}>
                    {characterCount} / {MAX_CHARS} characters
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm whitespace-pre-wrap leading-relaxed">
                {content}
              </p>
            )}
          </div>

          {/* Metrics for published posts */}
          {post.status === "published" && post.metrics && (
            <div className="px-4 py-2 border-t flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <ThumbsUp className="h-4 w-4" />
                {post.metrics.likes} reactions
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4" />
                {post.metrics.comments} comments
              </span>
              {post.linkedinUrl && (
                <a
                  href={post.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 ml-auto text-blue-600 hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  View on LinkedIn
                </a>
              )}
            </div>
          )}

        </div>

        {/* Edit Controls Panel */}
        <div className="border-t bg-muted/30 px-4 py-3 space-y-3 shrink-0">
          {/* Status & Schedule Row */}
          <div className="flex items-end gap-3 flex-wrap">
            <div className="w-44">
              <Label className="text-xs text-muted-foreground mb-1.5 block">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as PostStatus)}>
                <SelectTrigger className="h-9">
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

            {status === "scheduled" && (
              <>
                <div className="w-32">
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Date</Label>
                  <Input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="h-9"
                  />
                </div>
                <div className="w-24">
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Time</Label>
                  <Input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="h-9"
                  />
                </div>
                <div className="flex-1 min-w-[140px]">
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Timezone</Label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger className="h-9">
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
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              {onDelete && !showDeleteConfirm && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              )}
              {showDeleteConfirm && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-red-600">Delete?</span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? "..." : "Yes"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    No
                  </Button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {!isEditing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil className="h-4 w-4 mr-1" />
                  Edit Content
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setContent(post.content);
                    setIsEditing(false);
                  }}
                >
                  Cancel
                </Button>
              )}

              {onSave && hasChanges && (
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  <Save className="h-4 w-4 mr-1" />
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
