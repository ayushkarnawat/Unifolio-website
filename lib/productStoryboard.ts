/**
 * Pure helpers for the Product section illustration (components/product/ProductStoryboardVisual.tsx)
 * and the phone card carousel (components/product/ProductSection.tsx).
 * Ported from Docs/reference/product-section-prototype.html (the approved design).
 * No DOM access here, so everything in this file is unit tested in lib/productStoryboard.test.ts.
 *
 * All geometry is in source pixels of the 1672x941 PDF mockup the art was cut from
 * (same numbers as public/product-storyboard/manifest.json).
 */

export type Pt = [number, number];
/** Cubic bezier: start, control 1, control 2, end. */
export type Cubic = [Pt, Pt, Pt, Pt];
export type Rect = { x: number; y: number; w: number; h: number };

export type LayerId = "mf" | "st" | "ba" | "re" | "pm" | "go" | "lap";
export type Layer = Rect & { id: LayerId; file: string };

export const ASSET_BASE = "/product-storyboard/";

/** The background plate; the canvas is drawn at exactly this size (scaled to the canvas width). */
export const PLATE: Rect & { file: string } = { file: "plate.webp", x: 300, y: 290, w: 1070, h: 328 };
/** Canvas aspect ratio (width / height). */
export const PLATE_ASPECT = PLATE.w / PLATE.h;

/** Plate edge feather, in source px (left/right and top/bottom). */
export const FEATHER_X = 70;
export const FEATHER_Y = 44;
/** The plate is multiplied with the section background so it melts into the page. */
export const SECTION_BG = "#FAF8F5";

export const COLORS = {
  green: "#22C55E",
  ink: "#111613",
  muted: "#6B7A70",
  bg: SECTION_BG,
} as const;

/** Draw order: the six asset cards, then the laptop on top. */
export const LAYERS: Layer[] = [
  { id: "mf", file: "layer-mf.webp", x: 438, y: 313, w: 150, h: 123 },
  { id: "st", file: "layer-st.webp", x: 345, y: 422, w: 149, h: 123 },
  { id: "ba", file: "layer-ba.webp", x: 457, y: 481, w: 149, h: 123 },
  { id: "re", file: "layer-re.webp", x: 1074, y: 314, w: 147, h: 120 },
  { id: "pm", file: "layer-pm.webp", x: 1179, y: 423, w: 143, h: 122 },
  { id: "go", file: "layer-go.webp", x: 1069, y: 478, w: 146, h: 120 },
  { id: "lap", file: "layer-lap.webp", x: 648, y: 357, w: 380, h: 244 },
];

/** Float and tilt per layer: amplitude (px), speed, phase, rotation amplitude (rad). */
export const MOT: Record<LayerId, { a: number; s: number; ph: number; r: number }> = {
  mf: { a: 4, s: 0.9, ph: 0, r: 0.012 },
  st: { a: 5, s: 0.8, ph: 1.4, r: 0.014 },
  ba: { a: 4.5, s: 1.0, ph: 2.6, r: 0.012 },
  re: { a: 4, s: 0.85, ph: 0.7, r: 0.012 },
  pm: { a: 5, s: 0.95, ph: 2.0, r: 0.014 },
  go: { a: 4.5, s: 0.75, ph: 3.3, r: 0.012 },
  lap: { a: 2.2, s: 0.6, ph: 0, r: 0 },
};

/** Arrows from the asset cards toward the laptop. */
export const ARR: Cubic[] = [
  [[587, 369], [630, 368], [650, 395], [660, 430]],
  [[538, 461], [580, 445], [625, 455], [655, 467]],
  [[601, 544], [630, 545], [650, 520], [659, 498]],
  [[1081, 369], [1040, 370], [1020, 395], [1010, 429]],
  [[1137, 461], [1090, 445], [1050, 455], [1015, 467]],
  [[1073, 544], [1040, 545], [1025, 520], [1012, 498]],
];

/** The three "spark" strokes above the laptop: x1, y1, x2, y2. */
export const SPARKS: [number, number, number, number][] = [
  [806, 321, 818, 337],
  [837, 307, 838, 334],
  [869, 323, 857, 336],
];

/** The dashboard chart line the highlight dot rides along. */
export const CHART: Pt[] = [
  [730, 564], [769, 564], [788, 553], [802, 557], [827, 541], [855, 548], [886, 527], [915, 533], [949, 513],
];

/** Donut on the laptop screen (centre and radius of the scanning highlight). */
export const DONUT = { x: 782, y: 467, r: 40 } as const;
/** Soft screen glow (radial gradient centre, radii and the box it fills). */
export const SCREEN_GLOW = { x: 838, y: 470, r0: 20, r1: 190, box: { x: 700, y: 380, w: 280, h: 200 } } as const;
/** Glow ping cycle length (s). */
export const GLOW_CYCLE = 3.2;

/** Settled frame drawn for prefers-reduced-motion (intro long finished). */
export const SETTLED_T = 6;
/** Index used for the arrows and sparks in the intro stagger (after the six cards). */
export const ARROWS_INTRO_INDEX = 6;

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

export function bezierTangent(p: Cubic, t: number): Pt {
  const m = 1 - t;
  return [
    3 * m * m * (p[1][0] - p[0][0]) + 6 * m * t * (p[2][0] - p[1][0]) + 3 * t * t * (p[3][0] - p[2][0]),
    3 * m * m * (p[1][1] - p[0][1]) + 6 * m * t * (p[2][1] - p[1][1]) + 3 * t * t * (p[3][1] - p[2][1]),
  ];
}

/** Intro stagger: 0 before, eased to 1 over 0.8 s, each item 0.12 s after the previous. Reduced motion: always 1. */
export function intro(t: number, i: number, reduced = false): number {
  return reduced ? 1 : ease(clamp((t - 0.15 - i * 0.12) / 0.8));
}

/** Float offset and tilt of a layer at time t, given its intro progress e (rises 16 px into place). */
export function layerMotion(id: LayerId, t: number, e: number): { dx: number; dy: number; rot: number } {
  const M = MOT[id];
  return {
    dx: M.a * 0.4 * Math.cos(t * M.s * 0.8 + M.ph),
    dy: M.a * Math.sin(t * M.s + M.ph) + (1 - e) * 16,
    rot: M.r * Math.sin(t * M.s * 0.7 + M.ph),
  };
}

/** Position (0..1) of travelling dot k on arrow i at time t. */
export function arrowDotU(t: number, i: number, k: number): number {
  return (t * 0.32 + i * 0.17 + k * 0.5) % 1;
}

/** Arrowhead pulse factor (0.5..1). */
export function arrowPulse(t: number, i: number): number {
  return 0.75 + 0.25 * Math.sin(t * 3 + i);
}

/** Spark stroke alpha (0.25..1), staggered left to right. */
export function sparkAlpha(t: number, i: number): number {
  return 0.25 + 0.75 * Math.max(0, Math.sin(t * 2.4 - i * 0.9));
}

/** Screen glow strength: pings at the start of every GLOW_CYCLE and fades out. */
export function glowPing(t: number): number {
  const cyc = (t % GLOW_CYCLE) / GLOW_CYCLE;
  return Math.pow(Math.max(0, 1 - cyc * 1.8), 2);
}

/** Point at fraction `progress` (0..1) of the polyline's total length. */
export function polylinePoint(pts: Pt[], progress: number): Pt {
  if (pts.length === 0) return [0, 0];
  if (pts.length === 1) return [pts[0][0], pts[0][1]];
  const seg: number[] = [];
  let tot = 0;
  for (let j = 1; j < pts.length; j++) {
    const l = Math.hypot(pts[j][0] - pts[j - 1][0], pts[j][1] - pts[j - 1][1]);
    seg.push(l);
    tot += l;
  }
  let d = clamp(progress) * tot;
  for (let j = 0; j < seg.length; j++) {
    if (d <= seg[j]) {
      const f = seg[j] ? d / seg[j] : 0;
      return [pts[j][0] + (pts[j + 1][0] - pts[j][0]) * f, pts[j][1] + (pts[j + 1][1] - pts[j][1]) * f];
    }
    d -= seg[j];
  }
  const last = pts[pts.length - 1];
  return [last[0], last[1]];
}

/** Chart-dot progress (0..1) at time t. */
export function chartProgress(t: number): number {
  return (t * 0.18) % 1;
}

/** Canvas backing-store size for a CSS width/height (DPR capped at MAX_DPR). */
export function backingSize(cssW: number, cssH: number, dpr: number): { w: number; h: number; dpr: number } {
  const d = Math.min(MAX_DPR, dpr > 0 ? dpr : 1);
  return { w: Math.max(1, Math.round(cssW * d)), h: Math.max(1, Math.round(cssH * d)), dpr: d };
}

/** Transform that maps source px onto a canvas `canvasW` device px wide: [a, b, c, d, e, f] for setTransform. */
export function plateTransform(canvasW: number): [number, number, number, number, number, number] {
  const sc = canvasW / PLATE.w;
  return [sc, 0, 0, sc, -PLATE.x * sc, -PLATE.y * sc];
}

/* ---------- phone carousel ---------- */

/** Same timing as components/blueprint/MobileProductCarousel.tsx. */
export const CAROUSEL_DURATION_MS = 3000;

/** Index wrapped into 0..count-1 (arrows wrap last to first and first to last). */
export function wrapIndex(i: number, count: number): number {
  if (count <= 0) return 0;
  return ((i % count) + count) % count;
}

/** Index of the item whose centre is closest to `mid`. */
export function nearestIndex(centers: number[], mid: number): number {
  let best = 0;
  let bd = Infinity;
  centers.forEach((c, k) => {
    const d = Math.abs(c - mid);
    if (d < bd) {
      bd = d;
      best = k;
    }
  });
  return best;
}

/**
 * scrollLeft that centres a card in the track. Positions come from getBoundingClientRect, so they are
 * correct whatever the card's offsetParent is: cardLeft/trackLeft are viewport x, scrollLeft the current scroll.
 */
export function centeredScrollLeft(
  cardLeft: number,
  cardWidth: number,
  trackLeft: number,
  trackClientWidth: number,
  scrollLeft: number
): number {
  const centerInContent = cardLeft - trackLeft + scrollLeft + cardWidth / 2;
  return Math.max(0, centerInContent - trackClientWidth / 2);
}

/** Card centre in the track's scroll-content coordinates (for nearestIndex). */
export function contentCenter(cardLeft: number, cardWidth: number, trackLeft: number, scrollLeft: number): number {
  return cardLeft - trackLeft + scrollLeft + cardWidth / 2;
}
