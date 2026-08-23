"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Train } from "@/types/train";
import { getRecentSearches, saveRecentSearch, RecentSearchItem } from "@/lib/storage";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Train[]>([]);
  const [recentSearches, setRecentSearches] = useState<RecentSearchItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setRecentSearches(getRecentSearches());
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent handles toggle
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/trains/search?q=${encodeURIComponent(query)}`);
        const json = await res.json();
        setResults(json.data || []);
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelectTrain = (train: Train) => {
    saveRecentSearch(train);
    onClose();
    router.push(`/trains/${train.number}`);
  };

  const handleSelectRecent = (trainNumber: string) => {
    onClose();
    router.push(`/trains/${trainNumber}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-on-surface/40 backdrop-blur-sm animate-fade-in-up">
      <div
        className="fixed inset-0 -z-10"
        onClick={onClose}
        aria-label="Close search overlay"
      />
      <div className="w-full max-w-2xl bg-surface/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-outline-variant/30 overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input */}
        <div className="flex items-center px-stack-lg py-4 border-b border-outline-variant/20 gap-3">
          <span className="material-symbols-outlined text-[24px] text-primary">search</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search train by number (e.g. 12951, 22436), name, or station..."
            className="flex-1 bg-transparent border-none text-body-lg text-on-surface placeholder:text-on-surface-variant/40 focus:ring-0 outline-none"
          />
          {isLoading && (
            <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          )}
          <kbd className="hidden sm:inline-block text-[10px] font-label-caps bg-surface-container px-2 py-1 rounded text-on-surface-variant/60">
            ESC
          </kbd>
        </div>

        {/* Search Results / Recent Searches */}
        <div className="flex-1 overflow-y-auto p-stack-md space-y-stack-sm">
          {query.trim() && results.length > 0 && (
            <div className="space-y-2">
              <div className="px-3 text-label-caps text-on-surface-variant uppercase font-semibold">
                Live Trains ({results.length})
              </div>
              {results.map((train) => (
                <div
                  key={train.number}
                  onClick={() => handleSelectTrain(train)}
                  className="flex items-center justify-between p-3 rounded-2xl bg-surface hover:bg-primary-container/10 border border-outline-variant/20 hover:border-primary/40 cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-container/20 text-primary flex items-center justify-center font-bold text-sm">
                      <span className="material-symbols-outlined text-[20px]">train</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-data-mono font-bold text-primary">{train.number}</span>
                        <span className="font-semibold text-on-surface group-hover:text-primary transition-colors">
                          {train.name}
                        </span>
                      </div>
                      <div className="text-body-sm text-on-surface-variant text-xs mt-0.5">
                        {train.origin.code} ({train.origin.name}) → {train.destination.code} (
                        {train.destination.name})
                      </div>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-outline-variant group-hover:text-primary group-hover:translate-x-1 transition-all">
                    chevron_right
                  </span>
                </div>
              ))}
            </div>
          )}

          {query.trim() && !isLoading && results.length === 0 && (
            <div className="text-center py-12 text-on-surface-variant">
              <span className="material-symbols-outlined text-[36px] text-outline-variant mb-2">
                travel_explore
              </span>
              <p className="font-medium text-on-surface">No trains found for "{query}"</p>
              <p className="text-body-sm text-xs mt-1">
                Try searching using train number like 12951, 22436, or 12004
              </p>
            </div>
          )}

          {!query.trim() && recentSearches.length > 0 && (
            <div className="space-y-2">
              <div className="px-3 text-label-caps text-on-surface-variant uppercase font-semibold">
                Recent Searches
              </div>
              <div className="flex flex-wrap gap-2 px-2">
                {recentSearches.map((item) => (
                  <button
                    key={item.trainNumber}
                    onClick={() => handleSelectRecent(item.trainNumber)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-surface-container hover:bg-surface-variant rounded-full text-on-surface transition-colors border border-outline-variant/20 text-sm"
                  >
                    <span className="font-data-mono text-primary font-bold">{item.trainNumber}</span>
                    <span>{item.trainName}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {!query.trim() && (
            <div className="pt-stack-md space-y-2">
              <div className="px-3 text-label-caps text-on-surface-variant uppercase font-semibold">
                Featured Corridors
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { number: "22436", name: "Vande Bharat Exp", route: "NDLS → BSB" },
                  { number: "12951", name: "Mumbai Rajdhani", route: "MMCT → NDLS" },
                  { number: "12004", name: "Swarn Shatabdi", route: "NDLS → LKO" },
                  { number: "12002", name: "Bhopal Shatabdi", route: "NDLS → BPL" },
                ].map((feat) => (
                  <button
                    key={feat.number}
                    onClick={() => handleSelectRecent(feat.number)}
                    className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors text-left border border-outline-variant/20"
                  >
                    <div>
                      <div className="font-data-mono font-bold text-primary text-xs">{feat.number}</div>
                      <div className="font-medium text-sm text-on-surface">{feat.name}</div>
                    </div>
                    <span className="font-data-mono text-xs text-on-surface-variant bg-surface px-2 py-1 rounded">
                      {feat.route}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
