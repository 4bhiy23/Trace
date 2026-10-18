"use client";

import React, { useRef, useEffect } from "react";
import { Search, Send } from "lucide-react";
import { FilterTab } from "./types";
import { ThemeToggle } from "@/modules/auth/ThemeToggle";
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
    <header className="flex flex-wrap items-center justify-between gap-3 px-6 h-14 border-b-2 border-black dark:border-white/20 bg-[#FFFEFC] dark:bg-[#111213] transition-colors duration-200 font-brand-sans shrink-0">
      {/* Filter Tabs */}
      <nav className="flex items-center gap-2" aria-label="Filter files">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={cn(
                "px-3.5 py-1.5 text-xs font-brand-sans transition-all duration-150 cursor-pointer select-none",
                isActive
                  ? "bg-[#E9FFA3] text-black border-2 border-black font-semibold shadow-[2px_2px_0px_#000000]"
                  : "bg-white dark:bg-[#1c1d20] text-black dark:text-white border-2 border-black/30 dark:border-white/30 hover:border-black hover:bg-black/5 font-medium shadow-[1px_1px_0px_#000000]",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* Right Controls: Search, Avatars, Invite, Theme Toggle */}
      <div className="flex items-center gap-3">
        {/* Search Input */}
        <div className="relative flex items-center">
          <Search className="absolute left-3 w-3.5 h-3.5 text-[#636363] dark:text-white/60 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search canvases..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-48 sm:w-56 pl-8 pr-10 py-1.5 text-xs bg-white dark:bg-[#1c1d20] text-black dark:text-white border-2 border-black dark:border-white/30 placeholder:text-[#636363] shadow-[2px_2px_0px_#000000] focus:outline-none focus:shadow-[3px_3px_0px_#000000] transition-all font-brand-sans"
          />
          <div className="absolute right-2.5 flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 text-[10px] font-roboto-mono bg-[#ECE7E0] dark:bg-black text-black dark:text-white border border-black/40 font-semibold pointer-events-none">
              /
            </kbd>
          </div>
        </div>


        {/* Invite Button */}
        <button
          type="button"
          onClick={onOpenInviteModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-black text-white hover:bg-[#E9FFA3] hover:text-black border-2 border-black shadow-[2px_2px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
        >
          <Send className="w-3 h-3 stroke-[2.2]" />
          <span>Invite</span>
        </button>

        {/* Theme Toggle Button */}
        <ThemeToggle
          variant="circle"
          className="p-1.5 border-2 border-black bg-white dark:bg-[#1c1d20] shadow-[2px_2px_0px_#000000] hover:bg-[#E9FFA3] dark:hover:bg-[#E9FFA3] text-black dark:text-white dark:hover:text-black transition-colors cursor-pointer"
        />
      </div>
    </header>
  );
}
