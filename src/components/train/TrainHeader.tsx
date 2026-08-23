"use client";

import React, { useState, useEffect } from "react";
import { Train, TrainLiveStatus } from "@/types/train";
import { toggleFavouriteTrain, getFavouriteTrainNumbers } from "@/lib/storage";

interface TrainHeaderProps {
  train: Train;
  status: TrainLiveStatus;
}

export function TrainHeader({ train, status }: TrainHeaderProps) {
  const [isFav, setIsFav] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const favs = getFavouriteTrainNumbers();
    setIsFav(favs.includes(train.number));
  }, [train.number]);

  const handleToggleFav = () => {
    const nextState = toggleFavouriteTrain(train.number);
    setIsFav(nextState);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `${train.name} (${train.number}) - Railly Live Tracking`,
          text: `Track live position and delay for ${train.name} (${train.number}) on Railly`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isDelayed = status.delayMinutes > 0;
  const statusColor = isDelayed
    ? "bg-amber-500/20 text-amber-900 border-amber-500/30"
    : "bg-emerald-500/10 text-emerald-800 border-emerald-500/30";

  return (
    <div className="px-container-margin md:px-stack-lg py-stack-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      {/* Train Identity */}
      <div className="flex items-center gap-stack-md">
        <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-on-primary shadow-md flex-shrink-0">
          <span className="material-symbols-outlined text-[26px]">train</span>
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-headline-md text-xl md:text-2xl font-bold text-on-surface">
              {train.name} ({train.number})
            </h1>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-label-caps font-semibold uppercase tracking-wider border ${statusColor}`}
            >
              {isDelayed ? `Delayed ${status.delayMinutes}m` : "On Time"}
            </span>
          </div>
          <p className="font-body-sm text-xs md:text-sm text-on-surface-variant flex items-center gap-1.5 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
            Live Status • {train.origin.name} ({train.origin.code}) to {train.destination.name} (
            {train.destination.code})
          </p>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
        <button
          onClick={handleToggleFav}
          title={isFav ? "Remove from favourites" : "Add to favourites"}
          className={`px-3.5 py-2 rounded-xl text-body-sm font-medium shadow-sm flex items-center gap-1.5 transition-all border ${
            isFav
              ? "bg-secondary-container text-on-secondary-container border-secondary/30"
              : "bg-surface text-on-surface border-outline-variant/30 hover:bg-surface-container"
          }`}
        >
          <span
            className="material-symbols-outlined text-[18px]"
            style={{ fontVariationSettings: isFav ? "'FILL' 1" : "'FILL' 0" }}
          >
            star
          </span>
          <span className="hidden sm:inline">{isFav ? "Saved" : "Save"}</span>
        </button>

        <button
          onClick={handleShare}
          className="px-3.5 py-2 rounded-xl bg-surface text-on-surface border border-outline-variant/30 text-body-sm font-medium shadow-sm flex items-center gap-1.5 hover:bg-surface-container transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">share</span>
          <span>{copied ? "Copied Link!" : "Share"}</span>
        </button>

        <a
          href={`/trains/${train.number}/analytics`}
          className="px-4 py-2 rounded-xl bg-primary text-on-primary font-body-sm font-semibold shadow-sm hover:bg-primary-container transition-colors flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[18px]">analytics</span>
          <span>Insights</span>
        </a>
      </div>
    </div>
  );
}
