"use client";

import Image from "next/image";

interface TraceLogoProps {
  size?: number;
  showWordmark?: boolean;
  className?: string;
  variant?: "default" | "atelier";
  textColor?: string;
}

export function TraceLogo({
  size = 28,
  showWordmark = true,
  className = "",
  variant,
  textColor,
}: TraceLogoProps = {}) {
  // If variant is explicitly atelier and showWordmark is false, keep circular mark for backward compatibility
  if (variant === "atelier" && !showWordmark) {
    return (
      <div
        className={`inline-flex items-center justify-center select-none ${className}`}
        style={textColor ? { color: textColor } : undefined}
      >
        <div
          style={{ width: size, height: size }}
          className="shrink-0 rounded-full border-[1.5px] border-current flex items-center justify-center font-serif italic font-medium leading-none text-base"
        >
          T
        </div>
      </div>
    );
  }

  // Calculate width proportional to the 2168 x 725 image aspect ratio (~2.99:1)
  const height = size;
  const width = Math.round(size * 2.99);

  return (
    <div
      className={`inline-flex items-center select-none ${className}`}
      style={textColor ? { color: textColor } : undefined}
    >
      <Image
        src="/trace_logo.png"
        alt="Trace"
        width={width}
        height={height}
        priority
        className="h-auto w-auto object-contain select-none"
        style={{ height: `${height}px`, width: "auto" }}
      />
    </div>
  );
}
