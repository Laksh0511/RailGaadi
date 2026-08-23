"use client";

import React from "react";
import Link from "next/link";

interface HeaderProps {
  onOpenSearch?: () => void;
  onToggleMobileMenu?: () => void;
}

export function Header({ onOpenSearch, onToggleMobileMenu }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 md:left-72 right-0 h-16 bg-surface/80 backdrop-blur-xl z-40 flex items-center justify-between px-container-margin md:px-stack-lg gap-stack-lg shadow-[0_1px_8px_rgba(0,0,0,0.02)] border-b border-outline-variant/20">
      {/* Mobile Brand / Toggle */}
      <div className="flex items-center gap-3 md:hidden">
        <button
          onClick={onToggleMobileMenu}
          className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-on-surface"
          aria-label="Toggle Navigation"
        >
          <span className="material-symbols-outlined text-[22px]">menu</span>
        </button>
        <Link href="/" className="font-headline-sm text-primary font-bold">
          Railly
        </Link>
      </div>

      {/* Global Spotlight Search Trigger */}
      <div className="flex-1 max-w-md hidden sm:flex">
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-base px-base py-stack-sm bg-surface-container hover:bg-surface-container-high transition-colors rounded-full w-full border border-outline-variant/20 text-left text-on-surface-variant cursor-pointer group"
        >
          <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary text-[20px] transition-colors">
            search
          </span>
          <span className="text-body-sm text-on-surface-variant/60 flex-1">
            Search PNR, Train, Station...
          </span>
          <kbd className="text-label-caps bg-surface px-2 py-0.5 rounded border border-outline-variant/30 text-on-surface-variant/70 font-mono text-[10px]">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-stack-md ml-auto">
        <button
          onClick={onOpenSearch}
          className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface sm:hidden"
          aria-label="Search"
        >
          <span className="material-symbols-outlined text-[20px]">search</span>
        </button>
      </div>
    </header>
  );
}
