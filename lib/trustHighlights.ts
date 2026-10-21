/**
 * Content and timing for the hero "trust highlight" (TrustHighlights).
 * Pure module: no DOM, no React, so it can be unit tested.
 */

export type TrustVisual = "rest" | "transit" | "consent";

export interface TrustTextPart {
  text: string;
  /** Key words: rendered green with an animated underline. */
  kw?: boolean;
}

export interface TrustState {
  visual: TrustVisual;
  heading: string;
  subtext: TrustTextPart[];
}

export const TRUST_STATES: readonly TrustState[] = [
  {
    visual: "rest",
    heading: "Locked at rest",
    subtext: [{ text: "AES-256 bit", kw: true }, { text: " encryption on everything we store." }],
  },
  {
    visual: "transit",
    heading: "Locked in transit",
    subtext: [{ text: "TLS 1.2+", kw: true }, { text: " encryption on every connection, always." }],
  },
  {
    visual: "consent",
    heading: "Locked to you",
    subtext: [
      { text: "You approve it. You revoke it. Built for " },
      { text: "India’s DPDP Act", kw: true },
      { text: "." },
    ],
  },
];

/** Sample figure that turns into dots in the "Locked at rest" visual. */
export const SAMPLE_FIGURE = "₹2,84,000";
export const MASK_CHAR = "•";

/* Cycle timing (ms) */
export const HOLD_MS = 700;
export const SAFETY_MS = 1800;
export const OUT_MS = 170;
export const IN_MS = 320;
export const UNDERLINE_DELAY_MS = 500;
export const UNDERLINE_MS = 700;

/* Visual timing (ms after the state appears) */
export const DOT_START_MS = 200;
export const DOT_END_MS = 900;
export const BADGE_ON_MS = 950;
export const TOGGLE_OFF_MS = 900;

export function plainSubtext(state: TrustState): string {
  return state.subtext.map((p) => p.text).join("");
}

export function keywordsOf(state: TrustState): string[] {
  return state.subtext.filter((p) => p.kw).map((p) => p.text);
}

/**
 * Returns `plain` with its first characters replaced by bullets, left to right.
 * progress 0 -> unchanged, progress 1 -> all bullets. Character i is masked
 * once progress passes its midpoint, (i + 0.5) / n.
 */
export function maskFigure(plain: string, progress: number): string {
  const chars = Array.from(plain);
  const n = chars.length;
  if (n === 0) return plain;
  const k = Math.min(1, Math.max(0, Number.isFinite(progress) ? progress : 0));
  return chars.map((c, i) => (k > (i + 0.5) / n ? MASK_CHAR : c)).join("");
}

/** Dotting progress (0..1) for a given time since the state appeared. */
export function dotProgress(elapsedMs: number): number {
  if (elapsedMs <= DOT_START_MS) return 0;
  if (elapsedMs >= DOT_END_MS) return 1;
  return (elapsedMs - DOT_START_MS) / (DOT_END_MS - DOT_START_MS);
}
