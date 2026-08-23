import React, { useState } from "react";
import { UserTrip } from "@/types/trip";

interface PastTripItemProps {
  trip: UserTrip;
}

export function PastTripItem({ trip }: PastTripItemProps) {
  const [showReceipt, setShowReceipt] = useState(false);

  return (
    <div className="bg-surface-container-low rounded-2xl border border-outline-variant/30 shadow-xs p-stack-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 opacity-90 hover:opacity-100 transition-opacity">
      <div className="flex items-center gap-stack-md">
        <div className="w-11 h-11 rounded-2xl bg-surface-variant flex items-center justify-center shadow-xs text-on-surface-variant">
          <span className="material-symbols-outlined text-[22px]">train</span>
        </div>
        <div className="flex flex-col">
          <span className="font-headline-sm text-base font-bold text-on-surface">
            {trip.originStationCode} ➔ {trip.destinationStationCode}
          </span>
          <span className="font-label-caps text-[11px] text-on-surface-variant uppercase tracking-wider mt-0.5">
            {trip.train.number} • {trip.train.name}
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:items-center">
        <span className="font-body-sm text-sm text-on-surface font-medium">{trip.journeyDate}</span>
        <span className="font-label-caps text-[10px] text-outline-variant uppercase tracking-widest mt-0.5">
          Completed
        </span>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto">
        <button
          onClick={() => setShowReceipt(!showReceipt)}
          className="bg-surface hover:bg-surface-container text-on-surface font-label-caps text-xs px-3.5 py-1.5 rounded-xl border border-outline-variant/30 shadow-xs uppercase tracking-wider transition-colors"
        >
          {showReceipt ? "Hide Receipt" : "Receipt"}
        </button>
      </div>

      {showReceipt && (
        <div className="w-full sm:col-span-3 pt-3 border-t border-outline-variant/20 text-xs font-data-mono text-on-surface-variant flex flex-wrap gap-4">
          <span>PNR: {trip.pnr}</span>
          <span>Class: {trip.travelClass}</span>
        </div>
      )}
    </div>
  );
}
