import { DashboardContent } from "@/components/dashboard-content";
import type { Draft, ScheduledPost, PublishedPost } from "@/lib/types";

async function getData() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const [draftsRes, scheduledRes, publishedRes] = await Promise.all([
      fetch(`${baseUrl}/api/drafts`, { cache: "no-store" }),
      fetch(`${baseUrl}/api/scheduled`, { cache: "no-store" }),
      fetch(`${baseUrl}/api/published`, { cache: "no-store" }),
    ]);

    const drafts: Draft[] = draftsRes.ok ? await draftsRes.json() : [];
    const scheduled: ScheduledPost[] = scheduledRes.ok ? await scheduledRes.json() : [];
    const published: PublishedPost[] = publishedRes.ok ? await publishedRes.json() : [];

    return { drafts, scheduled, published };
  } catch (error) {
    console.error("Failed to fetch data:", error);
    return { drafts: [], scheduled: [], published: [] };
  }
}

export default async function PostsPage() {
  const { drafts, scheduled, published } = await getData();

  return (
    <DashboardContent
      drafts={drafts}
      scheduled={scheduled}
      published={published}
    />
  );
}
