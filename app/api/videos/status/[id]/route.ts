import { NextRequest, NextResponse } from "next/server";
import { getStatus } from "@/lib/video-status-store";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const status = getStatus(id);

  if (!status) {
    return NextResponse.json(
      { error: "Generation not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(status);
}
