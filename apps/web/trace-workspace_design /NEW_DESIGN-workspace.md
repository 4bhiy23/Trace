# TRACE design reference

Product: TRACE workspace dashboard (Dashboard + Project detail screens)
Theme: **Paper-inspired, not cartoonish.** Same cream + lime + black palette as before. The chrome is now a notebook desk: ruled-paper surfaces, ring-binder edges, and a few pieces of tape and binder clips used as accents.

> **Provenance.** Color tokens, spacing scale, motion and the base CSS variables are carried over from the previous measured capture (DESIGN-workspace.md, 1512 × 827). Everything marked _(est.)_ was read from the two current screenshots (Dashboard, `patra` project view) and should be verified against code. Hover, focus, active and dark-mode states were not captured.

---

## 1. Design principles

1. **Paper first.** Surfaces behave like paper: warm off-white, 2px ink outlines, a hard offset shadow instead of blur.
2. **Decoration is rare.** Tape, binder clips and hand-drawn doodles are *accents*, not texture. See §6 for the budget.
3. **Ink-and-highlighter palette.** Black ink for structure, lime (`#E9FFA3`) as the single highlighter for "active / primary / positive". No new hues.
4. **Mono for metadata, sans for content.** Labels, counts, badges and table headers are uppercase monospace. Names and descriptions are sans.
5. **Functional layout stays strict.** Tables, sidebar and top bar are crisp, aligned and grid-based. Only *containers* get hand-drawn edges, never the data inside them.

---

## 2. Color palette (unchanged)

| Token | Value | Usage |
| --- | --- | --- |
| `--ink` / `--info-foreground` | `#000000` | Text, borders, icons, primary button fill, focus |
| `--ink-muted` | `#636363` | Secondary text (descriptions, dates), muted icons |
| `--paper` / `--popover` | `#FFFEFC` | App background, popovers |
| `--paper-white` / `--card` | `#FFFFFF` | Cards, inputs, small chips |
| `--paper-shade` / `--muted` | `#ECE7E0` | Sidebar, table header row, grid lines |
| `--highlighter` | `#E9FFA3` | Active nav, active tab, primary CTA, badges, hero card |
| `--tape` _(est.)_ | `#E6CFA6` | Tape strips only (see §6). Used at ~90% opacity |
| `--divider` | `#DAD1C5` | Row separators, dashed section rules |
| `--border` | `rgba(0,0,0,0.2)` | Subtle 1px borders (inner table frame) |
| `--success` | `#14773F` | Success state |
| `--warning` | `#F5C842` | Warning state |

**Dark mode:** a toggle exists in the top bar (moon icon). Dark tokens were not captured. Define them before shipping; keep lime as the highlighter and invert paper/ink.

---

## 3. Typography

Previous `brandSans` single-family system is replaced by a three-voice system. Family names marked _(est.)_ are the closest match to the screenshots; swap for the real font files.

| Role | Family | Size | Weight | Line height | Tracking | Transform |
| --- | --- | --- | --- | --- | --- | --- |
| Logo / Display | Condensed heavy grotesque _(est. Barlow Condensed / Bebas-style)_ | 36–40px logo | 800 | 1 | -0.5px | none |
| Card title (e.g. "Create a Project", "patra") | Condensed grotesque, same as display | 28–32px | 700 | 1.1 | -0.6px | none |
| Body / row names | Sans _(est. Inter / Public Sans)_ | 14–15px | 500 (names) / 400 | 20px | normal | none |
| Description / secondary | Sans | 13–14px | 400 | 18px | normal | none, color `--ink-muted` |
| Label / metadata / table head | Monospace _(est. JetBrains Mono / Space Mono)_ | 12–13px | 500–700 | 16px | 0.35–0.6px | **UPPERCASE** |
| Buttons & badges | Monospace | 12–13px | 700 | 16px | 0.35px | **UPPERCASE** |
| Handwritten note | Casual handwriting _(est. Caveat / Patrick Hand)_ | 18–22px | 400 | 1.1 | normal | none, rotated -15° to -20° |

Rules:
- Handwriting is used for **one** annotation per screen (e.g. "Start from scratch!"). Never for UI controls or data.
- Dates use tabular figures and `DD/MM/YYYY`.

---

## 4. Spacing, radii, borders, shadows

**Spacing scale** (same as before): 2, 4, 8, 10, 12, 16, 24. Default gaps: 8px (controls), 12–16px (rows/cards), 24px (page padding, section spacing). Main content padding: 24px.

**Control height:** `--brand-control-height: 42px` for search, Invite, tabs and NEW FILE _(est. 40–48px for NEW FILE)_.

**Corner radii**
| Element | Radius |
| --- | --- |
| Buttons, inputs, tabs, badges, sidebar items, kbd chips | `2–4px` _(est.)_, near-square |
| Theme toggle, avatar | `9999px` (circle) |
| Paper containers (hero card, table sheet) | Irregular hand-drawn edge, see §6 (no CSS radius) |

**Borders**
- Interactive controls: `2px solid #000`.
- Active nav item / active tab: `2px solid #000` on `#E9FFA3`.
- Inactive nav item: `2px solid transparent` (keeps layout stable).
- Inner table frame and row dividers: `1px` at `--border` / `--divider`.
- Paper container outline: ~2px ink line with a slight wobble (SVG path or `border-image`), not a straight CSS border.

**Shadows (hard, offset, no blur)**
| Token | Value | Used on |
| --- | --- | --- |
| `--shadow-hard` | `rgba(0,0,0,0.14) 5px 6px 0 0` | Hero card, table sheet (paper lift) |
| `--shadow-btn` _(est.)_ | `0 3px 0 0 #000` (bottom/right ink edge) | Primary buttons: NEW FILE, "+" tile, "Back to Projects", search field |
| `--shadow-soft` | `0 1px 3px rgba(0,0,0,.1), 0 1px 2px -1px rgba(0,0,0,.1)` | Small floating chips/popovers only |

**Background texture:** page canvas is `#FFFEFC` with a 1px grid: `linear-gradient(to right, #ECE7E0 1px, transparent 1px), linear-gradient(#ECE7E0 1px, transparent 1px)` at ~40px cell _(est.)_, very low contrast.

---

## 5. Layout

- **Shell:** left sidebar (~296px, `--paper-shade`, 1px ink right border) + main column. Top bar (~72px) spans the main column with a 1px ink bottom border.
- **Sidebar, top to bottom:** logo → workspace switcher → `OVERVIEW` label + Dashboard item → `PROJECTS` label with "+" button → project list with count chips → (spacer) → `NEW FILE` primary button → user card (avatar, name, email, sign-out icon).
- **Top bar, left to right:** filter tabs (All / Recents / Created by Me) → flexible space → search → Invite → theme toggle.
- **Main:** page header card → section header → content sheet. Vertical rhythm 24–32px between blocks.
- **Responsive breakpoints (carried over):** 40rem, 48rem, 64rem, 80rem, 96rem, plus `(max-width: 600px)`. At small widths: sidebar collapses, table rows become stacked cards, binder rings and tape are hidden.

---

## 6. Paper motifs: usage budget

These are the "paper-inspired, not cartoonish" rules.

| Motif | Where | Max per screen |
| --- | --- | --- |
| **Tape strip** (`--tape`, ~64×24px, rotated ±4°, slight transparency) | Top edge of a page-header card, and top-right corner of the main content sheet | **2** |
| **Binder clip** (black, flat icon) | Top-left of the main content sheet only | **1** |
| **Ring-binder holes** (small circles with 1.5px ink stroke, ~12px pitch) | Left edge of paper containers (hero card: 3 rings; table sheet: continuous column) | 2 containers |
| **Spark / motion doodles** (3 short ink strokes) | Corners of the page-header card and section header | Max 2 clusters |
| **Hand-drawn arrow + handwritten note** | Beside the hero CTA only | **1** |
| **Wobbly outline** (hand-drawn edge) | Page-header card and main content sheet only | 2 containers |

Do **not**: add tape or clips to buttons, rows, badges, sidebar items, inputs or modals; stack more than one motif on a single corner; animate motifs (except per §8). Everything inside a paper container (table, rows, controls) stays crisp and straight.

---

## 7. Components

### 7.1 Sidebar navigation item
```css
.nav-item {
  display: flex; align-items: center; gap: 8px;
  padding: 8px; border: 2px solid transparent; border-radius: 2px;
  font: 500 14px/20px var(--font-sans); color: #000;
}
.nav-item[aria-current="page"] { background: #E9FFA3; border-color: #000; }
.nav-item .kbd { margin-left: auto; font: 700 12px var(--font-mono);
  background: #fff; border: 1px solid #000; padding: 0 6px; }
```
Project items use a folder icon, mono-lowercase name and a right-aligned count chip (white, 1px ink border). The active project fills lime like Dashboard.

### 7.2 Workspace switcher
White field, 2px ink border, layers icon + truncated name + small mono `PRIVATE` tag (`--paper-shade` fill) + chevron. **Show the tag once** (the project screen currently renders it twice, a bug).

### 7.3 Filter tabs (All / Recents / Created by Me)
- Mono 12–13px, bold, `padding: 8px 16px`, `2px` ink border, white fill.
- Active tab: `#E9FFA3`.
- Both treatments exist: separated buttons with gaps (Dashboard), or a joined segmented group with shared borders (project view). **Pick the joined segmented group as the standard.**

### 7.4 Search field
White, `2px` ink border, `--shadow-btn`, magnifier icon, placeholder in `--ink-muted`, trailing `/` kbd chip (shortcut). Placeholder is contextual: "Search canvases…" on Dashboard, "Search projects…" in a project.

### 7.5 Buttons
| Variant | Fill | Border | Text | Notes |
| --- | --- | --- | --- | --- |
| Primary (NEW FILE, Back to Projects) | `#E9FFA3` | 2px ink | Mono caps / sans 600, ink | `--shadow-btn`; icon left (paper plane / back arrow) |
| Solid dark (Invite) | `#000` | none | white | Paper-plane icon left |
| Icon square ("+" in PROJECTS, "…" menu, open ↗) | `#fff` | 2px ink | ink | 32–40px square |
| Icon tile ("+" in hero) | `#E9FFA3` | 2px ink | ink | ~64px, `--shadow-btn` |
| Theme toggle | `#fff` | 2px ink | moon icon | Circle, 42px |

Press state _(est.)_: translate `0 2px`, shadow reduced to `0 1px 0 #000`.

### 7.6 Page header / hero card (paper note)
- Background: `#E9FFA3` for the "Create a Project" hero; `#FFFEFC` for the project-title header.
- Wobbly 2px ink outline, `--shadow-hard`, ring holes on the left edge, one tape strip at top-left.
- Content: icon tile + condensed title (28–32px) + sans description (`--ink-muted`) + trailing icon button / actions.
- Optional hand-drawn arrow + handwritten note outside the card on the right (hero only).

### 7.7 Section header
`[01]` lime index chip (mono, 1px ink border) · mono caps title with `•` separators (e.g. `PROJECTS DIRECTORY • ACTIVE REPOSITORY`) · dashed `--divider` rule filling remaining width · right-aligned mono counter (`04 / 04 PROJECTS`).

### 7.8 Data sheet (binder table)
- Container: `#FFFEFC`, wobbly ink outline, `--shadow-hard`, continuous ring holes down the left edge, binder clip top-left, tape top-right.
- Inner frame: 1px `--border`, white/paper fill, straight edges.
- **Header row:** `--paper-shade` fill, mono caps 12–13px, sort arrow (↓) on the active column. Keep header text aligned with its column data.
- **Rows:** ~76px tall, 1px `--divider` bottom border. Hover: very light `--paper-shade` wash _(est.)_.
- **Columns (Dashboard):** Project name · Canvases · Access level · Last updated · Action.
- **Columns (Project):** Name · Type · Created · Last edited · Action.
- **Name cell:** 48px square icon tile (white, 2px ink border, small radius) + name (sans 600) + description (`--ink-muted`).
- **Action cell:** `OPEN →` mono bold link + `…` overflow menu.

### 7.9 Badges
| Badge | Style |
| --- | --- |
| Count (`8 CANVASES`) | White fill, 2px ink border, mono caps |
| Access (`WORKSPACE`) | `#E9FFA3` fill, 1px ink border, mono caps |
| Type: `MARKDOWN` | White fill, ink border, document icon |
| Type: `UML` | `#E9FFA3` fill, ink border, `<>` icon |
| Workspace tag (`PRIVATE`) | `--paper-shade` fill, hairline border, 10–11px mono |

Lime = "emphasized / typed as diagram"; white = neutral. Don't introduce new badge colors.

### 7.10 User card
White, 2px ink border, circular black avatar with white initial, name (sans 600) and truncated email (12px, `--ink-muted`), sign-out icon button at right.

---

## 8. Motion

| Property | Value |
| --- | --- |
| Durations | 0.07s (press), 0.1s (hover), 0.15s (state), 0.2s (panels) |
| Easing | `ease` (default), `cubic-bezier(0.4,0,0.2,1)` (standard), `ease-out` (enter), `cubic-bezier(0,0,0.2,1)` |
| Keyframes kept | `spin`, `pulse-attention`, `chevron-shake`, `check-draw`, `dash-march`, `pin-pulse` |
| Keyframes removed | `ty-*` set (mailer "thank-you" envelope/seal animations). Not part of TRACE |

Motion budget: hover and press only. Paper motifs are **static**. Respect `prefers-reduced-motion` (disable `dash-march`, `pulse-attention`, `pin-pulse`).

---

## 9. CSS custom properties

Carried over from the previous capture, with new TRACE tokens added. Tailwind palette tokens and `--qb-*` browser-extension variables from the old file were dropped as noise.

```css
:root {
  /* color */
  --ink: #000;
  --ink-muted: #636363;
  --paper: #fffefc;
  --paper-white: #fff;
  --paper-shade: #ece7e0;
  --highlighter: #e9ffa3;
  --tape: #e6cfa6;          /* est. */
  --divider: #dad1c5;
  --border: #0003;
  --success: #14773f;
  --warning: #f5c842;

  /* legacy aliases kept for compatibility */
  --info-foreground: #000;
  --popover: #fffefc;
  --card: #fff;
  --muted: #ece7e0;
  --primary-foreground: #fff;
  --sidebar-primary-foreground: #fff;
  --color-white: #fff;

  /* type */
  --font-display: "Barlow Condensed", "Arial Narrow", system-ui, sans-serif;  /* est. */
  --font-sans: "Inter", system-ui, arial, sans-serif;                         /* est. */
  --font-mono: "JetBrains Mono", ui-monospace, monospace;                     /* est. */
  --font-hand: "Caveat", "Comic Sans MS", cursive;                            /* est. */
  --tracking-wider: .05em;

  /* shape */
  --radius-control: 2px;
  --radius-pill: 9999px;
  --brand-control-height: 42px;
  --brand-shadow-x: 5px;
  --shadow-hard: rgba(0,0,0,.14) 5px 6px 0 0;
  --shadow-btn: 0 3px 0 0 #000;                                               /* est. */
  --shadow-soft: 0 1px 3px 0 rgba(0,0,0,.1), 0 1px 2px -1px rgba(0,0,0,.1);

  /* motion */
  --ease-in: cubic-bezier(.4,0,1,1);
  --ease-standard: cubic-bezier(.4,0,.2,1);
  --container-md: 28rem;
}
```

---

## 10. Known inconsistencies to resolve

1. `PRIVATE` tag renders twice in the workspace switcher on the project screen.
2. `CREATED` column header sits lower/misaligned vs. other headers in the project table.
3. Filter tabs differ between screens (separated vs. joined). Standardize on joined (§7.3).
4. Sidebar active project (`patra`) uses a lime fill; confirm whether it should match Dashboard's active style exactly (it currently does, keep).
5. Dark-mode tokens not defined.

## 11. Capture coverage

- Values marked _(est.)_ come from screenshots, not computed styles.
- Hover, focus, active, disabled, loading, empty states, modals and other viewports were not captured.
- Hand-drawn outlines are described, not specified. Export the actual SVG paths from design source.
- No invented colors: the only new swatch is `--tape`, an estimate of the tape color in the screenshots.

---

## 12. How to build the paper effect (implementation recipe)

> **§14 overrides §12.A (path generator), §12.B (rings) and §12.D (clip).** Those were first-pass versions. §14 is tuned to the reference crop and was render-tested. Keep §12's layer structure, ring strip approach, tape (C) and usage (E).

**Rule for agents:** the paper sheet is *not* a CSS box. Do not use `border`, `border-radius`, `box-shadow` or `clip-path: inset()` for it. A straight CSS border can never look hand-drawn. Build it from four layers: (A) an SVG wobbly outline that is also the paper fill, (B) a repeating ring strip, (C) tape, (D) a binder clip. Content sits on top, untouched and straight.

```
┌ .paper-sheet (position: relative, no padding, no border) ┐
│  A  <svg>  wobbly path = fill + ink stroke + hard shadow │  z-index 0
│  B  <i>    ring strip, left edge, repeat-y               │  z-index 1
│  C  tape   top-right, rotated, torn ends                 │  z-index 2
│  D  clip   top-left, rotated                             │  z-index 2
│  .paper-sheet__body  (padding lives HERE)                │  z-index 1
└──────────────────────────────────────────────────────────┘
```

### A. Wobbly outline (rough edge)

Generate a rectangle path whose points are nudged by a small seeded random offset, then smooth it with quadratic curves. The **same path** is the paper fill, the ink line and (via `drop-shadow`) the offset shadow, so the fill never pokes out past the rough edge. Seeded, so it is identical on every render (no flicker, no hydration mismatch).

```tsx
// paper-sheet.tsx
import { useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";

function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Pt = [number, number];

export function roughRectPath(
  w: number, h: number, seed = 7,
  { step = 26, amp = 1.6, inset = 3 } = {}   // step: px between wobble points, amp: max wobble px
) {
  const rnd = mulberry32(seed);
  const jit = () => (rnd() * 2 - 1) * amp;
  const x0 = inset, y0 = inset, x1 = w - inset, y1 = h - inset;
  const pts: Pt[] = [];
  const edge = (ax: number, ay: number, bx: number, by: number) => {
    const n = Math.max(2, Math.round(Math.hypot(bx - ax, by - ay) / step));
    for (let i = 0; i < n; i++) {
      const t = i / n;
      pts.push([ax + (bx - ax) * t + jit(), ay + (by - ay) * t + jit()]);
    }
  };
  edge(x0, y0, x1, y0); edge(x1, y0, x1, y1);   // top, right
  edge(x1, y1, x0, y1); edge(x0, y1, x0, y0);   // bottom, left

  const mid = (a: Pt, b: Pt): Pt => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  let d = `M${mid(pts[pts.length - 1], pts[0]).join(" ")}`;
  pts.forEach((p, i) => {
    const m = mid(p, pts[(i + 1) % pts.length]);
    d += ` Q${p[0]} ${p[1]} ${m[0]} ${m[1]}`;
  });
  return d + "Z";
}

export function PaperSheet({ children, seed = 7, className = "" }: {
  children: ReactNode; seed?: number; className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [{ w, h }, setSize] = useState({ w: 0, h: 0 });

  useLayoutEffect(() => {
    const ro = new ResizeObserver(([e]) =>
      setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(ref.current!);
    return () => ro.disconnect();
  }, []);

  const d = useMemo(() => (w ? roughRectPath(w, h, seed) : ""), [w, h, seed]);

  return (
    <div ref={ref} className={`paper-sheet ${className}`}>
      <svg className="paper-sheet__edge" width={w} height={h} aria-hidden>
        <path d={d} />
      </svg>
      <i className="paper-sheet__rings" aria-hidden />
      <span className="tape paper-sheet__tape" aria-hidden />
      <BinderClip className="paper-sheet__clip" />
      <div className="paper-sheet__body">{children}</div>
    </div>
  );
}
```

Tuning: bigger `amp` = shakier, bigger `step` = lazier, longer waves. Screenshot match is about `amp 1.4–1.8`, `step 24–30`. Use a different `seed` per sheet so two sheets don't look identical. **Do not** put padding on `.paper-sheet` (it would distort the measured size); padding goes on `__body`.

```css
.paper-sheet { position: relative; }

.paper-sheet__edge {
  position: absolute; inset: 0;
  overflow: visible; pointer-events: none;
  filter: drop-shadow(5px 6px 0 rgba(0, 0, 0, .14));   /* hard offset shadow follows the wobble */
}
.paper-sheet__edge path {
  fill: var(--paper);
  stroke: var(--ink);
  stroke-width: 2;
  stroke-linejoin: round;
  stroke-linecap: round;
  vector-effect: non-scaling-stroke;
}

.paper-sheet__body { position: relative; padding: 20px 20px 20px 36px; }  /* left pad clears the rings */
```

Optional "sketchy" doubled line: render a second `<path>` from `roughRectPath(w, h, seed + 1, { amp: 1 })` with `stroke-width: 1; opacity: .35; fill: none`.

**No-JS fallback** (only if you cannot measure): put the border on a decorative, empty layer and distort *only that layer*. Never apply the filter to the element containing text.

```html
<svg width="0" height="0" aria-hidden>
  <filter id="rough"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="4"/>
    <feDisplacementMap in="SourceGraphic" scale="4"/></filter>
</svg>
```
```css
.paper-sheet__edge-css { position:absolute; inset:0; background:var(--paper);
  border:2px solid var(--ink); filter:url(#rough); }
```
This is cheaper but the line quality is noisier than the path method. Prefer the path.

### B. Ring-binder holes (the loops on the left edge)

Each ring is a small paper-colored circle (the punched hole) with an ink outline, plus a short curved tail running to the sheet edge (the wire). Repeat it down the edge with a background image, with no JS and no per-row elements, so it grows with the sheet height automatically.

```css
.paper-sheet__rings {
  position: absolute;
  left: -10px;              /* ring centre sits on the wobbly edge */
  top: 18px; bottom: 18px;
  width: 20px;
  background-repeat: repeat-y;
  background-size: 20px 36px;          /* 36px = ring pitch */
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='36' viewBox='0 0 20 36'%3E%3Cpath d='M1 12 C6 12 7 18 8 18' fill='none' stroke='%23000' stroke-width='1.5' stroke-linecap='round'/%3E%3Ccircle cx='13' cy='18' r='5.5' fill='%23FFFEFC' stroke='%23000' stroke-width='1.6'/%3E%3C/svg%3E");
}
```
- Pitch **36px** (change `height` in both `background-size` and the SVG). Circle diameter ~11px, stroke 1.6px.
- Hero card variant: only 3 rings: set `.paper-sheet__rings { bottom: auto; height: 108px; top: 50%; transform: translateY(-50%) }`.
- If the dark theme changes `--paper`, swap `%23FFFEFC` in the data URI for the dark paper color (data URIs cannot read CSS variables). Alternative: use `mask`/`mask-image` with `background: currentColor`.

### C. Tape (torn ends, slightly see-through)

```css
.tape {
  position: absolute; width: 72px; height: 26px;
  background: rgba(230, 207, 166, .92);              /* --tape */
  clip-path: polygon(0 0, 3% 12%, 0 25%, 3% 38%, 0 50%, 3% 63%, 0 75%, 3% 88%, 0 100%,
                     100% 100%, 97% 88%, 100% 75%, 97% 63%, 100% 50%, 97% 38%, 100% 25%, 97% 12%, 100% 0);
}
.paper-sheet__tape { top: -12px; right: 18px; transform: rotate(4deg); }
```
`clip-path` removes any `box-shadow`, so if you want a tiny shadow, put `filter: drop-shadow(0 1px 1px rgba(0,0,0,.18))` on a wrapper around the tape, not on the tape itself. Page-header cards use the same class with `left: 40px; transform: rotate(-4deg)`.

### D. Binder clip

Use a flat black SVG (do not recreate it from CSS shapes). Starter asset:

```tsx
export const BinderClip = ({ className = "" }: { className?: string }) => (
  <svg className={className} width="44" height="52" viewBox="0 0 44 52" aria-hidden>
    <path d="M12 22C8 8 14 2 22 2s12 6 10 20" fill="none" stroke="#000" stroke-width="3" stroke-linecap="round"/>
    <path d="M6 20l32 4-4 26L2 46z" fill="#000"/>
    <path d="M13 31l16 2" stroke="#FFFEFC" stroke-width="1.5" stroke-linecap="round" opacity=".5"/>
  </svg>
);
```
```css
.paper-sheet__clip { position: absolute; top: -22px; left: 28px; transform: rotate(-8deg); }
```
Replace with the exported clip from your design source if you have one; this is a stand-in with the right proportions.

### E. Usage

```tsx
<PaperSheet seed={11}>
  <ProjectsTable />          {/* straight, crisp content inside */}
</PaperSheet>
```
Hero / page-header cards: same component with `className="paper-sheet--hero"` that sets `--paper: #E9FFA3` on the sheet (and swap the ring SVG fill to `%23E9FFA3`), no clip, one tape strip, 3 rings.

### F. Acceptance checklist

- [ ] No `border`/`border-radius` on `.paper-sheet`; outline is the SVG `<path>`.
- [ ] Fill and line come from the same path (no paper-colored rectangle sticking out past the edge).
- [ ] Wobble is visible but subtle (about ±1.6px) and **identical across re-renders**.
- [ ] Rings are centered *on* the left edge, evenly spaced at 36px, circle filled with paper color.
- [ ] Hard shadow is offset down-right (5px / 6px), no blur, and follows the wobbly shape.
- [ ] Table, rows and badges inside are perfectly straight; nothing inside is distorted.
- [ ] Motif count respects the §6 budget (1 clip, ≤2 tape strips per screen).
- [ ] Rings, tape and clip are hidden at `max-width: 600px`.

---

## 13. Sticky notes, doodles and div linings (the parts §12 did not cover)

### 13.1 One reusable `RoughBox` (use it for BOTH the binder sheet and sticky notes)

Refactor `PaperSheet` from §12 into a generic component. Everything that has a hand-drawn edge goes through it, so the agent never hand-writes a border again.

```tsx
type RoughBoxProps = {
  children: ReactNode;
  seed?: number;
  fill?: string;                       // "var(--paper)" | "var(--highlighter)"
  amp?: number;                        // wobble px: sheet 1.6, sticky 2.2
  step?: number;                       // px between wobble points
  rings?: "full" | number | "none";    // "full" = whole edge, number = that many rings, centred
  tape?: "tl" | "tr" | "none";
  clip?: boolean;                      // binder clip, top-left (sheet only)
  tilt?: number;                       // degrees; sticky notes ~ -0.6
  className?: string;
};
```
Inside, pass `amp`/`step` to `roughRectPath`, set `fill` on the `<path>` via inline `style={{ fill }}`, apply `style={{ transform: \`rotate(${tilt}deg)\` }}` on the root, render `<i className="rings">` only when `rings !== "none"`, and render the tape/clip spans from the props.

| Preset | fill | amp | step | rings | tape | clip | tilt |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **Binder sheet** (table) | `--paper` | 1.6 | 26 | full | tr | yes | 0 |
| **Sticky note** ("Create a Project") | `--highlighter` | 2.2 | 22 | 3 | tl | no | -0.6 |
| **Page header** (`patra` title card) | `--paper` | 1.8 | 24 | 5 | tl | no | 0 |

### 13.2 Sticky note specifics

A sticky note is the same `RoughBox` with a lime fill, a slightly stronger wobble and a tiny tilt so it looks stuck on, not printed.

```tsx
<RoughBox seed={3} fill="var(--highlighter)" amp={2.2} step={22} rings={3} tape="tl" tilt={-0.6}>
  <div className="sticky">
    <button className="icon-tile">+</button>
    <div>
      <h2>Create a Project</h2>
      <p>Organize canvases, specs and your work</p>
    </div>
    <button className="icon-square">↗</button>
  </div>
</RoughBox>
<HandNote text="Start from scratch!" />   {/* arrow + handwriting, outside the card */}
```
```css
.sticky { display:flex; align-items:center; gap:16px; padding:28px 28px 28px 52px; }  /* 52px left clears 3 rings */
.sticky h2 { font: 700 30px/1.1 var(--font-display); letter-spacing:-.6px; }
.sticky p  { color: var(--ink-muted); }
```
Sticky notes use the **same** hard shadow as the sheet (`drop-shadow(5px 6px 0 rgba(0,0,0,.14))`, applied to the SVG), not a soft blur. Only one sticky note per screen.

### 13.3 Hand-drawn doodles (sparks + arrow + note)

Small static SVGs, ink stroke, round caps, `aria-hidden`. Place them **outside** the box, absolutely positioned, never over text.

```tsx
export const Sparks = ({ className = "" }) => (            // 3 short strokes
  <svg className={className} width="34" height="30" viewBox="0 0 34 30" aria-hidden
       fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round">
    <path d="M4 22 L12 17" /><path d="M14 10 L18 2" /><path d="M24 12 L33 9" />
  </svg>
);

export const HandNote = ({ text }: { text: string }) => (  // arrow + handwritten line
  <div className="hand-note" aria-hidden>
    <svg width="64" height="36" viewBox="0 0 64 36" fill="none" stroke="#000"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M62 6 C46 4 22 8 8 26" /><path d="M8 26 L9 14" /><path d="M8 26 L20 24" />
    </svg>
    <span>{text}</span>
  </div>
);
```
```css
.hand-note { position:absolute; right:-130px; top:30px; transform:rotate(-16deg); }
.hand-note span { display:block; font: 400 22px/1.05 var(--font-hand); width:90px; }
.sparks--tl { position:absolute; top:-26px; left:-18px; }       /* mirror with scaleX(-1) for the right side */
```
Budget (§6): max 2 spark clusters and 1 hand note per screen.

### 13.4 Div linings (every line that is NOT the rough outline)

Rule of thumb: **only the outer container is wobbly. Every line inside is straight.** Mixing both would look broken.

> **Exception, see §15:** in dialogs/modals, buttons and option cards ALSO get a torn-paper border. Table rows, tabs, search and badges stay straight.

| Lining | Implementation |
| --- | --- |
| Inner table frame | `border:1px solid var(--border); background:#fffefc;` inset ~16px from the rough edge |
| Table header row | `background:var(--paper-shade); border-bottom:1px solid var(--divider)` |
| Row dividers | `border-bottom:1px solid var(--divider)` (last row: none) |
| Section dashed rule | `flex:1; height:0; border-top:1.5px dashed var(--divider)` between the title and the counter |
| Controls (tabs, search, buttons, badges) | `border:2px solid var(--ink); border-radius:2px` (straight, never wobbly) |
| Icon tile outline | `border:2px solid var(--ink); border-radius:4px; background:#fff` |
| Count/index chip | `border:1px solid var(--ink); background:var(--highlighter)` |
| Page grid (ruled paper) | on `body`/main, see below |

```css
/* ruled-paper page background */
.app-canvas {
  background-color: var(--paper);
  background-image:
    linear-gradient(to right, var(--paper-shade) 1px, transparent 1px),
    linear-gradient(var(--paper-shade) 1px, transparent 1px);
  background-size: 40px 40px;           /* est. cell size */
}
/* section header */
.section-head { display:flex; align-items:center; gap:12px; }
.section-head .rule { flex:1; border-top:1.5px dashed var(--divider); }
```
If the agent wants slightly imperfect dividers anyway, allow it for **the dashed section rule only**, by using an SVG line with `stroke-dasharray="6 5"` and a ±0.6px jitter. Do not apply it to table rows.

### 13.5 Acceptance checklist (additions)

- [ ] Sticky note and binder sheet are both rendered by `RoughBox`, not separate one-off code.
- [ ] Sticky note: lime fill, 3 rings, tape top-left, tilt about -0.6°, hard shadow, wobble stronger than the sheet.
- [ ] Spark doodles and hand note sit outside the card, don't overlap text, and are static.
- [ ] Inside any rough box, all lines (frame, header, rows, controls) are straight and crisp.
- [ ] Dashed section rule fills the gap between title and counter.
- [ ] Ruled-paper grid is visible but very low contrast (`--paper-shade` on `--paper`).

---

## 14. EXACT MATCH to the reference crop (edge + left side). Use this, not the §12 values.

Reference traits (from the screenshot crop):
1. **Edge line** = two overlapping ink strokes (a bold ~1.8px and a thin ~1px, slightly offset), with a *slow wave* plus *fine jitter every ~5px*. It looks pen-drawn and torn, not smooth.
2. **Paper** = near-white `#FFFEFC`, a touch lighter than the ruled canvas, with a **tan hard-offset shadow** (not gray).
3. **Rings** sit **inside** the paper, ~10px from the edge (not straddling it). Each ring is a **gray-filled circle** (`#D9D5CD`) with a dark outline, a small white highlight arc on the lower right, and a **funnel-shaped hook** that runs from the paper edge into the circle.
4. **Binder clip** overlaps the top edge: black body, silver wire handle drawn as a white line inside a dark outline.
5. **Inner panel** (table) starts ~44px from the left edge, 1px `rgba(0,0,0,.2)` border, ~6px radius, so the rings have clear space.

### 14.1 Edge generator (two octaves + fine jitter, seeded)

```ts
function rng(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function roughEdge(
  w: number, h: number, seed: number,
  { inset = 3, fine = 5, fineAmp = 0.9, coarseWave = 70, coarseAmp = 1.8 } = {}
) {
  const r = rng(seed);
  const ph = [r() * 6.28, r() * 6.28, r() * 6.28, r() * 6.28];
  const pts: [number, number][] = [];
  // walk one side; nx,ny = outward normal axis the wobble is applied on
  const side = (ax: number, ay: number, bx: number, by: number, nx: number, ny: number, k: number) => {
    const L = Math.hypot(bx - ax, by - ay);
    const n = Math.max(2, Math.round(L / fine));
    for (let i = 0; i < n; i++) {
      const t = i / n, d = L * t;
      const off =
        Math.sin((d / coarseWave) * 6.28 + ph[k]) * coarseAmp +                 // slow wave
        Math.sin((d / (coarseWave * 0.43)) * 6.28 + ph[(k + 1) % 4]) * coarseAmp * 0.45 + // 2nd octave
        (r() * 2 - 1) * fineAmp;                                                // fine jitter
      pts.push([ax + (bx - ax) * t + nx * off, ay + (by - ay) * t + ny * off]);
    }
  };
  const x0 = inset, y0 = inset, x1 = w - inset, y1 = h - inset;
  side(x0, y0, x1, y0, 0, 1, 0);   // top
  side(x1, y0, x1, y1, 1, 0, 1);   // right
  side(x1, y1, x0, y1, 0, 1, 2);   // bottom
  side(x0, y1, x0, y0, 1, 0, 3);   // left

  const mid = (a: number[], b: number[]) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  let d = `M${mid(pts[pts.length - 1], pts[0]).map(v => v.toFixed(1)).join(" ")}`;
  pts.forEach((p, i) => {
    const q = mid(p, pts[(i + 1) % pts.length]);
    d += ` Q${p[0].toFixed(1)} ${p[1].toFixed(1)} ${q[0].toFixed(1)} ${q[1].toFixed(1)}`;
  });
  return d + "Z";
}
```

Render **three paths** from it (fill, bold line, thin line):

```tsx
const main = roughEdge(w, h, seed);                                            // fill + bold stroke
const thin = roughEdge(w, h, seed + 12, { inset: 3.6, fineAmp: 0.7, coarseAmp: 1.4 }); // 2nd pass

<svg className="edge" width={w} height={h} aria-hidden>
  <path className="fill" d={main} />
  <path className="l1"   d={main} />
  <path className="l2"   d={thin} />
</svg>
```
```css
.edge { position:absolute; inset:0; overflow:visible; pointer-events:none;
        filter: drop-shadow(4px 5px 0 rgba(120, 95, 50, .16)); }      /* tan, hard, no blur */
.edge .fill { fill: var(--paper); stroke: none; }
.edge .l1   { fill:none; stroke:#111; stroke-width:1.8; stroke-linecap:round; stroke-linejoin:round; }
.edge .l2   { fill:none; stroke:#111; stroke-width:1;   stroke-linecap:round; stroke-linejoin:round; opacity:.75; }
```
Tuning (do not change without comparing to the reference): `fine 5`, `fineAmp .9`, `coarseWave 70`, `coarseAmp 1.8`, `inset 3`. Use a different `seed` per sheet (e.g. 7, 11, 19). For the sticky note raise `coarseAmp` to 2.4 and `fineAmp` to 1.1.

### 14.2 Ring strip (gray punched hole + funnel hook, inside the paper)

Tile is 26 × 36px. Circle centre is at x = 14.5, so with the strip at `left: 2px` the ring centre sits ~16px inside the drawn edge.

```css
.rings {
  position:absolute; left:2px; top:14px; bottom:14px; width:26px;
  background-repeat:repeat-y; background-size:26px 36px;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='26' height='36' viewBox='0 0 26 36'%3E%3Cpath d='M0 12.5 C5 12.5 8.5 14 8.5 18 C8.5 22 5 23.5 0 23.5' fill='none' stroke='%23111' stroke-width='1.6' stroke-linecap='round'/%3E%3Ccircle cx='14.5' cy='18' r='6.4' fill='%23D9D5CD' stroke='%23111' stroke-width='1.7'/%3E%3Cpath d='M10.6 20.8 A4.4 4.4 0 0 0 17.2 22.4' fill='none' stroke='%23fff' stroke-opacity='.55' stroke-width='1.2' stroke-linecap='round'/%3E%3C/svg%3E");
}
```
- Hook = the funnel path from the left edge into the circle. Circle = `#D9D5CD` fill, 1.7px `#111` stroke. White arc = tiny highlight.
- Ring pitch **36px**. Optional realism: wrap rings in a column and nudge every other ring `translateX(±1px)`, as the reference has slight irregularity.
- On the lime sticky note, change the circle fill to `#CFE08A` (`%23CFE08A`) so it reads as a hole in lime paper.

### 14.3 Binder clip (overlaps the top edge)

```tsx
export const BinderClip = ({ className = "" }) => (
  <svg className={className} width="52" height="60" viewBox="0 0 52 60" aria-hidden>
    {/* wire handle: dark outline with a white core = silver wire */}
    <path d="M14 26C9 8 16 2 26 2s17 6 12 24" fill="none" stroke="#111" strokeWidth="4.2" strokeLinecap="round"/>
    <path d="M14 26C9 8 16 2 26 2s17 6 12 24" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round"/>
    {/* body */}
    <path d="M7 24L45 28L41 58L3 54Z" fill="#111" stroke="#111" strokeWidth="2" strokeLinejoin="round"/>
    <path d="M12 36L34 39" stroke="#fff" strokeOpacity=".28" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);
```
```css
.clip { position:absolute; left:96px; top:-34px; transform:rotate(-2deg); z-index:2; }
```
The body must **cover the top edge line** (clip drawn above the SVG edge) with the handle rising above the sheet.

### 14.4 Inner panel spacing

```css
.paper-body { position:absolute; inset:22px 20px 30px 44px; }   /* 44px left = ring gutter */
.panel { border:1px solid rgba(0,0,0,.2); border-radius:6px; background:#fffefc; }
.panel-head { background:var(--paper-shade); height:44px; }
```

### 14.5 Acceptance checklist (edge + side)

- [ ] Edge shows a slow wave **and** fine pen jitter; corners are slightly rounded and irregular.
- [ ] Two strokes are visible (bold + faint), not one clean line.
- [ ] Shadow is tan, offset down-right, no blur.
- [ ] Rings are gray-filled, inside the paper, each with a hook reaching the edge; pitch 36px.
- [ ] Clip body hides the top edge line; handle is white-cored with a dark outline.
- [ ] 44px empty gutter between the edge and the inner panel.
- [ ] Compare a 2x screenshot crop of the top-left corner against the reference before finishing.

---

## 15. Torn-paper borders for buttons and option cards (modal style)

Reference: the "Create file" dialog. **Cancel** / **Create file** buttons and the option cards have a thick, jagged ink border, a **solid black, equally jagged offset shadow**, and a tiny **fold mark** in the bottom-right corner of buttons. Text stays perfectly crisp.

Why not reuse `RoughBox` (§13/§14)? That one measures the element in JS and draws an SVG path. For many small controls, use a **CSS + SVG displacement filter** instead: no JS, no resize observer, works on any size.

### 15.1 How it works (3 layers on one element)

```
<button class="rough">          ← text lives here, never filtered
   ::before  fill + 2.5px ink border   → filter: url(#r1)   (jagged edge)
   ::after   solid black, offset 5/6px → filter: url(#r2)   (different noise → jagged shadow)
</button>
```
The filter (`feTurbulence` noise + `feDisplacementMap`) pushes the pixels of the **pseudo-elements only**, so the border and shadow get torn edges while the label is untouched. Two filters with different `seed` make the shadow edge differ from the border edge, which is what makes it look hand-cut.

### 15.2 Code (render-tested)

Put the filters once in the app root:

```html
<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
  <filter id="r1" x="-4%" y="-8%" width="108%" height="116%">
    <feTurbulence type="fractalNoise" baseFrequency="0.045 0.07" numOctaves="3" seed="3" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="4.5" xChannelSelector="R" yChannelSelector="G"/>
  </filter>
  <filter id="r2" x="-4%" y="-8%" width="108%" height="116%">
    <feTurbulence type="fractalNoise" baseFrequency="0.05 0.08" numOctaves="3" seed="11" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G"/>
  </filter>
</defs></svg>
```

```css
.rough {
  position: relative; isolation: isolate;           /* isolate keeps the -1/-2 layers inside the button */
  --fill: var(--paper); --sx: 5px; --sy: 6px;       /* shadow offset */
  display: inline-flex; align-items: center; justify-content: center;
  padding: 20px 34px; border: 0; background: none;
  font: 800 17px/1 var(--font-display); letter-spacing: .8px; text-transform: uppercase; color: #111;
}
.rough::before {                                    /* paper + ink border */
  content: ""; position: absolute; inset: 0; z-index: -1;
  background: var(--fill); border: 2.5px solid var(--ink);
  filter: url(#r1);
}
.rough::after {                                     /* hard black shadow */
  content: ""; position: absolute; inset: 0; z-index: -2;
  background: var(--ink);
  transform: translate(var(--sx), var(--sy));
  filter: url(#r2);
}
.rough--lime { --fill: var(--highlighter); }        /* primary: Create file */
.rough:active { transform: translate(3px, 4px); --sx: 2px; --sy: 2px; }   /* press: button sinks into shadow */
```

Option card (radio row): same class, lighter weight:

```css
.rough.card { --sx: 3px; --sy: 5px; display:flex; justify-content:space-between; align-items:center;
  padding: 22px 26px; font: 14px var(--font-mono); }
.rough.card::before { border-width: 2px; }
.rough.card[aria-checked="true"] { --fill: var(--highlighter); }     /* selected state */
.card .radio { width:26px; height:26px; border:2.5px solid #111; border-radius:50%; }
.card[aria-checked="true"] .radio { background:#111; box-shadow: inset 0 0 0 5px var(--highlighter); }
```

Fold mark (optional, buttons only), drawn above the text layer:

```html
<button class="rough">Cancel
  <svg class="fold" viewBox="0 0 16 16" aria-hidden="true"><path d="M14 2L2 14" stroke="#111" stroke-width="1.3" stroke-linecap="round" fill="none"/></svg>
</button>
```
```css
.fold { position:absolute; right:3px; bottom:3px; width:16px; height:16px; pointer-events:none; z-index:1; }
```

### 15.3 Tuning

| Want | Change |
| --- | --- |
| More torn / jagged | raise `scale` (4.5 → 6) or `numOctaves` 3 → 4 |
| Smoother, wavier | lower `baseFrequency` (0.045 → 0.025) |
| Thicker, bolder look | border 2.5px → 3px, shadow `--sx/--sy` 6px/7px |
| Different shape per element | add more filters (`#r3`, `#r4`) with other `seed`s and assign by `nth-child` |
| Shadow too heavy on cards | `--sx:3px; --sy:4px` |

### 15.4 Gotchas

- **Never put the filter on the element that contains text** (it would blur/distort the label). Only on `::before` / `::after`.
- Keep `isolation: isolate`, otherwise `z-index:-1/-2` layers drop behind the page background.
- Filter region (`x/y/width/height` on `<filter>`) must be slightly larger than 100%, or the displaced edge gets clipped.
- Displacement is in screen pixels, so look is consistent at any size. On very large boxes (>600px wide) the noise looks stretched. Use `RoughBox` (§14) for those.
- Fix `seed` values. Do not randomize per render, or edges change on every re-render.
- Honor `prefers-reduced-motion`: the press translate is fine, but drop transitions.

### 15.5 Which technique where

| Element | Technique |
| --- | --- |
| Big sheet (table), sticky note, page header | `RoughBox` SVG path (§14) |
| Dialog buttons, option cards, small chips that need the torn look | `.rough` filter class (§15) |
| Table rows, tabs, search, badges, sidebar items | Plain straight 2px border (§13.4) |

### 15.6 Acceptance checklist

- [ ] Border is visibly jagged at 2x zoom, not a clean line; shadow is a **different** jagged shape.
- [ ] Shadow is solid black, offset down-right, no blur.
- [ ] Button label is crisp (not displaced).
- [ ] Pressed state moves the button into its shadow (3px/4px).
- [ ] Primary button is lime, secondary is paper-white; cards turn lime when selected.
- [ ] Fold mark only on buttons, bottom-right.

---

## 16. Spiral wire binding (top edge of the "Draft New Canvas" modal)

Reference: a row of upright metal loops along the **top** edge of the modal, spaced about 60px apart. Each loop is a bent wire, dark outline with a silver highlight, that enters a small black clamp plate sitting on the top edge. The modal's top edge is *under* the clamps.

Build it as one repeating SVG tile (no per-coil elements), placed just above the modal's top edge and overlapping it. Also use it on the sticky note only if the design calls for it. It is not used on the table sheet (§12).

### 16.1 Layout rules

| Property | Value |
| --- | --- |
| Tile | 60 × 64px, `background-repeat: repeat-x` |
| Pitch | 60px (reference ~62–64px; keep 60px and set `background-size` to match) |
| Wire loop | 28px wide, 26px arch radius, wire stroke 5.5px dark + 2.6px silver |
| Clamp plate | 38 × 12px black, rounded 2.5px, sits at the wire's base |
| Strip position | `top: -40px` relative to the modal, `left/right` = inner padding of the modal header |
| Layering | strip `z-index` above the modal's top edge line; modal top padding ≥ 40px |

### 16.2 Code

Put it in the modal's head region as a decorative element (`aria-hidden`), not in the background:

```html
<div class="modal">
  <div class="spiral" aria-hidden="true"></div>
  <div class="modal__body">…CANVAS CREATION, title, fields…</div>
</div>
```

```css
.modal { position: relative; padding-top: 52px; background: var(--paper);
         border: 2px solid #111; border-radius: 6px; }
.spiral {
  position: absolute; left: 30px; right: 30px; top: -22px; height: 64px;
  background-size: 60px 64px; background-repeat: repeat-x; background-position: left center;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='64' viewBox='0 0 60 64'%3E%3Cdefs%3E%3ClinearGradient id='m' x1='0' x2='1'%3E%3Cstop offset='0' stop-color='%23777'/%3E%3Cstop offset='.35' stop-color='%23f2f2f2'/%3E%3Cstop offset='.6' stop-color='%23999'/%3E%3Cstop offset='1' stop-color='%23444'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cpath d='M16 52 V26 A14 14 0 0 1 44 26 V52' fill='none' stroke='%23111' stroke-width='5.5' stroke-linecap='round'/%3E%3Cpath d='M16 52 V26 A14 14 0 0 1 44 26 V52' fill='none' stroke='url(%23m)' stroke-width='2.6' stroke-linecap='round'/%3E%3Crect x='11' y='48' width='38' height='12' rx='2.5' fill='%23111'/%3E%3Crect x='14' y='49.5' width='32' height='2' rx='1' fill='%23fff' fill-opacity='.25'/%3E%3C/svg%3E");
  pointer-events: none;
}
```

Note: `top: -22px` with a 64px tile puts the clamp plates (tile y 48–60) on the modal's top border line (roughly 42px from the tile top). Adjust `top` by ±4px if the plates don't sit on the line in your build.

### 16.3 Tuning

| Want | Change |
| --- | --- |
| Taller loops | raise the arch: `V26` → `V20`, `A14 14` → `A14 18` and tile height 72px |
| Tighter pitch | tile width and `background-size` to 56px (keep the path centred) |
| Lighter metal | raise the `stop-color` values (`#777` → `#999`) |
| Hand-drawn feel | put the spiral on the same rough edge as the modal (§14) and jitter each tile with `background-position-y` ±1px via a 2-tile sprite |

### 16.4 Gotchas

- **Don't draw the spiral with `border`.** Use the SVG tile so the loops keep their metal gradient at any zoom.
- The strip has to be wider than the modal's content area, or the last loop gets cut. Let `left/right` match the modal's inner padding so the first and last loops are symmetric.
- On narrow screens (under 600px) either hide the spiral or reduce the pitch, otherwise the loops crowd the header.
- Keep the modal's top border visible *between* the clamps: the clamps cover it, the gaps show it.

### 16.5 Acceptance checklist

- [ ] Loops are upright, with a dark outline and a silver highlight running down the left side.
- [ ] Clamp plates sit directly on the modal's top edge, one per loop.
- [ ] Pitch is about 60px and the row is evenly spaced.
- [ ] Spiral is `aria-hidden` and does not intercept clicks (`pointer-events: none`).
- [ ] Modal top padding leaves room so the header text does not touch the loops.

---

## 16.6 REVISION: one-way coil (supersedes the tile in §16.2)

The first tile drew both legs of each loop into the same clamp, which reads as a two-way loop. The corrected coil enters its clamp on the left and hooks off to the right, so each wire goes from one clamp to the next, one direction only.

Replace the `.spiral` tile in §16.2 with this (tile 60 × 76px, clamp plates at the bottom of the tile, page top border at tile y ≈ 60):

```css
.spiral {
  position: absolute; left: 30px; right: 30px; top: -56px; height: 76px;
  background-size: 60px 76px; background-repeat: repeat-x; background-position: left top;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='76' viewBox='0 0 60 76'%3E%3Cdefs%3E%3ClinearGradient id='m' x1='0' x2='1'%3E%3Cstop offset='0' stop-color='%23666'/%3E%3Cstop offset='.4' stop-color='%23f4f4f4'/%3E%3Cstop offset='.65' stop-color='%23959595'/%3E%3Cstop offset='1' stop-color='%23333'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cpath d='M12 66 V22 Q12 6 27 6 Q42 6 42 22 V56' fill='none' stroke='%23111' stroke-width='5.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M12 66 V22 Q12 6 27 6 Q42 6 42 22 V56' fill='none' stroke='url%28%23m%29' stroke-width='2.6' stroke-linecap='round' stroke-linejoin='round'/%3E%3Crect x='7' y='62' width='24' height='11' rx='2' fill='%23111'/%3E%3Crect x='9' y='63.5' width='20' height='2' rx='1' fill='%23fff' fill-opacity='.25'/%3E%3C/svg%3E");
  pointer-events: none;
}
```

Adjust `top` so the clamp plates sit on the modal's top border line (move up or down by ±4px). Set `.modal` top padding to at least 64px so the header text clears the coils.

Known approximation: the reference coils are taller and their hooks are slightly more pronounced. Compare a 2× crop with the reference and change the arch height (`Q12 6 27 6` → `Q12 0 27 0`) and the tile height if the coils look short.

### 16.7 Checklist addition

- [ ] Each coil has one clamp (left leg) and one free hook (right leg); no loop has both legs in the same clamp.

---

## 17. EXACT spiral component (supersedes §16 entirely)

Use this. §16's tile was a simplified approximation. This one is built from the high-res reference crop and was render-tested (the prototype is vanilla JS with the same logic as the React code below).

### 17.1 What the reference coil actually is

Each coil is **one wire ring that passes through a punched hole in the paper**:

1. A tall, narrow ring rises above the top edge (about 24px above the edge, 19px wide).
2. The **front leg** (left) is thick, silver with a dark outline, with a bright highlight. It is warm-tinted metal, not cool gray.
3. The **back leg** (right) is thin and dark (about 1.3px silver core inside a 3.6px outline), because it sits behind.
4. Both legs overlap the page's top edge line and run down into the paper to a **black punch plate** (about 22 × 17px, rounded 2px). A faint silver glint of each leg is visible inside the plate.
5. Pitch is about 64px but **slightly irregular**: ±1px position and ±1.4° tilt per coil, deterministic.
6. The page below is a normal sheet with a rounded top-right corner. A **second tan sheet** peeks out on the right (§17.4).

### 17.2 Component (render-tested logic)

```tsx
// spiral-binding.tsx
import { useLayoutEffect, useMemo, useRef, useState } from "react";

const PITCH = 64, W = 64, H = 68;

function rng(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function SpiralBinding({ seed = 5, className = "" }: { seed?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(0);

  useLayoutEffect(() => {
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width));
    ro.observe(ref.current!);
    return () => ro.disconnect();
  }, []);

  const coils = useMemo(() => {
    if (!w) return [];
    const n = Math.max(1, Math.floor(w / PITCH));
    const step = n > 1 ? (w - W) / (n - 1) : 0;
    const r = rng(seed);
    return Array.from({ length: n }, (_, i) => ({
      x: i * step + (r() * 2 - 1) * 1.2,
      rot: (r() * 2 - 1) * 1.4,
    }));
  }, [w, seed]);

  return (
    <div ref={ref} className={`spiral ${className}`} aria-hidden="true">
      <svg width={w} height={H} viewBox={`0 0 ${w} ${H}`}>
        <defs>
          <linearGradient id="metal" gradientUnits="userSpaceOnUse" x1="22" x2="28">
            <stop offset="0"   stopColor="#5a5448" />
            <stop offset=".35" stopColor="#f3efe3" />
            <stop offset=".7"  stopColor="#8d8779" />
            <stop offset="1"   stopColor="#2a2620" />
          </linearGradient>
          <symbol id="coil" viewBox="0 0 64 68">
            {/* back leg: thin, dark */}
            <path d="M32 4.8 C36 4.8 39 8.5 39 16 V51" fill="none" stroke="#111" strokeWidth="3.6" strokeLinecap="round" />
            <path d="M32 4.8 C36 4.8 39 8.5 39 16 V51" fill="none" stroke="#a39d8f" strokeOpacity=".85" strokeWidth="1.3" strokeLinecap="round" />
            {/* front leg: thick, silver */}
            <path d="M25 51 V16 C25 8.5 28 4.8 32 4.8" fill="none" stroke="#111" strokeWidth="6.4" strokeLinecap="round" />
            <path d="M25 51 V16 C25 8.5 28 4.8 32 4.8" fill="none" stroke="url(#metal)" strokeWidth="3.4" strokeLinecap="round" />
            {/* punch plate */}
            <rect x="21" y="47" width="22" height="17" rx="2.2" fill="#0f0e0c" />
            <path d="M22.6 48.4 H41.4" stroke="#fff" strokeOpacity=".14" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M25 48 V56 M39 48 V56" stroke="#c9c2ae" strokeOpacity=".55" strokeWidth="1.5" strokeLinecap="round" />
          </symbol>
        </defs>
        {coils.map((c, i) => (
          <use key={i} href="#coil" x={c.x} y={0} width={W} height={H}
               transform={`rotate(${c.rot} ${c.x + 32} 40)`} />
        ))}
      </svg>
    </div>
  );
}
```

```css
/* the page's top edge must line up with y = 28px inside the spiral box */
.modal { position: relative; padding-top: 64px; }
.spiral { position: absolute; left: 40px; right: 40px; top: -28px; height: 68px;
          pointer-events: none; z-index: 3; }
```
Only one `<svg>` in the page may define `id="metal"` / `id="coil"`. If the spiral is rendered twice on a screen, move `<defs>` into a single shared SVG in the app root.

### 17.3 Alignment (the part agents get wrong)

| Check | Value |
| --- | --- |
| Tile / symbol size | 64 × 68 |
| Page top edge inside the tile | y = 28 |
| Ring top (arch) | y ≈ 4.8, always inside the tile (never clipped flat) |
| Punch plate | y 47–64 |
| Strip `top` | `-28px` relative to the modal border box |
| Modal top padding | ≥ 64px so the label clears the plates |
| First/last coil | `left/right: 40px` so the end coils sit inside the page's rounded corners |

### 17.4 Page stack peeking out on the right

The reference shows a second sheet behind the modal, tan, offset right and slightly down.

```css
.modal::after {
  content: ""; position: absolute; z-index: -1;
  top: 14px; right: -14px; bottom: -4px; width: 24px;
  background: #e6d6a2; border: 2px solid #111; border-radius: 0 10px 10px 0;
}
```

### 17.5 Tuning

| Want | Change |
| --- | --- |
| Rounder arch | change `4.8 ... 8.5` to bring the control points closer (e.g. `C36 4.8 39 7 39 16`) |
| Taller coils | raise the symbol/tile `H` to 76 and shift arch/plate y by +8; move `.spiral top` to `-36px` |
| More irregularity | raise the jitter: `±1.2` px and `±1.4` degrees |
| Cooler metal | shift gradient stops towards `#555 → #f5f5f5 → #8a8a8a → #2b2b2b` |

### 17.6 Acceptance checklist

- [ ] Each coil: thick silver front leg, thin dark back leg, black punch plate inside the paper.
- [ ] Both legs overlap the page's top edge; the ring is complete (arch not clipped).
- [ ] Plates sit about 36px below the edge, rows are slightly irregular but evenly distributed.
- [ ] Tan sheet peeks out on the right.
- [ ] Spiral is decorative: `aria-hidden`, `pointer-events: none`.
- [ ] 2× crop compared against the reference before finishing.
