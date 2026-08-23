import { NextRequest, NextResponse } from "next/server";
import { weatherService } from "@/services/weatherService";
import { handleApiError } from "@/lib/errors";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const weatherData = await weatherService.getWeatherForTrain(id);

    return NextResponse.json({
      data: weatherData,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
