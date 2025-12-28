import { NextResponse } from "next/server";
import { query } from "@anthropic-ai/claude-agent-sdk";

export async function POST(request: Request) {
  try {
    const { themeId } = await request.json();

    if (!themeId) {
      return NextResponse.json(
        { error: "themeId is required" },
        { status: 400 }
      );
    }

    for await (const message of query({
      prompt: `Read the theme file at content/02-themes/${themeId}.json.

               Create 2-3 LinkedIn post draft files in content/03-drafts/ following these guidelines:
               - Under 1300 characters (LinkedIn limit for full display)
               - Short paragraphs (1-2 sentences max)
               - Strong hook that stops the scroll
               - End with a question or call to action
               - Conversational, not corporate
               - Include line breaks for readability

               Name files: YYYY-MM-DD-topic-v1.json, v2.json, etc.
               Use the existing draft format (see content/03-drafts/_example.json if it exists).

               Each draft should have:
               - id: unique identifier
               - title: descriptive title
               - content: the LinkedIn post content
               - themeId: reference to the source theme
               - version: draft version number
               - characterCount: length of content
               - tags: relevant tags
               - author: "ai-generated"
               - notes: any internal notes
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
          themeId,
        });
      }
    }

    return NextResponse.json({
      success: true,
      themeId,
    });
  } catch (error) {
    console.error("Error generating drafts:", error);
    return NextResponse.json(
      { error: "Failed to generate drafts", details: String(error) },
      { status: 500 }
    );
  }
}
