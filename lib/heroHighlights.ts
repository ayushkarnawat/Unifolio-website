/**
 * Content and timing for the hero highlight block (components/hero/HeroHighlights.tsx):
 * six states, each with a small looping visual, a heading and a line with green underlined key words.
 * Pure module: no DOM, no React, so it can be unit tested.
 * Approved design: Docs/reference/hero-section-prototype.html.
 */

export type HeroHighlightVisual =
  | "consolidate"
  | "protect"
  | "perform"
  | "control"
  | "risks"
  | "scenarios";

export interface HeroHighlightTextPart {
  text: string;
  /** Key words: rendered green with an animated underline. */
  kw?: boolean;
}

export interface HeroHighlightState {
  visual: HeroHighlightVisual;
  heading: string;
  line: HeroHighlightTextPart[];
}

/** Hero headline, one entry per line; the last line is green. */
export const HERO_HEADLINE = ["Your family’s wealth,", "understood."] as const;

/** The line under the hero headline. */
export const HERO_LINE = "All your family’s investments. Deeper insights. Smarter decisions.";

export const HERO_HIGHLIGHT_STATES: readonly HeroHighlightState[] = [
  {
    visual: "consolidate",
    heading: "Your family’s wealth, together.",
    line: [
      { text: "Bring your family’s investments into " },
      { text: "one consolidated view", kw: true },
      { text: "." },
    ],
  },
  {
    visual: "protect",
    heading: "Protected at every step.",
    line: [
      { text: "TLS encryption", kw: true },
      { text: " protects your data in transit, while " },
      { text: "AES-256 encryption", kw: true },
      { text: " safeguards it when stored." },
    ],
  },
  {
    visual: "perform",
    heading: "Know how your wealth is performing.",
    line: [
      { text: "See portfolio performance " },
      { text: "in context", kw: true },
      { text: ", not just the numbers." },
    ],
  },
  {
    visual: "control",
    heading: "Your data, under your control",
    line: [
      { text: "You control how your financial accounts are connected and can manage access. Built for " },
      { text: "India’s DPDP Act", kw: true },
      { text: "." },
    ],
  },
  {
    visual: "risks",
    heading: "See the risks you might miss",
    line: [
      { text: "Spot " },
      { text: "overlapping investments", kw: true },
      { text: ", concentrated exposure and potential portfolio blind spots." },
    ],
  },
  {
    visual: "scenarios",
    heading: "Make your next move with clarity",
    line: [
      { text: "Explore " },
      { text: "financial scenarios", kw: true },
      { text: " and understand how today’s choices could shape your family’s future." },
    ],
  },
];

/* Cycle timing (ms): every state stays the same time on every device (no underline-driven hold). */
export const STATE_MS = 3000;
export const OUT_MS = 170;
export const IN_MS = 320;

/* Key-word underline timing (ms after the state appears) */
export const UNDERLINE_DELAY_MS = 500;
export const UNDERLINE_STAGGER_MS = 650;
export const UNDERLINE_MS = 700;

export function plainLine(state: HeroHighlightState): string {
  return state.line.map((p) => p.text).join("");
}

export function keywordsOf(state: HeroHighlightState): string[] {
  return state.line.filter((p) => p.kw).map((p) => p.text);
}

/** When the i-th key-word underline of a state starts drawing (ms after the state appears). */
export function keywordDelayMs(i: number): number {
  return UNDERLINE_DELAY_MS + Math.max(0, i) * UNDERLINE_STAGGER_MS;
}

/** Index of the state after `index`, wrapping around. */
export function nextStateIndex(index: number): number {
  const n = HERO_HIGHLIGHT_STATES.length;
  return (((index + 1) % n) + n) % n;
}
