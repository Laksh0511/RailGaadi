"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    } else {
      router.push("/search");
    }
  };

  return (
    <div className="bg-surface font-body-lg text-on-surface selection:bg-secondary-container selection:text-on-secondary-container min-h-screen flex flex-col">
      {/* Top Header */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-outline-variant/20">
        <div className="h-20 w-full px-container-margin flex items-center justify-between mx-auto max-w-7xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-on-primary shadow-sm">
              <span className="material-symbols-outlined text-[24px]">train</span>
            </div>
            <span className="font-headline-md text-2xl font-bold tracking-tight text-primary">
              Railly
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/trains/22436"
              className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors font-medium"
            >
              Live Tracker
            </Link>
            <Link
              href="/search"
              className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors font-medium"
            >
              Search Trains
            </Link>
            <Link
              href="/trains/12951/analytics"
              className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors font-medium"
            >
              Insights & Elevation
            </Link>
            <Link
              href="/trips"
              className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors font-medium"
            >
              My Trips
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/search"
              className="px-5 py-2.5 bg-primary text-on-primary rounded-xl font-label-caps text-label-caps hover:bg-primary-container transition-all shadow-sm font-semibold"
            >
              TRACK A TRAIN
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full pt-20 bg-surface flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="relative w-full overflow-hidden bg-surface pt-12 pb-20 md:pt-20 md:pb-28 px-container-margin">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-16 relative z-10">
            {/* Text Content */}
            <div className="w-full lg:w-1/2 flex flex-col gap-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full font-label-caps text-label-caps self-center lg:self-start w-max border border-primary/20 backdrop-blur-sm shadow-xs">
                <span className="material-symbols-outlined text-[16px] animate-pulse text-secondary">
                  satellite_alt
                </span>
                LIVE NOW ACROSS INDIA
              </div>

              <h1 className="font-display-lg text-[40px] leading-[1.15] md:text-[54px] lg:text-[60px] font-bold text-on-surface tracking-tight">
                The Ultimate Companion for Every{" "}
                <span className="text-primary relative inline-block">
                  Indian Rail
                  <svg
                    className="absolute -bottom-2 left-0 w-full h-3 text-secondary/40 -z-10"
                    preserveAspectRatio="none"
                    viewBox="0 0 100 20"
                  >
                    <path
                      d="M0 10 Q 50 20 100 10"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                  </svg>
                </span>{" "}
                Journey.
              </h1>

              <p className="font-body-lg text-body-lg text-on-surface-variant md:text-[19px] md:leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Real-time tracking, AI-powered delay predictions, and seamless trip management.
                High-precision analytics designed for the modern commuter.
              </p>

              {/* Quick Search Form */}
              <form
                onSubmit={handleSearchSubmit}
                className="w-full max-w-lg mx-auto lg:mx-0 bg-surface rounded-2xl shadow-xl border border-outline-variant/30 p-2 flex items-center gap-2 mt-2"
              >
                <span className="material-symbols-outlined text-primary text-[24px] ml-2">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter train number (e.g. 22436, 12951) or name..."
                  className="flex-1 bg-transparent border-none text-body-sm md:text-body-lg text-on-surface placeholder:text-on-surface-variant/40 focus:ring-0 outline-none"
                />
                <button
                  type="submit"
                  className="px-5 py-3 bg-primary text-on-primary rounded-xl font-semibold text-sm hover:bg-primary-container transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <span>Track</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </form>

              {/* Quick Preset Badges */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-1 text-xs">
                <span className="text-on-surface-variant font-medium">Try popular:</span>
                <Link
                  href="/trains/22436"
                  className="px-3 py-1 rounded-full bg-surface-container hover:bg-surface-variant font-data-mono text-primary font-bold transition-colors border border-outline-variant/20"
                >
                  22436 Vande Bharat
                </Link>
                <Link
                  href="/trains/12951"
                  className="px-3 py-1 rounded-full bg-surface-container hover:bg-surface-variant font-data-mono text-primary font-bold transition-colors border border-outline-variant/20"
                >
                  12951 Rajdhani
                </Link>
                <Link
                  href="/trains/12004"
                  className="px-3 py-1 rounded-full bg-surface-container hover:bg-surface-variant font-data-mono text-primary font-bold transition-colors border border-outline-variant/20"
                >
                  12004 Shatabdi
                </Link>
              </div>

            </div>

            {/* Hero Visual */}
            <div className="w-full lg:w-1/2 relative mt-4 lg:mt-0">
              <div className="relative w-full aspect-[16/9] max-w-[600px] mx-auto rounded-3xl overflow-hidden shadow-2xl border border-outline-variant/20">
                <img
                  src="https://lh3.googleusercontent.com/aida/AEtjO1XvaqFhRsNsD7ehPgnKS3otZXWhXfQdZn5W4cuuOhi0nUmg405EfBMZpXBgM5XVAtlwFb_g1x-e4o34GnL1FEQHsjpUEysyGY9L56LW179LoNLcqWi513YsKoYb4j4E3TF1XDeQZ2s9NDh9Iq_wpDA6II8KCce0X38bwXl5iXPGTVQcBtzTinz8vUGBnZHCyBMmcnm2cj48VPaMazgiq5BMZX7ElbJKfenBayZvNUQJzY7NaJaovZXhAA"
                  alt="Modern high-speed Indian train travelling through a scenic landscape"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid Section */}
        <section className="w-full bg-surface-container-low py-20 px-container-margin relative border-t border-outline-variant/20">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="font-display-lg text-[32px] md:text-[40px] font-bold text-on-surface mb-3 tracking-tight">
                Precision engineering for your itinerary.
              </h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant">
                We've rebuilt the railway journey tracking experience with high clarity, real-time
                positioning, and environmental intelligence.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {/* Feature 1 */}
              <div className="bg-surface rounded-3xl p-8 border border-outline-variant/30 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-primary-container/20 text-primary flex items-center justify-center mb-6 border border-primary/10">
                    <span className="material-symbols-outlined text-[26px]">route</span>
                  </div>
                  <h3 className="font-headline-md text-xl font-bold text-on-surface mb-2">
                    Live Intelligence
                  </h3>
                  <p className="font-body-sm text-sm text-on-surface-variant mb-6">
                    Station-by-station live telemetry with animated tracks, smooth GPS
                    interpolation, and accurate platform information.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="bg-surface rounded-3xl p-8 border border-outline-variant/30 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-secondary-container/40 text-on-secondary-container flex items-center justify-center mb-6 border border-secondary/20">
                    <span className="material-symbols-outlined text-[26px]">insights</span>
                  </div>
                  <h3 className="font-headline-md text-xl font-bold text-on-surface mb-2">
                    Predictive Delay Alerts
                  </h3>
                  <p className="font-body-sm text-sm text-on-surface-variant mb-6">
                    Machine learning models analyzing 30+ past journeys, track congestion, and
                    weather to forecast delays before they occur.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="bg-surface rounded-3xl p-8 border border-outline-variant/30 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-surface-container-high text-on-surface flex items-center justify-center mb-6 border border-outline-variant/40">
                    <span className="material-symbols-outlined text-[26px]">folder_special</span>
                  </div>
                  <h3 className="font-headline-md text-xl font-bold text-on-surface mb-2">
                    Trip Cloud & PNR
                  </h3>
                  <p className="font-body-sm text-sm text-on-surface-variant mb-6">
                    Synchronize your tickets, coach/seat allocations, and live departure countdowns
                    in one unified personal travel companion.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
