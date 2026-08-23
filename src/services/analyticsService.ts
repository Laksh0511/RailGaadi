import { geographyProvider } from "@/providers/geography/geographyProvider";
import { trainService } from "./trainService";
import { RouteAnalyticsData } from "@/types/route";

export class AnalyticsService {
  async getAnalyticsForTrain(trainId: string): Promise<RouteAnalyticsData> {
    const train = await trainService.getTrain(trainId);
    return await geographyProvider.getRouteAnalytics(train);
  }
}

export const analyticsService = new AnalyticsService();
