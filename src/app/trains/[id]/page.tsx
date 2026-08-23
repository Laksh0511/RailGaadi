"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { TrainHeader } from "@/components/train/TrainHeader";
import { MetricGrid } from "@/components/train/MetricGrid";
import { UpcomingStationsTimeline } from "@/components/train/UpcomingStationsTimeline";
import { MapWrapper } from "@/components/map/MapWrapper";
import { LiveTrainData } from "@/types/train";
import { RouteDetail } from "@/services/routeService";
import { Skeleton } from "@/components/ui/Skeleton";
import Link from "next/link";

export default function TrainDashboardPage() {
  const params = useParams();
  const trainId = (params.id as string) || "22436";

  const [liveData, setLiveData] = useState<LiveTrainData | null>(null);
  const [routeDetail, setRouteDetail] = useState<RouteDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  useEffect(() => {
    let isMounted = true;

    async function fetchTrainData() {
      try {
        const [liveRes, routeRes] = await Promise.all([
          fetch(`/api/trains/${trainId}`),
          fetch(`/api/trains/${trainId}/route`),
        ]);

        if (!liveRes.ok) {
          throw new Error(`Train '${trainId}' not found.`);
        }

        const liveJson = await liveRes.json();
        const routeJson = await routeRes.json();

        if (isMounted) {
          setLiveData(liveJson.data);
          setRouteDetail(routeJson.data || null);
          setLastRefreshed(new Date());
          setError(null);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "Failed to load live train data.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchTrainData();

    // Auto refresh live data every 30s as per PRD
    const interval = setInterval(fetchTrainData, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [trainId]);

  if (isLoading) {
    return (
      <AppLayout currentTrainId={trainId}>
        <div className="p-stack-lg space-y-stack-lg max-w-7xl mx-auto w-full">
          <div className="flex justify-between items-center">
            <Skeleton className="h-14 w-80" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-stack-lg">
            <div className="lg:col-span-2 space-y-stack-lg">
              <Skeleton className="h-[420px] w-full rounded-2xl" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-stack-md">
                <Skeleton className="h-28 rounded-2xl" />
                <Skeleton className="h-28 rounded-2xl" />
                <Skeleton className="h-28 rounded-2xl" />
                <Skeleton className="h-28 rounded-2xl" />
              </div>
            </div>
            <div className="lg:col-span-1">
              <Skeleton className="h-[560px] rounded-2xl" />
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !liveData) {
    return (
      <AppLayout currentTrainId={trainId}>
        <div className="p-stack-lg max-w-2xl mx-auto text-center py-20 space-y-4">
          <div className="w-16 h-16 rounded-full bg-error-container text-error flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-[32px]">warning</span>
          </div>
          <h2 className="font-headline-md text-2xl font-bold text-on-surface">
            Train Tracking Unavailable
          </h2>
          <p className="text-on-surface-variant text-body-sm">
            {error || "Could not retrieve live telemetry for this train."}
          </p>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-xl font-semibold text-sm hover:bg-primary-container transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">search</span>
            Search Another Train
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout currentTrainId={trainId}>
      <div className="flex flex-col w-full max-w-7xl mx-auto pb-stack-lg space-y-stack-md">
        {/* Train Header */}
        <TrainHeader train={liveData.train} status={liveData.status} />

        {/* Refresh freshness banner */}
        <div className="px-container-margin md:px-stack-lg -mt-2 flex items-center justify-between text-xs text-on-surface-variant">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Live telemetry updated {lastRefreshed.toLocaleTimeString()}</span>
          </div>
          <Link
            href={`/trains/${trainId}/analytics`}
            className="text-primary hover:underline font-semibold flex items-center gap-1"
          >
            <span>View Delay Risk & Elevation Profile</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </Link>
        </div>

        {/* Dashboard Grid */}
        <div className="px-container-margin md:px-stack-lg grid grid-cols-1 lg:grid-cols-3 gap-stack-lg">
          {/* Left Column: Interactive Map + Metric Cards */}
          <div className="lg:col-span-2 flex flex-col gap-stack-lg">
            {/* Interactive Map */}
            <div className="h-[380px] md:h-[450px] w-full">
              <MapWrapper liveData={liveData} routeDetail={routeDetail} />
            </div>

            {/* Metrics Grid */}
            <MetricGrid liveData={liveData} />
          </div>

          {/* Right Column: Upcoming Stations Timeline */}
          <div className="lg:col-span-1">
            <UpcomingStationsTimeline stations={liveData.stations} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
