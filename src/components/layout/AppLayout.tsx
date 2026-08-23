"use client";

import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { CommandPalette } from "./CommandPalette";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { twMerge } from "tailwind-merge";

interface AppLayoutProps {
  children: React.ReactNode;
  currentTrainId?: string;
}

export function AppLayout({ children, currentTrainId = "22436" }: AppLayoutProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const mobileNavItems = [
    {
      label: "Live Tracker",
      icon: "near_me",
      href: `/trains/${currentTrainId}`,
      active: pathname.startsWith("/trains") && !pathname.includes("/analytics"),
    },
    {
      label: "Search",
      icon: "search",
      href: "/search",
      active: pathname === "/search",
    },
    {
      label: "Insights",
      icon: "analytics",
      href: `/trains/${currentTrainId}/analytics`,
      active: pathname.includes("/analytics"),
    },
    {
      label: "My Trips",
      icon: "confirmation_number",
      href: "/trips",
      active: pathname === "/trips",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col selection:bg-secondary-container selection:text-on-secondary-container">
      {/* Desktop Sidebar */}
      <Sidebar currentTrainId={currentTrainId} />

      {/* Top Header */}
      <Header
        onOpenSearch={() => setIsSearchOpen(true)}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      {/* Main Content Area */}
      <main className="md:pl-72 pt-16 flex-1 flex flex-col pb-20 md:pb-6">
        {children}
      </main>

      {/* Mobile Drawer Navigation (if opened) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-on-surface/40 backdrop-blur-sm">
          <div
            className="fixed inset-0"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close menu"
          />
          <div className="fixed left-0 top-0 bottom-0 w-72 bg-surface p-6 flex flex-col gap-6 shadow-2xl z-10 animate-fade-in-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-on-primary font-bold">
                  <span className="material-symbols-outlined text-[18px]">train</span>
                </div>
                <span className="font-headline-sm text-primary font-bold">Railly</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <nav className="flex flex-col gap-2">
              {mobileNavItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={twMerge(
                    "flex items-center px-4 py-3 rounded-xl gap-3 text-body-sm font-medium transition-colors",
                    item.active
                      ? "bg-primary-container text-on-primary-container font-bold"
                      : "text-on-surface hover:bg-surface-container"
                  )}
                >
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}


      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-surface/90 backdrop-blur-xl border-t border-outline-variant/30 z-40 flex items-center justify-around px-2 md:hidden">
        {mobileNavItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={twMerge(
              "flex flex-col items-center justify-center w-full h-full gap-0.5 transition-colors",
              item.active ? "text-primary font-semibold" : "text-on-surface-variant"
            )}
          >
            <span
              className={twMerge(
                "material-symbols-outlined text-[22px]",
                item.active && "scale-110 transition-transform"
              )}
            >
              {item.icon}
            </span>
            <span className="text-[10px] font-label-caps">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Global Command Palette */}
      <CommandPalette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
}
