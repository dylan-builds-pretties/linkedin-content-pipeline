import { NextResponse } from "next/server";
import { readAllFromStage } from "@/lib/storage";
import type { PublishedPost } from "@/lib/types";

// GET all published posts
export async function GET() {
  try {
    const published = await readAllFromStage<PublishedPost>("published");

    // Sort by publishedAt descending (most recent first)
    published.sort((a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    return NextResponse.json(published);
  } catch (error) {
    console.error("Error fetching published posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch published posts" },
      { status: 500 }
    );
  }
}
