/**
 * Pure helpers for the Security section: the vault illustration (components/security/SecurityVaultVisual.tsx),
 * the "money" banknote word (components/security/MoneyWord.tsx) and the phone carousel
 * (components/security/SecuritySection.tsx).
 * Ported from Docs/reference/security-section-prototype.html (the approved design).
 * No DOM access here, so everything in this file is unit tested in lib/securityStoryboard.test.ts.
 *
 * All geometry is in source pixels of the 1536x1024 PDF mockup the art was cut from
 * (same numbers as public/security-storyboard/manifest.json).
 */

import { clamp, ease, type Cubic } from "./productStoryboard";
import { BADGE_ON_MS, SAMPLE_FIGURE, TOGGLE_OFF_MS, dotProgress, maskFigure, type TrustVisual } from "./trustHighlights";

export {
  TAU,
  backingSize,
  bezierPoint,
  centeredScrollLeft,
  clamp,
  contentCenter,
  ease,
  nearestIndex,
  wrapIndex,
} from "./productStoryboard";
export type { Cubic, Pt } from "./productStoryboard";

export type Rect = { x: number; y: number; w: number; h: number };
export type CardId = "mf" | "st" | "ba" | "re" | "pm" | "go";
export type CardLayer = Rect & { id: CardId; file: string };

export const ASSET_BASE = "/security-storyboard/";

/** The background plate (vault door, hinge, handwriting); the canvas is drawn at exactly this size. */
export const PLATE: Rect & { file: string } = { file: "plate.webp", x: 62, y: 148, w: 706, h: 652 };
/** Canvas aspect ratio (width / height). */
export const PLATE_ASPECT = PLATE.w / PLATE.h;

/** Plate edge feather, in source px (left/right and top/bottom). */
export const FEATHER_X = 40;
export const FEATHER_Y = 34;
/** The plate is multiplied with the section background so it melts into the page. */
export const SECTION_BG = "#FAF8F5";

export const COLORS = {
  green: "#22C55E",
  ink: "#111613",
  muted: "#6B7A70",
  bg: SECTION_BG,
} as const;

/** The six asset cards, in draw (and intro) order. */
export const CARDS: CardLayer[] = [
  { id: "mf", file: "layer-mf.webp", x: 474, y: 178, w: 138, h: 139 },
  { id: "st", file: "layer-st.webp", x: 574, y: 258, w: 131, h: 127 },
  { id: "ba", file: "layer-ba.webp", x: 458, y: 346, w: 129, h: 113 },
  { id: "re", file: "layer-re.webp", x: 602, y: 414, w: 125, h: 117 },
  { id: "pm", file: "layer-pm.webp", x: 466, y: 482, w: 129, h: 133 },
  { id: "go", file: "layer-go.webp", x: 574, y: 556, w: 137, h: 137 },
];

/**
 * The vault wheel: an elliptical annulus around the logo, rotated in the door's perspective
 * (translate to the centre, scale(1, ry/rx), rotate, scale(1, rx/ry)). cx/cy are relative to x/y.
 */
export const WHEEL = { file: "layer-wheel.webp", x: 138, y: 293, w: 212, h: 312, cx: 106, cy: 156, rx: 100, ry: 150 } as const;

/** Float and tilt per card: amplitude (px), speed, phase, rotation amplitude (rad). */
export const MOT: Record<CardId, { a: number; s: number; ph: number; r: number }> = {
  mf: { a: 4, s: 0.9, ph: 0, r: 0.012 },
  st: { a: 5, s: 0.8, ph: 1.4, r: 0.014 },
  ba: { a: 4.5, s: 1.0, ph: 2.6, r: 0.012 },
  re: { a: 4, s: 0.85, ph: 0.7, r: 0.012 },
  pm: { a: 5, s: 0.95, ph: 2.0, r: 0.014 },
  go: { a: 4.5, s: 0.75, ph: 3.3, r: 0.012 },
};

/** Green dashed streaks from the vault's right edge to each card's left edge. */
export const STR: Cubic[] = [
  [[418, 300], [440, 285], [458, 272], [482, 258]],
  [[424, 330], [480, 330], [530, 336], [582, 338]],
  [[416, 420], [432, 414], [448, 410], [464, 408]],
  [[432, 455], [500, 458], [560, 462], [608, 466]],
  [[422, 500], [445, 515], [466, 528], [490, 540]],
  [[412, 560], [470, 580], [540, 600], [596, 616]],
];
export const STREAK_DASH: [number, number] = [16, 14];
/** Dash flow speed (source px per second). */
export const STREAK_FLOW = 34;

/** Dots on the plate: x, y, radius. */
export const DOTS: [number, number, number][] = [
  [477, 193, 8],
  [634, 234, 9],
  [718, 271, 9],
  [739, 474, 8],
  [727, 629, 9],
  [557, 660, 8],
];

/** Flickering tick marks: x1, y1, x2, y2. */
export const TICKS: [number, number, number, number][] = [
  [607, 173, 613, 159],
  [711, 382, 713, 389],
  [722, 391, 733, 376],
  [727, 398, 742, 396],
  [728, 404, 735, 408],
];

/** Soft glow behind the logo: radial gradient centre, radii and the box it fills. */
export const LOGO_GLOW = { x: 240, y: 448, r0: 10, r1: 95, box: { x: 130, y: 330, w: 220, h: 230 } } as const;
/** Glow ping cycle length (s). */
export const GLOW_CYCLE = 3.4;

/** Settled frame drawn for prefers-reduced-motion (intro long finished). */
export const SETTLED_T = 6;
/** Intro index used for the dots and ticks (after the wheel and the six cards). */
export const DOTS_INTRO_INDEX = 6;

/** Wheel swing amplitude (rad). */
export const WHEEL_SWING = 0.16;

/* ---------- vault maths ---------- */

/** Intro stagger: 0 before, eased to 1 over 0.8 s, each item 0.1 s after the previous. Reduced motion: always 1. */
export function intro(t: number, i: number, reduced = false): number {
  return reduced ? 1 : ease(clamp((t - 0.1 - i * 0.1) / 0.8));
}

/** Float offset and tilt of a card at time t, given its intro progress e (slides in from the left and below). */
export function cardMotion(id: CardId, t: number, e: number): { dx: number; dy: number; rot: number } {
  const M = MOT[id];
  return {
    dx: M.a * 0.5 * Math.cos(t * M.s * 0.8 + M.ph) + (1 - e) * -26,
    dy: M.a * Math.sin(t * M.s + M.ph) + (1 - e) * 18,
    rot: M.r * Math.sin(t * M.s * 0.7 + M.ph),
  };
}

/** Wheel angle (rad): a slow, irregular back-and-forth within +-WHEEL_SWING. Reduced motion: still. */
export function wheelAngle(t: number, introE: number, reduced = false): number {
  if (reduced) return 0;
  return (Math.sin(t * 0.62) * 0.5 + Math.sin(t * 0.31) * 0.5) * WHEEL_SWING * introE;
}

/**
 * Wheel transform relative to the plate origin, in the door's perspective, as a canvas matrix
 * [a, b, c, d, e, f]: translate(centre) scale(1, ry/rx) rotate(a) scale(1, rx/ry).
 * Draw the wheel image at (-cx, -cy) after applying it.
 */
export function wheelMatrix(angle: number): [number, number, number, number, number, number] {
  const k = WHEEL.ry / WHEEL.rx;
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  // S(1,k) . R(a) . S(1,1/k)
  return [c, k * s, -s / k, c, WHEEL.x + WHEEL.cx, WHEEL.y + WHEEL.cy];
}

/** Glow strength behind the logo: pings at the start of every GLOW_CYCLE and fades out. */
export function glowPing(t: number): number {
  const cyc = (t % GLOW_CYCLE) / GLOW_CYCLE;
  return Math.pow(Math.max(0, 1 - cyc * 1.5), 2);
}

/** Position (0..1) of travelling dot k on streak i at time t. */
export function streakDotU(t: number, i: number, k: number): number {
  return (t * 0.3 + i * 0.19 + k * 0.5) % 1;
}

/** Ping progress (0..1) on dot i at time t. */
export function pingU(t: number, i: number): number {
  return (t * 0.5 + i * 0.31) % 1;
}

/** Whether dot i is drawn filled green (the others are cream). */
export function dotIsGreen(i: number): boolean {
  return i % 3 === 1 || i === 4;
}

/** Tick alpha (0.3..1), staggered. */
export function tickAlpha(t: number, i: number): number {
  return 0.3 + 0.7 * Math.max(0, Math.sin(t * 2.2 - i * 0.8));
}

/** Transform that maps source px onto a canvas `canvasW` device px wide: [a, b, c, d, e, f] for setTransform. */
export function plateTransform(canvasW: number): [number, number, number, number, number, number] {
  const sc = canvasW / PLATE.w;
  return [sc, 0, 0, sc, -PLATE.x * sc, -PLATE.y * sc];
}

/* ---------- "money" banknote word ---------- */

/** Full loop length (s), including MONEY_REST at the start. */
export const MONEY_CYCLE = 6.4;
/** Rest before each play (s). */
export const MONEY_REST = 1.2;
/** The site's original timeline runs at 1.6x. */
export const MONEY_SPEED = 1.6;

const pw2in = (x: number) => x * x;
const pw2io = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
/** easeOutBack with overshoot s. */
export function backOut(x: number, s = 1.8): number {
  const c3 = s + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2);
}
const seg = (t: number, a: number, d: number) => clamp((t - a) / d);

export type MoneyFrame = {
  /** One entry per letter of "money". */
  chars: { opacity: number; scale: number; x: number }[];
  bill: { opacity: number; scale: number };
  /** Back bill (fans up and right). */
  b1: { x: number; y: number; rot: number };
  /** Back bill (fans down and left, flutters). */
  b2: { x: number; y: number; rot: number };
};

/**
 * State of the "money" animation at time t0 (s): letters fold into a banknote, two more bills fan out,
 * flutter, hold, fold back, letters return. Loops every MONEY_CYCLE seconds.
 */
export function moneyFrame(t0: number, letters = 5): MoneyFrame {
  const local = ((t0 % MONEY_CYCLE) + MONEY_CYCLE) % MONEY_CYCLE;
  const t = (local - MONEY_REST) * MONEY_SPEED;
  const tS = 0.3;
  const tB = tS + 0.12;
  const tF = tB + 0.22;
  const tFl = tF + 0.38;
  const tC = tFl + 0.32 + 0.7;
  const tR = tC + 0.22;
  const mid = (letters - 1) / 2;

  const chars = Array.from({ length: letters }, (_, i) => {
    let opacity = 1;
    let scale = 1;
    let x = 0;
    const u = seg(t, tS + i * 0.015, 0.25);
    if (u > 0) {
      const v = pw2in(u);
      opacity = 1 - v;
      scale = 1 - 0.65 * v;
      x = (i - mid) * 5 * v;
    }
    const r = seg(t, tR + i * 0.02, 0.3);
    if (r > 0) {
      const bk = backOut(r, 2.0);
      opacity = r;
      scale = 0.35 + 0.65 * bk;
      x = (i - mid) * 5 * (1 - bk);
    }
    return { opacity, scale, x };
  });

  const wi = seg(t, tB, 0.28);
  const wo = seg(t, tC + 0.16, 0.22);
  let billScale = 0.85 + 0.15 * backOut(wi, 1.8);
  const billOpacity = wi * (1 - pw2in(wo));
  if (wo > 0) billScale = 0.85 + 0.15 * (1 - pw2in(wo));

  const close = 1 - pw2io(seg(t, tC, 0.26));
  const f1 = backOut(seg(t, tF, 0.32), 1.8) * close;
  const f2 = backOut(seg(t, tF + 0.02, 0.34), 2.0) * close;
  let fl = 0;
  if (t > tFl && t < tFl + 0.32) {
    const q = (t - tFl) / 0.16;
    fl = (q <= 1 ? q : 2 - q) * 2 * Math.sin(Math.PI * clamp(q / 2));
  }

  return {
    chars,
    bill: { opacity: billOpacity, scale: billScale },
    b1: { x: 2.5 * f1, y: -1.2 * f1, rot: 4.5 * f1 },
    b2: { x: -2.5 * f2, y: 1.0 * f2, rot: -5.5 * f2 + 2 * fl * f2 },
  };
}

/* ---------- phone carousel ---------- */

/** Every slide gets the same dwell before auto-advancing. */
export const SLIDE_DURATION_MS = 2500;
/** After a programmatic smooth scroll, the carousel is idle once no scroll event arrives for this long. */
export const SCROLL_IDLE_MS = 140;
/** Upper bound for a programmatic smooth scroll (then the carousel follows the user again). */
export const SCROLL_MAX_MS = 1200;
/** Scroll snapping is switched off during a programmatic scroll and restored after this long. */
export const SNAP_RESTORE_MS = 1250;

export type AdvanceInput = {
  phone: boolean;
  visible: boolean;
  reduced: boolean;
  holding: boolean;
  busy: boolean;
  docHidden: boolean;
  elapsedMs: number;
};

/** Whether the carousel should move on to the next slide now. */
export function shouldAdvance(s: AdvanceInput): boolean {
  return s.phone && s.visible && !s.reduced && !s.holding && !s.busy && !s.docHidden && s.elapsedMs >= SLIDE_DURATION_MS;
}

/** Trust-slide visual state `elapsedMs` after the slide became active (same timing as the hero block). */
export function trustSlideVisual(
  visual: TrustVisual,
  elapsedMs: number
): { figure: string; badgeOn: boolean; toggleOff: boolean } {
  return {
    figure: visual === "rest" ? maskFigure(SAMPLE_FIGURE, dotProgress(elapsedMs)) : SAMPLE_FIGURE,
    badgeOn: visual === "rest" && elapsedMs >= BADGE_ON_MS,
    toggleOff: visual === "consent" && elapsedMs >= TOGGLE_OFF_MS,
  };
}
