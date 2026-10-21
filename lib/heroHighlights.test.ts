import { describe, expect, it } from "vitest";
import {
  HERO_HEADLINE,
  HERO_HIGHLIGHT_STATES,
  HERO_LINE,
  IN_MS,
  OUT_MS,
  STATE_MS,
  UNDERLINE_DELAY_MS,
  UNDERLINE_MS,
  UNDERLINE_STAGGER_MS,
  keywordDelayMs,
  keywordsOf,
  nextStateIndex,
  plainLine,
} from "./heroHighlights";

describe("hero copy", () => {
  it("uses the approved headline and line", () => {
    expect(HERO_HEADLINE).toEqual(["Your family’s wealth,", "understood."]);
    expect(HERO_LINE).toBe("All your family’s investments. Deeper insights. Smarter decisions.");
  });
});

describe("HERO_HIGHLIGHT_STATES", () => {
  it("has exactly six states in order", () => {
    expect(HERO_HIGHLIGHT_STATES).toHaveLength(6);
    expect(HERO_HIGHLIGHT_STATES.map((s) => s.heading)).toEqual([
      "Your family’s wealth, together.",
      "Protected at every step.",
      "Know how your wealth is performing.",
      "Your data, under your control",
      "See the risks you might miss",
      "Make your next move with clarity",
    ]);
    expect(HERO_HIGHLIGHT_STATES.map((s) => s.visual)).toEqual([
      "consolidate",
      "protect",
      "perform",
      "control",
      "risks",
      "scenarios",
    ]);
  });

  it("uses the approved line wording", () => {
    expect(HERO_HIGHLIGHT_STATES.map(plainLine)).toEqual([
      "Bring your family’s investments into one consolidated view.",
      "TLS encryption protects your data in transit, while AES-256 encryption safeguards it when stored.",
      "See portfolio performance in context, not just the numbers.",
      "You control how your financial accounts are connected and can manage access. Built for India’s DPDP Act.",
      "Spot overlapping investments, concentrated exposure and potential portfolio blind spots.",
      "Explore financial scenarios and understand how today’s choices could shape your family’s future.",
    ]);
  });

  it("marks the key words", () => {
    expect(HERO_HIGHLIGHT_STATES.map(keywordsOf)).toEqual([
      ["one consolidated view"],
      ["TLS encryption", "AES-256 encryption"],
      ["in context"],
      ["India’s DPDP Act"],
      ["overlapping investments"],
      ["financial scenarios"],
    ]);
  });

  it("never says bank grade or mentions PAN", () => {
    for (const s of HERO_HIGHLIGHT_STATES) {
      const text = `${s.heading} ${plainLine(s)}`;
      expect(text).not.toMatch(/bank.?grade/i);
      expect(text).not.toMatch(/PAN/);
    }
  });
});

describe("timing", () => {
  it("matches the approved values", () => {
    expect({ STATE_MS, OUT_MS, IN_MS, UNDERLINE_DELAY_MS, UNDERLINE_STAGGER_MS, UNDERLINE_MS }).toEqual({
      STATE_MS: 3000,
      OUT_MS: 170,
      IN_MS: 320,
      UNDERLINE_DELAY_MS: 500,
      UNDERLINE_STAGGER_MS: 650,
      UNDERLINE_MS: 700,
    });
  });

  it("schedules the key-word underlines 500 + i x 650 ms after the state appears", () => {
    expect([0, 1, 2].map(keywordDelayMs)).toEqual([500, 1150, 1800]);
    expect(keywordDelayMs(-1)).toBe(500);
  });

  it("draws every underline before the state slides out", () => {
    for (const s of HERO_HIGHLIGHT_STATES) {
      const last = keywordsOf(s).length - 1;
      expect(keywordDelayMs(last) + UNDERLINE_MS).toBeLessThanOrEqual(STATE_MS);
    }
  });

  it("cycles through the states and wraps", () => {
    expect([0, 1, 2, 3, 4, 5].map(nextStateIndex)).toEqual([1, 2, 3, 4, 5, 0]);
  });
});
