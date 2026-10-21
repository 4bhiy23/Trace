"use client";

import React, { useRef, useEffect } from "react";
import { Search, Send } from "lucide-react";
import { FilterTab } from "./types";
import { cn } from "@/lib/utils";

interface WorkspaceHeaderProps {
  currentTab: FilterTab;
  onSelectTab: (tab: FilterTab) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenInviteModal: () => void;
}

export function WorkspaceHeader({
  currentTab,
  onSelectTab,
  searchQuery,
  onSearchChange,
  onOpenInviteModal,
}: WorkspaceHeaderProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Global shortcut '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const tabs: { id: FilterTab; label: string }[] = [
    { id: "all", label: "All" },
    { id: "recents", label: "Recents" },
    { id: "created-by-me", label: "Created by Me" },
  ];

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 px-6 h-14 border-b-2 border-black dark:border-white/20 bg-[#FAF7F2] dark:bg-[#141416] grid-paper transition-colors duration-200 font-brand-sans shrink-0 select-none">
      <svg
        width="0"
        height="0"
        className="absolute pointer-events-none"
        aria-hidden="true"
      >
        <defs>
          <filter id="hdr-r1" x="-6%" y="-12%" width="112%" height="124%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.045 0.07"
              numOctaves="3"
              seed="9"
              result="n"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="n"
              scale="2.4"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
          <filter id="hdr-r2" x="-6%" y="-12%" width="112%" height="124%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.05 0.08"
              numOctaves="3"
              seed="17"
              result="n"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="n"
              scale="2.8"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      <style>{`
        .hdr-rough {
          position: relative;
          isolation: isolate;
          --fill: #ffffff;
          --border: #111111;
          --sx: 0px;
          --sy: 0px;
        }
        .dark .hdr-rough {
          --fill: #1c1d20;
          --border: #ffffff;
        }
        .hdr-rough::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -1;
          background: var(--fill);
          border: 2px solid var(--border);
          border-radius: 3px;
          filter: url(#hdr-r1);
        }
        .hdr-rough.has-shadow {
          --sx: 3px;
          --sy: 3px;
        }
        .hdr-rough.has-shadow::after {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -2;
          background: var(--border);
          border-radius: 3px;
          transform: translate(var(--sx), var(--sy));
          filter: url(#hdr-r2);
        }
        .hdr-rough-lime {
          --fill: #e9ffa3 !important;
          --border: #111111 !important;
        }
        .dark .hdr-rough-lime {
          --fill: #e9ffa3 !important;
          --border: #ffffff !important;
        }
        .hdr-rough-black {
          --fill: #000000 !important;
          --border: #000000 !important;
        }
        .dark .hdr-rough-black {
          --fill: #ffffff !important;
          --border: #ffffff !important;
        }
        .hdr-rough-circle {
          position: relative;
          isolation: isolate;
          --fill: #ffffff;
          --border: #111111;
        }
        .dark .hdr-rough-circle {
          --fill: #1c1d20;
          --border: #ffffff;
        }
        .hdr-rough-circle::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -1;
          background: var(--fill);
          border: 2px solid var(--border);
          border-radius: 9999px;
          filter: url(#hdr-r1);
        }
      `}</style>

      <nav className="flex items-center gap-2.5" aria-label="Filter files">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={cn(
                "hdr-rough h-8 px-4 flex items-center justify-center text-xs font-bold font-sans cursor-pointer select-none transition-transform active:translate-x-0.5 active:translate-y-0.5",
                isActive
                  ? "hdr-rough-lime has-shadow text-black"
                  : "text-black dark:text-white hover:opacity-90",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>

      <div className="flex items-center gap-3.5">
        <div className="hdr-rough relative flex items-center h-8 w-64 sm:w-80 md:w-[340px] px-3 transition-all">
          <Search className="w-4 h-4 text-black dark:text-white shrink-0 stroke-[2.2] mr-2.5 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search canvases..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-xs font-brand-sans text-black dark:text-white placeholder:text-[#888888] dark:placeholder:text-white/40"
          />
          <div className="flex items-center ml-1.5 shrink-0">
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-[#888888] dark:text-white/50 border border-black/25 dark:border-white/30 rounded-[2px] bg-transparent leading-none pointer-events-none">
              /
            </kbd>
          </div>
        </div>

        {/* Invite Button */}
        <button
          type="button"
          onClick={onOpenInviteModal}
          className="hdr-rough hdr-rough-black h-8 px-4 flex items-center gap-1.5 text-xs font-bold font-sans text-white dark:text-black cursor-pointer select-none transition-transform active:scale-95"
        >
          <Send className="w-3.5 h-3.5 text-white dark:text-black stroke-[2.2]" />
          <span>Invite</span>
        </button>
      </div>
    </header>
  );
}
