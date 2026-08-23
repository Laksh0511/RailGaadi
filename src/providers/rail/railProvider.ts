import { Train, LiveTrainData, StationStatus, TrainPosition, TrainLiveStatus } from "@/types/train";
import { TRAIN_SCHEDULES } from "@/lib/constants";
import { serverCache } from "@/lib/cache";

export interface TrainProvider {
  searchTrains(query: string, runsTodayOnly?: boolean): Promise<Train[]>;
  getTrainById(idOrNumber: string): Promise<Train | null>;
  getLiveTrainStatus(idOrNumber: string): Promise<LiveTrainData | null>;
}

// Calculate bearing angle between two coordinates in degrees
function calculateHeading(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const y = Math.sin(dLon) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.cos(dLon);
  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
}

function inferType(name: string): string {
  const n = name.toUpperCase();
  if (n.includes("VANDE BHARAT") || n.includes("VANDE")) return "Vande Bharat";
  if (n.includes("RAJDHANI")) return "Rajdhani";
  if (n.includes("SHATABDI") || n.includes("JAN SHATABDI")) return "Shatabdi";
  if (n.includes("DURONTO")) return "Duronto";
  if (n.includes("GARIB RATH")) return "Garib Rath";
  if (n.includes("TEJAS")) return "Tejas";
  if (n.includes("HUMSAFAR")) return "Humsafar";
  return "Express";
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m.toString().padStart(2, "0")}m`;
}

function parseRunDays(raw: any): string[] {
  if (!raw) return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  if (Array.isArray(raw)) {
    const dayMap: Record<string, string> = {
      mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu",
      fri: "Fri", sat: "Sat", sun: "Sun",
    };
    return raw.map((day) => {
      const d = String(day).toLowerCase().trim();
      return dayMap[d] || d.charAt(0).toUpperCase() + d.slice(1);
    });
  }
  if (typeof raw === "string") {
    const dayAbbr = raw.toLowerCase();
    const map: Record<string, string> = {
      mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu",
      fri: "Fri", sat: "Sat", sun: "Sun",
    };
    return Object.entries(map)
      .filter(([key]) => dayAbbr.includes(key))
      .map(([, val]) => val);
  }
  return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
}

/**
 * Map a search-result item into our Train type.
 * Search response fields: { number, name, source, sourceName, dest, destName, type, popularity }
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapSearchResult(item: any): Train {
  const number = String(item.number || "");
  const name = item.name || "Express";
  const originCode = item.source || "NDLS";
  const destCode = item.dest || "CSTM";

  return {
    id: number,
    number,
    name,
    type: item.type || inferType(name),
    origin: {
      id: originCode,
      code: originCode,
      name: item.sourceName || originCode,
      latitude: 28.6431,
      longitude: 77.2197,
    },
    destination: {
      id: destCode,
      code: destCode,
      name: item.destName || destCode,
      latitude: 18.9712,
      longitude: 72.8197,
    },
    departureTime: "00:00",
    arrivalTime: "00:00",
    duration: "--",
    totalDistanceKm: 0,
    runsOnDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    runsToday: true,
    classes: ["SL", "3A", "2A", "1A"],
    pantryAvailable: true,
  };
}

/**
 * Map the train details response into our Train type.
 * Details response: data.train = { number, name, source: { code, name, lat, lng },
 *   destination: { code, name, lat, lng }, distance, duration (minutes), type, runDays, ... }
 * data.route = array of station stops
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapTrainDetail(trainData: any): Train {
  const number = String(trainData.number || "");
  const name = trainData.name || "Express";
  const src = trainData.source || {};
  const dst = trainData.destination || {};

  // duration is in minutes
  const durationMins = typeof trainData.duration === "number" ? trainData.duration : 0;

  // Find departure and arrival from route array (first and last halt)
  const departureTime = "00:00"; // filled by route if needed
  const arrivalTime = "00:00";

  return {
    id: number,
    number,
    name,
    type: trainData.type || inferType(name),
    origin: {
      id: src.code || "ORIG",
      code: src.code || "ORIG",
      name: src.name || src.code || "Origin",
      latitude: src.lat || 28.6431,
      longitude: src.lng || 77.2197,
    },
    destination: {
      id: dst.code || "DEST",
      code: dst.code || "DEST",
      name: dst.name || dst.code || "Destination",
      latitude: dst.lat || 18.9712,
      longitude: dst.lng || 72.8197,
    },
    departureTime,
    arrivalTime,
    duration: durationMins > 0 ? formatDuration(durationMins) : "--",
    totalDistanceKm: trainData.distance || 0,
    runsOnDays: parseRunDays(trainData.runDays),
    runsToday: true,
    classes: trainData.classes || ["SL", "3A", "2A", "1A"],
    pantryAvailable: trainData.pantryAvailable ?? true,
  };
}

/**
 * Map a route station entry into StationStatus.
 * Each entry: { sequence, station: { code, name, lat, lng }, isHalt, arrival, arrivalDay,
 *   departure, departureDay, distance, speedToNextStationKmph }
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRouteStation(s: any, idx: number, total: number): StationStatus {
  const st = s.station || {};
  const isFirst = idx === 0;
  const isLast = idx === total - 1;

  let status: "COMPLETED" | "CURRENT" | "UPCOMING" = "UPCOMING";
  if (isFirst) status = "COMPLETED";
  else if (isLast) status = "CURRENT";

  return {
    station: {
      id: st.code || `ST_${idx}`,
      code: st.code || `ST_${idx}`,
      name: st.name || st.code || "Unknown Station",
      latitude: st.lat || 28.6431,
      longitude: st.lng || 77.2197,
      elevationMeters: 100,
      platformCount: 4,
    },
    stopSequence: s.sequence || idx + 1,
    scheduledArrival: s.arrival,
    scheduledDeparture: s.departure,
    delayMinutes: 0,
    distanceFromOriginKm: s.distance || 0,
    platform: s.platform ?? undefined,
    status,
    amenities: {
      food: s.isHalt ?? false,
      waterRefill: s.isHalt ?? false,
      wifi: false,
      lounge: isFirst || isLast,
      pharmacy: false,
    },
  };
}

export class RailRadarProvider implements TrainProvider {
  private readonly apiKey: string | undefined;
  private readonly baseUrl: string;

  constructor() {
    this.apiKey = process.env.RAILRADAR_API_KEY;
    this.baseUrl = (process.env.RAILRADAR_API_URL || "https://api.railradar.in/v1").replace(/\/$/, "");
  }

  private getHeaders(): HeadersInit {
    const h: Record<string, string> = { Accept: "application/json" };
    if (this.apiKey) h["Authorization"] = `Bearer ${this.apiKey}`;
    return h;
  }

  // ─── SEARCH ────────────────────────────────────────────────────────────────
  // GET /v1/lookup/search/trains?q=<query>&limit=20
  // Response: { success, data: [{ number, name, source, sourceName, dest, destName, type }] }
  async searchTrains(query: string, runsTodayOnly = false): Promise<Train[]> {
    const trimmed = query.trim();
    if (!trimmed) return [];

    const cacheKey = `train_search_${trimmed.toLowerCase()}_${runsTodayOnly}`;
    const cached = serverCache.get<Train[]>(cacheKey);
    if (cached) return cached;

    if (!this.apiKey) {
      console.warn("RailRadar: No API key configured. Set RAILRADAR_API_KEY in .env.local");
      return [];
    }

    try {
      const url = `${this.baseUrl}/lookup/search/trains?q=${encodeURIComponent(trimmed)}&limit=20`;
      const res = await fetch(url, { headers: this.getHeaders(), cache: "no-store" });

      if (!res.ok) {
        console.warn(`RailRadar search returned ${res.status}`);
        return [];
      }

      const json = await res.json();
      if (!json.success || !Array.isArray(json.data)) return [];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const trains: Train[] = json.data.map((item: any) => mapSearchResult(item));
      serverCache.set(cacheKey, trains, 60);
      return trains;
    } catch (err) {
      console.error("RailRadar searchTrains failed:", err);
      return [];
    }
  }

  // ─── GET TRAIN BY ID ───────────────────────────────────────────────────────
  // GET /v1/trains/{number}
  // Response: { success, data: { train: {...}, route: [...stations] } }
  async getTrainById(idOrNumber: string): Promise<Train | null> {
    const cleaned = idOrNumber.trim();
    if (!cleaned) return null;

    const cacheKey = `train_detail_${cleaned}`;
    const cached = serverCache.get<Train>(cacheKey);
    if (cached) return cached;

    if (!this.apiKey) {
      console.warn("RailRadar: No API key configured.");
      return null;
    }

    try {
      const url = `${this.baseUrl}/trains/${encodeURIComponent(cleaned)}`;
      const res = await fetch(url, { headers: this.getHeaders(), cache: "no-store" });

      if (!res.ok) {
        console.warn(`RailRadar getTrainById ${cleaned} returned ${res.status}`);
        return null;
      }

      const json = await res.json();
      if (!json.success || !json.data?.train) {
        console.warn("RailRadar getTrainById: unexpected response", JSON.stringify(json).slice(0, 200));
        return null;
      }

      const trainData = json.data.train;
      const routeData: unknown[] = Array.isArray(json.data.route) ? json.data.route : [];

      const train = mapTrainDetail(trainData);

      // Fill departure/arrival from first and last halt
      const halts = routeData.filter((s: unknown) => (s as {isHalt: boolean}).isHalt);
      if (halts.length > 0) {
        const first = halts[0] as {departure?: string};
        const last = halts[halts.length - 1] as {arrival?: string};
        train.departureTime = first.departure || "00:00";
        train.arrivalTime = last.arrival || "00:00";
      }

      // Cache the route stations alongside (keyed separately) for live status
      serverCache.set(`train_route_${cleaned}`, routeData, 3600);
      serverCache.set(cacheKey, train, 3600);
      return train;
    } catch (err) {
      console.error("RailRadar getTrainById failed:", err);
      return null;
    }
  }

  // ─── LIVE STATUS ───────────────────────────────────────────────────────────
  // GET /v1/trains/{number}/live
  // If not running / unavailable, falls back to schedule-based simulation
  async getLiveTrainStatus(idOrNumber: string): Promise<LiveTrainData | null> {
    const cleaned = idOrNumber.trim();
    if (!cleaned) return null;

    const cacheKey = `live_train_${cleaned}`;
    const cached = serverCache.get<LiveTrainData>(cacheKey);
    if (cached) return cached;

    const train = await this.getTrainById(cleaned);
    if (!train) return null;

    // Pull cached route (populated by getTrainById)
    const cachedRoute = serverCache.get<unknown[]>(`train_route_${cleaned}`);

    if (this.apiKey) {
      try {
        const url = `${this.baseUrl}/trains/${encodeURIComponent(cleaned)}/live`;
        const res = await fetch(url, { headers: this.getHeaders(), cache: "no-store" });

        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            const item = json.data;
            const result = this.buildLiveFromApiResponse(train, item, cachedRoute ?? undefined);
            if (result) {
              serverCache.set(cacheKey, result, 15);
              return result;
            }
          }
        } else {
          console.warn(`RailRadar live ${cleaned} returned ${res.status} — using schedule simulation`);
        }
      } catch (err) {
        console.warn("RailRadar live API call failed, using schedule simulation:", err);
      }
    }

    // Fallback: build from the timetable schedule
    const liveData = await this.simulateLiveData(train, cachedRoute ?? undefined);
    serverCache.set(cacheKey, liveData, 15);
    return liveData;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private buildLiveFromApiResponse(train: Train, item: any, cachedRoute: unknown[] | undefined): LiveTrainData | null {
    try {
      const position: TrainPosition = {
        latitude: item.currentLocation?.latitude || item.lat || train.origin.latitude,
        longitude: item.currentLocation?.longitude || item.lng || train.origin.longitude,
        heading: item.currentLocation?.heading || 45,
        speedKmh: item.currentLocation?.speed || item.speedKmh || 100,
        timestamp: item.lastUpdated || new Date().toISOString(),
        statusText: item.statusText || item.status || "Running",
      };

      const delayMinutes = item.delayMinutes ?? 0;
      const state: "ON_TIME" | "DELAYED" | "EARLY" =
        delayMinutes === 0 ? "ON_TIME" : delayMinutes > 0 ? "DELAYED" : "EARLY";

      const status: TrainLiveStatus = {
        state,
        delayMinutes,
        lastUpdated: item.lastUpdated || new Date().toISOString(),
        freshnessSeconds: 15,
        isStale: false,
        currentSpeedKmh: item.currentLocation?.speed || 100,
        currentElevationMeters: item.elevation || 126,
      };

      // Use route from timetable if live doesn't have stations
      const rawStations: unknown[] = Array.isArray(item.stations)
        ? item.stations
        : (cachedRoute || []);

      const total = rawStations.length;
      const stations: StationStatus[] = rawStations.map((s, idx) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mapRouteStation(s as any, idx, total)
      );

      return this.assembleLiveData(train, status, position, stations, item);
    } catch {
      return null;
    }
  }

  private async simulateLiveData(train: Train, cachedRoute: unknown[] | undefined): Promise<LiveTrainData> {
    // Use cached route stations if available, otherwise fall back to TRAIN_SCHEDULES
    let stations: StationStatus[];

    if (cachedRoute && cachedRoute.length > 0) {
      const total = cachedRoute.length;
      const raw = cachedRoute.map((s, idx) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mapRouteStation(s as any, idx, total)
      );
      // Mark first as COMPLETED, middle one as CURRENT, rest UPCOMING
      const midIdx = Math.max(1, Math.floor(total / 2));
      stations = raw.map((s, idx) => ({
        ...s,
        status: idx < midIdx ? "COMPLETED" : idx === midIdx ? "CURRENT" : "UPCOMING",
      })) as StationStatus[];
    } else {
      const scheduleTemplate = TRAIN_SCHEDULES[train.number] || this.generateDefaultSchedule(train);
      stations = JSON.parse(JSON.stringify(scheduleTemplate));
    }

    let currentIdx = stations.findIndex((s) => s.status === "CURRENT");
    if (currentIdx === -1) currentIdx = Math.max(0, Math.floor(stations.length / 2));

    const currentStation = stations[currentIdx];
    const prevStation = currentIdx > 0 ? stations[currentIdx - 1] : undefined;
    const nextStation = currentIdx < stations.length - 1 ? stations[currentIdx + 1] : undefined;

    let currentLat = currentStation.station.latitude;
    let currentLon = currentStation.station.longitude;
    let heading = 45;

    if (nextStation) {
      const frac = 0.45;
      currentLat = currentStation.station.latitude + (nextStation.station.latitude - currentStation.station.latitude) * frac;
      currentLon = currentStation.station.longitude + (nextStation.station.longitude - currentStation.station.longitude) * frac;
      heading = calculateHeading(
        currentStation.station.latitude, currentStation.station.longitude,
        nextStation.station.latitude, nextStation.station.longitude
      );
    }

    const baseSpeed = train.type === "Vande Bharat" ? 130 : train.type === "Rajdhani" ? 124 : train.type === "Shatabdi" ? 110 : 90;
    const currentSpeed = baseSpeed + ((Date.now() % 5) - 2);
    const delayMinutes = currentStation.delayMinutes || 0;
    const state: "ON_TIME" | "DELAYED" | "EARLY" =
      delayMinutes === 0 ? "ON_TIME" : delayMinutes > 0 ? "DELAYED" : "EARLY";

    const distanceCovered = Math.round(
      currentStation.distanceFromOriginKm +
        (nextStation ? (nextStation.distanceFromOriginKm - currentStation.distanceFromOriginKm) * 0.45 : 0)
    );
    const totalDist = train.totalDistanceKm || 1;
    const distanceRemaining = Math.max(0, totalDist - distanceCovered);
    const percentage = Math.min(100, Math.round((distanceCovered / totalDist) * 100));

    const position: TrainPosition = {
      latitude: currentLat,
      longitude: currentLon,
      heading,
      speedKmh: currentSpeed,
      timestamp: new Date().toISOString(),
      statusText: nextStation
        ? `Approaching ${nextStation.station.name}`
        : `At ${currentStation.station.name}`,
    };

    const status: TrainLiveStatus = {
      state,
      delayMinutes,
      lastUpdated: new Date().toISOString(),
      freshnessSeconds: 12,
      isStale: false,
      currentSpeedKmh: currentSpeed,
      currentElevationMeters: currentStation.station.elevationMeters || 126,
    };

    let liveWeather = { currentTempC: 28, condition: "Partly Cloudy", humidity: 55, windSpeedKmh: 10 };
    try {
      const { weatherProvider } = await import("@/providers/weather/weatherProvider");
      const wf = await weatherProvider.getRouteWeather(train);
      const cw = wf.currentStationWeather?.weather;
      if (cw) liveWeather = { currentTempC: cw.temperatureC, condition: cw.condition, humidity: cw.humidityPercent, windSpeedKmh: cw.windSpeedKmh };
    } catch { /* use defaults */ }

    return {
      train,
      status,
      position,
      currentStation,
      nextStation,
      previousStation: prevStation,
      stations,
      progress: {
        percentage,
        distanceCoveredKm: distanceCovered,
        distanceRemainingKm: distanceRemaining,
        totalDistanceKm: totalDist,
        stationsPassedCount: currentIdx + 1,
        stationsRemainingCount: Math.max(0, stations.length - currentIdx - 1),
      },
      weather: liveWeather,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private assembleLiveData(train: Train, status: TrainLiveStatus, position: TrainPosition, stations: StationStatus[], item: any): LiveTrainData {
    const completed = stations.filter((s) => s.status === "COMPLETED");
    const currentStation = stations.find((s) => s.status === "CURRENT") || completed[completed.length - 1] || stations[0];
    const nextStation = stations.find((s) => s.status === "UPCOMING");
    const previousStation = completed[completed.length - 1];

    const distanceCovered = item.distanceCovered || currentStation?.distanceFromOriginKm || 0;
    const totalDist = train.totalDistanceKm || 1;
    const distanceRemaining = Math.max(0, totalDist - distanceCovered);
    const percentage = Math.min(100, Math.round((distanceCovered / totalDist) * 100));

    return {
      train,
      status,
      position,
      currentStation: currentStation as StationStatus,
      nextStation,
      previousStation,
      stations,
      progress: {
        percentage,
        distanceCoveredKm: distanceCovered,
        distanceRemainingKm: distanceRemaining,
        totalDistanceKm: totalDist,
        stationsPassedCount: completed.length,
        stationsRemainingCount: stations.filter((s) => s.status === "UPCOMING").length,
      },
    };
  }

  private generateDefaultSchedule(train: Train): StationStatus[] {
    return [
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
  }
}

export const railProvider = new RailRadarProvider();
