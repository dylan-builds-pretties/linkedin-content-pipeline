// Simplified stage type - only two folders now
export type Stage = "ideas" | "posts";

// Post status replaces the old stage-based workflow
export type PostStatus = "draft" | "ready_for_review" | "scheduled" | "published";

export interface Idea {
  id: string;
  title: string;
  braindump: string; // Raw input text - required to create an idea
  notes: string; // Rich text field (Markdown)
  createdAt: string;
  updatedAt: string;
}

// Unified Post type - combines Draft, ScheduledPost, and PublishedPost
export interface Post {
  id: string;
  sourceIdea: string;
  title?: string;
  content: string;
  version: number;
  characterCount: number;
  author: string;
  status: PostStatus;

  // Scheduling fields (used when status is "scheduled" or later)
  scheduledDate?: string;
  scheduledTime?: string;
  timezone?: string;
  reviewedBy?: string;

  // Publishing fields (used when status is "published")
  publishedAt?: string;
  linkedinUrl?: string;
  metrics?: {
    likes: number;
    comments: number;
    shares: number;
    impressions: number;
  };

  createdAt: string;
  updatedAt: string;
}

export type ContentItem = Idea | Post;

export interface PipelineStats {
  ideas: number;
  drafts: number;
  draftsReadyForReview: number;
  scheduled: number;
  published: number;
}
