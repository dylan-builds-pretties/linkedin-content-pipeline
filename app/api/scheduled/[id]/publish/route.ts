import { NextResponse } from "next/server";
import { readOne, moveToStage, generateId, getCurrentTimestamp } from "@/lib/storage";
import { PublishPostSchema, PublishedPostSchema } from "@/lib/schemas";
import type { ScheduledPost, PublishedPost } from "@/lib/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST publish a scheduled post (move to published stage)
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Read existing scheduled post
    const scheduled = await readOne<ScheduledPost>("scheduled", id);
    if (!scheduled) {
      return NextResponse.json(
        { error: "Scheduled post not found" },
        { status: 404 }
      );
    }

    // Check if post is approved
    if (scheduled.status !== "approved") {
      return NextResponse.json(
        { error: "Post must be approved before publishing" },
        { status: 400 }
      );
    }

    // Validate publish input (optional fields)
    const validationResult = PublishPostSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const publishInput = validationResult.data;
    const now = getCurrentTimestamp();
    const publishedId = generateId();

    // Create the published post object
    const publishedPost: PublishedPost = {
      id: publishedId,
      title: scheduled.title,
      content: scheduled.content,
      publishedAt: now,
      linkedinUrl: publishInput.linkedinUrl,
      metrics: publishInput.metrics,
      createdAt: now,
    };

    // Validate the full published post object
    const fullValidation = PublishedPostSchema.safeParse(publishedPost);
    if (!fullValidation.success) {
      return NextResponse.json(
        { error: "Data validation failed", details: fullValidation.error.issues },
        { status: 500 }
      );
    }

    // Move from scheduled to published
    const result = await moveToStage<ScheduledPost, PublishedPost>(
      "scheduled",
      "published",
      id,
      publishedPost
    );

    if (!result) {
      return NextResponse.json(
        { error: "Failed to publish post" },
        { status: 500 }
      );
    }

    return NextResponse.json(publishedPost, { status: 201 });
  } catch (error) {
    console.error("Error publishing post:", error);
    return NextResponse.json(
      { error: "Failed to publish post" },
      { status: 500 }
    );
  }
}
