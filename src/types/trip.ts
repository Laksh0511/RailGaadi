import { Train } from "./train";

export interface UserTrip {
  id: string;
  pnr: string;
  train: Train;
  journeyDate: string; // YYYY-MM-DD
  travelClass: string; // e.g. "Exec. Chair (EC)", "AC 2 Tier (2A)"
  coach: string;       // e.g. "C1"
  seats: string;       // e.g. "45, 46"
  bookingStatus: "CNF" | "RAC" | "WL" | "COMPLETED";
  originStationCode: string;
  destinationStationCode: string;
  scheduledDeparture: string;
  scheduledArrival: string;
  countdownDepartureTimestamp: string;
  destinationImageUrl?: string;
  createdAt: string;
  isPast?: boolean;
}
