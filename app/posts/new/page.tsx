"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { PostStatus } from "@/lib/types";

const LINKEDIN_CHAR_LIMIT = 1300;

function NewPostForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [saving, setSaving] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [sourceIdea, setSourceIdea] = useState("");
  const [author, setAuthor] = useState("Dylan Goren");
  const [status, setStatus] = useState<PostStatus>(
    (searchParams.get("status") as PostStatus) || "draft"
  );

  const handleSave = async () => {
    if (!content.trim()) {
      alert("Content is required");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title || undefined,
          content,
          sourceIdea: sourceIdea || "manual",
          author,
          status,
        }),
      });
      if (res.ok) {
        const created = await res.json();
        router.push(`/posts/${created.id}`);
      }
    } catch (error) {
      console.error("Failed to create post:", error);
    } finally {
      setSaving(false);
    }
  };

  const charCount = content.length;
  const isOverLimit = charCount > LINKEDIN_CHAR_LIMIT;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <Button size="sm" onClick={handleSave} disabled={saving || !content.trim()}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Creating..." : "Create Post"}
        </Button>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Title (optional)</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Give your post a title for easy reference"
          />
        </div>

        {/* Content */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="content">Content</Label>
            <span className={cn("text-sm", isOverLimit ? "text-red-500" : "text-muted-foreground")}>
              {charCount} / {LINKEDIN_CHAR_LIMIT}
            </span>
          </div>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[300px] font-mono text-sm"
            placeholder="Write your LinkedIn post content here..."
          />
        </div>

        {/* Author */}
        <div className="space-y-2">
          <Label htmlFor="author">Author</Label>
          <Input
            id="author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Author name"
          />
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as PostStatus)}>
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="ready_for_review">Ready for Review</SelectItem>
            </SelectContent>
          </Select>
        </div>

      </div>
    </div>
  );
}

export default function NewPostPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]">Loading...</div>}>
      <NewPostForm />
    </Suspense>
  );
}
