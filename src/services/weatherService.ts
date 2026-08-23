import { weatherProvider } from "@/providers/weather/weatherProvider";
import { trainService } from "./trainService";
import { RouteWeatherForecast } from "@/types/weather";

export class WeatherService {
  async getWeatherForTrain(trainId: string): Promise<RouteWeatherForecast> {
    const train = await trainService.getTrain(trainId);
    return await weatherProvider.getRouteWeather(train);
  }
}

export const weatherService = new WeatherService();
