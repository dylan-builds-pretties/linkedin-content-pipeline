import { ContentGallery } from "@/components/content-generator/content-gallery";
import { readAllFromStage } from "@/lib/storage";
import type { ContentAsset } from "@/lib/types";

export const dynamic = "force-dynamic";

async function getAssets() {
  try {
    const assets = await readAllFromStage<ContentAsset>("assets");
    // Sort by createdAt descending (newest first)
    assets.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return assets;
  } catch (error) {
    console.error("Failed to fetch assets:", error);
    return [];
  }
}

export default async function ContentGeneratorPage() {
  const assets = await getAssets();

  return <ContentGallery initialAssets={assets} />;
}
