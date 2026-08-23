import { NextRequest, NextResponse } from "next/server";
import { routeService } from "@/services/routeService";
import { handleApiError } from "@/lib/errors";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const routeData = await routeService.getRouteGeometry(id);

    return NextResponse.json({
      data: routeData,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
