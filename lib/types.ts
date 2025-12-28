export type Stage =
  | "ideas"
  | "drafts"
  | "scheduled"
  | "published";

export type DraftStatus = "draft" | "ready_for_review";

export interface Idea {
  id: string;
  title: string;
  braindump: string; // Raw input text - required to create an idea
  notes: string; // Rich text field (Markdown)
  createdAt: string;
  updatedAt: string;
}

export interface Draft {
  id: string;
  title?: string;
  content: string;
  notes: string;
  sourceIdea: string;
  version: number;
  characterCount: number;
  author: string;
  status: DraftStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduledPost {
  id: string;
  draftId: string;
  title?: string;
  content: string;
  scheduledDate: string;
  scheduledTime: string;
  timezone: string;
  reviewedBy: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
}

export interface PublishedPost {
  id: string;
  title?: string;
  content: string;
  publishedAt: string;
  linkedinUrl?: string;
  metrics?: {
    likes: number;
    comments: number;
    shares: number;
    impressions: number;
  };
  createdAt: string;
}

export type ContentItem =
  | Idea
  | Draft
  | ScheduledPost
  | PublishedPost;

export interface PipelineStats {
  ideas: number;
  drafts: number;
  draftsReadyForReview: number;
  scheduled: number;
  published: number;
}
