"use client";

import { useState } from "react";
import { LinkedInPostCard, type FeedPost } from "./linkedin-post-card";
import { FeedFilters, type FilterType } from "./feed-filters";
import type { Draft, ScheduledPost, PublishedPost } from "@/lib/types";

interface FeedViewProps {
  drafts: Draft[];
  scheduled: ScheduledPost[];
  published: PublishedPost[];
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

function getSortDate(post: FeedPost): Date {
  if (post._type === "published" && "publishedAt" in post) {
    return new Date(post.publishedAt);
  }
  if (post._type === "scheduled") {
    return new Date(`${post.scheduledDate}T${post.scheduledTime}`);
  }
  return new Date(post.createdAt);
}

function groupPostsByDate(posts: FeedPost[]): Map<string, FeedPost[]> {
  const groups = new Map<string, FeedPost[]>();

  // Sort by date descending
  const sorted = [...posts].sort((a, b) => getSortDate(b).getTime() - getSortDate(a).getTime());

  for (const post of sorted) {
    const dateKey = getDateKey(
      post._type === "published" && "publishedAt" in post
        ? post.publishedAt
        : post._type === "scheduled"
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

function getPostFilterType(post: FeedPost): FilterType {
  if (post._type === "draft") {
    return post.status === "ready_for_review" ? "ready_for_review" : "draft";
  }
  return post._type;
}

export function FeedView({ drafts, scheduled, published }: FeedViewProps) {
  const [activeFilters, setActiveFilters] = useState<FilterType[]>([
    "draft",
    "ready_for_review",
    "scheduled",
    "published",
  ]);

  // Convert to FeedPost type with discriminator
  const allPosts: FeedPost[] = [
    ...drafts.map((d) => ({ ...d, _type: "draft" as const })),
    ...scheduled.map((s) => ({ ...s, _type: "scheduled" as const })),
    ...published.map((p) => ({ ...p, _type: "published" as const })),
  ];

  // Filter posts based on active filters
  const filteredPosts = allPosts.filter((post) => {
    const filterType = getPostFilterType(post);
    return activeFilters.includes(filterType);
  });

  const groupedPosts = groupPostsByDate(filteredPosts);

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-8">
      {/* Filters */}
      <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-20 py-3">
        <FeedFilters activeFilters={activeFilters} onFilterChange={setActiveFilters} />
      </div>

      {filteredPosts.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          <p>No posts match your filters.</p>
        </div>
      ) : (
        Array.from(groupedPosts.entries()).map(([dateKey, posts]) => (
          <div key={dateKey}>
            {/* Date Header */}
            <div className="sticky top-14 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 py-2 mb-3">
              <h2 className="text-sm font-semibold text-muted-foreground">{dateKey}</h2>
            </div>

            {/* Posts for this date */}
            <div className="space-y-4">
              {posts.map((post) => (
                <LinkedInPostCard key={`${post._type}-${post.id}`} post={post} />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
