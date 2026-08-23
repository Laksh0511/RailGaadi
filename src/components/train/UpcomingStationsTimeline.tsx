import React from "react";
import { StationStatus } from "@/types/train";

interface UpcomingStationsTimelineProps {
  stations: StationStatus[];
}

export function UpcomingStationsTimeline({ stations }: UpcomingStationsTimelineProps) {
  return (
    <div className="bg-surface rounded-2xl shadow-sm border border-outline-variant/30 p-stack-lg flex flex-col h-full min-h-[480px]">
      <div className="flex items-center justify-between mb-stack-md pb-2 border-b border-outline-variant/20">
        <h2 className="font-headline-sm text-lg md:text-xl font-bold text-on-surface">
          Upcoming Stations
        </h2>
        <span className="font-label-caps text-xs text-on-surface-variant uppercase">
          {stations.length} Stops Total
        </span>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 relative space-y-3">
        {/* Track Vertical Spine */}
        <div className="absolute left-[23px] top-4 bottom-4 w-1 bg-surface-container-highest rounded-full" />

        {stations.map((stop, idx) => {
          const isPassed = stop.status === "COMPLETED";
          const isCurrent = stop.status === "CURRENT";
          const isUpcoming = stop.status === "UPCOMING";

          if (isCurrent) {
            return (
              <div
                key={`${stop.station.code}-${idx}`}
                className="relative pl-12 py-3.5 bg-primary/5 rounded-2xl -ml-2 p-3 my-2 border border-primary/20 shadow-sm"
              >
                {/* Pulsing Target Marker */}
                <div className="absolute left-[20px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-secondary-fixed-dim border-2 border-surface z-10 animate-pulse shadow-[0_0_12px_rgba(233,196,0,0.8)]" />
                <div className="absolute left-[19px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-secondary-fixed-dim/30 animate-ping z-0" />

                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-body-lg text-base font-bold text-primary flex items-center gap-1.5">
                      <span>{stop.station.name}</span>
                      <span className="font-data-mono text-xs text-primary/70">
                        ({stop.station.code})
                      </span>
                    </div>
                    <div className="font-body-sm text-xs text-on-surface-variant mt-0.5">
                      {stop.platform ? `Platform ${stop.platform}` : "Platform TBA"} • {stop.distanceFromOriginKm} km
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-data-mono text-sm font-bold text-primary">
                      {stop.estimatedArrival || stop.scheduledArrival || "En Route"}
                    </div>
                    <div className="font-label-caps text-[10px] text-secondary font-bold uppercase mt-0.5">
                      {stop.delayMinutes === 0 ? "On Time" : `+${stop.delayMinutes}m delay`}
                    </div>
                  </div>
                </div>

                {/* Station Amenities Badges */}
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-surface rounded-md text-[11px] font-medium text-on-surface-variant border border-outline-variant/20">
                    <span className="material-symbols-outlined text-[13px] text-amber-700">
                      restaurant
                    </span>
                    Food Available
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-surface rounded-md text-[11px] font-medium text-on-surface-variant border border-outline-variant/20">
                    <span className="material-symbols-outlined text-[13px] text-blue-600">
                      local_drink
                    </span>
                    Water Refill
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-surface rounded-md text-[11px] font-medium text-on-surface-variant border border-outline-variant/20">
                    <span className="material-symbols-outlined text-[13px] text-emerald-600">
                      wifi
                    </span>
                    Station Wi-Fi
                  </span>
                </div>
              </div>
            );
          }

          if (isPassed) {
            return (
              <div
                key={`${stop.station.code}-${idx}`}
                className="relative pl-12 py-2.5 opacity-55 hover:opacity-90 transition-opacity"
              >
                <div className="absolute left-[20px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary border-2 border-surface shadow-xs" />
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-body-sm text-sm font-semibold text-on-surface">
                      {stop.station.name} ({stop.station.code})
                    </div>
                    <div className="font-data-mono text-[11px] text-on-surface-variant">
                      {stop.actualDeparture ? `Departed: ${stop.actualDeparture}` : `Passed: ${stop.scheduledDeparture}`}
                    </div>
                  </div>
                  <span className="text-[10px] font-label-caps bg-surface-container px-2 py-0.5 rounded text-on-surface-variant">
                    Passed
                  </span>
                </div>
              </div>
            );
          }

          // Upcoming Stop
          return (
            <div
              key={`${stop.station.code}-${idx}`}
              className="relative pl-12 py-3 hover:bg-surface-container/30 rounded-xl transition-colors"
            >
              <div className="absolute left-[20px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-surface-variant border-2 border-surface" />
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-body-sm text-sm font-medium text-on-surface">
                    {stop.station.name} ({stop.station.code})
                  </div>
                  <div className="font-body-sm text-xs text-on-surface-variant mt-0.5">
                    {stop.platform ? `Platform ${stop.platform}` : "Platform TBA"} • {stop.distanceFromOriginKm} km
                  </div>
                </div>
                <div className="text-right font-data-mono text-sm text-on-surface-variant font-medium">
                  {stop.scheduledArrival || stop.scheduledDeparture}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
