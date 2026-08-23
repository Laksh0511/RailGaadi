"use client";

import React, { useState } from "react";
import { ElevationPoint } from "@/types/route";

interface ElevationChartProps {
  elevationProfile: ElevationPoint[];
  maxElevationMeters: number;
  minElevationMeters: number;
  highestPointLocation?: string;
}

export function ElevationChart({
  elevationProfile,
  maxElevationMeters,
  minElevationMeters,
  highestPointLocation,
}: ElevationChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<ElevationPoint | null>(null);

  if (!elevationProfile || elevationProfile.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-on-surface-variant text-sm">
        Elevation profile data is calculating...
      </div>
    );
  }

  const maxDist = Math.max(...elevationProfile.map((p) => p.distanceKm), 1);
  const maxElev = Math.max(maxElevationMeters, 250);
  const minElev = Math.max(0, minElevationMeters - 10);

  // SVG viewBox coordinates 0 to 400 width, 0 to 100 height
  const width = 400;
  const height = 100;
  const paddingBottom = 15;
  const paddingTop = 15;
  const usableHeight = height - paddingTop - paddingBottom;

  const points = elevationProfile.map((p) => {
    const x = (p.distanceKm / maxDist) * width;
    const normY = (p.elevationMeters - minElev) / (maxElev - minElev);
    const y = height - paddingBottom - normY * usableHeight;
    return { ...p, x, y };
  });

  const pathD = points.reduce((acc, p, idx) => {
    return `${acc} ${idx === 0 ? "M" : "L"} ${p.x.toFixed(1)},${p.y.toFixed(1)}`;
  }, "");

  const fillD = `${pathD} L ${width},${height} L 0,${height} Z`;

  return (
    <div className="bg-surface rounded-2xl shadow-md border border-outline-variant/30 p-stack-md flex flex-col gap-stack-sm">
      <div className="flex items-center justify-between mb-base">
        <div className="flex items-center gap-2 text-on-surface">
          <span className="material-symbols-outlined text-[22px] text-primary">terrain</span>
          <h2 className="font-headline-sm text-base md:text-lg font-bold">Elevation Topography</h2>
        </div>
        <div className="flex items-center gap-2">
          {highestPointLocation && (
            <span className="text-[11px] font-label-caps text-secondary font-bold bg-secondary/10 px-2 py-0.5 rounded">
              Peak: {highestPointLocation}
            </span>
          )}
          <span className="font-data-mono text-on-surface-variant bg-surface-container px-2.5 py-1 rounded-md text-[12px] font-bold">
            Max: {maxElevationMeters}m
          </span>
        </div>
      </div>

      <div className="flex-1 min-h-[180px] w-full relative flex items-end pt-6">
        {/* Hover Tooltip */}
        {hoveredPoint && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-surface-container-highest px-3 py-1 rounded-lg text-xs font-data-mono text-on-surface shadow-md border border-outline-variant/40 pointer-events-none z-10 flex items-center gap-2">
            <span>{hoveredPoint.stationName || hoveredPoint.landmark || "Route Point"}</span>
            <span className="font-bold text-primary">{hoveredPoint.elevationMeters}m</span>
            <span className="text-on-surface-variant">({hoveredPoint.distanceKm} km)</span>
          </div>
        )}

        {/* SVG Elevation Graph */}
        <svg
          className="w-full h-full text-primary drop-shadow-sm overflow-visible"
          preserveAspectRatio="none"
          viewBox={`0 0 ${width} ${height}`}
        >
          <defs>
            <linearGradient id="elevationGrad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.25" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {/* Shaded Area */}
          <path d={fillD} fill="url(#elevationGrad)" />

          {/* Top Line */}
          <path
            d={pathD}
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="2.5"
            vectorEffect="non-scaling-stroke"
          />

          {/* Station Markers */}
          {points.map((p, i) => (
            <g
              key={i}
              className="cursor-pointer group"
              onMouseEnter={() => setHoveredPoint(p)}
              onMouseLeave={() => setHoveredPoint(null)}
            >
              <circle
                cx={p.x}
                cy={p.y}
                r={p.isPeak ? 5 : 3.5}
                fill={p.isPeak ? "#fcd400" : "#ffffff"}
                stroke="#003b72"
                strokeWidth={2}
                className="transition-transform group-hover:scale-150"
              />
            </g>
          ))}
        </svg>

        {/* Y-Axis Labels */}
        <div className="absolute left-0 top-2 bottom-2 flex flex-col justify-between font-label-caps text-[10px] text-on-surface-variant/50 pointer-events-none">
          <span>{maxElev}m</span>
          <span>{Math.round(maxElev / 2)}m</span>
          <span>0m</span>
        </div>
      </div>

      <div className="flex justify-between w-full font-label-caps text-xs text-on-surface-variant mt-2 px-2 border-t border-outline-variant/10 pt-2">
        <span>Origin ({elevationProfile[0]?.stationCode || "Start"})</span>
        <span>{highestPointLocation || "Mid Ghats"}</span>
        <span>Destination ({elevationProfile[elevationProfile.length - 1]?.stationCode || "End"})</span>
      </div>
    </div>
  );
}
