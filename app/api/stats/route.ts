import { NextResponse } from "next/server";
import { getPipelineStats } from "@/lib/storage";
import type { PipelineStats } from "@/lib/types";

// GET pipeline statistics
export async function GET() {
  try {
    const stageCounts = await getPipelineStats();

    const stats: PipelineStats = {
      ideas: stageCounts.ideas,
      drafts: stageCounts.drafts,
      draftsReadyForReview: 0, // TODO: Calculate from drafts with status
      scheduled: stageCounts.scheduled,
      published: stageCounts.published,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching pipeline stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch pipeline stats" },
      { status: 500 }
    );
  }
}
