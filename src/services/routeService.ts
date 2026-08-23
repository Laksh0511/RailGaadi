import { trainService } from "./trainService";
import { TRAIN_SCHEDULES } from "@/lib/constants";

export interface RouteDetail {
  trainId: string;
  totalDistanceKm: number;
  completedCoordinates: [number, number][];
  remainingCoordinates: [number, number][];
  allCoordinates: [number, number][];
}

export class RouteService {
  async getRouteGeometry(trainId: string): Promise<RouteDetail> {
    const liveData = await trainService.getLiveStatus(trainId);
    const schedule = TRAIN_SCHEDULES[liveData.train.number] || liveData.stations;

    const coordinates: [number, number][] = schedule.map((s) => [
      s.station.latitude,
      s.station.longitude,
    ]);

    const trainLat = liveData.position.latitude;
    const trainLon = liveData.position.longitude;

    // Split into completed and remaining routes
    const completedCoordinates: [number, number][] = [];
    const remainingCoordinates: [number, number][] = [];

    let passedCurrent = false;

    for (let i = 0; i < schedule.length; i++) {
      const stop = schedule[i];
      if (stop.status === "COMPLETED") {
        completedCoordinates.push([stop.station.latitude, stop.station.longitude]);
      } else if (stop.status === "CURRENT") {
        completedCoordinates.push([stop.station.latitude, stop.station.longitude]);
        completedCoordinates.push([trainLat, trainLon]);
        remainingCoordinates.push([trainLat, trainLon]);
        passedCurrent = true;
      } else {
        if (!passedCurrent) {
          remainingCoordinates.push([trainLat, trainLon]);
          passedCurrent = true;
        }
        remainingCoordinates.push([stop.station.latitude, stop.station.longitude]);
      }
    }

    if (completedCoordinates.length === 0 && coordinates.length > 0) {
      completedCoordinates.push(coordinates[0], [trainLat, trainLon]);
    }
    if (remainingCoordinates.length === 0 && coordinates.length > 0) {
      remainingCoordinates.push([trainLat, trainLon], coordinates[coordinates.length - 1]);
    }

    return {
      trainId,
      totalDistanceKm: liveData.train.totalDistanceKm,
      completedCoordinates,
      remainingCoordinates,
      allCoordinates: coordinates,
    };
  }
}

export const routeService = new RouteService();
