import { NextRequest, NextResponse } from "next/server";
import { analyticsService } from "@/services/analyticsService";
import { handleApiError } from "@/lib/errors";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const analyticsData = await analyticsService.getAnalyticsForTrain(id);

    return NextResponse.json({
      data: analyticsData,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
