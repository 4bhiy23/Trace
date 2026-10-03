import React from "react";

export function AuthBackgroundDoodles() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 overflow-hidden pointer-events-none select-none z-0"
    >
      {/* Subtle background radial canvas wash */}
      <div className="absolute inset-0 bg-[radial-gradient(#8E8A83_1px,transparent_1px)] [background-size:24px_24px] opacity-15 dark:opacity-20" />

      {/* TOP-LEFT DOODLES */}
      <div className="absolute top-4 left-4 sm:top-8 sm:left-10 flex flex-col gap-6 opacity-75 dark:opacity-85">
        {/* Sketched diamond/polygon */}
        <svg
          className="w-8 h-8 text-teal-500/80 -rotate-12 transition-transform hover:rotate-0 duration-300"
          viewBox="0 0 40 40"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 4 L34 20 L20 36 L6 20 Z" />
          <path d="M6 20 L34 20" strokeDasharray="3 3" opacity="0.6" />
        </svg>

        {/* Sketched fingerprint / contour swirls */}
        <svg
          className="w-10 h-10 text-indigo-400/70 translate-x-3 rotate-6"
          viewBox="0 0 50 50"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        >
          <path d="M25 8 C15 8 10 16 10 26 C10 36 15 42 25 42 C35 42 40 36 40 26" />
          <path d="M25 14 C18 14 15 20 15 26 C15 32 19 36 25 36 C31 36 35 32 35 26" />
          <path d="M25 20 C22 20 20 23 20 26 C20 29 22 31 25 31 C28 31 30 29 30 26" />
        </svg>

        {/* Hand-drawn Padlock Doodle (Terracotta accent) */}
        <svg
          className="w-9 h-9 text-[#F26A4B] rotate-3"
          viewBox="0 0 44 44"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Shackle */}
          <path d="M15 19 V12 C15 8 18 5 22 5 C26 5 29 8 29 12 V19" />
          {/* Body */}
          <rect x="10" y="19" width="24" height="18" rx="4" />
          {/* Keyhole */}
          <circle cx="22" cy="27" r="2.5" />
          <path d="M22 29.5 V33" />
        </svg>

        {/* Small color swatches */}
        <div className="flex items-center gap-2 translate-x-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#F26A4B]/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-300/80" />
        </div>
      </div>

      {/* TOP-RIGHT DOODLES */}
      <div className="absolute top-4 right-4 sm:top-8 sm:right-10 flex flex-col items-end gap-6 opacity-75 dark:opacity-85">
        {/* Sketched picture frame with mountain/sun */}
        <svg
          className="w-11 h-11 text-amber-500/80 rotate-6"
          viewBox="0 0 48 48"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="6" y="8" width="36" height="28" rx="3" />
          <circle cx="16" cy="18" r="3" />
          <path d="M8 32 L19 22 L27 30 L33 25 L40 32" />
        </svg>

        {/* Sketched selection bounding box with resize handles */}
        <svg
          className="w-9 h-9 text-slate-400/70"
          viewBox="0 0 40 40"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <rect x="8" y="8" width="24" height="24" strokeDasharray="3 3" />
          <rect
            x="5"
            y="5"
            width="6"
            height="6"
            fill="currentColor"
            stroke="none"
          />
          <rect
            x="29"
            y="5"
            width="6"
            height="6"
            fill="currentColor"
            stroke="none"
          />
          <rect
            x="5"
            y="29"
            width="6"
            height="6"
            fill="currentColor"
            stroke="none"
          />
          <rect
            x="29"
            y="29"
            width="6"
            height="6"
            fill="currentColor"
            stroke="none"
          />
        </svg>

        {/* Play indicator circle */}
        <svg
          className="w-8 h-8 text-emerald-400/80 -rotate-6"
          viewBox="0 0 36 36"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="18" cy="18" r="14" />
          <polygon
            points="15,12 24,18 15,24"
            fill="currentColor"
            opacity="0.3"
          />
        </svg>

        {/* Floating geometric dots */}
        <div className="flex gap-2 -translate-x-2">
          <span className="w-2 h-2 rounded-full bg-blue-500/80" />
          <span className="w-2 h-2 rotate-45 bg-purple-400/80" />
        </div>
      </div>

      {/* BOTTOM-LEFT DOODLES */}
      <div className="absolute bottom-4 left-4 sm:bottom-8 sm:left-10 flex flex-col gap-6 opacity-75 dark:opacity-85">
        {/* Pencil tip / drawing stylus doodle */}
        <svg
          className="w-10 h-10 text-amber-600/80 rotate-45"
          viewBox="0 0 44 44"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 32 L30 14 L34 18 L16 36 Z" />
          <path d="M12 32 L8 36 L16 36 Z" fill="currentColor" opacity="0.4" />
          <path d="M26 18 L30 22" />
        </svg>

        {/* Sketched connection wire / infinity loop */}
        <svg
          className="w-11 h-8 text-teal-400/70"
          viewBox="0 0 50 30"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        >
          <path d="M12 15 C4 8 4 22 12 22 C20 22 30 8 38 8 C46 8 46 22 38 22 C30 22 20 8 12 8" />
        </svg>

        {/* Sketched green triangle */}
        <svg
          className="w-7 h-7 text-lime-400/75 -rotate-12"
          viewBox="0 0 32 32"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="16,4 28,26 4,26" />
        </svg>
      </div>

      {/* BOTTOM-RIGHT DOODLES */}
      <div className="absolute bottom-4 right-4 sm:bottom-8 sm:right-10 flex flex-col items-end gap-5 opacity-75 dark:opacity-85">
        {/* Sketched speech bubble with smiling doodle */}
        <svg
          className="w-11 h-11 text-sky-400/80 -rotate-3"
          viewBox="0 0 48 48"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M24 8 C14 8 6 15 6 24 C6 28 8 32 12 35 L10 42 L18 39 C20 40 22 40 24 40 C34 40 42 33 42 24 C42 15 34 8 24 8 Z" />
          {/* Eyes & Smile */}
          <circle cx="18" cy="22" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="28" cy="22" r="1.5" fill="currentColor" stroke="none" />
          <path d="M19 27 Q23 31 27 27" />
        </svg>

        {/* Sketched planet with orbital ring */}
        <svg
          className="w-10 h-10 text-orange-400/75 rotate-12"
          viewBox="0 0 44 44"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        >
          <circle cx="22" cy="22" r="10" />
          <path d="M7 26 C12 18 32 14 37 18 C40 20 34 26 27 28 C20 30 10 30 7 26 Z" />
        </svg>

        {/* Sketched 3x3 dot matrix */}
        <svg
          className="w-7 h-7 text-lime-400/80"
          viewBox="0 0 30 30"
          fill="currentColor"
        >
          <circle cx="6" cy="6" r="1.5" />
          <circle cx="15" cy="6" r="1.5" />
          <circle cx="24" cy="6" r="1.5" />
          <circle cx="6" cy="15" r="1.5" />
          <circle cx="15" cy="15" r="1.5" />
          <circle cx="24" cy="15" r="1.5" />
          <circle cx="6" cy="24" r="1.5" />
          <circle cx="15" cy="24" r="1.5" />
          <circle cx="24" cy="24" r="1.5" />
        </svg>
      </div>
    </div>
  );
}
