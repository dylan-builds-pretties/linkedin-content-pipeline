import { z } from "zod";

// Status enum for scheduled posts
export const StatusEnum = z.enum(["pending", "approved", "rejected"]);

// Status enum for drafts
export const DraftStatusEnum = z.enum(["draft", "ready_for_review"]);

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

// Draft schema
export const DraftSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  content: z.string(),
  notes: z.string(),
  sourceIdea: z.string(),
  version: z.number(),
  characterCount: z.number(),
  author: z.string(),
  status: DraftStatusEnum,
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Scheduled post schema
export const ScheduledPostSchema = z.object({
  id: z.string(),
  draftId: z.string(),
  title: z.string().optional(),
  content: z.string(),
  scheduledDate: z.string(),
  scheduledTime: z.string(),
  timezone: z.string(),
  reviewedBy: z.string(),
  status: StatusEnum,
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Published post schema
export const PublishedPostSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  content: z.string(),
  publishedAt: z.string(),
  linkedinUrl: z.string().optional(),
  metrics: MetricsSchema.optional(),
  createdAt: z.string(),
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

// Schema for creating a new draft
export const CreateDraftSchema = z.object({
  title: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  notes: z.string().default(""),
  sourceIdea: z.string(),
  version: z.number().default(1),
  author: z.string().min(1, "Author is required"),
  status: DraftStatusEnum.default("draft"),
});

// Schema for updating a draft
export const UpdateDraftSchema = z.object({
  title: z.string().optional(),
  content: z.string().min(1).optional(),
  notes: z.string().optional(),
  sourceIdea: z.string().optional(),
  version: z.number().optional(),
  author: z.string().min(1).optional(),
  status: DraftStatusEnum.optional(),
});

// Schema for scheduling a draft
export const ScheduleDraftSchema = z.object({
  scheduledDate: z.string().min(1, "Scheduled date is required"),
  scheduledTime: z.string().min(1, "Scheduled time is required"),
  timezone: z.string().default("UTC"),
  reviewedBy: z.string().default(""),
  status: StatusEnum.default("pending"),
});

// Schema for updating a scheduled post
export const UpdateScheduledPostSchema = z.object({
  scheduledDate: z.string().optional(),
  scheduledTime: z.string().optional(),
  timezone: z.string().optional(),
  reviewedBy: z.string().optional(),
  status: StatusEnum.optional(),
  title: z.string().optional(),
  content: z.string().optional(),
});

// Schema for publishing a scheduled post
export const PublishPostSchema = z.object({
  linkedinUrl: z.string().url().optional(),
  metrics: MetricsSchema.optional(),
});

// Type exports inferred from schemas
export type IdeaInput = z.infer<typeof IdeaSchema>;
export type DraftInput = z.infer<typeof DraftSchema>;
export type ScheduledPostInput = z.infer<typeof ScheduledPostSchema>;
export type PublishedPostInput = z.infer<typeof PublishedPostSchema>;
export type CreateIdeaInput = z.infer<typeof CreateIdeaSchema>;
export type UpdateIdeaInput = z.infer<typeof UpdateIdeaSchema>;
export type CreateDraftInput = z.infer<typeof CreateDraftSchema>;
export type UpdateDraftInput = z.infer<typeof UpdateDraftSchema>;
export type ScheduleDraftInput = z.infer<typeof ScheduleDraftSchema>;
export type UpdateScheduledPostInput = z.infer<typeof UpdateScheduledPostSchema>;
export type PublishPostInput = z.infer<typeof PublishPostSchema>;
