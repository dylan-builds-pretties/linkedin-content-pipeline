import { NextResponse } from "next/server";
import { readOne, writeOne, deleteOne, getCurrentTimestamp } from "@/lib/storage";
import { UpdateDraftSchema, DraftSchema } from "@/lib/schemas";
import type { Draft } from "@/lib/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET single draft by id
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const draft = await readOne<Draft>("drafts", id);

    if (!draft) {
      return NextResponse.json(
        { error: "Draft not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(draft);
  } catch (error) {
    console.error("Error fetching draft:", error);
    return NextResponse.json(
      { error: "Failed to fetch draft" },
      { status: 500 }
    );
  }
}

// PUT update draft
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Read existing draft
    const existing = await readOne<Draft>("drafts", id);
    if (!existing) {
      return NextResponse.json(
        { error: "Draft not found" },
        { status: 404 }
      );
    }

    // Validate input
    const validationResult = UpdateDraftSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const input = validationResult.data;

    // Merge with existing data
    const updated: Draft = {
      ...existing,
      ...input,
      // Recalculate character count if content was updated
      characterCount: input.content ? input.content.length : existing.characterCount,
      updatedAt: getCurrentTimestamp(),
    };

    // Validate the full object
    const fullValidation = DraftSchema.safeParse(updated);
    if (!fullValidation.success) {
      return NextResponse.json(
        { error: "Data validation failed", details: fullValidation.error.issues },
        { status: 500 }
      );
    }

    // Write to file
    const success = await writeOne("drafts", id, updated);
    if (!success) {
      return NextResponse.json(
        { error: "Failed to update draft" },
        { status: 500 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating draft:", error);
    return NextResponse.json(
      { error: "Failed to update draft" },
      { status: 500 }
    );
  }
}

// PATCH update draft (partial update)
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Read existing draft
    const existing = await readOne<Draft>("drafts", id);
    if (!existing) {
      return NextResponse.json(
        { error: "Draft not found" },
        { status: 404 }
      );
    }

    // Merge with existing data
    const updated: Draft = {
      ...existing,
      ...body,
      characterCount: body.content ? body.content.length : existing.characterCount,
      updatedAt: getCurrentTimestamp(),
    };

    // Write to file
    const success = await writeOne("drafts", id, updated);
    if (!success) {
      return NextResponse.json(
        { error: "Failed to update draft" },
        { status: 500 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating draft:", error);
    return NextResponse.json(
      { error: "Failed to update draft" },
      { status: 500 }
    );
  }
}

// DELETE draft
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    const success = await deleteOne("drafts", id);
    if (!success) {
      return NextResponse.json(
        { error: "Draft not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Draft deleted successfully" });
  } catch (error) {
    console.error("Error deleting draft:", error);
    return NextResponse.json(
      { error: "Failed to delete draft" },
      { status: 500 }
    );
  }
}
