"use client";

import React from "react";
import { X, HelpCircle } from "lucide-react";

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShortcutsModal({ isOpen, onClose }: ShortcutsModalProps) {
  if (!isOpen) return null;

  const shortcuts = [
    { key: "D", description: "Navigate to Dashboard" },
    { key: "^ N / ⌘ N", description: "Create a new canvas / file" },
    { key: "/", description: "Quick search files and folders" },
    { key: "Esc", description: "Close modals and active menus" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-0 duration-200 font-brand-sans">
      <div
        className="w-full max-w-sm bg-[#FFFEFC] dark:bg-[#18191c] text-black dark:text-white border-2 border-black dark:border-white/30 shadow-[8px_10px_0px_0px_#000000] p-5 relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b-2 border-black dark:border-white/20">
          <div>
            <div className="font-roboto-mono text-[10px] uppercase tracking-[0.2em] text-[#636363] dark:text-white/60 font-semibold mb-0.5">
              QUICK COMMANDS
            </div>
            <h2 className="font-brand-display font-bold text-base sm:text-lg text-black dark:text-white tracking-tight">
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 border border-black hover:bg-black hover:text-white dark:border-white dark:hover:bg-white dark:hover:text-black transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        <div className="mt-3.5 space-y-2">
          {shortcuts.map((s) => (
            <div
              key={s.key}
              className="flex items-center justify-between py-1 text-xs"
            >
              <span className="text-[#636363] dark:text-white/80 font-brand-sans font-medium">
                {s.description}
              </span>
              <kbd className="px-2 py-0.5 text-[10px] font-roboto-mono font-bold bg-[#ECE7E0] dark:bg-black text-black dark:text-white border-2 border-black shadow-[1px_1px_0px_#000000]">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t-2 border-black dark:border-white/20 flex items-center justify-between text-[10.5px] font-roboto-mono text-[#636363] dark:text-white/60">
          <div className="flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-black dark:text-white stroke-[2.2]" />
            <span>Trace v1.0 • Brutalist</span>
          </div>
          <span className="text-black dark:text-white font-bold">
            Docs &amp; Specs ↗
          </span>
        </div>
      </div>
    </div>
  );
}
