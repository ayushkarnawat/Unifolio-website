/**
 * Pure helpers for the hero storyboard loop (components/hero/HeroStoryboardVisual.tsx).
 * Ported from Docs/reference/hero-storyboard-reference.js ("Your storyboard", refined: beats 04-07 only).
 * No DOM access here, so everything in this file is unit tested in lib/heroStoryboard.test.ts.
 */

export const ART_W = 904;
export const ART_H = 412;
export const RING_CENTER: [number, number] = [413, 229];
export const RING_RADIUS_OUTER = 113;
export const LOOP_SECONDS = 11.6;
/** p = q + LOOP_OFFSET maps the loop onto beats 04-07 of the original 8-beat timeline. */
export const LOOP_OFFSET = 6.4;
/** Settled "07 Settle into hero" frame used for reduced motion. */
export const SETTLED_T = 10.4;
export const LOGO_GREEN = "#22C55E"; // plain site green (the ring artwork uses the same flat #22C55E)
export const LOGO_GREEN_DEEP = "#16A34A";

export const COLORS = {
  ink: "#111613",
  muted: "#5A685D",
  card: "#FFFFFF",
  green: LOGO_GREEN,
  deep: LOGO_GREEN_DEEP,
} as const;

/** Wide (artwork to the right of the text) from this container width up; stacked (artwork above the text) below. */
export const WIDE_MIN_WIDTH = 1024;

/* Placement tuning constants (tuned with screenshots at 390x844 .. 1920x1080).
 * Wide: the artwork's visible content (art x WIDE_CONTENT_LEFT..WIDE_CONTENT_RIGHT) sits between just right of
 * where the hero headline ends (about 45% of the viewport at lg/xl) and WIDE_RIGHT_MARGIN px short of the right
 * edge, so nothing is cut off, not even the faded edge of the plate.
 * Stacked (tablet): the visible content (x 0..CONTENT_W) is centred and sits in the upper part of the hero,
 * above the text block below lg. */
export const WIDE_LEFT_FRACTION = 0.455;
export const WIDE_LEFT_GAP = 16; // px
export const WIDE_CONTENT_LEFT = 20; // art px: left-most thing that matters (a small sphere)
export const WIDE_CONTENT_RIGHT = 904; // art px: the whole plate, including its faded right edge, stays on screen (the right-most card ends at 809)
export const WIDE_RIGHT_MARGIN = 24; // px between the plate's right end and the container's right edge
export const WIDE_HEIGHT_FRACTION = 0.9; // cap: artwork height as a fraction of the container height
export const WIDE_CENTER_Y = 0.5; // artwork vertical centre as a fraction of the container height
/* Vertical spread (wide only): the layout is stretched up and down around the ring centre so the artwork uses more of
 * the hero's height. Only the POSITIONS are stretched; cards, tiles and the ring keep their shape and size. */
export const WIDE_VY_MAX = 1.4;
export const WIDE_CONTENT_HEIGHT = 390; // art px of visible content, top to bottom
export const WIDE_VY_TARGET = 0.8; // aim for the content to use this fraction of the container height
export const CONTENT_W = 820; // art px: everything that matters sits in x 0..820
export const STACKED_WIDTH_FRACTION = 0.98; // content width as a fraction of the container width
export const STACKED_MAX_SCALE = 0.95;
/* Below the wide breakpoint (phones and tablets) the canvas is its own normal-flow box next to the text (about 300px tall on
 * phones, 300-440px on tablets), so the artwork is simply centred in that box. */
export const BOX_HEIGHT_FRACTION = 0.9; // cap: artwork height as a fraction of the (phone or tablet) canvas box height

export type Placement = {
  wide: boolean;
  sc: number;
  x0: number;
  y0: number;
  /** vertical spread factor around the ring centre (1 = none) */
  vy: number;
  ringX: number;
  ringY: number;
  ringPctX: number;
  ringPctY: number;
};

export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
/** fade-in / fade-out window: 1 between a+f and b-f, ramps over f at both ends. */
export const fio = (p: number, a: number, b: number, f: number) => clamp((p - a) / f) * clamp((b - p) / f);

export function computePlacement(w: number, h: number): Placement {
  const W = Math.max(1, w);
  const H = Math.max(1, h);
  const wide = W >= WIDE_MIN_WIDTH;
  let sc: number;
  let x0: number;
  let y0: number;
  let vy = 1;
  if (wide) {
    const left = W * WIDE_LEFT_FRACTION + WIDE_LEFT_GAP;
    sc = Math.min(
      (W - WIDE_RIGHT_MARGIN - left) / (WIDE_CONTENT_RIGHT - WIDE_CONTENT_LEFT),
      (H * WIDE_HEIGHT_FRACTION) / ART_H
    );
    x0 = W - WIDE_RIGHT_MARGIN - WIDE_CONTENT_RIGHT * sc;
    vy = clamp((H * WIDE_VY_TARGET) / (WIDE_CONTENT_HEIGHT * sc), 1, WIDE_VY_MAX);
    // keep the vertical centre of the (stretched) artwork at WIDE_CENTER_Y of the container
    y0 = H * WIDE_CENTER_Y - (RING_CENTER[1] + (ART_H / 2 - RING_CENTER[1]) * vy) * sc;
  } else {
    // Below the wide breakpoint (phones and tablets) the canvas is its own normal-flow box above/below the text, so the
    // artwork is centred in that box, as large as the width allows and never taller than the box.
    sc = Math.min((W * STACKED_WIDTH_FRACTION) / CONTENT_W, STACKED_MAX_SCALE, (H * BOX_HEIGHT_FRACTION) / ART_H);
    x0 = (W - CONTENT_W * sc) / 2;
    y0 = (H - ART_H * sc) / 2;
  }
  const ringX = x0 + RING_CENTER[0] * sc;
  const ringY = y0 + RING_CENTER[1] * sc;
  return { wide, sc, x0, y0, vy, ringX, ringY, ringPctX: (ringX / W) * 100, ringPctY: (ringY / H) * 100 };
}

/** Screen y of an artwork y (art px), including the vertical spread around the ring centre. */
export function placeY(p: Placement, y: number): number {
  return p.y0 + (RING_CENTER[1] + (y - RING_CENTER[1]) * p.vy) * p.sc;
}

export type Timeline = {
  /** loop-local time, 0..LOOP_SECONDS */
  q: number;
  /** position on the original 8-beat timeline */
  p: number;
  intro: number;
  dim: number;
  streamAlpha: number;
  dotAlpha: number;
  halo: number;
  scan: number;
  insights: { alpha: number; progress: number }[];
};

export function timeline(t: number): Timeline {
  const tt = Math.max(0, t);
  const q = tt % LOOP_SECONDS;
  const p = q + LOOP_OFFSET;
  const intro = clamp(tt / 0.5);
  const dim = clamp(1 - 0.78 * ease(clamp((p - 11.4) / 0.9)) + 0.78 * ease(clamp((p - 15.2) / 1)));
  const streamAlpha = lerp(0.25, 1, ease(clamp(q / 0.8))) * (1 - 0.75 * ease(clamp((p - 11.4) / 0.8)));
  const dotAlpha = clamp((p - 6.4) / 0.6) * (1 - clamp((p - 11.4) / 0.6));
  const halo = clamp((p - 6.4) / 1) * (1 - clamp((p - 12) / 1.2));
  const scan = fio(p, 9, 11.8, 0.6);
  const insights = [0, 1, 2, 3].map((k) => ({
    alpha: ease(clamp((p - 11.8 - k * 0.5) / 0.8)) * (1 - ease(clamp((p - 15.2) / 0.8))),
    progress: clamp((p - 11.8 - k * 0.5) / 1.3),
  }));
  return { q, p, intro, dim, streamAlpha, dotAlpha, halo, scan, insights };
}

/* ---- layer constants, verbatim from the reference ---- */

/** Stream anchor point per card (art px). */
export const SCARD: [string, number, number][] = [
  ["mf", 186, 151],
  ["ins", 540, 57],
  ["dmr", 651, 189],
  ["cc", 737, 300],
  ["dml", 263, 297],
  ["epf", 577, 335],
];

/** Layers that move together with the ring as one rigid group. */
export const SGRP: Record<string, true> = { ring: true, epf: true, dml: true };

export type Motion = { a: number; s: number; ph: number; dep: number; r?: number; rs?: number };
export const SMOT: Record<string, Motion> = {
  mf: { a: 6, s: 0.9, ph: 0, r: 0.012, rs: 0.7, dep: 12 },
  ins: { a: 7, s: 0.8, ph: 1.2, r: 0.015, rs: 0.5, dep: 14 },
  dmr: { a: 6, s: 0.7, ph: 2.3, r: 0.01, rs: 0.6, dep: 12 },
  cc: { a: 6, s: 0.85, ph: 3.4, r: 0.012, rs: 0.6, dep: 12 },
  t1: { a: 8, s: 1.1, ph: 0.5, dep: 20, r: 0.1, rs: 0.6 },
  t2: { a: 6, s: 0.9, ph: 1.9, dep: 20, r: 0.1, rs: 0.5 },
  t3: { a: 8, s: 1.2, ph: 3.1, dep: 18, r: 0.1, rs: 0.7 },
  t4: { a: 7, s: 1.0, ph: 4.2, dep: 18, r: 0.1, rs: 0.6 },
  s1: { a: 6, s: 0.8, ph: 0.9, dep: 22 },
  s2: { a: 5, s: 1.1, ph: 2.4, dep: 20 },
};

export type InsightIcon = "bars" | "pie" | "zig" | "arrow";
export type Insight = { big: string; sm: string; x: number; y: number; ic: InsightIcon; ix: number; iy: number };
export const SINS: Insight[] = [
  { big: "₹2.84 Cr", sm: "Total Wealth", x: 34, y: 78, ic: "bars", ix: 176, iy: 58 },
  { big: "23%", sm: "Concentration", x: 612, y: 78, ic: "pie", ix: 576, iy: 76 },
  { big: "₹42,000", sm: "Fee Leakage", x: 34, y: 300, ic: "zig", ix: 44, iy: 336 },
  { big: "14 Months", sm: "Family Runway", x: 640, y: 312, ic: "arrow", ix: 560, iy: 344 },
];

/** Ring group transform at time t (art px / radians), pivoting on RING_CENTER. */
export function ringGroupMotion(t: number) {
  return {
    dx: 3 * Math.sin(t * 0.6),
    dy: 3 * Math.sin(t * 0.5 + 1),
    rot: 0.008 * Math.sin(t * 0.45),
    scale: 1 + 0.006 * Math.sin(t * 0.9),
  };
}

/* ---- sketch helpers (pure math) ---- */

export function hexA(hex: string, a: number) {
  const n = parseInt(String(hex).replace("#", ""), 16) || 0;
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

/** Deterministic noise in -1..1. */
export function nz(s: number) {
  const x = Math.sin(s * 127.1 + 311.7) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
}

export type Pt = [number, number];

export function subdiv(pts: Pt[], step: number): Pt[] {
  const out: Pt[] = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const n = Math.max(1, Math.ceil(L / step));
    for (let k = 1; k <= n; k++) out.push([lerp(a[0], b[0], k / n), lerp(a[1], b[1], k / n)]);
  }
  return out;
}

export function ellPts(cx: number, cy: number, rx: number, ry: number, seed: number, n: number): Pt[] {
  const a0 = nz(seed) * Math.PI;
  const out: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const a = a0 + Math.PI * 2 * 1.05 * (i / n);
    const k = 1 + nz(seed + i * 1.7) * 0.025;
    out.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
  }
  return out;
}

/** Point on a quadratic Bezier. */
export function sQ(a: Pt, b: Pt, c: Pt, u: number): Pt {
  const m = 1 - u;
  return [m * m * a[0] + 2 * m * u * b[0] + u * u * c[0], m * m * a[1] + 2 * m * u * b[1] + u * u * c[1]];
}

/** Stream curve from a card anchor to the ring edge (art px): [P0, P1 (control), P2]. */
export function streamCurve(i: number, cardX: number, cardY: number): [Pt, Pt, Pt] {
  const P0: Pt = [cardX, cardY];
  const dx = P0[0] - RING_CENTER[0];
  const dy = P0[1] - RING_CENTER[1];
  const l = Math.sqrt(dx * dx + dy * dy);
  const P2: Pt = [RING_CENTER[0] + (dx / l) * 112, RING_CENTER[1] + (dy / l) * 116];
  const sg = i % 2 ? 1 : -1;
  const P1: Pt = [(P0[0] + P2[0]) / 2 - (dy / l) * l * 0.22 * sg, (P0[1] + P2[1]) / 2 + (dx / l) * l * 0.22 * sg];
  return [P0, P1, P2];
}
