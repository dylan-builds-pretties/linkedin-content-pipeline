import { NextResponse } from "next/server";
import { getPipelineStats } from "@/lib/storage";

// GET pipeline statistics
export async function GET() {
  try {
    const stats = await getPipelineStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching pipeline stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch pipeline stats" },
      { status: 500 }
    );
  }
}
