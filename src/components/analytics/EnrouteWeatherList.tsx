import React from "react";
import { StationWeather } from "@/types/weather";

interface EnrouteWeatherListProps {
  weatherList: StationWeather[];
  rainAlert?: string;
}

export function EnrouteWeatherList({ weatherList, rainAlert }: EnrouteWeatherListProps) {
  return (
    <div className="bg-surface rounded-2xl shadow-md border border-outline-variant/30 p-stack-md flex flex-col">
      <div className="flex items-center justify-between mb-stack-md pb-2 border-b border-outline-variant/20">
        <div className="flex items-center gap-2 text-on-surface">
          <span className="material-symbols-outlined text-[22px] text-primary">routine</span>
          <h2 className="font-headline-sm text-base md:text-lg font-bold">En-route Weather</h2>
        </div>
        <span className="text-xs font-label-caps text-on-surface-variant uppercase">
          Live Stations
        </span>
      </div>

      {rainAlert && (
        <div className="mb-3 p-3 rounded-xl bg-primary/10 border border-primary/20 text-xs text-primary flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px] text-primary">rainy</span>
          <span>{rainAlert}</span>
        </div>
      )}

      <div className="flex flex-col gap-2.5">
        {weatherList.map((item) => (
          <div
            key={item.stationCode}
            className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-container/50 transition-colors border border-outline-variant/10 group cursor-default"
          >
            <div className="flex flex-col">
              <span className="font-headline-sm text-sm md:text-base font-semibold text-on-surface">
                {item.stationName}
              </span>
              <span className="font-body-sm text-xs text-on-surface-variant">
                ETA: {item.eta}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span className="font-headline-md text-base md:text-lg font-bold text-on-surface">
                  {item.weather.temperatureC}°
                </span>
                <span className="font-label-caps text-[11px] text-on-surface-variant">
                  {item.weather.condition}
                </span>
              </div>
              <span className="material-symbols-outlined text-[28px] text-outline-variant group-hover:text-primary transition-colors">
                {item.weather.icon || "cloud"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
