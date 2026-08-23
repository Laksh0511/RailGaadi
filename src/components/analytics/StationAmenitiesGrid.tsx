import React from "react";
import { StationAmenityItem } from "@/types/route";

interface StationAmenitiesGridProps {
  amenities: StationAmenityItem[];
}

export function StationAmenitiesGrid({ amenities }: StationAmenitiesGridProps) {
  return (
    <div className="bg-surface rounded-2xl shadow-md border border-outline-variant/30 p-stack-md flex flex-col">
      <div className="flex items-center justify-between mb-stack-md pb-2 border-b border-outline-variant/20">
        <div className="flex items-center gap-2 text-on-surface">
          <span className="material-symbols-outlined text-[22px] text-secondary">
            storefront
          </span>
          <h2 className="font-headline-sm text-base md:text-lg font-bold">Major Hub Amenities</h2>
        </div>
        <span className="font-label-caps text-xs text-primary font-bold">LIVE STATIONS</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-stack-sm flex-1">
        {amenities.map((hub) => (
          <div
            key={hub.id}
            className="bg-surface-container/60 rounded-xl p-3.5 flex flex-col gap-2 relative overflow-hidden group border border-outline-variant/20 hover:border-primary/40 hover:shadow-sm transition-all"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-primary group-hover:w-2 transition-all" />
            <div className="flex items-center justify-between pl-2">
              <span className="font-headline-sm text-sm font-bold text-on-surface">
                {hub.stationName}
              </span>
              <span className="font-data-mono text-[10px] text-on-surface-variant bg-surface px-1.5 py-0.5 rounded">
                {hub.stationCode}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 pl-2 mt-auto pt-2">
              {hub.hasFoodCourt && (
                <span
                  className="material-symbols-outlined text-[18px] text-on-surface-variant hover:text-primary transition-colors"
                  title="Food Court / Plaza"
                >
                  restaurant
                </span>
              )}
              {hub.hasWifi && (
                <span
                  className="material-symbols-outlined text-[18px] text-on-surface-variant hover:text-primary transition-colors"
                  title="High Speed Wi-Fi"
                >
                  wifi
                </span>
              )}
              {hub.hasExecutiveLounge && (
                <span
                  className="material-symbols-outlined text-[18px] text-on-surface-variant hover:text-primary transition-colors"
                  title="Executive Lounge"
                >
                  chair
                </span>
              )}
              {hub.hasPharmacy && (
                <span
                  className="material-symbols-outlined text-[18px] text-on-surface-variant hover:text-primary transition-colors"
                  title="24/7 Pharmacy"
                >
                  local_pharmacy
                </span>
              )}
              {hub.hasWaterVending && (
                <span
                  className="material-symbols-outlined text-[18px] text-on-surface-variant hover:text-primary transition-colors"
                  title="RO Water Booths"
                >
                  local_drink
                </span>
              )}
              {hub.hasRestrooms && (
                <span
                  className="material-symbols-outlined text-[18px] text-on-surface-variant hover:text-primary transition-colors"
                  title="Clean Restrooms"
                >
                  wc
                </span>
              )}
            </div>
          </div>
        ))}


      </div>
    </div>
  );
}
