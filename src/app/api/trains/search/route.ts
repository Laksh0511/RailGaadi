import { NextRequest, NextResponse } from "next/server";
import { trainService } from "@/services/trainService";
import { handleApiError } from "@/lib/errors";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const runsToday = searchParams.get("runsToday") === "true";

    const results = await trainService.search(q, runsToday);

    return NextResponse.json({
      data: results,
      total: results.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
