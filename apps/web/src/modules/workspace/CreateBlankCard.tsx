"use client";

import React from "react";
import { Plus } from "lucide-react";

interface CreateBlankCardProps {
  onClick: () => void;
}

export function CreateBlankCard({ onClick }: CreateBlankCardProps) {
  return (
    <div className="mb-6">
      <button
        type="button"
        onClick={onClick}
        className="w-52 h-36 rounded-xl border border-[var(--border)] bg-[var(--card)]/40 hover:bg-[var(--card)]/80 hover:border-[var(--primary)]/50 p-4 flex flex-col items-center justify-center gap-3 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-all duration-200 cursor-pointer group shadow-xs hover:shadow-md active:scale-[0.98]"
      >
        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] transition-transform duration-200 group-hover:scale-110">
          <Plus className="w-7 h-7 stroke-[1.5]" />
        </div>
        <span className="text-xs font-medium tracking-tight group-hover:font-semibold transition-all">
          Create a Blank File
        </span>
      </button>
    </div>
  );
}
