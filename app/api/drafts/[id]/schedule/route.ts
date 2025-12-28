import { NextResponse } from "next/server";
import { readOne, moveToStage, generateId, getCurrentTimestamp } from "@/lib/storage";
import { ScheduleDraftSchema, ScheduledPostSchema } from "@/lib/schemas";
import type { Draft, ScheduledPost } from "@/lib/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST schedule a draft (move to scheduled stage)
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Read existing draft
    const draft = await readOne<Draft>("drafts", id);
    if (!draft) {
      return NextResponse.json(
        { error: "Draft not found" },
        { status: 404 }
      );
    }

    // Validate schedule input
    const validationResult = ScheduleDraftSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const scheduleInput = validationResult.data;
    const now = getCurrentTimestamp();
    const scheduledId = generateId();

    // Create the scheduled post object
    const scheduledPost: ScheduledPost = {
      id: scheduledId,
      draftId: draft.id,
      title: draft.title,
      content: draft.content,
      scheduledDate: scheduleInput.scheduledDate,
      scheduledTime: scheduleInput.scheduledTime,
      timezone: scheduleInput.timezone,
      reviewedBy: scheduleInput.reviewedBy,
      status: scheduleInput.status,
      createdAt: now,
      updatedAt: now,
    };

    // Validate the full scheduled post object
    const fullValidation = ScheduledPostSchema.safeParse(scheduledPost);
    if (!fullValidation.success) {
      return NextResponse.json(
        { error: "Data validation failed", details: fullValidation.error.issues },
        { status: 500 }
      );
    }

    // Move from drafts to scheduled
    const result = await moveToStage<Draft, ScheduledPost>(
      "drafts",
      "scheduled",
      id,
      scheduledPost
    );

    if (!result) {
      return NextResponse.json(
        { error: "Failed to schedule draft" },
        { status: 500 }
      );
    }

    return NextResponse.json(scheduledPost, { status: 201 });
  } catch (error) {
    console.error("Error scheduling draft:", error);
    return NextResponse.json(
      { error: "Failed to schedule draft" },
      { status: 500 }
    );
  }
}
