import { NextResponse } from "next/server";
import { readAllFromStage, readPostsByStatus, writeOne, generateId, getCurrentTimestamp } from "@/lib/storage";
import { CreatePostSchema, PostSchema } from "@/lib/schemas";
import type { Post, PostStatus } from "@/lib/types";

// GET all posts (with optional status filter)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as PostStatus | null;

    let posts: Post[];
    if (status) {
      posts = await readPostsByStatus(status);
    } else {
      posts = await readAllFromStage<Post>("posts");
    }

    // Sort by createdAt descending (newest first)
    posts.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

// POST new post
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = CreatePostSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const input = validationResult.data;
    const now = getCurrentTimestamp();
    const id = generateId();

    // Create the full post object
    const post: Post = {
      id,
      title: input.title,
      content: input.content,
      sourceIdea: input.sourceIdea,
      version: input.version,
      characterCount: input.content.length,
      author: input.author,
      status: input.status,
      createdAt: now,
      updatedAt: now,
    };

    // Validate the full object
    const fullValidation = PostSchema.safeParse(post);
    if (!fullValidation.success) {
      return NextResponse.json(
        { error: "Data validation failed", details: fullValidation.error.issues },
        { status: 500 }
      );
    }

    // Write to file
    const success = await writeOne("posts", id, post);
    if (!success) {
      return NextResponse.json(
        { error: "Failed to save post" },
        { status: 500 }
      );
    }

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}
