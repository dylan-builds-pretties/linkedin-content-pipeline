"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Upload,
  Video,
  FileText,
  LayoutGrid,
  Images,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { UploadDialog } from "./upload-dialog";
import { VideoGeneratorDialog } from "./video-generator-dialog";
import type { ContentAsset } from "@/lib/types";

interface CreateContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadComplete: (asset: ContentAsset) => void;
}

type ContentTypeOption = {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  comingSoon?: boolean;
};

const contentTypes: ContentTypeOption[] = [
  {
    id: "upload",
    name: "Upload File",
    description: "Drag & drop or browse for images, videos, PDFs",
    icon: <Upload className="h-6 w-6" />,
  },
  {
    id: "screen-recording",
    name: "Screen Recording",
    description: "Record your screen to create tutorials or demos",
    icon: <Video className="h-6 w-6" />,
  },
  {
    id: "document",
    name: "Document",
    description: "Create text-based documents and articles",
    icon: <FileText className="h-6 w-6" />,
  },
  {
    id: "infographic",
    name: "Infographic",
    description: "Design visual data representations",
    icon: <LayoutGrid className="h-6 w-6" />,
    comingSoon: true,
  },
  {
    id: "carousel",
    name: "Carousel",
    description: "Create multi-slide visual content",
    icon: <Images className="h-6 w-6" />,
    comingSoon: true,
  },
  {
    id: "ai-image",
    name: "AI Image",
    description: "Generate images with AI",
    icon: <Sparkles className="h-6 w-6" />,
    comingSoon: true,
  },
];

export function CreateContentDialog({
  open,
  onOpenChange,
  onUploadComplete,
}: CreateContentDialogProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const handleClose = () => {
    setSelectedType(null);
    onOpenChange(false);
  };

  const handleBack = () => {
    setSelectedType(null);
  };

  const handleSelectType = (typeId: string) => {
    const type = contentTypes.find((t) => t.id === typeId);
    if (type?.comingSoon) return;
    setSelectedType(typeId);
  };

  const handleUploadComplete = (asset: ContentAsset) => {
    onUploadComplete(asset);
    setSelectedType(null);
  };

  // If upload is selected, show upload form inline
  if (selectedType === "upload") {
    return (
      <UploadDialog
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setSelectedType(null);
          }
          onOpenChange(isOpen);
        }}
        onUploadComplete={handleUploadComplete}
        onBack={handleBack}
        showBackButton
      />
    );
  }

  // If screen recording is selected
  if (selectedType === "screen-recording") {
    return (
      <VideoGeneratorDialog
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setSelectedType(null);
          }
          onOpenChange(isOpen);
        }}
        onComplete={handleUploadComplete}
        onBack={handleBack}
      />
    );
  }

  // If document is selected
  if (selectedType === "document") {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleBack}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <DialogTitle>Create Document</DialogTitle>
            </div>
            <DialogDescription>
              Create text-based documents and articles for your content.
            </DialogDescription>
          </DialogHeader>
          <div className="py-8 text-center text-muted-foreground">
            <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p className="text-sm">Document creation functionality coming soon.</p>
            <p className="text-xs mt-2">
              For now, you can upload PDFs or HTML files.
            </p>
            <Button className="mt-4" variant="outline" onClick={handleBack}>
              Go Back
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Default: show content type selection
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Create Content</DialogTitle>
          <DialogDescription>
            Choose how you want to create your content
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 py-4">
          {contentTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => handleSelectType(type.id)}
              disabled={type.comingSoon}
              className={`relative flex flex-col items-start gap-2 rounded-lg border p-4 text-left transition-all ${
                type.comingSoon
                  ? "cursor-not-allowed opacity-50 bg-muted/30"
                  : "hover:border-primary hover:bg-accent cursor-pointer"
              }`}
            >
              {type.comingSoon && (
                <span className="absolute top-2 right-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                  Soon
                </span>
              )}
              <div
                className={`rounded-md p-2 ${
                  type.comingSoon
                    ? "bg-muted text-muted-foreground"
                    : "bg-primary/10 text-primary"
                }`}
              >
                {type.icon}
              </div>
              <div>
                <p className="font-medium text-sm">{type.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {type.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
