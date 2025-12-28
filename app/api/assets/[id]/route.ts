import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { readOne, writeOne, deleteOne, getCurrentTimestamp } from "@/lib/storage";
import type { ContentAsset } from "@/lib/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET single asset
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const asset = await readOne<ContentAsset>("assets", id);

    if (!asset) {
      return NextResponse.json(
        { error: "Asset not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(asset);
  } catch (error) {
    console.error("Error fetching asset:", error);
    return NextResponse.json(
      { error: "Failed to fetch asset" },
      { status: 500 }
    );
  }
}

// PATCH update asset metadata
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const asset = await readOne<ContentAsset>("assets", id);

    if (!asset) {
      return NextResponse.json(
        { error: "Asset not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const updatedAsset: ContentAsset = {
      ...asset,
      name: body.name ?? asset.name,
      description: body.description ?? asset.description,
      tags: body.tags ?? asset.tags,
      updatedAt: getCurrentTimestamp(),
    };

    const success = await writeOne("assets", id, updatedAsset);
    if (!success) {
      return NextResponse.json(
        { error: "Failed to update asset" },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedAsset);
  } catch (error) {
    console.error("Error updating asset:", error);
    return NextResponse.json(
      { error: "Failed to update asset" },
      { status: 500 }
    );
  }
}

// DELETE asset
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const asset = await readOne<ContentAsset>("assets", id);

    if (!asset) {
      return NextResponse.json(
        { error: "Asset not found" },
        { status: 404 }
      );
    }

    // Delete the actual file
    const filePath = path.join(process.cwd(), "public", asset.filePath);
    await fs.unlink(filePath).catch(() => {
      console.warn(`Could not delete file: ${filePath}`);
    });

    // Delete the metadata
    const success = await deleteOne("assets", id);
    if (!success) {
      return NextResponse.json(
        { error: "Failed to delete asset metadata" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting asset:", error);
    return NextResponse.json(
      { error: "Failed to delete asset" },
      { status: 500 }
    );
  }
}
