import React from "react";
import Link from "next/link";
import { UserTrip } from "@/types/trip";

interface UpcomingTripCardProps {
  trip: UserTrip;
  daysLabel?: string;
}

export function UpcomingTripCard({ trip, daysLabel = "Upcoming" }: UpcomingTripCardProps) {
  return (
    <Link
      href={`/trains/${trip.train.number}`}
      className="bg-surface rounded-2xl shadow-sm border border-outline-variant/30 p-stack-md flex flex-col gap-stack-md hover:shadow-md hover:border-primary/30 transition-all cursor-pointer relative overflow-hidden group"
    >
      <div className="absolute inset-y-0 left-0 w-1.5 bg-outline-variant group-hover:bg-primary transition-colors duration-300" />
      <div className="flex justify-between items-center pl-2">
        <span className="font-data-mono text-xs text-on-surface-variant font-medium">
          {trip.train.number} • {trip.train.name}
        </span>
        <span className="font-label-caps text-[10px] text-primary bg-primary-fixed/40 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
          {daysLabel}
        </span>
      </div>

      <div className="flex items-center justify-between w-full pl-2">
        <div className="flex flex-col">
          <span className="font-headline-md text-xl font-bold text-on-surface">
            {trip.originStationCode}
          </span>
          <span className="font-body-sm text-xs text-on-surface-variant">
            {trip.scheduledDeparture}
          </span>
        </div>

        <span className="material-symbols-outlined text-outline-variant group-hover:text-primary group-hover:translate-x-1 transition-all text-[24px]">
          arrow_forward
        </span>

        <div className="flex flex-col items-end text-right">
          <span className="font-headline-md text-xl font-bold text-on-surface">
            {trip.destinationStationCode}
          </span>
          <span className="font-body-sm text-xs text-on-surface-variant">
            {trip.scheduledArrival}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-outline-variant/15 pl-2 text-xs text-on-surface-variant">
        <span>
          Seat {trip.coach} • {trip.seats}
        </span>
        <span className="font-data-mono font-bold text-primary">PNR {trip.pnr}</span>
      </div>
    </Link>
  );
}
