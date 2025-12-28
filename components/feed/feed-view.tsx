"use client";

import { LinkedInPostCard } from "./linkedin-post-card";
import type { Post } from "@/lib/types";

interface FeedViewProps {
  posts: Post[];
}

function getDateKey(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Reset time for comparison
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

  if (dateOnly.getTime() === todayOnly.getTime()) {
    return "Today";
  }
  if (dateOnly.getTime() === yesterdayOnly.getTime()) {
    return "Yesterday";
  }

  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function getSortDate(post: Post): Date {
  if (post.status === "published" && post.publishedAt) {
    return new Date(post.publishedAt);
  }
  if (post.status === "scheduled" && post.scheduledDate) {
    return new Date(`${post.scheduledDate}T${post.scheduledTime || "00:00"}`);
  }
  return new Date(post.createdAt);
}

function groupPostsByDate(posts: Post[]): Map<string, Post[]> {
  const groups = new Map<string, Post[]>();

  // Sort by date descending
  const sorted = [...posts].sort((a, b) => getSortDate(b).getTime() - getSortDate(a).getTime());

  for (const post of sorted) {
    const dateKey = getDateKey(
      post.status === "published" && post.publishedAt
        ? post.publishedAt
        : post.status === "scheduled" && post.scheduledDate
        ? post.scheduledDate
        : post.createdAt
    );

    if (!groups.has(dateKey)) {
      groups.set(dateKey, []);
    }
    groups.get(dateKey)!.push(post);
  }

  return groups;
}

export function FeedView({ posts }: FeedViewProps) {
  const groupedPosts = groupPostsByDate(posts);

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-8">
      {posts.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          <p>No posts match your filters.</p>
        </div>
      ) : (
        Array.from(groupedPosts.entries()).map(([dateKey, datePosts]) => (
          <div key={dateKey}>
            {/* Date Header */}
            <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 py-2 mb-3">
              <h2 className="text-sm font-semibold text-muted-foreground">{dateKey}</h2>
            </div>

            {/* Posts for this date */}
            <div className="space-y-4">
              {datePosts.map((post) => (
                <LinkedInPostCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
