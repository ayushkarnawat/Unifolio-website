import { describe, expect, it } from "vitest";
import {
  HOLD_MS,
  IN_MS,
  MASK_CHAR,
  OUT_MS,
  SAFETY_MS,
  SAMPLE_FIGURE,
  TRUST_STATES,
  UNDERLINE_DELAY_MS,
  UNDERLINE_MS,
  dotProgress,
  keywordsOf,
  maskFigure,
  plainSubtext,
} from "./trustHighlights";

describe("TRUST_STATES", () => {
  it("has exactly three states in order", () => {
    expect(TRUST_STATES).toHaveLength(3);
    expect(TRUST_STATES.map((s) => s.heading)).toEqual([
      "Locked at rest",
      "Locked in transit",
      "Locked to you",
    ]);
    expect(TRUST_STATES.map((s) => s.visual)).toEqual(["rest", "transit", "consent"]);
  });

  it("uses the approved subtext wording", () => {
    expect(TRUST_STATES.map(plainSubtext)).toEqual([
      "AES-256 bit encryption on everything we store.",
      "TLS 1.2+ encryption on every connection, always.",
      "You approve it. You revoke it. Built for India’s DPDP Act.",
    ]);
  });

  it("marks the key words", () => {
    expect(TRUST_STATES.map(keywordsOf)).toEqual([
      ["AES-256 bit"],
      ["TLS 1.2+"],
      ["India’s DPDP Act"],
    ]);
  });

  it("never says bank grade or mentions PAN", () => {
    for (const s of TRUST_STATES) {
      const text = `${s.heading} ${plainSubtext(s)}`;
      expect(text).not.toMatch(/bank.?grade/i);
      expect(text).not.toMatch(/PAN/);
    }
  });
});

describe("timing", () => {
  it("matches the approved values", () => {
    expect({ HOLD_MS, SAFETY_MS, OUT_MS, IN_MS, UNDERLINE_DELAY_MS, UNDERLINE_MS }).toEqual({
      HOLD_MS: 700,
      SAFETY_MS: 1800,
      OUT_MS: 170,
      IN_MS: 320,
      UNDERLINE_DELAY_MS: 500,
      UNDERLINE_MS: 700,
    });
    expect(SAFETY_MS).toBeGreaterThan(UNDERLINE_DELAY_MS + UNDERLINE_MS);
  });

  it("dotProgress ramps from 0 to 1", () => {
    expect(dotProgress(0)).toBe(0);
    expect(dotProgress(200)).toBe(0);
    expect(dotProgress(550)).toBeCloseTo(0.5);
    expect(dotProgress(900)).toBe(1);
    expect(dotProgress(5000)).toBe(1);
  });
});

describe("maskFigure", () => {
  const n = Array.from(SAMPLE_FIGURE).length;
  const maskedCount = (s: string) => Array.from(s).filter((c) => c === MASK_CHAR).length;

  it("returns the plain figure at progress 0", () => {
    expect(maskFigure(SAMPLE_FIGURE, 0)).toBe(SAMPLE_FIGURE);
  });

  it("returns all bullets at progress 1", () => {
    expect(maskFigure(SAMPLE_FIGURE, 1)).toBe(MASK_CHAR.repeat(n));
  });

  it("clamps out-of-range progress", () => {
    expect(maskFigure(SAMPLE_FIGURE, -1)).toBe(SAMPLE_FIGURE);
    expect(maskFigure(SAMPLE_FIGURE, 2)).toBe(MASK_CHAR.repeat(n));
  });

  it("masks left to right and is monotonic", () => {
    let prev = -1;
    for (let i = 0; i <= 100; i++) {
      const out = maskFigure(SAMPLE_FIGURE, i / 100);
      const count = maskedCount(out);
      expect(count).toBeGreaterThanOrEqual(prev);
      // masked characters are always a prefix
      expect(out).toBe(MASK_CHAR.repeat(count) + Array.from(SAMPLE_FIGURE).slice(count).join(""));
      prev = count;
    }
    expect(prev).toBe(n);
  });
});
