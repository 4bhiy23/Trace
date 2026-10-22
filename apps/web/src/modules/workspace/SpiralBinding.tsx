"use client";

import React, {
  useLayoutEffect,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const PITCH = 44;
const W = 46;
const H = 49;

function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface SpiralBindingProps {
  seed?: number;
  className?: string;
}

/**
 * Top spiral binder loops faithfully implementing:
 * - spiral-component-prototype.html
 * - Section 17 of NEW_DESIGN-workspace.md
 */
export function SpiralBinding({
  seed = 5,
  className = "",
}: SpiralBindingProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(0);

  useIsomorphicLayoutEffect(() => {
    if (!ref.current) return;
    const updateSize = () => {
      if (ref.current) {
        setW(ref.current.offsetWidth);
      }
    };
    updateSize();
    const ro = new ResizeObserver(() => updateSize());
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  const coils = useMemo(() => {
    if (!w) return [];
    const n = Math.max(2, Math.floor(w / PITCH));
    const step = (w - W) / (n - 1);
    const r = rng(seed);
    return Array.from({ length: n }, (_, i) => ({
      x: i * step + (r() * 2 - 1) * 1.1,
      rot: (r() * 2 - 1) * 1.3,
    }));
  }, [w, seed]);

  return (
    <div
      ref={ref}
      className={`spiral-strip relative pointer-events-none select-none ${className}`}
      aria-hidden="true"
    >
      <svg
        width={w || "100%"}
        height={H}
        viewBox={w ? `0 0 ${w} ${H}` : undefined}
        className="overflow-visible"
      >
        <defs>
          <linearGradient
            id="metal-gradient"
            gradientUnits="userSpaceOnUse"
            x1="22"
            x2="28"
          >
            <stop offset="0" stopColor="#5a5448" />
            <stop offset=".35" stopColor="#f3efe3" />
            <stop offset=".7" stopColor="#8d8779" />
            <stop offset="1" stopColor="#2a2620" />
          </linearGradient>

          <symbol id="notebook-coil" viewBox="0 0 64 68">
            <path
              d="M32 4.8 C36 4.8 39 8.5 39 16 V51"
              fill="none"
              stroke="#111"
              strokeWidth="3.6"
              strokeLinecap="round"
            />
            <path
              d="M32 4.8 C36 4.8 39 8.5 39 16 V51"
              fill="none"
              stroke="#a39d8f"
              strokeOpacity=".85"
              strokeWidth="1.3"
              strokeLinecap="round"
            />

            <path
              d="M25 51 V16 C25 8.5 28 4.8 32 4.8"
              fill="none"
              stroke="#111"
              strokeWidth="6.4"
              strokeLinecap="round"
            />
            <path
              d="M25 51 V16 C25 8.5 28 4.8 32 4.8"
              fill="none"
              stroke="url(#metal-gradient)"
              strokeWidth="3.4"
              strokeLinecap="round"
            />

            <rect
              x="21"
              y="47"
              width="22"
              height="17"
              rx="2.2"
              fill="#0f0e0c"
            />
            <path
              d="M22.6 48.4 H41.4"
              stroke="#fff"
              strokeOpacity=".14"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <path
              d="M25 48 V56 M39 48 V56"
              stroke="#c9c2ae"
              strokeOpacity=".55"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </symbol>
        </defs>

        {coils.map((c, i) => (
          <use
            key={i}
            href="#notebook-coil"
            x={c.x}
            y={0}
            width={W}
            height={H}
            transform={`rotate(${c.rot.toFixed(2)} ${(c.x + W / 2).toFixed(1)} ${(H * 0.58).toFixed(1)})`}
          />
        ))}
      </svg>
    </div>
  );
}
