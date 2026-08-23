"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/Skeleton";
import { LiveTrainData } from "@/types/train";
import { RouteDetail } from "@/services/routeService";

const DynamicJourneyMap = dynamic(
  () => import("./JourneyMap").then((mod) => mod.JourneyMap),
  {
    ssr: false,
    loading: () => (
      <div className="relative w-full h-full min-h-[380px] md:min-h-[460px] rounded-2xl overflow-hidden bg-surface-container flex flex-col items-center justify-center border border-outline-variant/30">
        <Skeleton className="w-full h-full absolute inset-0" />
        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center animate-pulse">
            <span className="material-symbols-outlined text-[28px]">map</span>
          </div>
          <span className="text-body-sm font-medium text-on-surface-variant">
            Initializing Interactive Journey Map...
          </span>
        </div>
      </div>
    ),
  }
);

interface MapWrapperProps {
  liveData: LiveTrainData;
  routeDetail?: RouteDetail | null;
  className?: string;
}

export function MapWrapper({ liveData, routeDetail, className }: MapWrapperProps) {
  return <DynamicJourneyMap liveData={liveData} routeDetail={routeDetail} className={className} />;
}
