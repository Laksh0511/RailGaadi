import { NextRequest, NextResponse } from "next/server";
import { trainService } from "@/services/trainService";
import { handleApiError } from "@/lib/errors";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const liveData = await trainService.getLiveStatus(id);

    return NextResponse.json({
      data: liveData,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
