"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { Train } from "@/types/train";
import { getRecentSearches, saveRecentSearch, removeRecentSearch, RecentSearchItem } from "@/lib/storage";
import { Skeleton } from "@/components/ui/Skeleton";

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [runsTodayOnly, setRunsTodayOnly] = useState(false);
  const [results, setResults] = useState<Train[]>([]);
  const [recentSearches, setRecentSearches] = useState<RecentSearchItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  // Fetch initial results or perform search when query / runsToday changes
  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const debounceTimer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/trains/search?q=${encodeURIComponent(q)}&runsToday=${runsTodayOnly}`
        );
        const json = await res.json();
        setResults(json.data || []);
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(debounceTimer);
  }, [query, runsTodayOnly]);

  const handleSelectTrain = (train: Train) => {
    saveRecentSearch(train);
    router.push(`/trains/${train.number}`);
  };

  const handleSelectRecent = (trainNumber: string) => {
    setQuery(trainNumber);
    router.push(`/trains/${trainNumber}`);
  };

  const handleRemoveRecent = (e: React.MouseEvent, trainNumber: string) => {
    e.stopPropagation();
    const updated = removeRecentSearch(trainNumber);
    setRecentSearches(updated);
  };

  return (
    <div className="relative z-10 flex flex-col items-center pb-stack-lg w-full max-w-3xl mx-auto space-y-stack-lg">
      {/* Header Typography */}
      <div className="flex flex-col items-center text-center space-y-stack-sm pt-4 animate-fade-in-up">
        <h1 className="font-display-lg text-3xl md:text-4xl font-bold text-on-background tracking-tight">
          Find Your Train
        </h1>
        <p className="font-body-lg text-sm md:text-base text-on-surface-variant max-w-md">
          Enter a train name, 5-digit number, or station to get real-time tracking, delay
          forecasts, and schedules.
        </p>
      </div>

      {/* Spotlight Search Bar */}
      <div className="w-full relative shadow-xl shadow-surface-variant/30 rounded-[2rem] transition-all duration-300 group hover:shadow-2xl focus-within:shadow-2xl">
        <div className="absolute inset-0 bg-surface rounded-[2rem] blur-xl opacity-50 group-focus-within:opacity-80 transition-opacity" />
        <div className="relative bg-surface/90 backdrop-blur-2xl rounded-[2rem] flex items-center px-4 py-3 border border-outline-variant/40 group-focus-within:border-primary/60 transition-colors">
          <span className="material-symbols-outlined text-[26px] text-on-surface-variant group-focus-within:text-primary transition-colors ml-2">
            search
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. 12951, 22436, Rajdhani, Shatabdi, NDLS..."
            className="flex-1 bg-transparent border-none focus:ring-0 font-headline-md text-base md:text-xl text-on-surface placeholder:text-on-surface-variant/40 ml-3 h-10 md:h-12 caret-primary outline-none"
            autoFocus
          />

          <div className="flex items-center gap-2">
            {/* Runs Today Toggle Switch */}
            <label className="flex items-center gap-2 cursor-pointer bg-surface-container-high hover:bg-surface-variant transition-colors px-3 py-1.5 rounded-full select-none">
              <div className="relative inline-block w-7 h-4">
                <input
                  type="checkbox"
                  checked={runsTodayOnly}
                  onChange={(e) => setRunsTodayOnly(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="w-7 h-4 bg-outline-variant/50 rounded-full peer-checked:bg-primary transition-colors" />
                <div className="absolute left-[2px] top-[2px] bg-white w-3 h-3 rounded-full transition-transform peer-checked:translate-x-3 shadow-xs" />
              </div>
              <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider hidden sm:inline">
                Runs Today
              </span>
            </label>

            <button
              onClick={() => query.trim() && setQuery(query.trim())}
              className="bg-primary hover:bg-primary-container text-on-primary rounded-full w-10 h-10 md:w-11 md:h-11 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-md shadow-primary/20"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Quick Access / Recent Searches */}
      <div className="w-full space-y-2">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
            history
          </span>
          <h2 className="font-label-caps text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
            Recent & Suggested
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {recentSearches.length > 0
            ? recentSearches.map((item) => (
                <div
                  key={item.trainNumber}
                  onClick={() => handleSelectRecent(item.trainNumber)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-surface hover:bg-surface-variant rounded-full text-on-surface transition-colors border border-outline-variant/30 text-xs shadow-xs cursor-pointer group"
                >
                  <span className="font-data-mono text-primary font-bold">{item.trainNumber}</span>
                  <span>{item.trainName}</span>
                  <button
                    onClick={(e) => handleRemoveRecent(e, item.trainNumber)}
                    className="text-on-surface-variant hover:text-error ml-1"
                    title="Remove"
                  >
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                </div>
              ))
            : [
                { num: "22436", name: "Vande Bharat" },
                { num: "12951", name: "Mumbai Rajdhani" },
                { num: "12004", name: "Swarn Shatabdi" },
                { num: "12002", name: "Bhopal Shatabdi" },
                { num: "12229", name: "Lucknow Mail" },
              ].map((preset) => (
                <button
                  key={preset.num}
                  onClick={() => handleSelectRecent(preset.num)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-surface hover:bg-surface-variant rounded-full text-on-surface transition-colors border border-outline-variant/30 text-xs shadow-xs"
                >
                  <span className="font-data-mono text-primary font-bold">{preset.num}</span>
                  <span>{preset.name}</span>
                </button>
              ))}
        </div>
      </div>

      {/* Search Results List */}
      {query.trim() && (
        <div className="w-full flex flex-col space-y-3 pt-2 animate-fade-in-up">
          <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
            <span className="font-label-caps text-xs text-on-surface-variant uppercase font-semibold">
              Results
            </span>
            <span className="font-body-sm text-xs text-on-surface-variant">
              {results.length} matches found
            </span>
          </div>

          {results.length > 0 ? (
            results.map((train) => {
              const isVande = train.type === "Vande Bharat";
              const isRaj = train.type === "Rajdhani";
              const isShat = train.type === "Shatabdi";

              const stripColor = isVande
                ? "bg-secondary"
                : isRaj
                ? "bg-primary"
                : isShat
                ? "bg-amber-500"
                : "bg-outline";

              const typeBadgeStyle = isVande
                ? "bg-secondary-container text-on-secondary-container"
                : isRaj
                ? "bg-primary-container text-on-primary-container"
                : "bg-surface-variant text-on-surface-variant";

              return (
                <div
                  key={train.number}
                  onClick={() => handleSelectTrain(train)}
                  className="group relative flex items-center bg-surface hover:bg-surface-container-lowest p-stack-md rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-lg shadow-surface-variant/20 border border-outline-variant/30"
                >
                  {/* Left color strip */}
                  <div
                    className={`absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-12 rounded-r-full ${stripColor}`}
                  />

                  <div className="flex-1 pl-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`px-2 py-0.5 rounded font-label-caps text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${typeBadgeStyle}`}
                      >
                        <span className="material-symbols-outlined text-[13px]">train</span>
                        {train.type}
                      </span>
                      <span className="font-data-mono text-sm font-bold text-primary">
                        {train.number}
                      </span>
                    </div>

                    <h3 className="font-headline-sm text-base md:text-lg font-bold text-on-surface group-hover:text-primary transition-colors">
                      {train.name}
                    </h3>

                    <div className="flex items-center gap-2 mt-1 text-on-surface-variant font-body-sm text-xs">
                      <span className="flex items-center gap-1 font-mono">
                        <span className="material-symbols-outlined text-[14px]">schedule</span>
                        {train.departureTime}
                      </span>
                      <span className="text-outline-variant">•</span>
                      <span className="font-semibold text-on-surface">{train.origin.code}</span>
                      <span className="material-symbols-outlined text-[14px] text-outline-variant">
                        arrow_right_alt
                      </span>
                      <span className="font-semibold text-on-surface">
                        {train.destination.code}
                      </span>
                      <span className="text-outline-variant hidden sm:inline">•</span>
                      <span className="hidden sm:inline">{train.duration}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span className="flex items-center gap-1 px-2.5 py-1 bg-surface-container rounded-full font-label-caps text-[11px] text-on-surface-variant">
                      <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                      {train.runsToday ? "Runs Today" : "Tomorrow"}
                    </span>
                    <span className="material-symbols-outlined text-outline-variant group-hover:text-primary group-hover:translate-x-1 transition-all">
                      chevron_right
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            !isLoading && (
              <div className="text-center py-16 bg-surface rounded-2xl border border-outline-variant/20 p-8 space-y-2">
                <span className="material-symbols-outlined text-4xl text-outline-variant">
                  train
                </span>
                <h3 className="font-bold text-on-surface">No trains found for "{query}"</h3>
                <p className="text-body-sm text-xs text-on-surface-variant max-w-sm mx-auto">
                  Try searching with a 5-digit train number like 12951, 22436, or station names
                  like New Delhi or Mumbai.
                </p>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <AppLayout>
      <div className="flex flex-col w-full relative min-h-[calc(100vh-4rem)] bg-background overflow-hidden px-container-margin py-stack-lg">
        {/* Ambient background glow elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-fixed-dim/20 blur-[120px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-secondary-fixed/15 blur-[100px]" />
        </div>

        <Suspense
          fallback={
            <div className="w-full max-w-3xl mx-auto space-y-4 pt-12">
              <Skeleton className="h-12 w-64 mx-auto rounded-xl" />
              <Skeleton className="h-16 w-full rounded-full" />
              <Skeleton className="h-40 w-full rounded-2xl" />
            </div>
          }
        >
          <SearchContent />
        </Suspense>
      </div>
    </AppLayout>
  );
}
