import React from "react";
import { DelayAnalytics } from "@/types/route";

interface DelayRiskCardProps {
  analytics: DelayAnalytics;
}

export function DelayRiskCard({ analytics }: DelayRiskCardProps) {
  const isHighRisk = analytics.delayRiskLevel === "HIGH";
  const isModerateRisk = analytics.delayRiskLevel === "MODERATE";

  const riskColor = isHighRisk
    ? "text-error"
    : isModerateRisk
    ? "text-amber-800"
    : "text-emerald-800";

  const glowBg = isHighRisk
    ? "bg-error-container/40"
    : isModerateRisk
    ? "bg-amber-500/20"
    : "bg-emerald-500/20";

  return (
    <div className="bg-surface rounded-2xl shadow-md border border-outline-variant/30 p-stack-md flex flex-col gap-stack-sm relative overflow-hidden group">
      {/* Ambient background glow */}
      <div
        className={`absolute -right-12 -top-12 w-48 h-48 rounded-full blur-3xl transition-transform group-hover:scale-125 duration-700 ease-in-out ${glowBg}`}
      />

      {/* Top Header */}
      <div className="flex items-center justify-between mb-base z-10">
        <div className="flex items-center gap-2 text-on-surface">
          <span className={`material-symbols-outlined text-[22px] ${riskColor}`}>
            {isHighRisk ? "warning" : isModerateRisk ? "schedule" : "check_circle"}
          </span>
          <h2 className="font-headline-sm text-base md:text-lg font-bold">Delay Risk</h2>
        </div>
        <span className="font-label-caps text-[11px] text-on-surface-variant/80 bg-surface-container px-2.5 py-1 rounded-md font-semibold border border-outline-variant/20">
          AI PREDICTED
        </span>
      </div>

      {/* Primary Value */}
      <div className="flex flex-col gap-1 z-10">
        <span className={`font-display-lg text-3xl md:text-4xl font-bold ${riskColor}`}>
          {analytics.predictedDestinationDelayMinutes > 0
            ? `${analytics.predictedDestinationDelayMinutes} min`
            : "0 min"}
        </span>
        <span className="font-body-sm text-sm text-on-surface-variant">
          Estimated arrival delay at destination.
        </span>
        <p className="text-xs text-on-surface-variant/80 mt-1">{analytics.riskDescription}</p>
      </div>

      {/* Historical Comparison Bar */}
      <div className="mt-auto pt-stack-sm z-10">
        <div className="flex justify-between font-label-caps text-xs text-on-surface-variant mb-1.5 font-medium">
          <span>Historical Average</span>
          <span className="font-bold">+{analytics.historicalAvgDelayMinutes} min</span>
        </div>
        <div className="w-full h-2.5 bg-surface-container rounded-full overflow-hidden flex">
          <div className="h-full bg-outline-variant w-[55%] rounded-l-full" />
          <div
            className={`h-full ${
              isHighRisk ? "bg-error" : isModerateRisk ? "bg-amber-700" : "bg-emerald-700"
            } w-[20%] rounded-r-full relative`}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-sm ring-1 ring-black/10" />
          </div>
        </div>
        <div className="mt-2.5 flex items-center justify-between font-data-mono text-[11px] text-on-surface-variant/70">
          <span>Based on past {analytics.pastTripsCount} trips</span>
          <span className="text-primary font-semibold">
            {analytics.onTimeArrivalPercentage}% on-time rate
          </span>
        </div>
      </div>
    </div>
  );
}
