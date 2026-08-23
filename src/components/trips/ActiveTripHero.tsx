"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { UserTrip } from "@/types/trip";

interface ActiveTripHeroProps {
  trip: UserTrip;
}

export function ActiveTripHero({ trip }: ActiveTripHeroProps) {
  const [countdownStr, setCountdownStr] = useState("Departs in 02h 45m");

  useEffect(() => {
    const updateCountdown = () => {
      const targetTime = new Date(trip.countdownDepartureTimestamp).getTime();
      const now = Date.now();
      const diff = targetTime - now;

      if (diff <= 0) {
        setCountdownStr("Departed / Boarding Now");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const hStr = String(hours).padStart(2, "0");
      const mStr = String(minutes).padStart(2, "0");
      setCountdownStr(`Departs in ${hStr}h ${mStr}m`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 30000);
    return () => clearInterval(interval);
  }, [trip.countdownDepartureTimestamp]);

  return (
    <div className="relative bg-surface rounded-2xl shadow-xl border border-outline-variant/30 p-stack-lg overflow-hidden flex flex-col gap-stack-md transition-transform hover:-translate-y-0.5 duration-300 group">
      {/* Ambient background glow */}
      <div className="absolute -top-32 -right-32 w-[480px] h-[480px] bg-gradient-to-bl from-primary-fixed/40 to-transparent opacity-40 blur-3xl -z-10 group-hover:opacity-60 transition-opacity duration-700 pointer-events-none" />

      {/* Top Status Bar */}
      <div className="flex justify-between items-start w-full">
        <div className="flex gap-2 items-center text-secondary">
          <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse" />
          <span className="font-label-caps text-xs font-bold uppercase tracking-wider">
            {countdownStr}
          </span>
        </div>
        <div className="flex flex-col items-end">
          <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest">
            PNR Status
          </span>
          <div className="font-data-mono text-sm text-primary font-bold mt-0.5 flex items-center gap-1.5">
            {trip.pnr}
            <span className="text-on-primary bg-primary px-2 py-0.5 rounded shadow-xs text-[10px] font-bold">
              {trip.bookingStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Route Visualization */}
      <div className="flex items-center justify-between w-full mt-2">
        {/* Origin */}
        <div className="flex flex-col w-1/4">
          <span className="font-display-lg text-2xl md:text-3xl text-on-surface font-bold tracking-tight">
            {trip.originStationCode}
          </span>
          <span className="font-body-sm text-xs text-on-surface-variant truncate">
            {trip.train.origin.name}
          </span>
          <span className="font-headline-sm text-sm text-on-surface mt-1 font-semibold">
            {trip.scheduledDeparture}
          </span>
        </div>

        {/* Track Timeline */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 relative">
          <div className="w-full flex items-center relative">
            <div className="w-3.5 h-3.5 rounded-full bg-primary z-10 shadow-md ring-4 ring-surface" />
            <div className="flex-1 h-[2px] bg-surface-variant relative overflow-hidden">
              <div className="absolute left-0 top-0 h-full bg-primary w-[40%] rounded-full" />
            </div>
            <div className="w-3.5 h-3.5 rounded-full bg-surface-variant z-10 shadow-xs ring-4 ring-surface group-hover:bg-primary-fixed transition-colors duration-500" />
          </div>
          <span className="font-data-mono text-xs text-on-surface bg-surface-container-high px-3 py-1 shadow-xs rounded-full mt-3 z-10 border border-outline-variant/20">
            {trip.train.number} • {trip.train.name}
          </span>
        </div>

        {/* Destination */}
        <div className="flex flex-col w-1/4 items-end text-right">
          <span className="font-display-lg text-2xl md:text-3xl text-on-surface font-bold tracking-tight">
            {trip.destinationStationCode}
          </span>
          <span className="font-body-sm text-xs text-on-surface-variant truncate">
            {trip.train.destination.name}
          </span>
          <span className="font-headline-sm text-sm text-on-surface mt-1 font-semibold">
            {trip.scheduledArrival}
          </span>
        </div>
      </div>

      {/* Metadata & Imagery */}
      <div className="flex flex-col md:flex-row gap-stack-md mt-2">
        {trip.destinationImageUrl && (
          <div className="w-full md:w-48 h-28 rounded-xl overflow-hidden shadow-sm flex-shrink-0 relative group-hover:shadow-md transition-shadow">
            <img
              src={trip.destinationImageUrl}
              alt="Destination Landmark"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <span className="absolute bottom-2 left-3 font-label-caps text-[10px] text-white uppercase tracking-widest font-bold">
              {trip.train.destination.name}
            </span>
          </div>
        )}

        <div className="flex-1 bg-surface-container rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-xs border border-outline-variant/20">
          <div className="flex gap-6">
            <div className="flex flex-col">
              <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest">
                Class
              </span>
              <span className="font-headline-sm text-sm md:text-base font-bold text-on-surface mt-0.5">
                {trip.travelClass}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest">
                Coach / Seat
              </span>
              <span className="font-headline-sm text-sm md:text-base font-bold text-on-surface mt-0.5">
                {trip.coach} • {trip.seats}
              </span>
            </div>
          </div>

          <Link
            href={`/trains/${trip.train.number}`}
            className="w-full sm:w-auto px-4 py-2 bg-primary hover:bg-primary-container text-on-primary rounded-xl text-body-sm font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-all self-stretch sm:self-auto"
          >
            <span className="material-symbols-outlined text-[18px]">near_me</span>
            <span>Track Live Journey</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
