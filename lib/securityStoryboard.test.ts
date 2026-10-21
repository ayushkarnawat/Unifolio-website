import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  CARDS,
  DOTS,
  MONEY_CYCLE,
  MONEY_REST,
  PLATE,
  PLATE_ASPECT,
  SETTLED_T,
  SLIDE_DURATION_MS,
  STR,
  TICKS,
  WHEEL,
  WHEEL_SWING,
  cardMotion,
  dotIsGreen,
  glowPing,
  intro,
  moneyFrame,
  pingU,
  plateTransform,
  shouldAdvance,
  streakDotU,
  tickAlpha,
  trustSlideVisual,
  wheelAngle,
  wheelMatrix,
  type AdvanceInput,
} from "./securityStoryboard";
import { SECURITY_PRINCIPLES } from "./securityCopy";
import { MASK_CHAR, SAMPLE_FIGURE } from "./trustHighlights";

const manifest = JSON.parse(
  readFileSync(join(__dirname, "..", "public", "security-storyboard", "manifest.json"), "utf8")
) as {
  plate: { file: string; x: number; y: number; w: number; h: number };
  layers: { id: string; file: string; x: number; y: number; w: number; h: number; cx?: number; cy?: number; rx?: number; ry?: number }[];
  dots: [number, number, number][];
  icons: { file: string }[];
};

describe("geometry matches public/security-storyboard/manifest.json", () => {
  it("plate", () => {
    expect(PLATE).toEqual(manifest.plate);
    expect(PLATE_ASPECT).toBeCloseTo(706 / 652, 6);
  });

  it("six cards in order with the same rects", () => {
    const cards = manifest.layers.filter((l) => l.id !== "wheel");
    expect(CARDS.map((c) => c.id)).toEqual(cards.map((c) => c.id));
    CARDS.forEach((c, i) => {
      expect(c).toMatchObject({ file: cards[i].file, x: cards[i].x, y: cards[i].y, w: cards[i].w, h: cards[i].h });
    });
  });

  it("wheel", () => {
    const w = manifest.layers.find((l) => l.id === "wheel")!;
    expect(WHEEL).toMatchObject({ file: w.file, x: w.x, y: w.y, w: w.w, h: w.h, cx: w.cx, cy: w.cy, rx: w.rx, ry: w.ry });
  });

  it("dots", () => {
    expect(DOTS).toEqual(manifest.dots);
  });

  it("principle icons exist in the manifest", () => {
    const files = manifest.icons.map((i) => "/security-storyboard/" + i.file);
    SECURITY_PRINCIPLES.forEach((p) => expect(files).toContain(p.icon.src));
  });

  it("one streak per card, ticks inside the plate", () => {
    expect(STR).toHaveLength(CARDS.length);
    TICKS.forEach(([x1, y1, x2, y2]) => {
      [x1, x2].forEach((x) => expect(x).toBeGreaterThanOrEqual(PLATE.x));
      [x1, x2].forEach((x) => expect(x).toBeLessThanOrEqual(PLATE.x + PLATE.w));
      [y1, y2].forEach((y) => expect(y).toBeGreaterThanOrEqual(PLATE.y));
      [y1, y2].forEach((y) => expect(y).toBeLessThanOrEqual(PLATE.y + PLATE.h));
    });
  });
});

describe("vault motion", () => {
  it("intro staggers and settles", () => {
    expect(intro(0, 0)).toBe(0);
    expect(intro(0.1 + 0.8, 0)).toBeCloseTo(1, 6);
    expect(intro(1, 3)).toBeLessThan(intro(1, 0));
    expect(intro(SETTLED_T, 7)).toBe(1);
    expect(intro(0, 5, true)).toBe(1);
  });

  it("cards start offset to the left and below, then float within their amplitude", () => {
    const start = cardMotion("mf", 0, 0);
    expect(start.dx).toBeLessThan(-20);
    expect(start.dy).toBeGreaterThan(10);
    for (let t = 0; t < 20; t += 0.37) {
      const m = cardMotion("st", t, 1);
      expect(Math.abs(m.dy)).toBeLessThanOrEqual(5 + 1e-9);
      expect(Math.abs(m.dx)).toBeLessThanOrEqual(2.5 + 1e-9);
      expect(Math.abs(m.rot)).toBeLessThanOrEqual(0.014 + 1e-9);
    }
  });

  it("wheel swings slowly within +-WHEEL_SWING, still for reduced motion", () => {
    for (let t = 0; t < 60; t += 0.13) {
      expect(Math.abs(wheelAngle(t, 1))).toBeLessThanOrEqual(WHEEL_SWING + 1e-9);
    }
    expect(wheelAngle(3, 1, true)).toBe(0);
    expect(wheelAngle(3, 0)).toBe(0);
  });

  it("wheel matrix keeps the wheel centre fixed and is the identity at angle 0", () => {
    const [a, b, c, d, e, f] = wheelMatrix(0);
    expect([a, b, c, d]).toEqual([1, 0, -0, 1]);
    expect(e).toBe(WHEEL.x + WHEEL.cx);
    expect(f).toBe(WHEEL.y + WHEEL.cy);
    // A point on the ellipse stays on the ellipse after rotating in perspective.
    const m = wheelMatrix(0.3);
    const px = WHEEL.rx;
    const py = 0;
    const x = m[0] * px + m[2] * py;
    const y = m[1] * px + m[3] * py;
    expect((x / WHEEL.rx) ** 2 + (y / WHEEL.ry) ** 2).toBeCloseTo(1, 9);
  });

  it("glow pings at the start of each cycle", () => {
    expect(glowPing(0)).toBe(1);
    expect(glowPing(3.4 * 0.7)).toBe(0);
    expect(glowPing(3.4)).toBeCloseTo(1, 6);
  });

  it("travelling values stay in range", () => {
    for (let t = 0; t < 30; t += 0.41) {
      for (let i = 0; i < 6; i++) {
        const u = streakDotU(t, i, 1);
        expect(u).toBeGreaterThanOrEqual(0);
        expect(u).toBeLessThan(1);
        const p = pingU(t, i);
        expect(p).toBeGreaterThanOrEqual(0);
        expect(p).toBeLessThan(1);
        const a = tickAlpha(t, i);
        expect(a).toBeGreaterThanOrEqual(0.3);
        expect(a).toBeLessThanOrEqual(1);
      }
    }
  });

  it("two of the six dots are green, as in the drawing", () => {
    expect(DOTS.map((_, i) => dotIsGreen(i))).toEqual([false, true, false, false, true, false]);
  });

  it("plate transform maps the plate onto the canvas", () => {
    const [a, , , d, e, f] = plateTransform(1412);
    expect(a).toBe(2);
    expect(d).toBe(2);
    expect(e).toBe(-PLATE.x * 2);
    expect(f).toBe(-PLATE.y * 2);
  });
});

describe("money word", () => {
  it("rests as the plain word, with the bill hidden", () => {
    for (const t of [0, 0.5, MONEY_REST - 0.01, MONEY_CYCLE - 0.001]) {
      const fr = moneyFrame(t);
      expect(fr.bill.opacity).toBeCloseTo(0, 6);
      fr.chars.forEach((c) => {
        expect(c.opacity).toBeCloseTo(1, 2);
        expect(c.scale).toBeCloseTo(1, 2);
      });
    }
  });

  it("turns into a banknote with fanned bills mid-cycle", () => {
    // t (timeline) = 1.3 -> local = 1.2 + 1.3 / 1.6
    const fr = moneyFrame(MONEY_REST + 1.3 / 1.6);
    expect(fr.bill.opacity).toBeCloseTo(1, 6);
    fr.chars.forEach((c) => expect(c.opacity).toBeCloseTo(0, 6));
    expect(fr.b1.rot).toBeGreaterThan(3);
    expect(fr.b2.rot).toBeLessThan(-3);
  });

  it("loops every MONEY_CYCLE seconds", () => {
    const a = moneyFrame(2.1);
    const b = moneyFrame(2.1 + MONEY_CYCLE * 3);
    expect(b.bill.opacity).toBeCloseTo(a.bill.opacity, 9);
    expect(b.b2.rot).toBeCloseTo(a.b2.rot, 9);
  });

  it("letters spread symmetrically around the middle letter", () => {
    // timeline t = 0.8: every letter has finished folding in
    const fr = moneyFrame(MONEY_REST + 0.8 / 1.6);
    expect(fr.chars[2].x).toBeCloseTo(0, 9);
    expect(fr.chars[0].x).toBeCloseTo(-fr.chars[4].x, 9);
  });
});

describe("phone carousel", () => {
  const base: AdvanceInput = {
    phone: true,
    visible: true,
    reduced: false,
    holding: false,
    busy: false,
    docHidden: false,
    elapsedMs: SLIDE_DURATION_MS,
  };

  it("advances every 2.5 s only when it may", () => {
    expect(SLIDE_DURATION_MS).toBe(2500);
    expect(shouldAdvance(base)).toBe(true);
    expect(shouldAdvance({ ...base, elapsedMs: 2499 })).toBe(false);
    expect(shouldAdvance({ ...base, phone: false })).toBe(false);
    expect(shouldAdvance({ ...base, visible: false })).toBe(false);
    expect(shouldAdvance({ ...base, reduced: true })).toBe(false);
    expect(shouldAdvance({ ...base, holding: true })).toBe(false);
    expect(shouldAdvance({ ...base, busy: true })).toBe(false);
    expect(shouldAdvance({ ...base, docHidden: true })).toBe(false);
  });

  it("trust slide visuals follow the hero timing and restart from 0", () => {
    expect(trustSlideVisual("rest", 0)).toEqual({ figure: SAMPLE_FIGURE, badgeOn: false, toggleOff: false });
    const done = trustSlideVisual("rest", 1000);
    expect(done.badgeOn).toBe(true);
    expect(Array.from(done.figure).every((c) => c === MASK_CHAR)).toBe(true);
    expect(trustSlideVisual("consent", 899).toggleOff).toBe(false);
    expect(trustSlideVisual("consent", 900).toggleOff).toBe(true);
    expect(trustSlideVisual("transit", 5000)).toEqual({ figure: SAMPLE_FIGURE, badgeOn: false, toggleOff: false });
  });
});
