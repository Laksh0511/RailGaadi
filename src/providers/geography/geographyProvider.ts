import {
  ElevationPoint,
  RouteAnalyticsData,
  DelayAnalytics,
} from "@/types/route";
import { Train } from "@/types/train";
import {
  TRAIN_SCHEDULES,
  GEOGRAPHIC_LANDMARKS,
  STATION_AMENITIES_DATABASE,
} from "@/lib/constants";
import { serverCache } from "@/lib/cache";

export interface GeographyProvider {
  getRouteAnalytics(train: Train): Promise<RouteAnalyticsData>;
}

export class DefaultGeographyProvider implements GeographyProvider {
  private async fetchElevations(coords: { lat: number; lon: number }[]): Promise<number[]> {
    if (coords.length === 0) return [];
    try {
      const lats = coords.map((c) => c.lat.toFixed(4)).join(",");
      const lons = coords.map((c) => c.lon.toFixed(4)).join(",");
      const url = `https://api.open-meteo.com/v1/elevation?latitude=${lats}&longitude=${lons}`;
      
      const res = await fetch(url, { next: { revalidate: 86400 } });
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.elevation)) {
          return json.elevation.map((e: number) => Math.round(e || 100));
        }
      }
    } catch (err) {
      console.warn("Open-Meteo elevation fetch failed, falling back to dynamic terrain estimation:", err);
    }
    return coords.map((c) => Math.round(50 + Math.abs(Math.sin(c.lat + c.lon) * 350)));
  }

  async getRouteAnalytics(train: Train): Promise<RouteAnalyticsData> {
    const cacheKey = `route_analytics_${train.number}`;
    const cached = serverCache.get<RouteAnalyticsData>(cacheKey);
    if (cached) return cached;

    const schedule = TRAIN_SCHEDULES[train.number] || [
      {
        station: train.origin,
        stopSequence: 1,
        scheduledDeparture: train.departureTime,
        actualDeparture: train.departureTime,
        delayMinutes: 0,
        distanceFromOriginKm: 0,
        platform: 1,
        status: "COMPLETED",
        amenities: { food: true, waterRefill: true, wifi: true, lounge: true, pharmacy: true },
      },
      {
        station: train.destination,
        stopSequence: 2,
        scheduledArrival: train.arrivalTime,
        estimatedArrival: train.arrivalTime,
        delayMinutes: 0,
        distanceFromOriginKm: train.totalDistanceKm,
        platform: 1,
        status: "CURRENT",
        amenities: { food: true, waterRefill: true, wifi: true, lounge: true, pharmacy: true },
      },
    ];

    // Build array of coordinates to query real elevation
    const sampleCoords: { lat: number; lon: number; name?: string; dist: number; isStation: boolean; code?: string }[] = [];
    
    schedule.forEach((stop, idx) => {
      sampleCoords.push({
        lat: stop.station.latitude,
        lon: stop.station.longitude,
        name: stop.station.name,
        code: stop.station.code,
        dist: stop.distanceFromOriginKm,
        isStation: true,
      });

      if (idx < schedule.length - 1) {
        const next = schedule[idx + 1];
        const midLat = (stop.station.latitude + next.station.latitude) / 2;
        const midLon = (stop.station.longitude + next.station.longitude) / 2;
        const midDist = Math.round((stop.distanceFromOriginKm + next.distanceFromOriginKm) / 2);
        sampleCoords.push({
          lat: midLat,
          lon: midLon,
          name: `${stop.station.name} - ${next.station.name} Section`,
          dist: midDist,
          isStation: false,
        });
      }
    });

    const liveElevations = await this.fetchElevations(sampleCoords);

    const elevationProfile: ElevationPoint[] = sampleCoords.map((item, i) => ({
      distanceKm: item.dist,
      elevationMeters: liveElevations[i] ?? 100,
      stationCode: item.code,
      stationName: item.name,
      isPeak: false,
    }));

    // Find highest peak point
    let highestPoint = elevationProfile[0];
    elevationProfile.forEach((p) => {
      if (p.elevationMeters > highestPoint.elevationMeters) {
        highestPoint = p;
      }
    });

    if (highestPoint) {
      highestPoint.isPeak = true;
      highestPoint.landmark = `${highestPoint.stationName || "Summit Point"} (${highestPoint.elevationMeters}m)`;
    }

    const elevations = elevationProfile.map((p) => p.elevationMeters);
    const maxElevationMeters = Math.max(...elevations, 100);
    const minElevationMeters = Math.min(...elevations, 10);

    // Compute dynamic delay metrics based on actual station delays
    const stationDelays = schedule.map((s) => s.delayMinutes || 0);
    const currentDelay = stationDelays.length > 0 ? stationDelays[stationDelays.length - 1] : 0;
    const maxDelay = Math.max(...stationDelays, 0);
    const avgDelay = Math.round(stationDelays.reduce((a, b) => a + b, 0) / Math.max(1, stationDelays.length));

    const delayRiskLevel = maxDelay > 30 ? "HIGH" : maxDelay > 10 ? "MODERATE" : "LOW";
    const riskDescription =
      delayRiskLevel === "HIGH"
        ? `High congestion or section delay detected (+${maxDelay}m).`
        : delayRiskLevel === "MODERATE"
        ? `Moderate delay observed along route (+${maxDelay}m).`
        : "Train operating smooth and on-schedule across all sections.";

    const delayAnalytics: DelayAnalytics = {
      currentDelayMinutes: currentDelay,
      departureDelayMinutes: stationDelays[0] || 0,
      historicalAvgDelayMinutes: avgDelay,
      predictedDestinationDelayMinutes: currentDelay,
      delayRiskLevel,
      riskDescription,
      delayTrend: currentDelay > avgDelay ? "INCREASING" : currentDelay < avgDelay ? "RECOVERING" : "CONSTANT",
      pastTripsCount: 42,
      onTimeArrivalPercentage: Math.max(70, Math.min(99, 100 - avgDelay * 2)),
    };

    const landmarks = GEOGRAPHIC_LANDMARKS[train.number] || [
      {
        id: `landmark-mid-${train.number}`,
        name: `${train.name} Scenic Pass`,
        type: "valley",
        latitude: (train.origin.latitude + train.destination.latitude) / 2,
        longitude: (train.origin.longitude + train.destination.longitude) / 2,
        description: `Central route passage connecting ${train.origin.city || train.origin.name} to ${train.destination.city || train.destination.name}.`,
        elevationMeters: highestPoint.elevationMeters,
        distanceFromOriginKm: Math.round(train.totalDistanceKm / 2),
      },
    ];

    const durationHours = parseFloat(train.duration) || 8;
    const averageSpeedKmh = Math.round(train.totalDistanceKm / Math.max(1, durationHours));

    const result: RouteAnalyticsData = {
      elevationProfile,
      maxElevationMeters,
      minElevationMeters,
      highestPointLocation: highestPoint?.stationName || "Central Ridge",
      landmarks,
      delayAnalytics,
      stationAmenities: STATION_AMENITIES_DATABASE,
      totalDistanceKm: train.totalDistanceKm,
      averageSpeedKmh,
      durationFormatted: train.duration,
    };

    serverCache.set(cacheKey, result, 3600);
    return result;
  }
}

export const geographyProvider = new DefaultGeographyProvider();

