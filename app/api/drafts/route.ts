import { NextResponse } from "next/server";
import { readAllFromStage, writeOne, generateId, getCurrentTimestamp } from "@/lib/storage";
import { CreateDraftSchema, DraftSchema } from "@/lib/schemas";
import type { Draft } from "@/lib/types";

// GET all drafts
export async function GET() {
  try {
    const drafts = await readAllFromStage<Draft>("drafts");

    // Sort by createdAt descending (newest first)
    drafts.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json(drafts);
  } catch (error) {
    console.error("Error fetching drafts:", error);
    return NextResponse.json(
      { error: "Failed to fetch drafts" },
      { status: 500 }
    );
  }
}

// POST new draft
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = CreateDraftSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const input = validationResult.data;
    const now = getCurrentTimestamp();
    const id = generateId();

    // Create the full draft object
    const draft: Draft = {
      id,
      title: input.title,
      content: input.content,
      notes: input.notes,
      sourceIdea: input.sourceIdea,
      version: input.version,
      characterCount: input.content.length,
      author: input.author,
      status: input.status,
      createdAt: now,
      updatedAt: now,
    };

    // Validate the full object
    const fullValidation = DraftSchema.safeParse(draft);
    if (!fullValidation.success) {
      return NextResponse.json(
        { error: "Data validation failed", details: fullValidation.error.issues },
        { status: 500 }
      );
    }

    // Write to file
    const success = await writeOne("drafts", id, draft);
    if (!success) {
      return NextResponse.json(
        { error: "Failed to save draft" },
        { status: 500 }
      );
    }

    return NextResponse.json(draft, { status: 201 });
  } catch (error) {
    console.error("Error creating draft:", error);
    return NextResponse.json(
      { error: "Failed to create draft" },
      { status: 500 }
    );
  }
}
