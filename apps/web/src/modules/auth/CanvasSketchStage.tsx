"use client";

import React from "react";
import Image from "next/image";
import { TraceLogo } from "./TraceLogo";

export function CanvasSketchStage() {
  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden select-none light-canvas-grid text-black">
      {/* Background subtle light wash in bottom right corner matching Image 1 */}
      <svg
        className="absolute bottom-0 right-0 w-full h-full pointer-events-none"
        preserveAspectRatio="none"
        viewBox="0 0 600 700"
        fill="none"
      >
        <path
          d="M260,700 C400,560 480,480 600,430 L600,700 Z"
          fill="#ECEAE4"
          opacity="0.5"
        />
      </svg>

      {/* Top Header - Justified Between: Logo on far left, CANVAS / STUDIO on far right */}
      <header className="relative z-20 pt-8 sm:pt-10 px-8 sm:px-12 flex items-center justify-between w-full shrink-0">
        <TraceLogo size={44} className="text-black" />
        <div className="inline-flex items-center gap-1.5 px-3 py-1 border-[1.5px] border-black rounded-[2px] bg-white font-roboto-mono text-[12px] font-medium leading-[1.4] tracking-[0.5px] text-black uppercase shadow-xs">
          <span>CANVAS</span>
          <span className="text-[#E03E2D] font-bold">/</span>
          <span>STUDIO</span>
        </div>
      </header>

      {/* Main Illustration Canvas - Shifted down with spacious, clean layout matching Image 2 */}
      <div className="relative z-10 flex-1 w-full flex items-center justify-center px-4 sm:px-8 py-1 my-auto min-h-0">
        <svg
          viewBox="0 0 600 450"
          className="w-full max-w-[690px] max-h-[50vh] h-auto drop-shadow-xs"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Diagonal black hatching pattern */}
            <pattern
              id="hatch-black"
              width="6"
              height="6"
              patternTransform="rotate(45 0 0)"
              patternUnits="userSpaceOnUse"
            >
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="6"
                stroke="#000000"
                strokeWidth="1.6"
              />
            </pattern>

            {/* Red diagonal hatch for triangle */}
            <pattern
              id="hatch-red"
              width="5"
              height="5"
              patternTransform="rotate(45 0 0)"
              patternUnits="userSpaceOnUse"
            >
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="5"
                stroke="#EF4444"
                strokeWidth="1.5"
              />
            </pattern>

            {/* Blue diagonal hatch for triangle matching Image 2 */}
            <pattern
              id="hatch-blue"
              width="5"
              height="5"
              patternTransform="rotate(45 0 0)"
              patternUnits="userSpaceOnUse"
            >
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="5"
                stroke="#2563EB"
                strokeWidth="1.5"
              />
            </pattern>
          </defs>

          {/* ======================================================= */}
          {/* WIREFRAME GRID ACCENT (Top Left)                        */}
          {/* ======================================================= */}
          <g transform="translate(140, 36) rotate(-14)">
            <rect
              x="0"
              y="0"
              width="52"
              height="38"
              rx="3"
              stroke="#000000"
              strokeWidth="2.5"
              fill="#FFFFFF"
            />
            <line
              x1="17"
              y1="0"
              x2="17"
              y2="38"
              stroke="#000000"
              strokeWidth="2"
            />
            <line
              x1="35"
              y1="0"
              x2="35"
              y2="38"
              stroke="#000000"
              strokeWidth="2"
            />
            <line
              x1="0"
              y1="19"
              x2="52"
              y2="19"
              stroke="#000000"
              strokeWidth="2"
            />
          </g>

          {/* Curved Dotted Arrow pointing towards photo card */}
          <path
            d="M205,52 Q232,40 256,52"
            stroke="#000000"
            strokeWidth="2.4"
            strokeDasharray="4 4"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M249,45 L257,53 L247,59"
            stroke="#000000"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />

          {/* Downward curved arrow between yellow note and card */}
          <path
            d="M125,98 C144,120 148,145 142,175"
            stroke="#000000"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M135,166 L142,176 L150,166"
            stroke="#000000"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />

          {/* ======================================================= */}
          {/* CENTRAL TILTED PHOTO CANVAS FRAME                       */}
          {/* ======================================================= */}
          <g transform="translate(225, 62) rotate(-7)">
            {/* Soft cast shadow behind card */}
            <rect
              x="-14"
              y="16"
              width="235"
              height="172"
              rx="16"
              fill="#DDD9D0"
              opacity="0.95"
            />

            {/* White card body with clean solid black border */}
            <rect
              x="0"
              y="0"
              width="235"
              height="172"
              rx="16"
              fill="#FFFFFF"
              stroke="#000000"
              strokeWidth="3"
            />

            {/* Sun in picture */}
            <circle
              cx="115"
              cy="62"
              r="18"
              stroke="#000000"
              strokeWidth="2.8"
              fill="#FFFFFF"
            />
            {/* 8 Sun rays */}
            <line
              x1="115"
              y1="38"
              x2="115"
              y2="28"
              stroke="#000000"
              strokeWidth="2.6"
              strokeLinecap="round"
            />
            <line
              x1="115"
              y1="86"
              x2="115"
              y2="96"
              stroke="#000000"
              strokeWidth="2.6"
              strokeLinecap="round"
            />
            <line
              x1="91"
              y1="62"
              x2="81"
              y2="62"
              stroke="#000000"
              strokeWidth="2.6"
              strokeLinecap="round"
            />
            <line
              x1="139"
              y1="62"
              x2="149"
              y2="62"
              stroke="#000000"
              strokeWidth="2.6"
              strokeLinecap="round"
            />
            <line
              x1="98"
              y1="45"
              x2="91"
              y2="38"
              stroke="#000000"
              strokeWidth="2.6"
              strokeLinecap="round"
            />
            <line
              x1="132"
              y1="79"
              x2="139"
              y2="86"
              stroke="#000000"
              strokeWidth="2.6"
              strokeLinecap="round"
            />
            <line
              x1="132"
              y1="45"
              x2="139"
              y2="38"
              stroke="#000000"
              strokeWidth="2.6"
              strokeLinecap="round"
            />
            <line
              x1="98"
              y1="79"
              x2="91"
              y2="86"
              stroke="#000000"
              strokeWidth="2.6"
              strokeLinecap="round"
            />

            {/* Rolling Mountain Peaks */}
            <path
              d="M18,148 Q65,92 110,122 T220,150"
              stroke="#000000"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M82,126 Q138,88 202,132"
              stroke="#000000"
              strokeWidth="2.8"
              fill="none"
              strokeLinecap="round"
            />

            {/* Slope hatching lines matching Image 2 */}
            <line
              x1="38"
              y1="147"
              x2="48"
              y2="126"
              stroke="#000000"
              strokeWidth="2.2"
            />
            <line
              x1="54"
              y1="147"
              x2="66"
              y2="118"
              stroke="#000000"
              strokeWidth="2.2"
            />
            <line
              x1="70"
              y1="147"
              x2="82"
              y2="116"
              stroke="#000000"
              strokeWidth="2.2"
            />
            <line
              x1="86"
              y1="147"
              x2="98"
              y2="124"
              stroke="#000000"
              strokeWidth="2.2"
            />
            <line
              x1="126"
              y1="145"
              x2="140"
              y2="118"
              stroke="#000000"
              strokeWidth="2.2"
            />
            <line
              x1="146"
              y1="145"
              x2="160"
              y2="116"
              stroke="#000000"
              strokeWidth="2.2"
            />
            <line
              x1="166"
              y1="145"
              x2="178"
              y2="122"
              stroke="#000000"
              strokeWidth="2.2"
            />
          </g>

          {/* ======================================================= */}
          {/* YELLOW STICKY NOTE WITH SHADOW (Top Left)               */}
          {/* ======================================================= */}
          <g transform="translate(42, 85) rotate(-7)">
            {/* Soft cast shadow behind sticky note */}
            <rect
              x="7"
              y="8"
              width="128"
              height="112"
              rx="2"
              fill="#D8D5CD"
              opacity="0.85"
            />
            {/* Yellow sticky note body */}
            <rect
              x="0"
              y="0"
              width="128"
              height="112"
              rx="2"
              fill="#FEF08A"
              stroke="rgba(0,0,0,0.18)"
              strokeWidth="1.2"
            />
            {/* 4 lines of all-caps bold text */}
            <text
              x="16"
              y="29"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontSize="12"
              fontWeight="900"
              letterSpacing="0.04em"
              fill="#000000"
            >
              IDEAS
            </text>
            <text
              x="16"
              y="49"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontSize="12"
              fontWeight="900"
              letterSpacing="0.04em"
              fill="#000000"
            >
              DIAGRAMS
            </text>
            <text
              x="16"
              y="69"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontSize="12"
              fontWeight="900"
              letterSpacing="0.04em"
              fill="#000000"
            >
              SYSTEMS
            </text>
            <text
              x="16"
              y="89"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontSize="12"
              fontWeight="900"
              letterSpacing="0.04em"
              fill="#000000"
            >
              TOGETHER.
            </text>
          </g>

          {/* 3 tiny accent radiating lines to the left of yellow sticky note */}
          <line
            x1="32"
            y1="148"
            x2="21"
            y2="144"
            stroke="#000000"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <line
            x1="33"
            y1="158"
            x2="20"
            y2="160"
            stroke="#000000"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <line
            x1="35"
            y1="168"
            x2="24"
            y2="174"
            stroke="#000000"
            strokeWidth="2.2"
            strokeLinecap="round"
          />

          {/* ======================================================= */}
          {/* PURPLE STICKY NOTE WITH SHADOW (Top Right)              */}
          {/* ======================================================= */}
          <g transform="translate(420, 108) rotate(-3)">
            {/* Cast shadow behind purple note */}
            <rect
              x="7"
              y="8"
              width="136"
              height="112"
              rx="2"
              fill="#D0C9DE"
              opacity="0.85"
            />
            {/* Purple sticky note body */}
            <rect
              x="0"
              y="0"
              width="136"
              height="112"
              rx="2"
              fill="#DDD6FE"
              stroke="rgba(0,0,0,0.18)"
              strokeWidth="1.2"
            />
            {/* 3 lines of all-caps bold text */}
            <text
              x="16"
              y="32"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontSize="12"
              fontWeight="900"
              letterSpacing="0.04em"
              fill="#000000"
            >
              BUILD
            </text>
            <text
              x="16"
              y="53"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontSize="12"
              fontWeight="900"
              letterSpacing="0.04em"
              fill="#000000"
            >
              VISUALIZE
            </text>
            <text
              x="16"
              y="74"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontSize="12"
              fontWeight="900"
              letterSpacing="0.04em"
              fill="#000000"
            >
              COLLABORATE.
            </text>
            {/* Hand-drawn underline under COLLABORATE. strictly inside the box */}
            <path
              d="M14,83 Q60,81 110,82"
              stroke="#000000"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
            />
          </g>

          {/* Sparkle 4-point star near top right */}
          <g transform="translate(418, 56)">
            <path
              d="M12,0 Q12,12 24,12 Q12,12 12,24 Q12,12 0,12 Q12,12 12,0 Z"
              fill="#000000"
            />
          </g>

          {/* Small outline triangle near top right */}
          <polygon
            points="385,116 397,138 373,138"
            stroke="#000000"
            strokeWidth="2.4"
            fill="none"
          />

          {/* ======================================================= */}
          {/* GEOMETRIC SHAPES (Left Side)                            */}
          {/* ======================================================= */}
          {/* Blue outlined hatched triangle */}
          <polygon
            points="126,212 144,246 108,246"
            stroke="#2563EB"
            strokeWidth="2.4"
            fill="url(#hatch-blue)"
          />

          {/* Red outlined hatched triangle */}
          <polygon
            points="162,228 180,262 144,262"
            stroke="#EF4444"
            strokeWidth="2.4"
            fill="url(#hatch-red)"
          />

          {/* Small black plus near triangles */}
          <g
            transform="translate(94, 246)"
            stroke="#000000"
            strokeWidth="2.2"
            strokeLinecap="round"
          >
            <line x1="0" y1="5" x2="10" y2="5" />
            <line x1="5" y1="0" x2="5" y2="10" />
          </g>

          {/* Hatched black circle (left) */}
          <circle
            cx="128"
            cy="302"
            r="21"
            stroke="#000000"
            strokeWidth="2.4"
            fill="url(#hatch-black)"
          />

          {/* Tilted blue outline square */}
          <rect
            x="176"
            y="298"
            width="18"
            height="18"
            stroke="#2563EB"
            strokeWidth="2.4"
            fill="none"
            transform="rotate(22 185 307)"
          />

          {/* Blue Avatar / Person Outline */}
          <g transform="translate(82, 342)">
            <circle
              cx="18"
              cy="12"
              r="8"
              stroke="#2563EB"
              strokeWidth="2.4"
              fill="none"
            />
            <path
              d="M4,36 C4,24 10,22 18,22 C26,22 32,24 32,36"
              stroke="#2563EB"
              strokeWidth="2.4"
              fill="none"
              strokeLinecap="round"
            />
          </g>

          {/* ======================================================= */}
          {/* SELECTION BOX WITH LOCK (Center Bottom)                 */}
          {/* ======================================================= */}
          <g transform="translate(225, 276)">
            {/* Cyan dashed selection rectangle */}
            <rect
              x="0"
              y="0"
              width="86"
              height="86"
              stroke="#0091FF"
              strokeWidth="2.2"
              strokeDasharray="5 4"
              fill="rgba(0, 145, 255, 0.02)"
            />

            {/* Solid blue square handles at corners */}
            <rect x="-4" y="-4" width="8" height="8" fill="#0091FF" />
            <rect x="82" y="-4" width="8" height="8" fill="#0091FF" />
            <rect x="-4" y="82" width="8" height="8" fill="#0091FF" />
            <rect x="82" y="82" width="8" height="8" fill="#0091FF" />

            {/* Small center ticks on edges matching Image 2 */}
            <rect x="39" y="-3" width="8" height="6" fill="#000000" rx="1" />
            <rect x="39" y="83" width="8" height="6" fill="#000000" rx="1" />
            <rect x="-3" y="39" width="6" height="8" fill="#000000" rx="1" />
            <rect x="83" y="39" width="6" height="8" fill="#000000" rx="1" />

            {/* Centered Padlock Icon */}
            <g transform="translate(29, 21)">
              <path
                d="M6,13 V8 C6,3.5 9.5,0 14,0 C18.5,0 22,3.5 22,8 V13"
                stroke="#000000"
                strokeWidth="2.8"
                strokeLinecap="round"
                fill="none"
              />
              <rect
                x="0"
                y="12"
                width="28"
                height="24"
                rx="3"
                stroke="#000000"
                strokeWidth="2.8"
                fill="#FFFFFF"
              />
              <circle cx="14" cy="21" r="2.5" fill="#000000" />
              <line
                x1="14"
                y1="23"
                x2="14"
                y2="28"
                stroke="#000000"
                strokeWidth="2.4"
                strokeLinecap="round"
              />
            </g>
          </g>

          {/* Sweeping red dashed curved arrow below selection box */}
          <path
            d="M152,402 C194,368 244,384 288,376"
            stroke="#EF4444"
            strokeWidth="2.6"
            strokeDasharray="5 4"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M280,369 L290,376 L281,385"
            stroke="#EF4444"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />

          {/* ======================================================= */}
          {/* RED SMILEY SUN & CIRCLE HATCH (Right Center)            */}
          {/* ======================================================= */}
          <polygon
            points="348,252 360,274 336,274"
            stroke="#000000"
            strokeWidth="2.4"
            fill="none"
          />

          <g transform="translate(378, 230)">
            <circle
              cx="25"
              cy="25"
              r="17"
              stroke="#EF4444"
              strokeWidth="2.6"
              fill="#FFFFFF"
            />
            <circle cx="19" cy="21" r="1.8" fill="#EF4444" />
            <circle cx="31" cy="21" r="1.8" fill="#EF4444" />
            <path
              d="M19,27 Q25,34 31,27"
              stroke="#EF4444"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
            />
            {/* 8 squiggly red rays */}
            <line
              x1="25"
              y1="4"
              x2="25"
              y2="-4"
              stroke="#EF4444"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            <line
              x1="25"
              y1="46"
              x2="25"
              y2="54"
              stroke="#EF4444"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            <line
              x1="4"
              y1="25"
              x2="-4"
              y2="25"
              stroke="#EF4444"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            <line
              x1="46"
              y1="25"
              x2="54"
              y2="25"
              stroke="#EF4444"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            <line
              x1="10"
              y1="10"
              x2="4"
              y2="4"
              stroke="#EF4444"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            <line
              x1="40"
              y1="40"
              x2="46"
              y2="46"
              stroke="#EF4444"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            <line
              x1="40"
              y1="10"
              x2="46"
              y2="4"
              stroke="#EF4444"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            <line
              x1="10"
              y1="40"
              x2="4"
              y2="46"
              stroke="#EF4444"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          </g>

          {/* Hatched circle to the right of smiley sun */}
          <circle
            cx="472"
            cy="282"
            r="22"
            stroke="#000000"
            strokeWidth="2.4"
            fill="url(#hatch-black)"
          />

          {/* ======================================================= */}
          {/* PLAY BUTTON WITH SOLID SHADOW (Bottom Right of Lock)    */}
          {/* ======================================================= */}
          <g transform="translate(382, 335)">
            {/* Solid offset shadow underneath play circle */}
            <circle cx="34" cy="34" r="28" fill="#000000" opacity="0.2" />
            {/* White play circle with thick black border */}
            <circle
              cx="28"
              cy="28"
              r="28"
              fill="#FFFFFF"
              stroke="#000000"
              strokeWidth="2.8"
            />
            {/* Blue Play Triangle */}
            <polygon
              points="23,17 39,28 23,39"
              stroke="#0091FF"
              strokeWidth="2.8"
              strokeLinejoin="round"
              fill="none"
            />
          </g>

          {/* Sparkle 4-point star near play button */}
          <g transform="translate(348, 412)">
            <path
              d="M7,0 Q7,7 14,7 Q7,7 7,14 Q7,7 0,7 Q7,7 7,0 Z"
              fill="#000000"
            />
          </g>

          {/* Scattered plus accents matching Image 2 */}
          <g stroke="#000000" strokeWidth="2.2" strokeLinecap="round">
            {/* Above card */}
            <g transform="translate(374, 94)">
              <line x1="0" y1="5" x2="10" y2="5" />
              <line x1="5" y1="0" x2="5" y2="10" />
            </g>
            {/* Near purple note */}
            <g transform="translate(410, 168)">
              <line x1="0" y1="5" x2="10" y2="5" />
              <line x1="5" y1="0" x2="5" y2="10" />
            </g>
            {/* Left of play button */}
            <g transform="translate(330, 318)">
              <line x1="0" y1="5" x2="10" y2="5" />
              <line x1="5" y1="0" x2="5" y2="10" />
            </g>
            {/* Below play button */}
            <g transform="translate(315, 382)">
              <line x1="0" y1="5" x2="10" y2="5" />
              <line x1="5" y1="0" x2="5" y2="10" />
            </g>
          </g>
        </svg>
      </div>

      {/* Bottom Editorial Caption - Styled with brandDisplay, Roboto Mono, and brandSans */}
      <div className="relative z-10 px-8 sm:px-12 pb-5 sm:pb-6 pt-1 shrink-0">
        <div className="flex items-center gap-2 mb-1.5 font-roboto-mono text-[11px] sm:text-[12px] font-normal leading-[1.4] tracking-[1px] uppercase text-[#71717A]">
          <span>WORKSPACE CANVAS</span>
          <span className="text-[#E03E2D] font-bold">·</span>
          <span>MULTI-USER EDITING</span>
        </div>

        <h1 className="brand-display-bold text-[clamp(28px,3.2vw,44px)] text-black leading-[1.05] max-w-lg">
          Where thoughts
          <br />
          take shape
          <span className="text-[#E03E2D]">.</span>
        </h1>

        <p className="font-brand-sans text-[14px] sm:text-[15px] font-normal leading-[1.4] tracking-normal text-[#555555] mt-2 max-w-md">
          An infinite collaborative canvas for engineering diagrams, wireframes,
          and living visual systems.
        </p>

        {/* Hand-drawn sketch flourish using sketchline.png */}
        <div className="mt-2.5">
          <Image
            src="/sketchline.png"
            alt="Sketch flourish"
            width={148}
            height={44}
            className="w-[135px] sm:w-[148px] h-auto pointer-events-none select-none"
            priority
          />
        </div>

        {/* Dotted Grid at Bottom Right of Left Pane matching Image 1 */}
        <div
          aria-hidden="true"
          className="hidden md:block absolute right-8 sm:right-12 bottom-6 sm:bottom-7 pointer-events-none opacity-40 select-none"
        >
          <svg width="96" height="112" viewBox="0 0 96 112" fill="none">
            {[0, 1, 2, 3, 4, 5].map((col) =>
              [0, 1, 2, 3, 4, 5, 6].map((row) => (
                <circle
                  key={`btm-grid-dot-${col}-${row}`}
                  cx={8 + col * 16}
                  cy={8 + row * 16}
                  r="1.8"
                  fill="#000000"
                />
              )),
            )}
          </svg>
        </div>
      </div>
    </div>
  );
}
