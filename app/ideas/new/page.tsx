"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function NewIdeaPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [braindump, setBraindump] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!title.trim()) {
      setError("Title is required");
      setIsSubmitting(false);
      return;
    }

    if (!braindump.trim()) {
      setError("Braindump content is required");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/ideas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          braindump: braindump.trim(),
          notes: notes.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create idea");
      }

      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Pipeline
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">New Idea</h1>
        <p className="text-sm text-muted-foreground">
          Start with your raw thoughts, then build out the idea
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="text-destructive text-sm bg-destructive/10 p-3 rounded-md">
            {error}
          </div>
        )}

        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Idea Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Founder Authenticity, Pricing Psychology"
            required
          />
        </div>

        {/* Braindump - the raw input */}
        <Card className="border-purple-200 bg-purple-50/50">
          <CardHeader>
            <CardTitle className="text-lg">Braindump</CardTitle>
            <CardDescription>
              Your raw thoughts, voice notes, or ideas. This is the foundation
              for your idea.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={braindump}
              onChange={(e) => setBraindump(e.target.value)}
              placeholder="Type or paste your raw thoughts here...

Example: Had a call with a founder today who was hiding their revenue numbers from their team. Why do we do this? I think there's something about vulnerability and trust here. The most engaged posts I see are the vulnerable ones..."
              className="min-h-[200px] bg-white"
              required
            />
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Notes</CardTitle>
            <CardDescription>
              Rich text content (supports Markdown) - optional
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Write your notes here... (Markdown supported)"
              className="min-h-[150px]"
            />
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" asChild>
            <Link href="/">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Idea"}
          </Button>
        </div>
      </form>
    </div>
  );
}
