"use client";

import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup, CircleMarker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { LiveTrainData, StationStatus } from "@/types/train";
import { RouteDetail } from "@/services/routeService";

// Helper component to auto-pan / follow train
function MapController({
  trainPos,
  followTrain,
  bounds,
}: {
  trainPos: [number, number];
  followTrain: boolean;
  bounds: [number, number][];
}) {
  const map = useMap();
  const initialFitRef = useRef(false);

  useEffect(() => {
    if (!initialFitRef.current && bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50] });
      initialFitRef.current = true;
    }
  }, [bounds, map]);

  useEffect(() => {
    if (followTrain && trainPos) {
      map.panTo(trainPos, { animate: true, duration: 1 });
    }
  }, [trainPos, followTrain, map]);

  return null;
}

interface JourneyMapProps {
  liveData: LiveTrainData;
  routeDetail?: RouteDetail | null;
  className?: string;
}

export function JourneyMap({ liveData, routeDetail, className = "" }: JourneyMapProps) {
  const [followTrain, setFollowTrain] = useState(true);
  const [mapStyle, setMapStyle] = useState<"light" | "dark" | "outdoors">("light");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [liveSpeed, setLiveSpeed] = useState(liveData.status.currentSpeedKmh || 132);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Speed micro-fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      const delta = Math.floor(Math.random() * 3) - 1;
      setLiveSpeed((prev) => Math.min(138, Math.max(122, prev + delta)));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const trainLat = liveData.position.latitude;
  const trainLon = liveData.position.longitude;
  const trainPos: [number, number] = [trainLat, trainLon];

  // Coordinates for completed and remaining lines
  const completedCoords =
    routeDetail?.completedCoordinates ||
    liveData.stations.map((s) => [s.station.latitude, s.station.longitude] as [number, number]);

  const remainingCoords =
    routeDetail?.remainingCoordinates ||
    liveData.stations.map((s) => [s.station.latitude, s.station.longitude] as [number, number]);

  const allBounds =
    routeDetail?.allCoordinates && routeDetail.allCoordinates.length > 0
      ? routeDetail.allCoordinates
      : liveData.stations.map((s) => [s.station.latitude, s.station.longitude] as [number, number]);

  // Create custom animated Train marker HTML icon
  const trainIconHtml = `
    <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2">
      <div class="absolute w-8 h-8 rounded-full bg-secondary-fixed-dim/40 animate-ping"></div>
      <div class="relative w-7 h-7 rounded-full bg-primary border-2 border-white shadow-xl flex items-center justify-center text-white" style="transform: rotate(${liveData.position.heading || 0}deg);">
        <span class="material-symbols-outlined text-[16px]">navigation</span>
      </div>
    </div>
  `;

  const trainIcon = L.divIcon({
    html: trainIconHtml,
    className: "train-live-marker",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });

  const tileUrls = {
    light: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    outdoors: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  };

  const toggleFullscreen = () => {
    if (!mapContainerRef.current) return;
    if (!document.fullscreenElement) {
      mapContainerRef.current.requestFullscreen().catch((err) => console.error(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch((err) => console.error(err));
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={mapContainerRef}
      className={`relative w-full h-full min-h-[380px] md:min-h-[460px] rounded-2xl overflow-hidden shadow-sm border border-outline-variant/30 ${className}`}
    >
      {/* Top HUD: Speedometer & Next Stop Pill */}
      <div className="absolute inset-x-0 top-0 p-4 z-[400] flex justify-between items-start pointer-events-none gap-2">
        {/* Speedometer Badge */}
        <div className="bg-surface/90 backdrop-blur-md px-3 py-2 rounded-xl shadow-md border border-outline-variant/20 pointer-events-auto flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary-container/20 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">speed</span>
          </div>
          <div>
            <div className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider">
              Current Speed
            </div>
            <div className="font-data-mono text-base font-bold text-on-surface">
              {liveSpeed} <span className="text-xs font-normal text-on-surface-variant">km/h</span>
            </div>
          </div>
        </div>

        {/* Next Stop Pill */}
        {liveData.nextStation && (
          <div className="bg-surface/90 backdrop-blur-md px-3 py-2 rounded-xl shadow-md border border-outline-variant/20 pointer-events-auto flex flex-col items-end text-right">
            <div className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider">
              Next Stop
            </div>
            <div className="font-headline-sm text-sm md:text-base font-bold text-on-surface tracking-tight">
              {liveData.nextStation.station.name}
            </div>
            <div className="font-data-mono text-xs text-primary flex items-center gap-1">
              ETA {liveData.nextStation.estimatedArrival || liveData.nextStation.scheduledArrival}{" "}
              <span className="text-secondary font-bold text-[11px]">(On Time)</span>
            </div>
          </div>
        )}
      </div>

      {/* Map Controls (Right Floating) */}
      <div className="absolute right-4 bottom-24 md:bottom-20 z-[400] flex flex-col gap-2 pointer-events-auto">
        <button
          onClick={() => setFollowTrain(!followTrain)}
          title={followTrain ? "Lock Camera on Train" : "Free Camera"}
          className={`w-10 h-10 rounded-xl shadow-md flex items-center justify-center transition-all ${
            followTrain
              ? "bg-primary text-on-primary ring-2 ring-primary/30 shadow-primary/20"
              : "bg-surface text-on-surface-variant hover:bg-surface-container"
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">near_me</span>
        </button>

        <button
          onClick={() =>
            setMapStyle((prev) => (prev === "light" ? "dark" : prev === "dark" ? "outdoors" : "light"))
          }
          title="Toggle Map Style"
          className="w-10 h-10 rounded-xl bg-surface hover:bg-surface-container text-on-surface shadow-md flex items-center justify-center transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">layers</span>
        </button>

        <button
          onClick={toggleFullscreen}
          title="Fullscreen Mode"
          className="w-10 h-10 rounded-xl bg-surface hover:bg-surface-container text-on-surface shadow-md flex items-center justify-center transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">
            {isFullscreen ? "fullscreen_exit" : "fullscreen"}
          </span>
        </button>
      </div>

      {/* Bottom Journey Progress Overlay */}
      <div className="absolute bottom-4 left-4 right-4 bg-surface/90 backdrop-blur-xl rounded-xl shadow-lg border border-outline-variant/30 p-3.5 z-[400] pointer-events-auto">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-label-caps text-xs text-on-surface font-semibold uppercase tracking-wider">
              Journey Progress
            </span>
          </div>
          <span className="font-data-mono text-sm text-primary font-bold">
            {liveData.progress.percentage}%
          </span>
        </div>
        <div className="w-full h-2 bg-surface-variant rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-1000 ease-in-out shadow-sm"
            style={{ width: `${liveData.progress.percentage}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 font-data-mono text-xs text-on-surface-variant">
          <span>
            {liveData.train.origin.code} ({liveData.progress.distanceCoveredKm} km)
          </span>
          <span className="text-secondary font-semibold">
            {liveData.progress.distanceRemainingKm} km remaining
          </span>
          <span>{liveData.train.destination.code}</span>
        </div>
      </div>

      {/* Leaflet Map */}
      <MapContainer
        center={trainPos}
        zoom={6}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url={tileUrls[mapStyle]}
        />

        <MapController trainPos={trainPos} followTrain={followTrain} bounds={allBounds} />

        {/* Remaining Route Polyline (Dashed subtle line) */}
        {remainingCoords.length > 1 && (
          <Polyline
            positions={remainingCoords}
            color="#003b72"
            weight={4}
            opacity={0.35}
            dashArray="6, 8"
          />
        )}

        {/* Completed Route Polyline (Solid prominent glow line) */}
        {completedCoords.length > 1 && (
          <Polyline
            positions={completedCoords}
            color="#00529b"
            weight={5}
            opacity={0.9}
          />
        )}

        {/* Station Markers */}
        {liveData.stations.map((stop, idx) => {
          const isPassed = stop.status === "COMPLETED";
          const isCurrent = stop.status === "CURRENT";
          const markerColor = isCurrent ? "#e9c400" : isPassed ? "#003b72" : "#727782";

          return (
            <CircleMarker
              key={`${stop.station.code}-${idx}`}
              center={[stop.station.latitude, stop.station.longitude]}
              radius={isCurrent ? 7 : isPassed ? 5 : 4}
              fillColor={markerColor}
              color="#ffffff"
              weight={2}
              fillOpacity={1}
            >
              <Popup className="station-popup">
                <div className="p-1 min-w-[160px]">
                  <div className="font-bold text-sm text-primary">{stop.station.name} ({stop.station.code})</div>
                  <div className="text-xs text-on-surface-variant mt-1">
                    {stop.scheduledArrival ? `Arrival: ${stop.scheduledArrival}` : `Dep: ${stop.scheduledDeparture}`}
                  </div>
                  {stop.platform && (
                    <div className="text-[11px] text-secondary font-semibold mt-0.5">
                      Platform {stop.platform}
                    </div>
                  )}
                  <div className="text-[10px] text-outline mt-1 font-mono">
                    {stop.distanceFromOriginKm} km from origin
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

        {/* Live Train Marker */}
        <Marker position={trainPos} icon={trainIcon}>
          <Popup>
            <div className="p-1">
              <div className="font-bold text-sm text-primary">
                {liveData.train.name} ({liveData.train.number})
              </div>
              <div className="text-xs text-on-surface-variant mt-0.5">
                Speed: {liveSpeed} km/h • {liveData.status.state}
              </div>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
