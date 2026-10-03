"use client";

import React, { useRef, useEffect } from "react";
import { Search, Send } from "lucide-react";
import { FilterTab } from "./types";
import { ThemeToggle } from "@/src/modules/auth/ThemeToggle";
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
    { id: "folders", label: "Folders" },
    { id: "unsorted", label: "Unsorted" },
  ];

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 px-6 py-3.5 border-b border-[var(--border)] bg-[var(--background)] transition-colors duration-200">
      {/* Filter Tabs / Pills */}
      <nav className="flex items-center gap-1.5" aria-label="Filter files">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer select-none",
                isActive
                  ? "bg-[var(--card)] text-[var(--foreground)] shadow-xs border border-[var(--border)] font-semibold"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--card)]/50",
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
          <Search className="absolute left-2.5 w-3.5 h-3.5 text-[var(--muted-foreground)] pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-48 sm:w-56 pl-8 pr-12 py-1.5 text-xs rounded-lg bg-[var(--card)] text-[var(--foreground)] border border-[var(--border)] placeholder:text-[var(--muted-foreground)]/70 focus:outline-none focus:ring-1 focus:ring-[var(--ring)] focus:border-[var(--primary)] transition-all"
          />
          <div className="absolute right-2 flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-[var(--secondary)]/60 text-[var(--muted-foreground)] border border-[var(--border)]/40 pointer-events-none">
              /
            </kbd>
          </div>
        </div>

        {/* Team Avatars */}
        <div
          className="hidden sm:flex items-center -space-x-1.5 cursor-pointer group"
          onClick={onOpenInviteModal}
          title="Team members"
        >
          <div className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px] font-bold ring-2 ring-[var(--background)]">
            SG
          </div>
          <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold ring-2 ring-[var(--background)]">
            AL
          </div>
          <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold ring-2 ring-[var(--background)]">
            JD
          </div>
        </div>

        {/* Invite Button */}
        <button
          type="button"
          onClick={onOpenInviteModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 active:scale-95 border border-[var(--border)] shadow-xs transition-all duration-150 cursor-pointer"
        >
          <Send className="w-3 h-3" />
          <span>Invite</span>
        </button>

        {/* Theme Toggle Button */}
        <ThemeToggle
          variant="circle"
          className="p-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--card)]/80 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
        />
      </div>
    </header>
  );
}
