import { z } from "zod";

// Post status enum - replaces old stage-based workflow
export const PostStatusEnum = z.enum(["draft", "ready_for_review", "scheduled", "published"]);

// Metrics schema for published posts
export const MetricsSchema = z.object({
  likes: z.number(),
  comments: z.number(),
  shares: z.number(),
  impressions: z.number(),
});

// Idea schema
export const IdeaSchema = z.object({
  id: z.string(),
  title: z.string(),
  braindump: z.string(), // Raw input text - required
  notes: z.string(), // Rich text field (Markdown)
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Unified Post schema - combines Draft, ScheduledPost, and PublishedPost
export const PostSchema = z.object({
  id: z.string(),
  sourceIdea: z.string(),
  title: z.string().optional(),
  content: z.string(),
  version: z.number(),
  characterCount: z.number(),
  author: z.string(),
  status: PostStatusEnum,

  // Scheduling fields (optional, used when status is "scheduled" or later)
  scheduledDate: z.string().optional(),
  scheduledTime: z.string().optional(),
  timezone: z.string().optional(),
  reviewedBy: z.string().optional(),

  // Publishing fields (optional, used when status is "published")
  publishedAt: z.string().optional(),
  linkedinUrl: z.string().optional(),
  metrics: MetricsSchema.optional(),

  createdAt: z.string(),
  updatedAt: z.string(),
});

// Schema for creating a new idea (braindump is required input)
export const CreateIdeaSchema = z.object({
  title: z.string().min(1, "Title is required"),
  braindump: z.string().min(1, "Braindump content is required"),
  notes: z.string().default(""), // Rich text field (Markdown)
});

// Schema for updating an idea
export const UpdateIdeaSchema = z.object({
  title: z.string().optional(),
  braindump: z.string().optional(),
  notes: z.string().optional(), // Rich text field (Markdown)
});

// Schema for creating a new post
export const CreatePostSchema = z.object({
  title: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  sourceIdea: z.string(),
  version: z.number().default(1),
  author: z.string().min(1, "Author is required"),
  status: PostStatusEnum.default("draft"),
});

// Schema for updating a post (supports status transitions)
export const UpdatePostSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
  version: z.number().optional(),
  author: z.string().optional(),
  status: PostStatusEnum.optional(),

  // Scheduling fields
  scheduledDate: z.string().optional(),
  scheduledTime: z.string().optional(),
  timezone: z.string().optional(),
  reviewedBy: z.string().optional(),

  // Publishing fields
  publishedAt: z.string().optional(),
  linkedinUrl: z.string().optional(),
  metrics: MetricsSchema.optional(),
});

// Type exports inferred from schemas
export type IdeaInput = z.infer<typeof IdeaSchema>;
export type PostInput = z.infer<typeof PostSchema>;
export type CreateIdeaInput = z.infer<typeof CreateIdeaSchema>;
export type UpdateIdeaInput = z.infer<typeof UpdateIdeaSchema>;
export type CreatePostInput = z.infer<typeof CreatePostSchema>;
export type UpdatePostInput = z.infer<typeof UpdatePostSchema>;
