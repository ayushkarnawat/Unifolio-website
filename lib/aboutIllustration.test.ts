import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  ASSET_BASE,
  DEV,
  LAYERS,
  MAX_DPR,
  MOT,
  ORDER,
  SETTLED_T,
  STR,
  VIEW,
  VIEW_ASPECT,
  arrivalPulse,
  backingSize,
  bezierPoint,
  clamp,
  dashboardScale,
  devicePingU,
  ease,
  fitFontSize,
  glowAlpha,
  intro,
  layerMotion,
  streamDotAlpha,
  streamDotU,
  viewTransform,
  type Cubic,
} from "./aboutIllustration";
import { ABOUT_CLOSING, ABOUT_CLOSING_FIT, ABOUT_HEADLINE, ABOUT_LINE, ABOUT_LINE_FIT } from "./aboutCopy";

const close = (a: number, b: number, eps = 1e-6) => expect(Math.abs(a - b)).toBeLessThan(eps);
const PUBLIC_DIR = join(__dirname, "..", "public");

describe("geometry", () => {
  const manifest = JSON.parse(readFileSync(join(PUBLIC_DIR, "about-illustration", "manifest.json"), "utf8"));

  it("matches public/about-illustration/manifest.json", () => {
    expect(VIEW).toEqual(manifest.viewBox);
    expect(manifest.layers).toHaveLength(ORDER.length);
    for (const m of manifest.layers) {
      const L = LAYERS[m.id as keyof typeof LAYERS];
      expect(L, m.id).toBeDefined();
      expect({ file: L.file, x: L.x, y: L.y, w: L.w, h: L.h }).toEqual({ file: m.file, x: m.x, y: m.y, w: m.w, h: m.h });
    }
  });

  it("every layer file exists under the asset base", () => {
    for (const id of ORDER) {
      expect(existsSync(join(PUBLIC_DIR, ASSET_BASE, LAYERS[id].file)), LAYERS[id].file).toBe(true);
    }
  });

  it("draws the dashboard first, then the four people, each once", () => {
    expect(ORDER[0]).toBe("c");
    expect([...ORDER].sort()).toEqual(["c", "p1", "p2", "p3", "p4"]);
  });

  it("has one flow and one device per person, each flow touching the dashboard", () => {
    expect(STR).toHaveLength(4);
    expect(DEV).toHaveLength(4);
    const c = LAYERS.c;
    const inDashboard = ([x, y]: [number, number]) => x >= c.x && x <= c.x + c.w && y >= c.y && y <= c.y + c.h;
    for (const p of STR) {
      // flows 0-2 end on the dashboard; flow 3 starts on it (same curves as the prototype)
      expect(inDashboard(p[0]) || inDashboard(p[3])).toBe(true);
    }
  });

  it("keeps the aspect ratio of the view box", () => {
    close(VIEW_ASPECT, 1330 / 800);
  });
});

describe("maths", () => {
  it("clamps and eases", () => {
    expect(clamp(-1)).toBe(0);
    expect(clamp(2)).toBe(1);
    expect(clamp(5, 0, 10)).toBe(5);
    expect(ease(0)).toBe(0);
    expect(ease(1)).toBe(1);
    close(ease(0.5), 0.5);
    expect(ease(0.25)).toBeLessThan(0.25);
    expect(ease(0.75)).toBeGreaterThan(0.75);
  });

  it("bezierPoint hits both ends and stays inside the hull", () => {
    const p: Cubic = STR[0];
    expect(bezierPoint(p, 0)).toEqual(p[0]);
    const end = bezierPoint(p, 1);
    close(end[0], p[3][0]);
    close(end[1], p[3][1]);
    const mid = bezierPoint(p, 0.5);
    close(mid[0], (p[0][0] + 3 * p[1][0] + 3 * p[2][0] + p[3][0]) / 8);
    close(mid[1], (p[0][1] + 3 * p[1][1] + 3 * p[2][1] + p[3][1]) / 8);
  });

  it("intro staggers 0.16 s apart over 0.9 s and is 1 for reduced motion", () => {
    expect(intro(0, 0)).toBe(0);
    expect(intro(0.1, 0)).toBe(0);
    close(intro(1.0, 0), 1);
    expect(intro(0.26, 1)).toBe(0);
    close(intro(0.26 + 0.45, 1), 0.5);
    close(intro(SETTLED_T, 4), 1);
    expect(intro(0, 3, true)).toBe(1);
  });

  it("layerMotion follows the MOT table and rises 18 px during the intro", () => {
    const m = layerMotion("p1", 0, 0);
    close(m.dy, 18);
    close(m.dx, MOT.p1.a * 0.5);
    close(m.rot, 0);
    const settled = layerMotion("p2", 2, 1);
    close(settled.dy, MOT.p2.a * Math.sin(2 * MOT.p2.s + MOT.p2.ph));
    close(settled.rot, MOT.p2.r * Math.sin(2 * MOT.p2.s * 0.7 + MOT.p2.ph));
    expect(MOT.c.r).toBe(0);
    for (let t = 0; t < 20; t += 0.37) {
      for (const id of ORDER) {
        const { dx, dy, rot } = layerMotion(id, t, 1);
        expect(Math.abs(dx)).toBeLessThanOrEqual(MOT[id].a * 0.5 + 1e-9);
        expect(Math.abs(dy)).toBeLessThanOrEqual(MOT[id].a + 1e-9);
        expect(Math.abs(rot)).toBeLessThanOrEqual(MOT[id].r + 1e-9);
      }
    }
  });

  it("dots, pings and pulse stay in range", () => {
    for (let t = 0; t < 30; t += 0.13) {
      for (let i = 0; i < 4; i++) {
        const u = streamDotU(t, i);
        expect(u).toBeGreaterThanOrEqual(0);
        expect(u).toBeLessThan(1);
        expect(streamDotAlpha(u)).toBeGreaterThanOrEqual(0);
        expect(streamDotAlpha(u)).toBeLessThanOrEqual(1);
        const v = devicePingU(t, i);
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThan(1);
      }
      const p = arrivalPulse(t);
      expect(p).toBeGreaterThanOrEqual(0);
      expect(p).toBeLessThanOrEqual(1);
      expect(glowAlpha(t)).toBeGreaterThanOrEqual(0.05 - 1e-9);
      expect(glowAlpha(t)).toBeLessThanOrEqual(0.15 + 1e-9);
      expect(dashboardScale(t, p)).toBeGreaterThan(0.99);
      expect(dashboardScale(t, p)).toBeLessThan(1.02);
    }
  });

  it("pulses when a dot arrives and is quiet in between", () => {
    // flow 0 has u = 0 at t = 0 (just arrived); at t = 0.6 every u is between 0.12 and 0.9
    close(arrivalPulse(0), 1);
    expect(arrivalPulse(0.6)).toBe(0);
    close(arrivalPulse(0.95 / 0.22, 1), 0.5);
  });

  it("backingSize caps DPR at 2", () => {
    expect(backingSize(100, 60, 3)).toEqual({ w: 200, h: 120, dpr: MAX_DPR });
    expect(backingSize(100, 60, 1)).toEqual({ w: 100, h: 60, dpr: 1 });
    expect(backingSize(0, 0, 0)).toEqual({ w: 1, h: 1, dpr: 1 });
  });

  it("viewTransform maps the view box onto the canvas, centred", () => {
    const [a, , , d, e, f] = viewTransform(1330, 800);
    expect(a).toBe(1);
    expect(d).toBe(1);
    expect(e).toBe(-VIEW.x);
    expect(f).toBe(-VIEW.y);
    // wider canvas: scaled by height, centred horizontally
    const [s, , , , ex, fy] = viewTransform(2000, 400);
    close(s, 0.5);
    close(ex + VIEW.x * s, (2000 - VIEW.w * s) / 2);
    close(fy + VIEW.y * s, 0);
  });
});

describe("one-line fitting", () => {
  it("keeps the design size when it fits", () => {
    expect(fitFontSize(20, 14, 900, 780)).toEqual({ size: 20, nowrap: false });
  });

  it("shrinks to fit on one line down to the minimum", () => {
    const r = fitFontSize(20, 14, 600, 780);
    expect(r.nowrap).toBe(true);
    close(r.size, ((20 * 600) / 780) * 0.98);
    expect(r.size).toBeGreaterThanOrEqual(14);
  });

  it("wraps at the minimum when it would go below it", () => {
    expect(fitFontSize(19, 11, 200, 560)).toEqual({ size: 11, nowrap: false });
  });
});

describe("copy", () => {
  it("uses the page 12 wording", () => {
    expect(ABOUT_HEADLINE.lead).toBe("Your family’s wealth is connected.");
    expect(ABOUT_HEADLINE.emphasis).toBe("Your understanding should be, too.");
    expect(ABOUT_LINE).toBe("Unifolio brings your family’s finance together, helping you see the bigger picture.");
    expect(`${ABOUT_CLOSING.lead} ${ABOUT_CLOSING.emphasis}`).toBe("Better clarity. Smarter decisions.");
    expect(ABOUT_CLOSING.line).toBe("Understand what you own, what’s working, and what comes next.");
    expect(ABOUT_LINE_FIT).toEqual({ max: 20, min: 14 });
    expect(ABOUT_CLOSING_FIT).toEqual({ max: 19, min: 11 });
  });
});
