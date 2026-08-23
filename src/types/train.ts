export type TrainStatusState =
  | "ON_TIME"
  | "DELAYED"
  | "EARLY"
  | "ARRIVED"
  | "COMPLETED"
  | "UNKNOWN";

export interface Station {
  id: string;
  code: string;
  name: string;
  city?: string;
  state?: string;
  latitude: number;
  longitude: number;
  elevationMeters?: number;
  platformCount?: number;
}

export interface Train {
  id: string;
  number: string;
  name: string;
  type: "Vande Bharat" | "Rajdhani" | "Shatabdi" | "Duronto" | "Superfast" | "Express" | "Mail";
  origin: Station;
  destination: Station;
  departureTime: string; // e.g. "06:00"
  arrivalTime: string;   // e.g. "14:00"
  duration: string;      // e.g. "08h 00m"
  totalDistanceKm: number;
  runsOnDays: string[];  // e.g. ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  runsToday: boolean;
  classes: string[];     // e.g. ["EC", "CC", "1A", "2A", "3A", "SL"]
  pantryAvailable: boolean;
}

export interface TrainPosition {
  latitude: number;
  longitude: number;
  heading: number; // degrees 0-360
  speedKmh: number;
  timestamp: string;
  statusText?: string;
}

export interface StationStatus {
  station: Station;
  stopSequence: number;
  scheduledArrival?: string;
  actualArrival?: string;
  estimatedArrival?: string;
  scheduledDeparture?: string;
  actualDeparture?: string;
  delayMinutes: number;
  distanceFromOriginKm: number;
  platform?: string | number;
  status: "COMPLETED" | "CURRENT" | "UPCOMING";
  amenities?: {
    food: boolean;
    waterRefill: boolean;
    wifi: boolean;
    lounge: boolean;
    pharmacy: boolean;
  };
}

export interface JourneyProgress {
  percentage: number;
  distanceCoveredKm: number;
  distanceRemainingKm: number;
  totalDistanceKm: number;
  stationsPassedCount: number;
  stationsRemainingCount: number;
}

export interface TrainLiveStatus {
  state: TrainStatusState;
  delayMinutes: number;
  lastUpdated: string;
  freshnessSeconds: number;
  isStale: boolean;
  currentSpeedKmh: number;
  currentElevationMeters: number;
}

export interface LiveTrainData {
  train: Train;
  status: TrainLiveStatus;
  position: TrainPosition;
  currentStation?: StationStatus;
  nextStation?: StationStatus;
  previousStation?: StationStatus;
  stations: StationStatus[];
  progress: JourneyProgress;
  weather?: {
    currentTempC: number;
    condition: string;
    humidity: number;
    windSpeedKmh: number;
  };
}
