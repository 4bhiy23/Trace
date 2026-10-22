"use client";

import React, {
  useLayoutEffect,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

// Safe useLayoutEffect for SSR
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Seeded PRNG as used in paper-edge-prototype-large.html
 */
function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * roughEdge algorithm directly from paper-edge-prototype-large.html
 * Generates an organic, hand-drawn paper edge with coarse sine waves + fine jitter.
 */
export function roughEdge(
  w: number,
  h: number,
  seed = 7,
  o: {
    inset?: number;
    fine?: number;
    fineAmp?: number;
    coarseWave?: number;
    coarseAmp?: number;
  } = {},
) {
  if (w <= 0 || h <= 0) return "";
  const {
    inset = 3,
    fine = 9,
    fineAmp = 0.35,
    coarseWave = 85,
    coarseAmp = 1.25,
  } = o;

  const r = rng(seed);
  const ph = [r() * 6.28, r() * 6.28, r() * 6.28, r() * 6.28];
  const pts: [number, number][] = [];

  const side = (
    ax: number,
    ay: number,
    bx: number,
    by: number,
    nx: number,
    ny: number,
    k: number,
  ) => {
    const L = Math.hypot(bx - ax, by - ay);
    const n = Math.max(2, Math.round(L / fine));
    for (let i = 0; i < n; i++) {
      const t = i / n;
      const d = L * t;
      const off =
        Math.sin((d / coarseWave) * 6.28 + ph[k]) * coarseAmp +
        Math.sin((d / (coarseWave * 0.43)) * 6.28 + ph[(k + 1) % 4]) *
          coarseAmp *
          0.35 +
        (r() * 2 - 1) * fineAmp;
      pts.push([ax + (bx - ax) * t + nx * off, ay + (by - ay) * t + ny * off]);
    }
  };

  const x0 = inset;
  const y0 = inset;
  const x1 = w - inset;
  const y1 = h - inset;

  side(x0, y0, x1, y0, 0, 1, 0); // top
  side(x1, y0, x1, y1, 1, 0, 1); // right
  side(x1, y1, x0, y1, 0, 1, 2); // bottom
  side(x0, y1, x0, y0, 1, 0, 3); // left

  const m = (a: [number, number], b: [number, number]) => [
    (a[0] + b[0]) / 2,
    (a[1] + b[1]) / 2,
  ];

  let d = `M${m(pts[pts.length - 1], pts[0])
    .map((v) => v.toFixed(1))
    .join(" ")}`;

  pts.forEach((p, i) => {
    const q = m(p, pts[(i + 1) % pts.length]);
    d += ` Q${p[0].toFixed(1)} ${p[1].toFixed(1)} ${q[0].toFixed(1)} ${q[1].toFixed(1)}`;
  });

  return d + "Z";
}

/**
 * Paper clip image from /paper_clip.png
 */
export const BinderClip = ({
  className = "",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) => (
  <img
    src="/paper_clip.png"
    alt=""
    aria-hidden
    className={className}
    style={{
      width: "90px",
      height: "auto",
      userSelect: "none",
      pointerEvents: "none",
      filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.22))",
      ...style,
    }}
  />
);

/**
 * Hand-drawn Sparks
 */
export const Sparks = ({ className = "" }: { className?: string }) => (
  <svg
    className={className}
    width="32"
    height="32"
    viewBox="0 0 32 32"
    aria-hidden
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
  >
    <path d="M22 17 L20 4" />
    <path d="M17 18 L6 7" />
    <path d="M18 24 L5 23" />
  </svg>
);

/**
 * Hand-drawn arrow + note annotation
 */
export const HandNote = ({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) => (
  <div className={`hand-note ${className}`} aria-hidden>
    <svg
      width="64"
      height="36"
      viewBox="0 0 64 36"
      fill="none"
      stroke="#000"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M62 6 C46 4 22 8 8 26" />
      <path d="M8 26 L9 14" />
      <path d="M8 26 L20 24" />
    </svg>
    <span>{text}</span>
  </div>
);

export type RoughBoxProps = {
  children: ReactNode;
  seed?: number;
  fill?: string;
  amp?: number;
  step?: number;
  rings?: "full" | number | "none";
  tape?: "tl" | "tr" | "none";
  clip?: boolean;
  clipLeft?: string;
  tilt?: number;
  shadow?: boolean | string;
  className?: string;
  bodyClassName?: string;
  style?: React.CSSProperties;
};

/**
 * Box component faithfully implementing paper-edge-prototype-large.html:
 * - Double wobbly ink stroke (fill + l1 + l2)
 * - 42px x 58px repeating rings on the left with wire loops & silver highlight
 * - Real metallic binder clip
 * - Washi tape
 */
export function RoughBox({
  children,
  seed = 7,
  fill = "#ffffff",
  amp = 1.25,
  step,
  rings = "full",
  tape = "none",
  clip = false,
  clipLeft = "42px",
  tilt = 0,
  shadow = true,
  className = "",
  bodyClassName = "",
  style = {},
}: RoughBoxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [{ w, h }, setSize] = useState({ w: 0, h: 0 });

  useIsomorphicLayoutEffect(() => {
    if (!ref.current) return;
    const updateSize = () => {
      if (ref.current) {
        setSize({
          w: Math.round(ref.current.offsetWidth),
          h: Math.round(ref.current.offsetHeight),
        });
      }
    };
    updateSize();
    const ro = new ResizeObserver(() => {
      updateSize();
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  // Primary wobbly path (d1)
  const d1 = useMemo(() => {
    if (!w || !h) return "";
    return roughEdge(w, h, seed, {
      inset: 3,
      fine: step ?? 9,
      fineAmp: 0.35,
      coarseWave: 85,
      coarseAmp: amp,
    });
  }, [w, h, seed, amp, step]);

  // Secondary architectural wobbly path (d2) as specified in paper-edge-prototype-large.html
  const d2 = useMemo(() => {
    if (!w || !h) return "";
    return roughEdge(w, h, seed === 7 ? 19 : seed + 12, {
      inset: 3.5,
      fine: step ?? 9,
      fineAmp: 0.25,
      coarseWave: 85,
      coarseAmp: amp * 0.75,
    });
  }, [w, h, seed, amp, step]);

  return (
    <div
      ref={ref}
      className={`sheet relative flow-root ${className}`}
      style={{
        position: "relative",
        boxSizing: "border-box",
        transform: tilt ? `rotate(${tilt}deg)` : undefined,
        ...style,
      }}
    >
      {/* Edge SVG: Double Stroke Lines */}
      <svg
        className="edge"
        style={{
          position: "absolute",
          inset: 0,
          overflow: "visible",
          pointerEvents: "none",
          filter:
            typeof shadow === "string"
              ? shadow
              : shadow
                ? "drop-shadow(4px 5px 0 rgba(120,95,50,.16))"
                : "none",
        }}
        width={w || "100%"}
        height={h || "100%"}
        viewBox={w && h ? `0 0 ${w} ${h}` : undefined}
        aria-hidden
      >
        {d1 ? (
          <>
            <path className="fill" d={d1} style={{ fill, stroke: "none" }} />
            <path
              className="l1"
              d={d1}
              style={{
                fill: "none",
                stroke: "var(--ink, #111)",
                strokeWidth: 1.6,
                strokeLinecap: "round",
                strokeLinejoin: "round",
              }}
            />
            <path
              className="l2"
              d={d2}
              style={{
                fill: "none",
                stroke: "var(--ink, #111)",
                strokeWidth: 0.9,
                strokeLinecap: "round",
                strokeLinejoin: "round",
                opacity: 0.6,
              }}
            />
          </>
        ) : (
          <rect
            x="3"
            y="3"
            width={w ? w - 6 : "calc(100% - 6px)"}
            height={h ? h - 6 : "calc(100% - 6px)"}
            style={{ fill }}
            stroke="var(--ink, #111)"
            strokeWidth="1.8"
            rx="4"
          />
        )}
      </svg>

      {/* Repeating rings */}
      {rings === "full" && (
        <i
          className="rings"
          style={{
            position: "absolute",
            left: "4px",
            top: "24px",
            bottom: "24px",
            width: "42px",
            backgroundRepeat: "repeat-y",
            backgroundSize: "42px 58px",
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='42' height='58' viewBox='0 0 42 58'%3E%3Cpath d='M0 20 C8 20 13 22.5 13 29 C13 35.5 8 38 0 38' fill='none' stroke='%23111' stroke-width='2.2' stroke-linecap='round'/%3E%3Ccircle cx='23' cy='29' r='10' fill='%23D9D5CD' stroke='%23111' stroke-width='2.3'/%3E%3Cpath d='M17 33.5 A6.8 6.8 0 0 0 27 35.5' fill='none' stroke='%23fff' stroke-opacity='.55' stroke-width='1.6' stroke-linecap='round'/%3E%3C/svg%3E\")",
            pointerEvents: "none",
            zIndex: 10,
          }}
          aria-hidden
        />
      )}

      {typeof rings === "number" && (
        <i
          className="rings"
          style={{
            position: "absolute",
            left: "4px",
            top: "50%",
            transform: "translateY(-50%)",
            height: `${rings * 58}px`,
            width: "42px",
            backgroundRepeat: "repeat-y",
            backgroundSize: "42px 58px",
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='42' height='58' viewBox='0 0 42 58'%3E%3Cpath d='M0 20 C8 20 13 22.5 13 29 C13 35.5 8 38 0 38' fill='none' stroke='%23111' stroke-width='2.2' stroke-linecap='round'/%3E%3Ccircle cx='23' cy='29' r='10' fill='%23D9D5CD' stroke='%23111' stroke-width='2.3'/%3E%3Cpath d='M17 33.5 A6.8 6.8 0 0 0 27 35.5' fill='none' stroke='%23fff' stroke-opacity='.55' stroke-width='1.6' stroke-linecap='round'/%3E%3C/svg%3E\")",
            pointerEvents: "none",
            zIndex: 10,
          }}
          aria-hidden
        />
      )}

      {tape === "tr" && (
        <span
          className="tape"
          style={{
            position: "absolute",
            top: "-10px",
            right: "26px",
            width: "78px",
            height: "28px",
            background: "rgba(230, 207, 166, 0.92)",
            clipPath:
              "polygon(0 0, 3% 12%, 0 25%, 3% 38%, 0 50%, 3% 63%, 0 75%, 3% 88%, 0 100%, 100% 100%, 97% 88%, 100% 75%, 97% 63%, 100% 50%, 97% 38%, 100% 25%, 97% 12%, 100% 0)",
            transform: "rotate(8deg)",
            filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.18))",
            pointerEvents: "none",
            zIndex: 20,
          }}
          aria-hidden
        />
      )}
      {tape === "tl" && (
        <span
          className="tape"
          style={{
            position: "absolute",
            top: "-10px",
            left: "40px",
            width: "74px",
            height: "26px",
            background: "rgba(230, 207, 166, 0.92)",
            clipPath:
              "polygon(0 0, 3% 12%, 0 25%, 3% 38%, 0 50%, 3% 63%, 0 75%, 3% 88%, 0 100%, 100% 100%, 97% 88%, 100% 75%, 97% 63%, 100% 50%, 97% 38%, 100% 25%, 97% 12%, 100% 0)",
            transform: "rotate(-6deg)",
            filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.18))",
            pointerEvents: "none",
            zIndex: 20,
          }}
          aria-hidden
        />
      )}

      {clip && (
        <BinderClip
          className="clip"
          style={{
            position: "absolute",
            left: clipLeft,
            top: "-30px",
            pointerEvents: "none",
            zIndex: 20,
          }}
        />
      )}

      {/* Content wrapper */}
      <div className={`relative z-1 ${bodyClassName}`}>{children}</div>
    </div>
  );
}
