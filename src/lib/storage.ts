import { Train } from "@/types/train";
import { UserTrip } from "@/types/trip";

export interface RecentSearchItem {
  trainNumber: string;
  trainName: string;
  originCode: string;
  originName: string;
  destinationCode: string;
  destinationName: string;
  selectedAt: string;
}

const RECENT_SEARCHES_KEY = "railly_recent_searches";
const FAVOURITES_KEY = "railly_favourite_trains";
const SAVED_TRIPS_KEY = "railly_saved_trips";

export function getRecentSearches(): RecentSearchItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to read recent searches", e);
    return [];
  }
}

export function saveRecentSearch(train: Train): RecentSearchItem[] {
  if (typeof window === "undefined") return [];
  try {
    const existing = getRecentSearches().filter((item) => item.trainNumber !== train.number);
    const updated: RecentSearchItem[] = [
      {
        trainNumber: train.number,
        trainName: train.name,
        originCode: train.origin.code,
        originName: train.origin.name,
        destinationCode: train.destination.code,
        destinationName: train.destination.name,
        selectedAt: new Date().toISOString(),
      },
      ...existing,
    ].slice(0, 10); // Max 10 recent searches

    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error("Failed to save recent search", e);
    return [];
  }
}

export function removeRecentSearch(trainNumber: string): RecentSearchItem[] {
  if (typeof window === "undefined") return [];
  try {
    const existing = getRecentSearches().filter((item) => item.trainNumber !== trainNumber);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(existing));
    return existing;
  } catch (e) {
    console.error("Failed to remove recent search", e);
    return [];
  }
}

export function getFavouriteTrainNumbers(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(FAVOURITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to read favourites", e);
    return [];
  }
}

export function toggleFavouriteTrain(trainNumber: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const favs = getFavouriteTrainNumbers();
    const isFav = favs.includes(trainNumber);
    const updated = isFav ? favs.filter((n) => n !== trainNumber) : [...favs, trainNumber];
    localStorage.setItem(FAVOURITES_KEY, JSON.stringify(updated));
    return !isFav;
  } catch (e) {
    console.error("Failed to toggle favourite", e);
    return false;
  }
}

export function getSavedTrips(): UserTrip[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SAVED_TRIPS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to read trips", e);
    return [];
  }
}

export function saveUserTrip(trip: UserTrip): UserTrip[] {
  if (typeof window === "undefined") return [];
  try {
    const trips = getSavedTrips();
    const updated = [trip, ...trips.filter((t) => t.id !== trip.id)];
    localStorage.setItem(SAVED_TRIPS_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error("Failed to save trip", e);
    return [];
  }
}
