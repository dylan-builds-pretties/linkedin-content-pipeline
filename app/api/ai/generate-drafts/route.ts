import { NextResponse } from "next/server";
import { query } from "@anthropic-ai/claude-agent-sdk";

export async function POST(request: Request) {
  try {
    const { ideaId } = await request.json();

    if (!ideaId) {
      return NextResponse.json(
        { error: "ideaId is required" },
        { status: 400 }
      );
    }

    for await (const message of query({
      prompt: `Read the idea file at content/ideas/${ideaId}.json.

               Create 2-3 LinkedIn post files in content/posts/ following these guidelines:
               - Under 1300 characters (LinkedIn limit for full display)
               - Short paragraphs (1-2 sentences max)
               - Strong hook that stops the scroll
               - End with a question or call to action
               - Conversational, not corporate
               - Include line breaks for readability

               Use the Post schema format (see content/posts/_example.json if it exists).

               Each post should have:
               - id: unique identifier (use timestamp-random format like "abc123-xyz789")
               - sourceIdea: "${ideaId}"
               - title: descriptive title (optional)
               - content: the LinkedIn post content
               - version: 1
               - characterCount: length of content
               - author: "ai-generated"
               - status: "draft"
               - createdAt/updatedAt: ISO timestamps`,
      options: {
        allowedTools: ["Read", "Write", "Glob"],
        cwd: process.cwd(),
      },
    })) {
      if (message.type === "result") {
        return NextResponse.json({
          success: true,
          cost: message.total_cost_usd,
          ideaId,
        });
      }
    }

    return NextResponse.json({
      success: true,
      ideaId,
    });
  } catch (error) {
    console.error("Error generating posts:", error);
    return NextResponse.json(
      { error: "Failed to generate posts", details: String(error) },
      { status: 500 }
    );
  }
}
