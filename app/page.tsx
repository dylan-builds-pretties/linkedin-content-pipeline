import { DashboardContent } from "@/components/dashboard-content";
import { readAllFromStage } from "@/lib/storage";
import type { Post } from "@/lib/types";

export const dynamic = "force-dynamic";

async function getData() {
  try {
    const posts = await readAllFromStage<Post>("posts");
    // Sort by createdAt descending (newest first)
    posts.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
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
