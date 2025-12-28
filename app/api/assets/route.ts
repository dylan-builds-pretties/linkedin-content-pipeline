import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { readAllFromStage, writeOne, generateId, getCurrentTimestamp } from "@/lib/storage";
import type { ContentAsset, ContentAssetType } from "@/lib/types";

// GET all assets
export async function GET() {
  try {
    const assets = await readAllFromStage<ContentAsset>("assets");

    // Sort by createdAt descending (newest first)
    assets.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json(assets);
  } catch (error) {
    console.error("Error fetching assets:", error);
    return NextResponse.json(
      { error: "Failed to fetch assets" },
      { status: 500 }
    );
  }
}

// Helper to determine asset type from mime type
function getAssetType(mimeType: string): ContentAssetType {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType === "text/html") return "html";
  if (mimeType === "application/pdf" || mimeType.includes("document")) return "document";
  return "image"; // default
}

// POST new asset (file upload)
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const name = formData.get("name") as string | null;
    const description = formData.get("description") as string | null;
    const tagsString = formData.get("tags") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    const id = generateId();
    const now = getCurrentTimestamp();
    const fileExtension = path.extname(file.name);
    const safeFileName = `${id}${fileExtension}`;

    // Save file to public/uploads
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    const filePath = path.join(uploadsDir, safeFileName);
    const arrayBuffer = await file.arrayBuffer();
    await fs.writeFile(filePath, Buffer.from(arrayBuffer));

    // Create asset metadata
    const asset: ContentAsset = {
      id,
      name: name || file.name,
      description: description || undefined,
      type: getAssetType(file.type),
      mimeType: file.type,
      fileName: file.name,
      filePath: `/uploads/${safeFileName}`,
      fileSize: file.size,
      tags: tagsString ? tagsString.split(",").map(t => t.trim()).filter(Boolean) : [],
      createdAt: now,
      updatedAt: now,
    };

    // Save metadata to content/assets
    const success = await writeOne("assets", id, asset);
    if (!success) {
      // Clean up uploaded file on failure
      await fs.unlink(filePath).catch(() => {});
      return NextResponse.json(
        { error: "Failed to save asset metadata" },
        { status: 500 }
      );
    }

    return NextResponse.json(asset, { status: 201 });
  } catch (error) {
    console.error("Error creating asset:", error);
    return NextResponse.json(
      { error: "Failed to create asset" },
      { status: 500 }
    );
  }
}
