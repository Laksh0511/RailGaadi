"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ActiveTripHero } from "@/components/trips/ActiveTripHero";
import { UpcomingTripCard } from "@/components/trips/UpcomingTripCard";
import { PastTripItem } from "@/components/trips/PastTripItem";
import { AddTripModal } from "@/components/trips/AddTripModal";
import { UserTrip } from "@/types/trip";
import { getSavedTrips } from "@/lib/storage";
import { Skeleton } from "@/components/ui/Skeleton";

function getDaysRemainingLabel(journeyDateStr?: string): string {
  if (!journeyDateStr) return "Upcoming";
  const journeyDate = new Date(journeyDateStr).getTime();
  const now = Date.now();
  const diffDays = Math.ceil((journeyDate - now) / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return "Departs Today";
  if (diffDays === 1) return "Tomorrow";
  return `In ${diffDays} Days`;
}

export default function MyTripsPage() {
  const [trips, setTrips] = useState<UserTrip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    async function loadTrips() {
      try {
        const res = await fetch("/api/trips");
        const json = await res.json();
        const serverTrips: UserTrip[] = json.data || [];

        // Merge with local storage custom trips
        const localTrips = getSavedTrips();
        const mergedMap = new Map<string, UserTrip>();

        serverTrips.forEach((t) => mergedMap.set(t.id, t));
        localTrips.forEach((t) => mergedMap.set(t.id, t));

        setTrips(Array.from(mergedMap.values()));
      } catch (err) {
        console.error("Failed to load trips", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadTrips();
  }, []);

  const handleTripAdded = (newTrip: UserTrip) => {
    setTrips((prev) => [newTrip, ...prev]);
  };

  const activeTrip = trips.find((t) => !t.isPast);
  const upcomingTrips = trips.filter((t) => !t.isPast && t.id !== activeTrip?.id);
  const pastTrips = trips.filter((t) => t.isPast);

  return (
    <AppLayout>
      <div className="flex flex-col w-full max-w-7xl mx-auto px-container-margin md:px-stack-lg pb-stack-lg gap-stack-lg mt-stack-md">
        {/* Header & Global Actions */}
        <div className="flex items-center justify-between w-full">
          <div>
            <h2 className="font-headline-md text-2xl md:text-3xl font-bold text-on-surface">
              Upcoming Journeys
            </h2>
            <p className="text-xs md:text-sm text-on-surface-variant mt-0.5">
              Live tracking and ticket details for your reserved rail journeys.
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-primary text-on-primary px-4 py-2.5 rounded-2xl flex items-center gap-2 shadow-md hover:bg-primary-container hover:-translate-y-0.5 transition-all duration-300 font-semibold text-xs md:text-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            <span className="font-label-caps uppercase tracking-wider">Add Trip</span>
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-stack-md">
            <Skeleton className="h-64 rounded-3xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-md">
              <Skeleton className="h-40 rounded-2xl" />
              <Skeleton className="h-40 rounded-2xl" />
            </div>
          </div>
        ) : (
          <>
            {trips.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-surface-container-low rounded-3xl border border-outline-variant/30 border-dashed">
                <span className="material-symbols-outlined text-[48px] text-on-surface-variant mb-4">
                  train
                </span>
                <h3 className="font-headline-sm text-lg font-bold text-on-surface mb-2">
                  No trips planned yet
                </h3>
                <p className="text-body-sm text-on-surface-variant max-w-sm mb-6">
                  Add your upcoming journeys to track live train status and access ticket details offline.
                </p>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-primary text-on-primary px-5 py-2.5 rounded-xl font-semibold shadow-sm hover:bg-primary-container transition-colors"
                >
                  Add Your First Trip
                </button>
              </div>
            ) : (
              <>
                {/* Active / Next Trip Hero Card */}
                {activeTrip && <ActiveTripHero trip={activeTrip} />}

                {/* Secondary Upcoming Grid */}
                {upcomingTrips.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-md w-full mt-stack-sm">
                    {upcomingTrips.map((trip) => (
                      <UpcomingTripCard
                        key={trip.id}
                        trip={trip}
                        daysLabel={getDaysRemainingLabel(trip.journeyDate)}
                      />
                    ))}
                  </div>
                )}

                {/* Past Trips Section */}
                {pastTrips.length > 0 && (
                  <>
                    <div className="flex items-center justify-between w-full mt-stack-md pt-stack-md border-t border-outline-variant/20">
                      <h3 className="font-headline-sm text-lg md:text-xl font-bold text-on-surface">
                        Past Trips
                      </h3>
                      <span className="font-label-caps text-xs text-primary font-semibold">
                        {pastTrips.length} Completed Journeys
                      </span>
                    </div>

                    <div className="flex flex-col gap-stack-md w-full">
                      {pastTrips.map((trip) => (
                        <PastTripItem key={trip.id} trip={trip} />
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </>
        )}

        {/* Add Trip Modal */}
        <AddTripModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onTripAdded={handleTripAdded}
        />
      </div>
    </AppLayout>
  );
}
