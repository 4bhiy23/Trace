interface TraceLogoProps {
  size?: number;
  showWordmark?: boolean;
  className?: string;
}

export function TraceLogo({
  size = 36,
  showWordmark = true,
  className,
}: TraceLogoProps = {}) {
  const iconSize = Math.max(16, Math.round(size * 0.55));

  return (
    <div
      className={`flex items-center justify-center gap-2.5 select-none ${className || ""}`}
    >
      {/* Hand-drawn style rocket / trace pen glyph */}
      <div
        style={{ width: size, height: size }}
        className="relative shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-[#F26A4B] to-[#e05333] shadow-md shadow-[#F26A4B]/20 text-white"
      >
        <svg
          style={{ width: iconSize, height: iconSize }}
          className="-rotate-45"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Rocket body / Pen nib */}
          <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
          <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
          <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
          <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
        </svg>
      </div>

   
      {showWordmark && (
        <div className="flex items-center tracking-tight font-black text-2xl sm:text-3xl text-[var(--foreground)] font-sans">
          <span>TRACE</span>
          <span className="text-[#F26A4B] text-xl font-bold ml-0.5 -mt-2">
            +
          </span>
        </div>
      )}
    </div>
  );
}
