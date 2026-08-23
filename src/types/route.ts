export interface RouteCoordinate {
  latitude: number;
  longitude: number;
  distanceKm?: number;
  elevationMeters?: number;
}

export interface ElevationPoint {
  distanceKm: number;
  elevationMeters: number;
  stationCode?: string;
  stationName?: string;
  isPeak?: boolean;
  landmark?: string;
}

export interface GeographicLandmark {
  id: string;
  name: string;
  type: "ghat" | "river" | "bridge" | "tunnel" | "monument" | "plateau" | "lake";
  latitude: number;
  longitude: number;
  description: string;
  elevationMeters?: number;
  distanceFromOriginKm?: number;
}

export interface StationAmenityItem {
  id: string;
  stationCode: string;
  stationName: string;
  hasFoodCourt: boolean;
  hasWifi: boolean;
  hasExecutiveLounge: boolean;
  hasPharmacy: boolean;
  hasRestrooms: boolean;
  hasWaterVending: boolean;
  hasStationMap: boolean;
}

export interface DelayAnalytics {
  currentDelayMinutes: number;
  departureDelayMinutes: number;
  historicalAvgDelayMinutes: number;
  predictedDestinationDelayMinutes: number;
  delayRiskLevel: "LOW" | "MODERATE" | "HIGH";
  riskDescription: string;
  delayTrend: "INCREASING" | "RECOVERING" | "CONSTANT";
  pastTripsCount: number;
  onTimeArrivalPercentage: number;
}

export interface RouteAnalyticsData {
  elevationProfile: ElevationPoint[];
  maxElevationMeters: number;
  minElevationMeters: number;
  highestPointLocation: string;
  landmarks: GeographicLandmark[];
  delayAnalytics: DelayAnalytics;
  stationAmenities: StationAmenityItem[];
  totalDistanceKm: number;
  averageSpeedKmh: number;
  durationFormatted: string;
}
