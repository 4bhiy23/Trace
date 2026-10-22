"use client";

import React, { useEffect } from "react";
import { X, HelpCircle, Keyboard } from "lucide-react";
import { SpiralBinding } from "./SpiralBinding";

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShortcutsModal({ isOpen, onClose }: ShortcutsModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shortcuts = [
    { key: "D", description: "Navigate to Dashboard" },
    { key: "^ N / ⌘ N", description: "Create a new canvas / file" },
    { key: "/", description: "Quick search files and folders" },
    { key: "Esc", description: "Close modals and active menus" },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-0 duration-200 overflow-y-auto"
      onClick={onClose}
    >
      <svg
        width="0"
        height="0"
        className="absolute pointer-events-none"
        aria-hidden="true"
      >
        <defs>
          <filter id="sc-r1" x="-8%" y="-12%" width="116%" height="124%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.045 0.07"
              numOctaves="3"
              seed="3"
              result="n"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="n"
              scale="4.5"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
          <filter id="sc-r2" x="-8%" y="-12%" width="116%" height="124%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.05 0.08"
              numOctaves="3"
              seed="11"
              result="n"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="n"
              scale="5"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
          <filter id="sc-r-sm" x="-10%" y="-14%" width="120%" height="128%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.06 0.09"
              numOctaves="3"
              seed="5"
              result="n"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="n"
              scale="2.6"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      <style>{`
        .sc-rough {
          position: relative;
          isolation: isolate;
          --fill: #faf7f2;
          --ink: #111111;
          color: var(--ink);
          border: 0;
          background: transparent;
        }
        .sc-rough::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -1;
          background: var(--fill);
          border: 2px solid var(--ink);
          border-radius: 2px;
          filter: url(#sc-r1);
          pointer-events: none;
        }

        .sc-rough-kbd {
          position: relative;
          isolation: isolate;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          --fill: #e9ffa3;
          --ink: #111111;
          color: var(--ink);
          padding: 2px 8px;
          border: 0;
          background: transparent;
        }
        .sc-rough-kbd::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -1;
          background: var(--fill);
          border: 1.5px solid var(--ink);
          border-radius: 2px;
          filter: url(#sc-r-sm);
          pointer-events: none;
        }

        .sc-rough-btn {
          position: relative;
          isolation: isolate;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          --fill: #faf7f2;
          --ink: #111111;
          --sx: 4px;
          --sy: 5px;
          color: var(--ink);
          cursor: pointer;
          border: 0;
          background: transparent;
          transition: transform 0.08s ease, opacity 0.15s ease;
        }
        .sc-rough-btn::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -1;
          background: var(--fill);
          border: 2px solid var(--ink);
          border-radius: 2px;
          filter: url(#sc-r1);
          pointer-events: none;
        }
        .sc-rough-btn:hover {
          opacity: 0.94;
        }
        .sc-rough-btn:active {
          transform: translate(1px, 1.5px);
        }

        /* Shadow applied specifically to Done button */
        .sc-rough-btn--shadow::after {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -2;
          background: var(--ink);
          border-radius: 2px;
          transform: translate(var(--sx), var(--sy));
          filter: url(#sc-r2);
          pointer-events: none;
        }
        .sc-rough-btn--shadow:active {
          transform: translate(2px, 3px);
          --sx: 1.5px;
          --sy: 1.5px;
        }

        .sc-rough--lime {
          --fill: #e9ffa3;
        }
        .sc-rough-btn--lime {
          --fill: #e9ffa3;
        }

        .sc-rough-card {
          position: relative;
          isolation: isolate;
          display: flex;
          align-items: center;
          justify-content: space-between;
          --fill: #faf7f2;
          --ink: #111111;
          padding: 9px 14px;
          border: 0;
          background: transparent;
        }
        .sc-rough-card::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -1;
          background: var(--fill);
          border: 2px solid var(--ink);
          border-radius: 2px;
          filter: url(#sc-r1);
          pointer-events: none;
        }
      `}</style>

      {/* Modal Notebook Wrapper */}
      <div
        className="relative w-full max-w-[460px] my-6 select-none animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/*right & bottom (§17.4) */}
        <div
          className="absolute -right-3 -bottom-2.5 top-3.5 left-2 bg-[#e6d6a2] border-2 border-[#111] rounded-r-xl pointer-events-none -z-10 paper-texture-wash"
          aria-hidden="true"
        />

        {/* Main Notepad Sheet */}
        <div
          className="relative bg-[#FAF5EC] border-2 border-[#111] rounded-lg paper-texture-wash overflow-hidden"
          style={{
            backgroundImage:
              "linear-gradient(to right, #ece3d3 1px, transparent 1px), linear-gradient(#ece3d3 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        >
          {/* Top Spiral Wire Binding (§17) */}
          <div className="absolute left-6 right-6 -top-5 z-20 pointer-events-none">
            <SpiralBinding seed={7} />
          </div>

          <div className="p-5 sm:p-7 pt-11 sm:pt-12">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <div className="sc-rough sc-rough--lime w-12 h-12 text-black flex items-center justify-center shrink-0">
                  <Keyboard className="w-6 h-6 stroke-[2.2]" />
                </div>

                <div className="min-w-0">
                  <div className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#636056] mb-0.5">
                    QUICK COMMANDS
                  </div>
                  <div className="flex items-center">
                    <h2 className="font-brand-sans font-black text-2xl tracking-tight text-[#111] leading-none">
                      Keyboard Shortcuts
                    </h2>

                    <svg
                      width="18"
                      height="16"
                      viewBox="0 0 20 16"
                      fill="none"
                      stroke="#111"
                      strokeWidth="2.6"
                      strokeLinecap="round"
                      className="inline-block ml-2 text-black shrink-0"
                      aria-hidden="true"
                    >
                      <path d="M4 14L16 2" />
                    </svg>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="sc-rough-btn sc-rough-btn--shadow w-9 h-9 !p-0 text-black flex items-center justify-center shrink-0 mt-0.5"
              >
                <X className="w-5 h-5 stroke-[2.6] text-black" />
              </button>
            </div>

            <div className="w-full border-b-[1.5px] border-black my-4" />

            <div className="space-y-2.5">
              {shortcuts.map((s) => (
                <div key={s.key} className="sc-rough-card">
                  <span className="font-sans text-xs font-bold text-black">
                    {s.description}
                  </span>
                  <kbd className="sc-rough-kbd font-mono text-[11px] font-bold text-black">
                    {s.key}
                  </kbd>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-5 pt-3 border-t-[1.5px] border-dashed border-black/40 flex items-center justify-between text-[11px] font-mono text-[#636056]">
              <div className="flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-black stroke-[2.2]" />
                <span className="font-medium text-black">
                  Trace v1.0 • Brutalist
                </span>
              </div>
              <span className="text-black font-bold">Docs &amp; Specs ↗</span>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="sc-rough-btn sc-rough-btn--lime sc-rough-btn--shadow px-6 py-2 text-xs font-mono font-bold uppercase tracking-wider text-black mr-1 mb-1"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
