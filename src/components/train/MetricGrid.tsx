import React from "react";
import { LiveTrainData } from "@/types/train";

interface MetricGridProps {
  liveData: LiveTrainData;
}

export function MetricGrid({ liveData }: MetricGridProps) {
  const isDelayed = liveData.status.delayMinutes > 0;
  const delayStr = isDelayed
    ? `+${liveData.status.delayMinutes}m`
    : "00:00";

  const delayColor = isDelayed ? "text-amber-700" : "text-emerald-700";
  const currStationCode = liveData.currentStation?.station.code || "EN-ROUTE";

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-stack-md w-full">
      {/* Delay Card */}
      <div className="bg-surface rounded-2xl p-4 shadow-sm border border-outline-variant/20 flex flex-col justify-between hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="font-label-caps text-[11px] text-on-surface-variant uppercase font-semibold">
            Delay
          </span>
          <span className="material-symbols-outlined text-outline-variant text-[20px]">
            schedule
          </span>
        </div>
        <div className="mt-3">
          <span className={`font-data-mono text-xl md:text-2xl font-bold ${delayColor}`}>
            {delayStr}
          </span>
          <p className="text-[11px] text-on-surface-variant/80 mt-0.5">
            {isDelayed ? "Running late" : "Right on schedule"}
          </p>
        </div>
      </div>

      {/* Elevation Card */}
      <div className="bg-surface rounded-2xl p-4 shadow-sm border border-outline-variant/20 flex flex-col justify-between hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="font-label-caps text-[11px] text-on-surface-variant uppercase font-semibold">
            Elevation
          </span>
          <span className="material-symbols-outlined text-outline-variant text-[20px]">
            altitude
          </span>
        </div>
        <div className="mt-3">
          <span className="font-data-mono text-xl md:text-2xl font-bold text-on-surface">
            {liveData.status.currentElevationMeters}m
          </span>
          <p className="text-[11px] text-on-surface-variant/80 mt-0.5">Above sea level</p>
        </div>
      </div>

      {/* Weather Card */}
      <div className="bg-surface rounded-2xl p-4 shadow-sm border border-outline-variant/20 flex flex-col justify-between hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="font-label-caps text-[11px] text-on-surface-variant uppercase font-semibold truncate">
            Weather ({currStationCode})
          </span>
          <span className="material-symbols-outlined text-outline-variant text-[20px]">
            thermostat
          </span>
        </div>
        <div className="mt-3">
          <span className="font-data-mono text-xl md:text-2xl font-bold text-on-surface">
            {liveData.weather?.currentTempC || 32}°C
          </span>
          <p className="text-[11px] text-on-surface-variant/80 mt-0.5">
            {liveData.weather?.condition || "Sunny"}
          </p>
        </div>
      </div>
    </div>
  );
}
