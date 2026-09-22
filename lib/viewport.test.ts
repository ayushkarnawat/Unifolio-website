import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  getComposedViewport,
  getViewportHeightScale,
  getCardRestHeight,
  DESKTOP_REFERENCE_WIDTH,
  DESKTOP_REFERENCE_HEIGHT,
} from "./viewport";

function setWindowSize(width: number, height: number) {
  Object.defineProperty(window, "innerWidth", { value: width, configurable: true });
  Object.defineProperty(window, "innerHeight", { value: height, configurable: true });
}

describe("getComposedViewport", () => {
  afterEach(() => {
    setWindowSize(1024, 768);
  });

  it("snaps two widths in the same tier to an identical value", () => {
    setWindowSize(1290, 900);
    const a = getComposedViewport();
    setWindowSize(1364, 900);
    const b = getComposedViewport();
    expect(a.vw).toBe(b.vw);
    expect(a.vw).toBe(1280);
  });

  it("clamps any width above the desktop reference to the reference width", () => {
    setWindowSize(2560, 1440);
    const result = getComposedViewport();
    expect(result.vw).toBe(DESKTOP_REFERENCE_WIDTH);
    expect(result.vh).toBe(DESKTOP_REFERENCE_HEIGHT);
  });

  it("still reports the true raw width/height alongside the tiered ones", () => {
    setWindowSize(1600, 1000);
    const result = getComposedViewport();
    expect(result.rawW).toBe(1600);
    expect(result.rawH).toBe(1000);
    expect(result.vw).toBe(DESKTOP_REFERENCE_WIDTH);
  });

  it("passes a width just under the smallest tier straight through, unsnapped", () => {
    setWindowSize(900, 700);
    const result = getComposedViewport();
    expect(result.vw).toBe(900);
  });
});

describe("getViewportHeightScale", () => {
  it("returns 1.0 for tall/standard screens", () => {
    expect(getViewportHeightScale(900)).toBe(1.0);
  });

  it("returns the floor scale for very short screens", () => {
    expect(getViewportHeightScale(500)).toBe(0.72);
  });

  it("interpolates linearly between the short and tall thresholds", () => {
    const mid = getViewportHeightScale(715); // halfway between 580 and 850
    expect(mid).toBeCloseTo(0.72 + 0.14, 2);
  });
});

describe("getCardRestHeight", () => {
  it("steps down for narrower viewports", () => {
    expect(getCardRestHeight(1600, 900)).toBe(375);
    expect(getCardRestHeight(1300, 900)).toBe(360);
    expect(getCardRestHeight(1024, 900)).toBe(345);
    expect(getCardRestHeight(500, 900)).toBe(285);
  });

  it("shrinks further on short-height screens", () => {
    const tall = getCardRestHeight(1600, 900);
    const short = getCardRestHeight(1600, 700);
    expect(short).toBeLessThan(tall);
  });
});
