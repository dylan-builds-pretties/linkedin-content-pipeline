import { ContentGallery } from "@/components/content-generator/content-gallery";
import type { ContentAsset } from "@/lib/types";

export const dynamic = "force-dynamic";

async function getAssets() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/assets`, { cache: "no-store" });
    const assets: ContentAsset[] = res.ok ? await res.json() : [];
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
