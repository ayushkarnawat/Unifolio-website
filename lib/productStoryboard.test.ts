import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  ARR,
  CAROUSEL_DURATION_MS,
  CHART,
  LAYERS,
  PLATE,
  PLATE_ASPECT,
  SETTLED_T,
  arrowDotU,
  backingSize,
  bezierPoint,
  bezierTangent,
  centeredScrollLeft,
  chartProgress,
  clamp,
  contentCenter,
  ease,
  glowPing,
  intro,
  layerMotion,
  nearestIndex,
  plateTransform,
  polylinePoint,
  sparkAlpha,
  wrapIndex,
  type Cubic,
} from "./productStoryboard";
import { PRODUCT_CARDS, PRODUCT_HEADLINE } from "./productCopy";

const close = (a: number, b: number, eps = 1e-6) => expect(Math.abs(a - b)).toBeLessThan(eps);

describe("geometry", () => {
  it("matches public/product-storyboard/manifest.json", () => {
    const m = JSON.parse(readFileSync(join(__dirname, "..", "public", "product-storyboard", "manifest.json"), "utf8"));
    expect({ file: PLATE.file, x: PLATE.x, y: PLATE.y, w: PLATE.w, h: PLATE.h }).toEqual({
      file: m.plate.file,
      x: m.plate.x,
      y: m.plate.y,
      w: m.plate.w,
      h: m.plate.h,
    });
    expect(LAYERS.map((l) => l.id)).toEqual(m.layers.map((l: { id: string }) => l.id));
    LAYERS.forEach((l, i) => {
      const ml = m.layers[i];
      expect({ file: l.file, x: l.x, y: l.y, w: l.w, h: l.h }).toEqual({ file: ml.file, x: ml.x, y: ml.y, w: ml.w, h: ml.h });
    });
    PRODUCT_CARDS.forEach((c, i) => {
      const ill = m.illustrations[i];
      expect(c.illustration.src).toBe(`/product-storyboard/${ill.file}`);
      expect([c.illustration.width, c.illustration.height]).toEqual([ill.w, ill.h]);
    });
  });

  it("keeps every layer and arrow inside the plate", () => {
    const inside = (x: number, y: number) =>
      x >= PLATE.x && x <= PLATE.x + PLATE.w && y >= PLATE.y && y <= PLATE.y + PLATE.h;
    LAYERS.forEach((l) => {
      expect(inside(l.x, l.y)).toBe(true);
      expect(inside(l.x + l.w, l.y + l.h)).toBe(true);
    });
    ARR.flat().forEach(([x, y]) => expect(inside(x, y)).toBe(true));
    CHART.forEach(([x, y]) => expect(inside(x, y)).toBe(true));
  });

  it("has the plate aspect ratio 1070/328", () => {
    close(PLATE_ASPECT, 1070 / 328);
  });
});

describe("maths", () => {
  it("clamp and ease", () => {
    expect(clamp(-1)).toBe(0);
    expect(clamp(2)).toBe(1);
    expect(clamp(5, 0, 10)).toBe(5);
    close(ease(0), 0);
    close(ease(0.5), 0.5);
    close(ease(1), 1);
    expect(ease(0.25)).toBeLessThan(0.25);
    expect(ease(0.75)).toBeGreaterThan(0.75);
  });

  it("bezierPoint hits the end points and bezierTangent follows the control polygon at the ends", () => {
    const p: Cubic = [[0, 0], [10, 0], [20, 10], [30, 30]];
    expect(bezierPoint(p, 0)).toEqual([0, 0]);
    expect(bezierPoint(p, 1)).toEqual([30, 30]);
    expect(bezierTangent(p, 0)).toEqual([30, 0]);
    expect(bezierTangent(p, 1)).toEqual([30, 60]);
  });

  it("every arrow ends at the laptop, pointing inward", () => {
    ARR.forEach((p, i) => {
      const [dx] = bezierTangent(p, 1);
      if (i < 3) expect(dx).toBeGreaterThan(0); // left cards point right
      else expect(dx).toBeLessThan(0); // right cards point left
    });
  });

  it("polylinePoint walks the chart line by length", () => {
    expect(polylinePoint(CHART, 0)).toEqual(CHART[0]);
    expect(polylinePoint(CHART, 1)).toEqual(CHART[CHART.length - 1]);
    const mid = polylinePoint([[0, 0], [10, 0], [10, 10]], 0.75);
    close(mid[0], 10);
    close(mid[1], 5);
    expect(polylinePoint([], 0.5)).toEqual([0, 0]);
    expect(polylinePoint([[3, 4]], 0.5)).toEqual([3, 4]);
  });
});

describe("animation", () => {
  it("intro staggers the layers and is settled by SETTLED_T", () => {
    expect(intro(0, 0)).toBe(0);
    expect(intro(0.5, 0)).toBeGreaterThan(intro(0.5, 1));
    for (let i = 0; i <= 6; i++) close(intro(SETTLED_T, i), 1);
    expect(intro(0, 3, true)).toBe(1);
  });

  it("layers rise 16 px into place and then only float within their amplitude", () => {
    const start = layerMotion("mf", 0, 0);
    const settled = layerMotion("mf", 0, 1);
    close(start.dy - settled.dy, 16);
    for (let t = 0; t < 20; t += 0.37) {
      const m = layerMotion("st", t, 1);
      expect(Math.abs(m.dy)).toBeLessThanOrEqual(5 + 1e-9);
      expect(Math.abs(m.dx)).toBeLessThanOrEqual(2 + 1e-9);
      expect(Math.abs(m.rot)).toBeLessThanOrEqual(0.014 + 1e-9);
    }
    // the laptop does not tilt
    expect(layerMotion("lap", 3.3, 1).rot).toBe(0);
  });

  it("loops stay in range", () => {
    for (let t = 0; t < 30; t += 0.41) {
      const u = arrowDotU(t, 2, 1);
      expect(u).toBeGreaterThanOrEqual(0);
      expect(u).toBeLessThan(1);
      const a = sparkAlpha(t, 1);
      expect(a).toBeGreaterThanOrEqual(0.25);
      expect(a).toBeLessThanOrEqual(1);
      const g = glowPing(t);
      expect(g).toBeGreaterThanOrEqual(0);
      expect(g).toBeLessThanOrEqual(1);
      const c = chartProgress(t);
      expect(c).toBeGreaterThanOrEqual(0);
      expect(c).toBeLessThan(1);
    }
    close(glowPing(0), 1);
    close(glowPing(3.2 * 0.6), 0);
  });
});

describe("canvas sizing", () => {
  it("caps the DPR at 2 and never returns an empty backing store", () => {
    expect(backingSize(535, 164, 3)).toEqual({ w: 1070, h: 328, dpr: 2 });
    expect(backingSize(100, 30, 1)).toEqual({ w: 100, h: 30, dpr: 1 });
    expect(backingSize(0, 0, 0)).toEqual({ w: 1, h: 1, dpr: 1 });
  });

  it("maps the plate's top-left to the canvas origin and its width to the canvas width", () => {
    const [a, , , d, e, f] = plateTransform(2140);
    close(a, 2);
    close(d, 2);
    close(PLATE.x * a + e, 0);
    close(PLATE.y * d + f, 0);
    close((PLATE.x + PLATE.w) * a + e, 2140);
  });
});

describe("carousel", () => {
  it("uses the same 3 s timing as the old mobile carousel", () => {
    expect(CAROUSEL_DURATION_MS).toBe(3000);
  });

  it("wraps arrows last to first and first to last", () => {
    expect(wrapIndex(3, 3)).toBe(0);
    expect(wrapIndex(-1, 3)).toBe(2);
    expect(wrapIndex(1, 3)).toBe(1);
    expect(wrapIndex(5, 0)).toBe(0);
  });

  it("finds the card closest to the track centre", () => {
    expect(nearestIndex([100, 400, 700], 380)).toBe(1);
    expect(nearestIndex([100, 400, 700], 0)).toBe(0);
    expect(nearestIndex([100, 400, 700], 9999)).toBe(2);
  });

  it("centres a card from viewport rects, independent of the track's own position", () => {
    // track at viewport x 50, 300 wide, scrolled by 120; card at viewport x 330, 250 wide
    const left = centeredScrollLeft(330, 250, 50, 300, 120);
    // card centre in content = 330 - 50 + 120 + 125 = 525; minus half the track = 375
    expect(left).toBe(375);
    expect(contentCenter(330, 250, 50, 120)).toBe(525);
    // the first card never asks for negative scroll
    expect(centeredScrollLeft(66, 250, 50, 390, 0)).toBe(0);
  });
});

describe("copy", () => {
  it("has the approved headline and three cards", () => {
    expect(PRODUCT_HEADLINE.lead + PRODUCT_HEADLINE.emphasis).toBe("From seeing your wealth to understanding it.");
    expect(PRODUCT_CARDS.map((c) => `${c.num} ${c.label}`)).toEqual(["01 Track", "02 Analyse", "03 Plan"]);
    expect(PRODUCT_CARDS.map((c) => c.titleLead + c.titleEmphasis)).toEqual([
      "See your whole financial picture.",
      "Understand what’s really happening.",
      "Make your next move with clarity.",
    ]);
  });
});
