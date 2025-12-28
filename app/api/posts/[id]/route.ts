import { NextResponse } from "next/server";
import { readOne, writeOne, deleteOne, getCurrentTimestamp } from "@/lib/storage";
import { UpdatePostSchema, PostSchema } from "@/lib/schemas";
import type { Post } from "@/lib/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET single post by id
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const post = await readOne<Post>("posts", id);

    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 }
    );
  }
}

// PUT update post (including status transitions)
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Read existing post
    const existing = await readOne<Post>("posts", id);
    if (!existing) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    // Validate input
    const validationResult = UpdatePostSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const input = validationResult.data;
    const now = getCurrentTimestamp();

    // Handle status transitions with automatic field population
    let additionalFields: Partial<Post> = {};
    if (input.status === "published" && existing.status !== "published") {
      additionalFields.publishedAt = now;
    }

    // Merge with existing data
    const updated: Post = {
      ...existing,
      ...input,
      ...additionalFields,
      // Recalculate character count if content was updated
      characterCount: input.content ? input.content.length : existing.characterCount,
      updatedAt: now,
    };

    // Validate the full object
    const fullValidation = PostSchema.safeParse(updated);
    if (!fullValidation.success) {
      return NextResponse.json(
        { error: "Data validation failed", details: fullValidation.error.issues },
        { status: 500 }
      );
    }

    // Write to file
    const success = await writeOne("posts", id, updated);
    if (!success) {
      return NextResponse.json(
        { error: "Failed to update post" },
        { status: 500 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating post:", error);
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 }
    );
  }
}

// PATCH update post (partial update)
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Read existing post
    const existing = await readOne<Post>("posts", id);
    if (!existing) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    const now = getCurrentTimestamp();

    // Handle status transitions with automatic field population
    let additionalFields: Partial<Post> = {};
    if (body.status === "published" && existing.status !== "published") {
      additionalFields.publishedAt = now;
    }

    // Merge with existing data
    const updated: Post = {
      ...existing,
      ...body,
      ...additionalFields,
      characterCount: body.content ? body.content.length : existing.characterCount,
      updatedAt: now,
    };

    // Write to file
    const success = await writeOne("posts", id, updated);
    if (!success) {
      return NextResponse.json(
        { error: "Failed to update post" },
        { status: 500 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating post:", error);
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 }
    );
  }
}

// DELETE post
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    const success = await deleteOne("posts", id);
    if (!success) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}
