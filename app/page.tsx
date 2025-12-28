import { DashboardContent } from "@/components/dashboard-content";
import type { Post } from "@/lib/types";

export const dynamic = "force-dynamic";

async function getData() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/posts`, { cache: "no-store" });
    const posts: Post[] = res.ok ? await res.json() : [];
    return { posts };
  } catch (error) {
    console.error("Failed to fetch data:", error);
    return { posts: [] };
  }
}

export default async function PostsPage() {
  const { posts } = await getData();

  return <DashboardContent posts={posts} />;
}
