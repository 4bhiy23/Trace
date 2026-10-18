"use client";

import { AuthCard } from "./AuthCard";
import { CanvasSketchStage } from "./CanvasSketchStage";

interface AuthPageLayoutProps {
  initialMode?: "sign-in" | "sign-up";
}

export function AuthPageLayout({
  initialMode = "sign-up",
}: AuthPageLayoutProps) {
  return (
    <div className="min-h-screen lg:h-screen lg:max-h-screen w-full flex flex-col lg:flex-row bg-[#FFFEFC] text-black overflow-y-auto lg:overflow-hidden relative">
      {/* Overlapping Dot Grid between Left (Light) and Right (Dark) Areas */}
      <div
        aria-hidden="true"
        className="hidden lg:block absolute left-1/2 -translate-x-1/2 top-[138px] xl:top-[148px] z-20 pointer-events-none select-none"
      >
        <svg width="128" height="112" viewBox="0 0 128 112" fill="none">
          {/* 4 columns on the left (light canvas): dark dots */}
          {[0, 1, 2, 3].map((col) =>
            [0, 1, 2, 3, 4, 5, 6].map((row) => (
              <circle
                key={`overlap-dot-left-${col}-${row}`}
                cx={8 + col * 16}
                cy={8 + row * 16}
                r="1.8"
                fill="#000000"
                opacity="0.38"
              />
            )),
          )}
          {/* 4 columns on the right (dark canvas): white/light dots */}
          {[0, 1, 2, 3].map((col) =>
            [0, 1, 2, 3, 4, 5, 6].map((row) => (
              <circle
                key={`overlap-dot-right-${col}-${row}`}
                cx={72 + col * 16}
                cy={8 + row * 16}
                r="1.8"
                fill="#FFFFFF"
                opacity="0.32"
              />
            )),
          )}
        </svg>
      </div>

      {/* ========================================================= */}
      {/* LEFT PANE: Light Canvas Sketch & Brand Studio             */}
      {/* ========================================================= */}
      <section
        aria-label="Creative Canvas Showcase"
        className="relative lg:w-1/2 min-h-[580px] lg:min-h-0 lg:h-full light-canvas-grid flex flex-col justify-between overflow-hidden border-b lg:border-b-0 lg:border-r border-black/15"
      >
        <CanvasSketchStage />
      </section>

      {/* ========================================================= */}
      {/* RIGHT PANE: Dark Technical Canvas with Brutalist Modal    */}
      {/* ========================================================= */}
      <section
        aria-label="Authentication Form"
        className="relative lg:w-1/2 min-h-[600px] lg:min-h-0 lg:h-full dark-canvas-grid flex flex-col justify-between overflow-hidden"
      >
        {/* Top Navigation Bar */}
        <header className="relative z-10 w-full pt-8 sm:pt-10 px-8 sm:px-12 flex items-center justify-between shrink-0">
          <div className="lg:hidden">
            {/* On mobile, brand is already shown in left pane, keep top clean */}
          </div>

          {/* Desktop Right Header: CREATE · PLAN · COLLABORATE */}
          <div className="hidden sm:flex items-center gap-2 font-roboto-mono text-[12px] font-medium leading-[1.4] tracking-[0.3px] text-[#A1A1AA] uppercase ml-auto">
            <span>CREATE</span>
            <span className="text-[#E03E2D] font-bold">·</span>
            <span>PLAN</span>
            <span className="text-[#E03E2D] font-bold">·</span>
            <span>COLLABORATE</span>
          </div>

          {/* Small decorative corner scribble */}
          <div className="absolute right-6 top-8 sm:right-8 sm:top-10 pointer-events-none opacity-40">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2 L12 6 M22 12 L18 12 M19 5 L16 8 M19 19 L16 16"
                stroke="#FFFFFF"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </header>

        {/* Centered Sign In / Sign Up Card */}
        <main className="relative z-10 flex-1 flex items-center justify-center p-3 sm:p-4 my-auto min-h-0">
          <AuthCard initialMode={initialMode} />
        </main>

        {/* Clean bottom baseline spacer */}
        <footer className="relative z-10 h-3 sm:h-4 shrink-0" />
      </section>
    </div>
  );
}
