import { NextResponse } from "next/server";
import { readAllFromStage } from "@/lib/storage";
import type { ScheduledPost } from "@/lib/types";

// GET all scheduled posts
export async function GET() {
  try {
    const scheduled = await readAllFromStage<ScheduledPost>("scheduled");

    // Sort by scheduledDate and scheduledTime ascending (earliest first)
    scheduled.sort((a, b) => {
      const dateA = new Date(`${a.scheduledDate}T${a.scheduledTime}`);
      const dateB = new Date(`${b.scheduledDate}T${b.scheduledTime}`);
      return dateA.getTime() - dateB.getTime();
    });

    return NextResponse.json(scheduled);
  } catch (error) {
    console.error("Error fetching scheduled posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch scheduled posts" },
      { status: 500 }
    );
  }
}
