"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Image as ImageIcon,
  Video,
  FileText,
  Code,
  LayoutGrid,
  MoreVertical,
  Trash2,
  Download,
  Eye,
} from "lucide-react";
import type { ContentAsset, ContentAssetType } from "@/lib/types";

interface ContentAssetCardProps {
  asset: ContentAsset;
  onDelete: () => void;
}

const typeIcons: Record<ContentAssetType, React.ReactNode> = {
  image: <ImageIcon className="h-4 w-4" />,
  video: <Video className="h-4 w-4" />,
  document: <FileText className="h-4 w-4" />,
  html: <Code className="h-4 w-4" />,
  carousel: <LayoutGrid className="h-4 w-4" />,
};

const typeColors: Record<ContentAssetType, string> = {
  image: "bg-blue-100 text-blue-800",
  video: "bg-purple-100 text-purple-800",
  document: "bg-orange-100 text-orange-800",
  html: "bg-green-100 text-green-800",
  carousel: "bg-pink-100 text-pink-800",
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ContentAssetCard({ asset, onDelete }: ContentAssetCardProps) {
  const [imageError, setImageError] = useState(false);

  const isImage = asset.type === "image";
  const isVideo = asset.type === "video";

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = asset.filePath;
    link.download = asset.fileName;
    link.click();
  };

  const handlePreview = () => {
    window.open(asset.filePath, "_blank");
  };

  return (
    <Card className="group overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative aspect-square bg-muted">
        {isImage && !imageError ? (
          <Image
            src={asset.filePath}
            alt={asset.name}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
          />
        ) : isVideo ? (
          <video
            src={asset.filePath}
            className="w-full h-full object-cover"
            muted
            playsInline
            onMouseEnter={(e) => e.currentTarget.play()}
            onMouseLeave={(e) => {
              e.currentTarget.pause();
              e.currentTarget.currentTime = 0;
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-muted-foreground">
              {typeIcons[asset.type]}
            </div>
          </div>
        )}

        {/* Overlay with actions */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button size="icon" variant="secondary" onClick={handlePreview}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="secondary" onClick={handleDownload}>
            <Download className="h-4 w-4" />
          </Button>
        </div>

        {/* Type badge */}
        <Badge
          className={`absolute top-2 left-2 ${typeColors[asset.type]}`}
          variant="secondary"
        >
          {typeIcons[asset.type]}
          <span className="ml-1 capitalize">{asset.type}</span>
        </Badge>
      </div>

      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="font-medium text-sm truncate" title={asset.name}>
              {asset.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(asset.fileSize)}
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handlePreview}>
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {asset.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {asset.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {asset.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{asset.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
