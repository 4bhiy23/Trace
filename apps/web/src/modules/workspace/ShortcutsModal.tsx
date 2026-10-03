"use client";

import React from "react";
import { X, Keyboard, HelpCircle } from "lucide-react";

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShortcutsModal({ isOpen, onClose }: ShortcutsModalProps) {
  if (!isOpen) return null;

  const shortcuts = [
    { key: "A", description: "Navigate to All Files" },
    { key: "P", description: "Navigate to Private Files" },
    { key: "E", description: "Navigate to Archive" },
    { key: "^ N / ⌘ N", description: "Create a new canvas / file" },
    { key: "/", description: "Quick search files and folders" },
    { key: "Esc", description: "Close modals and active menus" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-0 duration-200">
      <div
        className="w-full max-w-sm rounded-2xl bg-[var(--card)] text-[var(--card-foreground)] border border-[var(--border)] shadow-2xl p-5 relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-[var(--foreground)]" />
            <h2 className="text-sm font-bold tracking-tight text-[var(--foreground)]">
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)]/50 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-3.5 space-y-2.5">
          {shortcuts.map((s) => (
            <div
              key={s.key}
              className="flex items-center justify-between py-1 text-xs"
            >
              <span className="text-[var(--muted-foreground)]">
                {s.description}
              </span>
              <kbd className="px-2 py-0.5 text-[11px] font-mono rounded-md bg-[var(--secondary)]/60 text-[var(--foreground)] border border-[var(--border)] shadow-2xs">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between text-[11px] text-[var(--muted-foreground)]">
          <div className="flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Trace Workspace v1.0</span>
          </div>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="text-[var(--foreground)] font-medium hover:underline"
          >
            Docs & Support
          </a>
        </div>
      </div>
    </div>
  );
}
