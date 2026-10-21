/**
 * Pure helpers for the About section illustration (components/about/AboutIllustration.tsx) and the
 * one-line text fitting in components/about/AboutSection.tsx.
 * Ported from Docs/reference/about-section-prototype.html (the approved design).
 * No DOM access here, so everything in this file is unit tested in lib/aboutIllustration.test.ts.
 *
 * All geometry is in picture coordinates of the user's sketch (1536x1024), the same numbers as
 * public/about-illustration/manifest.json. The canvas shows the VIEW box of that picture.
 */

export type Pt = [number, number];
/** Cubic bezier: start, control 1, control 2, end. */
export type Cubic = [Pt, Pt, Pt, Pt];
export type Rect = { x: number; y: number; w: number; h: number };

export type LayerId = "p1" | "p2" | "p3" | "p4" | "c";
export type Layer = Rect & { id: LayerId; file: string };

export const ASSET_BASE = "/about-illustration/";

/** The part of the picture the canvas shows. */
export const VIEW: Rect = { x: 100, y: 120, w: 1330, h: 800 };
/** Canvas aspect ratio (width / height). */
export const VIEW_ASPECT = VIEW.w / VIEW.h;

export const COLORS = {
  green: "#22C55E",
  /** Dashed data-flow curves. */
  flow: "#1F4D33",
  ink: "#111613",
  bg: "#FAF8F5",
} as const;

/** The four family members and the shared dashboard (positions from manifest.json). */
export const LAYERS: Record<LayerId, Layer> = {
  p1: { id: "p1", file: "person-p1.webp", x: 158, y: 128, w: 368, h: 296 },
  p2: { id: "p2", file: "person-p2.webp", x: 972, y: 148, w: 446, h: 280 },
  p3: { id: "p3", file: "person-p3.webp", x: 108, y: 592, w: 514, h: 312 },
  p4: { id: "p4", file: "person-p4.webp", x: 984, y: 648, w: 414, h: 264 },
  c: { id: "c", file: "dashboard.webp", x: 572, y: 284, w: 432, h: 406 },
};

/** Draw order and intro order: the dashboard first, then the people. */
export const ORDER: LayerId[] = ["c", "p1", "p2", "p3", "p4"];

/** Float and tilt per layer: amplitude (px), speed, phase, rotation amplitude (rad). */
export const MOT: Record<LayerId, { a: number; s: number; ph: number; r: number }> = {
  p1: { a: 4, s: 0.8, ph: 0, r: 0.006 },
  p2: { a: 3.4, s: 0.7, ph: 1.6, r: 0.006 },
  p3: { a: 4, s: 0.75, ph: 2.8, r: 0.005 },
  p4: { a: 3.6, s: 0.85, ph: 4.1, r: 0.006 },
  c: { a: 1.6, s: 0.6, ph: 0, r: 0 },
};

/** Data flows between each person (p1..p4) and the dashboard; the 4th starts at the dashboard edge, as in the prototype. */
export const STR: Cubic[] = [
  [[528, 283], [585, 283], [622, 318], [650, 376]],
  [[1015, 297], [955, 302], [925, 325], [896, 380]],
  [[527, 705], [595, 705], [630, 662], [648, 612]],
  [[955, 570], [1020, 572], [1058, 598], [1096, 646]],
];

/** Each person's device (where the small ping expands). */
export const DEV: Pt[] = [
  [482, 262],
  [1105, 274],
  [472, 772],
  [1050, 736],
];

/** Centre of the dashboard (glow and arrival ring). */
export const CEN: Pt = [790, 497];
/** Breathing glow: radial gradient radii and the box it fills. */
export const GLOW = { r0: 40, r1: 330, box: { x: 380, y: 150, w: 820, h: 700 } } as const;
/** Donut on the dashboard (centre and radius of the circling highlight). */
export const DONUT = { x: 722, y: 492, r: 47 } as const;
/** Arrival ring (ellipse radii at full pulse; it grows as the pulse fades). */
export const RING = { rx: 162, ry: 132, grow: { rx: 26, ry: 22 } } as const;

/** Settled frame drawn for prefers-reduced-motion (intro long finished). */
export const SETTLED_T = 6;

/** Max device pixel ratio for the canvas backing store. */
export const MAX_DPR = 2;

/* ---------- maths ---------- */

export const TAU = Math.PI * 2;
export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
/** easeInOutCubic */
export const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function bezierPoint(p: Cubic, t: number): Pt {
  const m = 1 - t;
  return [
    m * m * m * p[0][0] + 3 * m * m * t * p[1][0] + 3 * m * t * t * p[2][0] + t * t * t * p[3][0],
    m * m * m * p[0][1] + 3 * m * m * t * p[1][1] + 3 * m * t * t * p[2][1] + t * t * t * p[3][1],
  ];
}

/** Intro stagger: 0 before, eased to 1 over 0.9 s, each item 0.16 s after the previous. Reduced motion: always 1. */
export function intro(t: number, i: number, reduced = false): number {
  return reduced ? 1 : ease(clamp((t - 0.1 - i * 0.16) / 0.9));
}

/** Float offset and tilt of a layer at time t, given its intro progress e (rises 18 px into place). */
export function layerMotion(id: LayerId, t: number, e: number): { dx: number; dy: number; rot: number } {
  const M = MOT[id];
  return {
    dx: M.a * 0.5 * Math.cos(t * M.s * 0.8 + M.ph),
    dy: M.a * Math.sin(t * M.s + M.ph) + (1 - e) * 18,
    rot: M.r * Math.sin(t * M.s * 0.7 + M.ph),
  };
}

/** Dashboard scale: a slow breath plus a small bump while an arrival pulse is on. */
export function dashboardScale(t: number, pulse: number): number {
  return 1 + 0.008 * Math.sin(t * 1.3) + pulse * 0.01;
}

/** Breathing glow strength behind the dashboard (0.05..0.15). */
export function glowAlpha(t: number): number {
  return 0.1 + 0.05 * Math.sin(t * 1.2);
}

/** Position (0..1) of the travelling dot on flow i at time t. */
export function streamDotU(t: number, i: number): number {
  return (t * 0.22 + i * 0.25) % 1;
}

/** Dot opacity factor along its flow (fades in at the person, out at the dashboard). */
export function streamDotAlpha(u: number): number {
  return Math.sin(Math.PI * Math.min(1, u));
}

/** Arrival pulse (0..1): rises as a dot nears the dashboard (u > 0.9) and fades just after (u < 0.12). */
export function arrivalPulse(t: number, count = STR.length): number {
  let pulse = 0;
  for (let i = 0; i < count; i++) {
    const u = streamDotU(t, i);
    if (u > 0.9) pulse = Math.max(pulse, (u - 0.9) / 0.1);
    else if (u < 0.12) pulse = Math.max(pulse, 1 - u / 0.12);
  }
  return pulse;
}

/** Progress (0..1) of the expanding ping on device i at time t. */
export function devicePingU(t: number, i: number): number {
  return (t * 0.32 + i * 0.27) % 1;
}

/** Canvas backing-store size for a CSS width/height (DPR capped at MAX_DPR). */
export function backingSize(cssW: number, cssH: number, dpr: number): { w: number; h: number; dpr: number } {
  const d = Math.min(MAX_DPR, dpr > 0 ? dpr : 1);
  return { w: Math.max(1, Math.round(cssW * d)), h: Math.max(1, Math.round(cssH * d)), dpr: d };
}

/**
 * Transform that fits the VIEW box into a canvas w x h device px, centred, keeping the aspect ratio:
 * [a, b, c, d, e, f] for setTransform.
 */
export function viewTransform(w: number, h: number): [number, number, number, number, number, number] {
  const sc = Math.min(w / VIEW.w, h / VIEW.h);
  return [sc, 0, 0, sc, (w - VIEW.w * sc) / 2 - VIEW.x * sc, (h - VIEW.h * sc) / 2 - VIEW.y * sc];
}

/* ---------- one-line text fitting ---------- */

/**
 * Font size that keeps a sentence on ONE line: `textWidth` is its width at `max` px with no wrapping,
 * `avail` the width of its row. Fits at max: wrap normally (nothing overflows anyway). Otherwise shrink
 * to 98% of the exact fit; if that is below `min`, use `min` and let it wrap.
 */
export function fitFontSize(
  max: number,
  min: number,
  avail: number,
  textWidth: number
): { size: number; nowrap: boolean } {
  if (!(textWidth > avail) || avail <= 0) return { size: max, nowrap: false };
  const s = ((max * avail) / textWidth) * 0.98;
  return s >= min ? { size: s, nowrap: true } : { size: min, nowrap: false };
}
