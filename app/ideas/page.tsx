import { IdeasGallery } from "@/components/ideas/ideas-gallery";
import { readAllFromStage } from "@/lib/storage";
import type { Idea } from "@/lib/types";

export const dynamic = "force-dynamic";

async function getIdeas() {
  try {
    const ideas = await readAllFromStage<Idea>("ideas");
    // Sort by createdAt descending (newest first)
    ideas.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
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
