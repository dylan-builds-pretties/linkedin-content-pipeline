import { NextResponse } from "next/server";
import { readOne, writeOne, deleteOne, getCurrentTimestamp } from "@/lib/storage";
import { UpdateScheduledPostSchema, ScheduledPostSchema } from "@/lib/schemas";
import type { ScheduledPost } from "@/lib/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET single scheduled post by id
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const scheduled = await readOne<ScheduledPost>("scheduled", id);

    if (!scheduled) {
      return NextResponse.json(
        { error: "Scheduled post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(scheduled);
  } catch (error) {
    console.error("Error fetching scheduled post:", error);
    return NextResponse.json(
      { error: "Failed to fetch scheduled post" },
      { status: 500 }
    );
  }
}

// PUT update scheduled post
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Read existing scheduled post
    const existing = await readOne<ScheduledPost>("scheduled", id);
    if (!existing) {
      return NextResponse.json(
        { error: "Scheduled post not found" },
        { status: 404 }
      );
    }

    // Validate input
    const validationResult = UpdateScheduledPostSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const input = validationResult.data;

    // Merge with existing data
    const updated: ScheduledPost = {
      ...existing,
      ...input,
      updatedAt: getCurrentTimestamp(),
    };

    // Validate the full object
    const fullValidation = ScheduledPostSchema.safeParse(updated);
    if (!fullValidation.success) {
      return NextResponse.json(
        { error: "Data validation failed", details: fullValidation.error.issues },
        { status: 500 }
      );
    }

    // Write to file
    const success = await writeOne("scheduled", id, updated);
    if (!success) {
      return NextResponse.json(
        { error: "Failed to update scheduled post" },
        { status: 500 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating scheduled post:", error);
    return NextResponse.json(
      { error: "Failed to update scheduled post" },
      { status: 500 }
    );
  }
}

// DELETE scheduled post
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    const success = await deleteOne("scheduled", id);
    if (!success) {
      return NextResponse.json(
        { error: "Scheduled post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Scheduled post deleted successfully" });
  } catch (error) {
    console.error("Error deleting scheduled post:", error);
    return NextResponse.json(
      { error: "Failed to delete scheduled post" },
      { status: 500 }
    );
  }
}
