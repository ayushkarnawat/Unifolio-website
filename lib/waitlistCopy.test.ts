import { describe, expect, it } from "vitest";
import {
  SUCCESS_AUTOCLOSE_MS,
  WAITLIST_BENEFITS,
  WAITLIST_FORM,
  WAITLIST_NEXT_STEPS,
  WAITLIST_PANEL,
  WAITLIST_SUCCESS,
} from "./waitlistCopy";

function strings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === "object") return Object.values(value).flatMap(strings);
  return [];
}

describe("waitlist pop-up copy", () => {
  it("closes the success card after 5 seconds", () => {
    expect(SUCCESS_AUTOCLOSE_MS).toBe(5000);
  });

  it("has exactly three benefits with the approved titles", () => {
    expect(WAITLIST_BENEFITS.map((b) => b.title)).toEqual([
      "Early access",
      "Product updates",
      "Wealth insights",
    ]);
  });

  it("has exactly three next steps with the approved titles", () => {
    expect(WAITLIST_NEXT_STEPS.map((s) => s.title)).toEqual([
      "Early access",
      "Product updates",
      "A clearer view of your wealth",
    ]);
  });

  it("never says bank grade or mentions PAN", () => {
    const all = strings([
      WAITLIST_PANEL,
      WAITLIST_FORM,
      WAITLIST_BENEFITS,
      WAITLIST_SUCCESS,
      WAITLIST_NEXT_STEPS,
    ]);
    expect(all.length).toBeGreaterThan(20);
    for (const s of all) {
      expect(s).not.toMatch(/bank.?grade/i);
      expect(s).not.toMatch(/\bPAN\b/);
    }
  });
});
