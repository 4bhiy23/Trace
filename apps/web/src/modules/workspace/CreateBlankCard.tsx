"use client";

import React from "react";
import { Plus, ArrowUpRight } from "lucide-react";

interface CreateBlankCardProps {
  onClick: () => void;
}

export function CreateBlankCard({ onClick }: CreateBlankCardProps) {
  return (
    <div className="mb-6">
      <button
        type="button"
        onClick={onClick}
        className="group relative w-72 h-36 bg-white dark:bg-[#18191c] border-2 border-dashed border-black dark:border-white/40 hover:border-solid hover:bg-[#fafbe9] dark:hover:bg-[#202227] shadow-[5px_6px_0px_0px_rgba(0,0,0,0.14)] hover:shadow-[7px_8px_0px_0px_rgba(0,0,0,0.24)] hover:-translate-y-0.5 p-4 flex flex-col justify-between text-left transition-all duration-200 cursor-pointer select-none font-brand-sans"
      >
        {/* Top metadata strip */}
        <div className="flex items-center justify-between w-full">
          <span className="font-roboto-mono text-xs font-bold text-black dark:text-white bg-[#E9FFA3] dark:text-black border border-black px-1.5 py-0.2">
            01
          </span>
          <span className="font-roboto-mono text-[9px] uppercase tracking-[0.2em] text-[#636363] dark:text-white/60 font-semibold">
            BLANK CANVAS
          </span>
        </div>

        {/* Center icon & headline */}
        <div className="flex items-center gap-3 my-1">
          <div className="w-9 h-9 border-2 border-black bg-[#E9FFA3] text-black group-hover:bg-black group-hover:text-[#E9FFA3] flex items-center justify-center transition-all duration-200 shrink-0 shadow-[2px_2px_0px_#000000]">
            <Plus className="w-4 h-4 stroke-[2.8]" />
          </div>
          <div>
            <div className="font-brand-display font-bold text-sm sm:text-base text-black dark:text-white tracking-tight leading-snug">
              Create a Blank File
            </div>
            <div className="font-brand-sans text-[11px] text-[#636363] dark:text-white/60 leading-tight mt-0.5">
              Infinite drafting canvas & specs
            </div>
          </div>
        </div>

        {/* Footer meta row + circular arrow */}
        <div className="flex items-center justify-between w-full pt-1.5 border-t border-black/15 dark:border-white/15">
          <span className="font-roboto-mono text-[9px] uppercase tracking-[0.14em] text-[#636363] dark:text-white/60 font-medium">
            START FROM SCRATCH
          </span>
          <div className="w-5 h-5 border border-black bg-white dark:bg-black group-hover:bg-[#E9FFA3] text-black flex items-center justify-center transition-all duration-150">
            <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
          </div>
        </div>
      </button>
    </div>
  );
}
