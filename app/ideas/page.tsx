import { IdeasGallery } from "@/components/ideas/ideas-gallery";
import type { Idea } from "@/lib/types";

async function getIdeas() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/ideas`, { cache: "no-store" });
    const ideas: Idea[] = res.ok ? await res.json() : [];
    return ideas;
  } catch (error) {
    console.error("Failed to fetch ideas:", error);
    return [];
  }
}

export default async function IdeasPage() {
  const ideas = await getIdeas();

  return <IdeasGallery initialIdeas={ideas} />;
}
