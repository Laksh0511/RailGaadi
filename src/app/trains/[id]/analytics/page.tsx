"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { ElevationChart } from "@/components/analytics/ElevationChart";
import { DelayRiskCard } from "@/components/analytics/DelayRiskCard";
import { EnrouteWeatherList } from "@/components/analytics/EnrouteWeatherList";
import { StationAmenitiesGrid } from "@/components/analytics/StationAmenitiesGrid";
import { RouteAnalyticsData } from "@/types/route";
import { RouteWeatherForecast } from "@/types/weather";
import { LiveTrainData } from "@/types/train";
import { Skeleton } from "@/components/ui/Skeleton";
import Link from "next/link";

export default function JourneyAnalyticsPage() {
  const params = useParams();
  const trainId = (params.id as string) || "12951";

  const [analyticsData, setAnalyticsData] = useState<RouteAnalyticsData | null>(null);
  const [weatherData, setWeatherData] = useState<RouteWeatherForecast | null>(null);
  const [liveData, setLiveData] = useState<LiveTrainData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [analyticsRes, weatherRes, trainRes] = await Promise.all([
          fetch(`/api/trains/${trainId}/analytics`),
          fetch(`/api/trains/${trainId}/weather`),
          fetch(`/api/trains/${trainId}`),
        ]);

        const analyticsJson = await analyticsRes.json();
        const weatherJson = await weatherRes.json();
        const trainJson = await trainRes.json();

        setAnalyticsData(analyticsJson.data || null);
        setWeatherData(weatherJson.data || null);
        setLiveData(trainJson.data || null);
      } catch (err) {
        console.error("Failed to load analytics data", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [trainId]);

  return (
    <AppLayout currentTrainId={trainId}>
      <div className="flex flex-col w-full max-w-7xl mx-auto px-container-margin md:px-stack-lg pb-stack-lg gap-stack-lg">
        {/* Header */}
        <div className="flex flex-col gap-1 pt-stack-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary">
              <span className="material-symbols-outlined text-[28px]">analytics</span>
              <h1 className="font-display-lg text-2xl md:text-3xl font-bold text-on-surface">
                Journey Insights
              </h1>
            </div>
            <Link
              href={`/trains/${trainId}`}
              className="px-4 py-2 rounded-xl bg-surface text-on-surface border border-outline-variant/30 text-xs md:text-sm font-semibold hover:bg-surface-container transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <span className="material-symbols-outlined text-[18px]">near_me</span>
              <span>Back to Live Map</span>
            </Link>
          </div>
          <p className="font-body-lg text-xs md:text-sm text-on-surface-variant max-w-2xl mt-1">
            Predictive analytics, route elevation topography, and en-route weather forecasts for{" "}
            <span className="font-bold text-on-surface">
              {liveData?.train.name || "Train"} ({trainId})
            </span>
            .
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-stack-md">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-stack-md">
              <Skeleton className="h-64 rounded-2xl" />
              <Skeleton className="h-64 lg:col-span-2 rounded-2xl" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-stack-md">
              <Skeleton className="h-64 rounded-2xl" />
              <Skeleton className="h-64 rounded-2xl" />
            </div>
          </div>
        ) : (
          analyticsData && (
            <div className="space-y-stack-md">
              {/* Row 1: Delay Prediction Widget + Elevation Profile */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-stack-md w-full">
                {/* Delay Prediction */}
                <div className="col-span-1">
                  <DelayRiskCard analytics={analyticsData.delayAnalytics} />
                </div>

                {/* Elevation Profile */}
                <div className="col-span-1 lg:col-span-2">
                  <ElevationChart
                    elevationProfile={analyticsData.elevationProfile}
                    maxElevationMeters={analyticsData.maxElevationMeters}
                    minElevationMeters={analyticsData.minElevationMeters}
                    highestPointLocation={analyticsData.highestPointLocation}
                  />
                </div>
              </div>

              {/* Row 2: En-route Weather Forecast + Major Hub Amenities */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-stack-md w-full">
                {/* Weather Forecast List */}
                <EnrouteWeatherList
                  weatherList={weatherData?.enRouteStations || []}
                  rainAlert={weatherData?.rainAlongRouteAlert}
                />

                {/* Station Amenities */}
                <StationAmenitiesGrid amenities={analyticsData.stationAmenities} />
              </div>
            </div>
          )
        )}
      </div>
    </AppLayout>
  );
}
