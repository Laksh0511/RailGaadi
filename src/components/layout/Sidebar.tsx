"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { twMerge } from "tailwind-merge";

interface SidebarProps {
  currentTrainId?: string;
}

export function Sidebar({ currentTrainId = "22436" }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Live Tracker",
      icon: "near_me",
      href: `/trains/${currentTrainId}`,
      active: pathname.startsWith("/trains") && !pathname.includes("/analytics"),
    },
    {
      label: "My Trips",
      icon: "confirmation_number",
      href: "/trips",
      active: pathname === "/trips",
    },
    {
      label: "Search Trains",
      icon: "search",
      href: "/search",
      active: pathname === "/search",
    },
    {
      label: "Journey Insights",
      icon: "analytics",
      href: `/trains/${currentTrainId}/analytics`,
      active: pathname.includes("/analytics"),
    },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-surface-container-low z-50 flex flex-col border-r border-outline-variant/30 transition-all duration-300 hidden md:flex">
      {/* Brand Header */}
      <div className="p-stack-lg flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-sm">
          <span className="material-symbols-outlined text-[22px]">train</span>
        </div>
        <Link href="/" className="flex flex-col">
          <span className="font-headline-sm text-headline-sm text-primary tracking-tight font-bold">
            Railly
          </span>
          <span className="text-[10px] font-label-caps text-on-surface-variant/70 uppercase tracking-widest -mt-1">
            Journey Intelligence
          </span>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-stack-md mt-base space-y-stack-sm">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={twMerge(
              "flex items-center px-stack-md py-stack-md rounded-xl transition-all group font-medium text-body-sm",
              item.active
                ? "bg-primary-container text-on-primary-container font-bold shadow-sm"
                : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
            )}
          >
            <span
              className={twMerge(
                "material-symbols-outlined mr-3 text-[22px] transition-transform group-hover:scale-110",
                item.active ? "text-on-primary-container" : "text-on-surface-variant"
              )}
            >
              {item.icon}
            </span>
            <span>{item.label}</span>
          </Link>
        ))}

        <div className="pt-stack-lg pb-base px-stack-md text-label-caps font-label-caps text-on-surface-variant/60 uppercase tracking-wider">
          Preferences
        </div>

        <Link
          href="/search"
          className="flex items-center px-stack-md py-stack-md rounded-xl text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all group"
        >
          <span className="material-symbols-outlined mr-3 text-[22px] group-hover:scale-110 transition-transform">
            tune
          </span>
          <span className="font-body-sm">Rail Radar Sync</span>
          <span className="ml-auto w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        </Link>
      </nav>

    </aside>
  );
}
