import { NextResponse } from "next/server";
import { readAllFromStage, writeOne, generateId, getCurrentTimestamp } from "@/lib/storage";
import { CreateIdeaSchema, IdeaSchema } from "@/lib/schemas";
import type { Idea } from "@/lib/types";

// GET all ideas
export async function GET() {
  try {
    const ideas = await readAllFromStage<Idea>("ideas");

    // Sort by createdAt descending (newest first)
    ideas.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json(ideas);
  } catch (error) {
    console.error("Error fetching ideas:", error);
    return NextResponse.json(
      { error: "Failed to fetch ideas" },
      { status: 500 }
    );
  }
}

// POST new idea
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = CreateIdeaSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const input = validationResult.data;
    const now = getCurrentTimestamp();
    const id = generateId();

    // Create the full idea object
    const idea: Idea = {
      id,
      title: input.title,
      braindump: input.braindump,
      notes: input.notes,
      createdAt: now,
      updatedAt: now,
    };

    // Validate the full object
    const fullValidation = IdeaSchema.safeParse(idea);
    if (!fullValidation.success) {
      return NextResponse.json(
        { error: "Data validation failed", details: fullValidation.error.issues },
        { status: 500 }
      );
    }

    // Write to file
    const success = await writeOne("ideas", id, idea);
    if (!success) {
      return NextResponse.json(
        { error: "Failed to save idea" },
        { status: 500 }
      );
    }

    return NextResponse.json(idea, { status: 201 });
  } catch (error) {
    console.error("Error creating idea:", error);
    return NextResponse.json(
      { error: "Failed to create idea" },
      { status: 500 }
    );
  }
}
