"use client";

import { useState } from "react";
import { ContentAssetCard } from "./content-asset-card";
import { CreateContentDialog } from "./create-content-dialog";
import { Button } from "@/components/ui/button";
import { Plus, FolderOpen } from "lucide-react";
import type { ContentAsset } from "@/lib/types";

interface ContentGalleryProps {
  initialAssets: ContentAsset[];
}

export function ContentGallery({ initialAssets }: ContentGalleryProps) {
  const [assets, setAssets] = useState<ContentAsset[]>(initialAssets);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const handleUploadComplete = (newAsset: ContentAsset) => {
    setAssets((prev) => [newAsset, ...prev]);
    setCreateDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/assets/${id}`, { method: "DELETE" });
      if (res.ok) {
        setAssets((prev) => prev.filter((a) => a.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete asset:", error);
    }
  };

  return (
    <div className="flex flex-1 flex-col min-h-0">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Content Generator</h1>
          <p className="text-sm text-muted-foreground">
            Upload and manage visual content for your LinkedIn posts
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Content
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {assets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
            <FolderOpen className="mb-4 h-12 w-12" />
            <p className="text-lg font-medium">No content yet</p>
            <p className="text-sm mt-1">
              Upload images, videos, carousels, or other visual content
            </p>
            <Button className="mt-4" onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Content
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {assets.map((asset) => (
              <ContentAssetCard
                key={asset.id}
                asset={asset}
                onDelete={() => handleDelete(asset.id)}
              />
            ))}
          </div>
        )}
      </div>

      <CreateContentDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onUploadComplete={handleUploadComplete}
      />
    </div>
  );
}
