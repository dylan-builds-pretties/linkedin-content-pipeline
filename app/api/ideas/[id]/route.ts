import { NextResponse } from "next/server";
import { readOne, writeOne, deleteOne, getCurrentTimestamp } from "@/lib/storage";
import { UpdateIdeaSchema, IdeaSchema } from "@/lib/schemas";
import type { Idea } from "@/lib/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET single idea by id
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const idea = await readOne<Idea>("ideas", id);

    if (!idea) {
      return NextResponse.json(
        { error: "Idea not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(idea);
  } catch (error) {
    console.error("Error fetching idea:", error);
    return NextResponse.json(
      { error: "Failed to fetch idea" },
      { status: 500 }
    );
  }
}

// PUT update idea
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Read existing idea
    const existing = await readOne<Idea>("ideas", id);
    if (!existing) {
      return NextResponse.json(
        { error: "Idea not found" },
        { status: 404 }
      );
    }

    // Validate input
    const validationResult = UpdateIdeaSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const input = validationResult.data;

    // Merge with existing data
    const updated: Idea = {
      ...existing,
      ...input,
      updatedAt: getCurrentTimestamp(),
    };

    // Validate the full object
    const fullValidation = IdeaSchema.safeParse(updated);
    if (!fullValidation.success) {
      return NextResponse.json(
        { error: "Data validation failed", details: fullValidation.error.issues },
        { status: 500 }
      );
    }

    // Write to file
    const success = await writeOne("ideas", id, updated);
    if (!success) {
      return NextResponse.json(
        { error: "Failed to update idea" },
        { status: 500 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating idea:", error);
    return NextResponse.json(
      { error: "Failed to update idea" },
      { status: 500 }
    );
  }
}

// PATCH update idea (alias for PUT)
export const PATCH = PUT;

// DELETE idea
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    const success = await deleteOne("ideas", id);
    if (!success) {
      return NextResponse.json(
        { error: "Idea not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Idea deleted successfully" });
  } catch (error) {
    console.error("Error deleting idea:", error);
    return NextResponse.json(
      { error: "Failed to delete idea" },
      { status: 500 }
    );
  }
}
