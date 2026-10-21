import { describe, expect, it } from "vitest";
import {
  ART_H,
  ART_W,
  LOOP_SECONDS,
  RING_CENTER,
  RING_RADIUS_OUTER,
  SETTLED_T,
  computePlacement,
  placeY,
  ringGroupMotion,
  streamCurve,
  timeline,
} from "./heroStoryboard";

const close = (a: number, b: number, eps = 1e-3) => expect(Math.abs(a - b)).toBeLessThan(eps);

describe("timeline", () => {
  it("starts fully assembled: cards at full strength, streams faint, no beats running", () => {
    const tl = timeline(0);
    close(tl.dim, 1);
    close(tl.streamAlpha, 0.25);
    close(tl.dotAlpha, 0);
    close(tl.halo, 0);
    close(tl.scan, 0);
    tl.insights.forEach((i) => close(i.alpha, 0));
  });

  it("is seamless: the last frame of the loop equals the first", () => {
    const a = timeline(LOOP_SECONDS); // first frame of loop 2 (intro already complete)
    const b = timeline(LOOP_SECONDS * 2 - 1e-6); // last frame of loop 2
    for (const k of ["dim", "streamAlpha", "dotAlpha", "halo", "scan"] as const) {
      close(a[k], b[k]);
    }
    a.insights.forEach((ins, k) => close(ins.alpha, b.insights[k].alpha));
    close(b.dim, 1);
    close(b.streamAlpha, 0.25);
    close(b.dotAlpha, 0);
    close(b.halo, 0);
    close(b.scan, 0);
  });

  it("timeline(0) and timeline(LOOP_SECONDS - 1e-6) agree on every envelope", () => {
    const a = timeline(0);
    const b = timeline(LOOP_SECONDS - 1e-6);
    for (const k of ["dim", "streamAlpha", "dotAlpha", "halo", "scan"] as const) close(a[k], b[k]);
    a.insights.forEach((ins, k) => close(ins.alpha, b.insights[k].alpha));
  });

  it("is continuous across the loop point (no jump between consecutive frames)", () => {
    const dt = 1 / 120;
    const a = timeline(LOOP_SECONDS * 3 - dt);
    const b = timeline(LOOP_SECONDS * 3 + dt);
    for (const k of ["dim", "streamAlpha", "dotAlpha", "halo", "scan"] as const) {
      expect(Math.abs(a[k] - b[k])).toBeLessThan(0.05);
    }
  });

  it("plays the beats in order: dots, scan, insights, settle", () => {
    expect(timeline(1.5).dotAlpha).toBeGreaterThan(0.9); // 04 everything connects
    expect(timeline(4).scan).toBeGreaterThan(0.9); // 05 processing
    expect(timeline(8).insights.every((i) => i.alpha > 0.9)).toBe(true); // 06 insights
    expect(timeline(8).dim).toBeLessThan(0.3); // cards fade back for the insights
    const settled = timeline(SETTLED_T); // 07 settle
    close(settled.dim, 1, 0.01);
    settled.insights.forEach((i) => close(i.alpha, 0, 0.01));
    close(settled.scan, 0);
  });

  it("fades in once over 0.5 s and stays in", () => {
    close(timeline(0).intro, 0);
    close(timeline(0.25).intro, 0.5);
    close(timeline(0.5).intro, 1);
    close(timeline(LOOP_SECONDS + 0.1).intro, 1);
  });
});

describe("ringGroupMotion", () => {
  it("stays within a few art pixels", () => {
    for (let t = 0; t < 30; t += 0.37) {
      const m = ringGroupMotion(t);
      expect(Math.abs(m.dx)).toBeLessThanOrEqual(3);
      expect(Math.abs(m.dy)).toBeLessThanOrEqual(3);
      expect(Math.abs(m.rot)).toBeLessThanOrEqual(0.008);
      expect(Math.abs(m.scale - 1)).toBeLessThanOrEqual(0.006);
    }
  });
});

describe("streamCurve", () => {
  it("ends on the ring edge", () => {
    const [, , P2] = streamCurve(0, 186, 151);
    const r = Math.hypot(P2[0] - RING_CENTER[0], P2[1] - RING_CENTER[1]);
    expect(r).toBeGreaterThan(110);
    expect(r).toBeLessThan(118);
  });
});

describe("computePlacement", () => {
  const sizes: [number, number][] = [
    [1920, 1080],
    [1440, 900],
    [1024, 768],
    [768, 1024],
    [390, 844],
    [390, 240],
    [390, 300],
    [360, 300],
    [639, 300],
  ];

  it.each(sizes)("%i x %i: finite, ring inside the container", (w, h) => {
    const p = computePlacement(w, h);
    for (const v of Object.values(p)) if (typeof v === "number") expect(Number.isFinite(v)).toBe(true);
    expect(p.sc).toBeGreaterThan(0);
    expect(p.ringX).toBeGreaterThan(0);
    expect(p.ringX).toBeLessThan(w);
    expect(p.ringY).toBeGreaterThan(0);
    expect(p.ringY).toBeLessThan(h);
    expect(p.ringPctX).toBeGreaterThan(0);
    expect(p.ringPctX).toBeLessThan(100);
    expect(p.ringPctY).toBeGreaterThan(0);
    expect(p.ringPctY).toBeLessThan(100);
    close(p.ringX, p.x0 + RING_CENTER[0] * p.sc);
    close(p.ringY, p.y0 + RING_CENTER[1] * p.sc);
  });

  it("puts the artwork on the right half on desktop, clear of the headline column", () => {
    for (const [w, h] of [
      [1920, 1080],
      [1440, 900],
      [1024, 768],
    ]) {
      const p = computePlacement(w, h);
      expect(p.wide).toBe(true);
      expect(p.x0 + 20 * p.sc).toBeGreaterThanOrEqual(w * 0.455);
      // the vertical spread keeps the whole plate inside the container, and the ring stays put
      expect(p.vy).toBeGreaterThanOrEqual(1);
      expect(p.vy).toBeLessThanOrEqual(1.4);
      expect(placeY(p, 0)).toBeGreaterThanOrEqual(0);
      expect(placeY(p, ART_H)).toBeLessThanOrEqual(h);
      close(placeY(p, RING_CENTER[1]), p.ringY);
      // the visible content (art y 6..395) uses at least 40% of the container height (it was about 30% before the spread)
      expect((placeY(p, 395) - placeY(p, 6)) / h).toBeGreaterThanOrEqual(0.4);
      // the right-most card (ends at art x 809) is fully visible, with a clear gap to the edge
      expect(p.x0 + 809 * p.sc).toBeLessThanOrEqual(w - 8);
      // and the whole plate (art x 0..904, including its faded right edge) fits in the container with a margin
      expect(p.x0 + 904 * p.sc).toBeLessThanOrEqual(w - 16);
    }
  });

  it("stacks the artwork in the upper part of the hero on tablets", () => {
    for (const [w, h] of [
      [768, 1024],
      [640, 900],
    ]) {
      const p = computePlacement(w, h);
      expect(p.wide).toBe(false);
      expect(p.y0 + ART_H * p.sc).toBeLessThan(h * 0.72);
      // ring outer diameter at least 25% of the viewport width
      expect((2 * RING_RADIUS_OUTER * p.sc) / w).toBeGreaterThanOrEqual(0.25);
      expect(p.x0 + ART_W * p.sc).toBeGreaterThan(w * 0.9);
    }
  });

  it("keeps the tablet placement unchanged (artwork centred at 40% of the hero height)", () => {
    const p = computePlacement(768, 1024);
    const sc = Math.min((768 * 0.98) / 820, 0.95, (1024 * 0.42) / ART_H);
    close(p.sc, sc);
    close(p.x0, (768 - 820 * sc) / 2);
    close(p.y0, 1024 * 0.4 - (ART_H / 2) * sc);
    close(p.vy, 1);
  });

  it("centres the artwork in its own 300px box on phones (between the button and the highlight block)", () => {
    for (const w of [320, 360, 390, 430, 639]) {
      const h = 300;
      const p = computePlacement(w, h);
      expect(p.wide).toBe(false);
      close(p.vy, 1);
      // vertically centred in the box and fully inside it
      close(p.y0 + (ART_H * p.sc) / 2, h / 2);
      expect(p.y0).toBeGreaterThanOrEqual(0);
      expect(p.y0 + ART_H * p.sc).toBeLessThanOrEqual(h);
      // horizontally centred on the visible content
      close(p.x0 + (820 * p.sc) / 2, w / 2);
      // ring outer diameter at least 25% of the viewport width on usual phones (the box height caps the wider ones)
      expect((2 * RING_RADIUS_OUTER * p.sc) / w).toBeGreaterThanOrEqual(w <= 430 ? 0.25 : 0.2);
      if (w <= 430) expect(p.x0 + ART_W * p.sc).toBeGreaterThan(w * 0.9);
    }
  });
});
