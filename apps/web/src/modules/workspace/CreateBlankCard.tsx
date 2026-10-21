"use client";

import React from "react";
import { Plus, ArrowUpRight } from "lucide-react";
import { RoughBox, HandNote } from "./RoughBox";

interface CreateBlankCardProps {
  onClick: () => void;
  title?: string;
  subtitle?: string;
  tag?: string;
  handNote?: string;
  punchedHoles?: boolean;
}


export function CreateBlankCard({
  onClick,
  title = "Create a Project",
  subtitle = "Organize canvases, specs and your work",
  tag,
  handNote,
  punchedHoles = false,
}: CreateBlankCardProps) {
  return (
    <div className="relative pt-4 pb-2 select-none inline-block">
      {/* Sticky note RoughBox (§13.2) */}
      <RoughBox
        seed={punchedHoles ? 5 : 3}
        fill={punchedHoles ? "#f1fdc2" : "#E9FFA3"}
        amp={1.25}
        rings="none"
        tape="tl"
        tilt={punchedHoles ? 0 : -0.6}
        className="w-full max-w-[580px]"
      >
        <div className="relative">
          <button
            type="button"
            onClick={onClick}
            className="w-full flex flex-col justify-between text-left cursor-pointer transition-transform hover:-translate-y-0.5 active:translate-y-0.5 group focus:outline-none py-4 sm:py-5 px-6 sm:px-7"
          >
            {/* Top Tag e.g. "BLANK CANVAS" */}
            {tag && (
              <div className="self-end mb-1">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-black">
                  {tag}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between gap-4 w-full">
              {/* Left + Icon Tile (~56px, 2px ink border, shadow-btn) */}
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 sm:w-14 sm:h-14 border-2 border-black rounded-[4px] bg-[#E9FFA3] group-hover:bg-black group-hover:text-[#E9FFA3] text-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#000000] transition-colors duration-150">
                  <Plus className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.6]" />
                </div>

                <div className="min-w-0">
                  <h2 className="font-extrabold text-xl sm:text-2xl leading-tight text-black tracking-tight font-brand-sans">
                    {title}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#636363] font-medium leading-normal mt-0.5 truncate font-brand-sans">
                    {subtitle}
                  </p>
                </div>
              </div>

              {/* Right Icon Square (ArrowUpRight) */}
              <div className="relative">
                {/* Two small doodle energy ticks above icon button */}
                <svg
                  className="absolute -top-3.5 right-1 w-4 h-3.5 pointer-events-none text-black dark:text-white"
                  viewBox="0 0 16 14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M 4 11 L 3 3" />
                  <path d="M 9 11 L 13 3" />
                </svg>

                <div className="w-8 h-8 sm:w-9 sm:h-9 border-2 border-black rounded-[2px] bg-white group-hover:bg-black group-hover:text-[#E9FFA3] text-black flex items-center justify-center shrink-0 shadow-[1px_1px_0px_#000000] transition-colors duration-150">
                  <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.4]" />
                </div>
              </div>
            </div>
          </button>
        </div>
      </RoughBox>


      {!punchedHoles && (
        <div className="absolute left-[calc(100%+28px)] top-3.5 pointer-events-none select-none z-20 hidden sm:flex flex-col items-start">
          {/* Handwritten text */}
          <div
            className="text-[23px] font-bold leading-[1.05] text-black dark:text-white -rotate-[16deg] tracking-wide"
            style={{
              fontFamily: 'var(--font-handwriting, "Caveat", cursive)',
            }}
          >
            <div className="pl-0">Start</div>
            <div className="pl-3.5">from</div>
            <div className="pl-1">scratch!</div>
          </div>

          {/*arrow pointing down-left towards the box */}
          <svg
            className="-mt-0.5 -ml-5 w-16 h-11 text-black dark:text-white overflow-visible"
            viewBox="0 0 60 44"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M 46 4 C 34 16, 20 25, 4 26" />
            <path d="M 14 17 L 3 26 L 13 35" />
          </svg>
        </div>
      )}

      {/* Hand-drawn arrow*/}
      {handNote && <HandNote text={handNote} />}
    </div>
  );
}
