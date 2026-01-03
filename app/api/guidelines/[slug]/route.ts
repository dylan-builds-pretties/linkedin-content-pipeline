import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const SLUG_TO_FILE: Record<string, string> = {
  "brand-voice": "01-brand-voice.md",
  "content-pillars": "02-content-pillars.md",
  "decision-rules": "03-decision-rules.md",
  "cadence-system": "04-cadence-system.md",
  "post-formats": "06-post-formats.md",
};

const GUIDELINES_DIR = path.join(process.cwd(), "content", "guidelines");

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const filename = SLUG_TO_FILE[slug];

  if (!filename) {
    return NextResponse.json(
      { error: "Invalid guideline slug" },
      { status: 404 }
    );
  }

  try {
    const filePath = path.join(GUIDELINES_DIR, filename);
    const content = fs.readFileSync(filePath, "utf-8");
    return NextResponse.json({ content, slug, filename });
  } catch (error) {
    console.error(`Error reading guideline ${slug}:`, error);
    return NextResponse.json(
      { error: "Failed to read guideline" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const filename = SLUG_TO_FILE[slug];

  if (!filename) {
    return NextResponse.json(
      { error: "Invalid guideline slug" },
      { status: 404 }
    );
  }

  try {
    const body = await request.json();
    const { content } = body;

    if (typeof content !== "string") {
      return NextResponse.json(
        { error: "Content must be a string" },
        { status: 400 }
      );
    }

    const filePath = path.join(GUIDELINES_DIR, filename);
    fs.writeFileSync(filePath, content, "utf-8");

    return NextResponse.json({ success: true, slug, filename });
  } catch (error) {
    console.error(`Error writing guideline ${slug}:`, error);
    return NextResponse.json(
      { error: "Failed to save guideline" },
      { status: 500 }
    );
  }
}
