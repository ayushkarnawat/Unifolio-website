"use client";

import { useEffect, useRef } from "react";
import {
  ART_H,
  ART_W,
  COLORS,
  RING_CENTER,
  SCARD,
  SETTLED_T,
  SGRP,
  SINS,
  SMOT,
  clamp,
  computePlacement,
  placeY,
  ellPts,
  hexA,
  lerp,
  nz,
  ringGroupMotion,
  sQ,
  streamCurve,
  subdiv,
  timeline,
  type InsightIcon,
  type Placement,
  type Pt,
  type Timeline,
} from "@/lib/heroStoryboard";

/**
 * Hero background: the "Your storyboard" illustration drawn on a canvas.
 * Loops storyboard beats 04-07 (11.6 s, seamless). Ported from Docs/reference/hero-storyboard-reference.js.
 * Decorative only: the hero text carries the meaning.
 */

interface HeroStoryboardVisualProps {
  onRingMounted?: (element: HTMLElement) => void;
  isPaused?: boolean;
}

type Manifest = {
  width: number;
  height: number;
  feather?: { x: number; y: number };
  plate: string;
  poster: string;
  drawOrder: string[];
  layers: { id: string; file: string; x: number; y: number; w: number; h: number }[];
};

type Layer = { id: string; x: number; y: number; w: number; h: number; img: HTMLImageElement };
type Art = { plate: HTMLCanvasElement; layers: Layer[] };
type Fonts = { hand: string; sans: string };

const BASE = "/hero-storyboard/";
const TAU = Math.PI * 2;
const MAX_DPR = 2;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      if (typeof img.decode === "function") img.decode().then(() => resolve(img), () => resolve(img));
      else resolve(img);
    };
    img.onerror = () => reject(new Error(`failed to load ${src}`));
    img.src = src;
  });
}

/** Plate with soft edges, built once on an offscreen canvas at source resolution. */
function buildFeatheredPlate(plate: HTMLImageElement, fx: number, fy: number): HTMLCanvasElement {
  const oc = document.createElement("canvas");
  oc.width = ART_W;
  oc.height = ART_H;
  const o = oc.getContext("2d");
  if (!o) return oc;
  o.drawImage(plate, 0, 0, ART_W, ART_H);
  o.globalCompositeOperation = "destination-in";
  const F = fx / ART_W;
  const gx = o.createLinearGradient(0, 0, ART_W, 0);
  gx.addColorStop(0, "rgba(0,0,0,0)");
  gx.addColorStop(F, "#000");
  gx.addColorStop(1 - F, "#000");
  gx.addColorStop(1, "rgba(0,0,0,0)");
  o.fillStyle = gx;
  o.fillRect(0, 0, ART_W, ART_H);
  const G = fy / ART_H;
  const gy = o.createLinearGradient(0, 0, 0, ART_H);
  gy.addColorStop(0, "rgba(0,0,0,0)");
  gy.addColorStop(G, "#000");
  gy.addColorStop(1 - G, "#000");
  gy.addColorStop(1, "rgba(0,0,0,0)");
  o.fillStyle = gy;
  o.fillRect(0, 0, ART_W, ART_H);
  return oc;
}

/* ---------- sketch drawing helpers (ported from the reference) ---------- */

function sk(c: CanvasRenderingContext2D, pts: Pt[], f: number, seed: number, amp: number, boil: number) {
  if (f <= 0 || pts.length < 2) return;
  const P = subdiv(pts, 16).map((p, i): Pt => {
    const s = seed * 13.7 + i * 3.1 + boil * 9.1;
    return [p[0] + nz(s) * amp, p[1] + nz(s + 50) * amp];
  });
  let tot = 0;
  const L = [0];
  for (let i = 1; i < P.length; i++) {
    tot += Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]);
    L.push(tot);
  }
  const lim = tot * Math.min(1, f);
  c.beginPath();
  c.moveTo(P[0][0], P[0][1]);
  for (let i = 1; i < P.length; i++) {
    if (L[i] <= lim) c.lineTo(P[i][0], P[i][1]);
    else {
      const u = (lim - L[i - 1]) / (L[i] - L[i - 1] || 1);
      c.lineTo(lerp(P[i - 1][0], P[i][0], u), lerp(P[i - 1][1], P[i][1], u));
      break;
    }
  }
  c.stroke();
}

function inkStyle(c: CanvasRenderingContext2D, lw: number) {
  c.strokeStyle = COLORS.ink;
  c.lineCap = "round";
  c.lineJoin = "round";
  c.lineWidth = lw;
  c.setLineDash([]);
}

function handText(
  c: CanvasRenderingContext2D,
  fonts: Fonts,
  txt: string,
  x: number,
  y: number,
  px: number,
  al: number,
  f: number
) {
  c.globalAlpha = al;
  c.font = `700 ${px}px ${fonts.hand}`;
  c.textBaseline = "middle";
  c.textAlign = "left";
  c.fillStyle = COLORS.ink;
  const n = Math.floor(clamp(f) * txt.length);
  c.fillText(txt.slice(0, n), x, y);
}

function sIcon(
  c: CanvasRenderingContext2D,
  X: (x: number) => number,
  Y: (y: number) => number,
  sc: number,
  ic: InsightIcon,
  x: number,
  y: number,
  f: number,
  boil: number
) {
  const lw = 1.7 * sc;
  inkStyle(c, lw);
  if (ic === "bars") {
    const hs = [12, 20, 16, 28, 38];
    hs.forEach((hh, i) => {
      const bx = x + i * 17;
      const by = y + 44;
      const fp = clamp(f * 6 - i * 0.7);
      if (fp <= 0) return;
      c.fillStyle = hexA(COLORS.green, 0.55);
      c.fillRect(X(bx), Y(by - hh * fp), 14 * sc, hh * fp * sc);
      sk(c, [[X(bx), Y(by)], [X(bx), Y(by - hh * fp)], [X(bx + 14), Y(by - hh * fp)], [X(bx + 14), Y(by)]], 1, i + 400, 0.6, boil);
    });
    sk(c, [[X(x - 4), Y(y + 44)], [X(x + 88), Y(y + 44)]], clamp(f * 2), 410, 0.6, boil);
  } else if (ic === "pie") {
    c.fillStyle = hexA(COLORS.green, 0.5 * clamp(f * 2));
    c.beginPath();
    c.moveTo(X(x), Y(y));
    c.arc(X(x), Y(y), 24 * sc, -Math.PI / 2, -Math.PI / 2 + TAU * 0.23);
    c.closePath();
    c.fill();
    sk(c, ellPts(X(x), Y(y), 24 * sc, 24 * sc, 420, 24), f, 420, 0.7, boil);
    sk(c, [[X(x), Y(y)], [X(x), Y(y - 24)]], clamp(f * 2 - 0.5), 421, 0.5, boil);
    sk(c, [[X(x), Y(y)], [X(x + 23), Y(y - 6)]], clamp(f * 2 - 0.5), 422, 0.5, boil);
  } else if (ic === "zig") {
    const pts = ([[x, y + 22], [x + 30, y + 4], [x + 54, y + 16], [x + 96, y - 20]] as Pt[]).map((q): Pt => [X(q[0]), Y(q[1])]);
    c.save();
    c.strokeStyle = hexA(COLORS.ink, 0.8);
    sk(c, pts, f, 430, 0.7, boil);
    c.restore();
    if (f > 0.95) {
      c.fillStyle = COLORS.ink;
      c.beginPath();
      c.arc(pts[3][0], pts[3][1], 3 * sc, 0, TAU);
      c.fill();
    }
  } else {
    const pa = ([[x, y + 34], [x + 22, y + 18], [x + 40, y + 24], [x + 66, y - 6]] as Pt[]).map((q): Pt => [X(q[0]), Y(q[1])]);
    c.save();
    c.strokeStyle = COLORS.green;
    c.lineWidth = 2.4 * sc;
    sk(c, pa, f, 440, 0.7, boil);
    c.restore();
    sk(
      c,
      [
        [pa[3][0] - 8 * sc, pa[3][1] + 1 * sc],
        [pa[3][0], pa[3][1]],
        [pa[3][0] - 2 * sc, pa[3][1] + 9 * sc],
      ],
      clamp(f * 3 - 2),
      441,
      0.5,
      boil
    );
  }
}

/* ---------- the scene (story4 from the reference, caption pill and BEATS dropped) ---------- */

function drawStory(
  c: CanvasRenderingContext2D,
  w: number,
  h: number,
  pl: Placement,
  art: Art,
  t: number,
  tl: Timeline,
  fade: number,
  spx: number,
  spy: number,
  fonts: Fonts
) {
  const { sc, x0, y0 } = pl;
  const X = (x: number) => x0 + x * sc;
  const Y = (y: number) => placeY(pl, y); // includes the vertical spread around the ring centre
  const YS = (ys: number) => y0 + ys * sc; // for points already spread (see `spread`)
  const spread = (y: number) => RING_CENTER[1] + (y - RING_CENTER[1]) * pl.vy;
  const boil = Math.floor(t * 5);
  const SRC = RING_CENTER;

  c.globalAlpha = fade;
  c.drawImage(art.plate, x0, Y(0), ART_W * sc, ART_H * sc * pl.vy);

  const { dim, streamAlpha: stA, dotAlpha: dotA } = tl;

  // streams and travelling dots
  SCARD.forEach(([, cx, cy], i) => {
    const [P0, P1, P2] = streamCurve(i, cx, spread(cy)); // computed in spread coordinates so the ends land on the (round) ring edge
    if (stA > 0) {
      c.save();
      c.globalAlpha = fade * stA * 0.7;
      c.strokeStyle = COLORS.green;
      c.lineWidth = 1.4 * sc;
      c.setLineDash([8 * sc, 9 * sc]);
      c.lineDashOffset = -t * 30 * sc;
      c.beginPath();
      c.moveTo(X(P0[0]), YS(P0[1]));
      c.quadraticCurveTo(X(P1[0]), YS(P1[1]), X(P2[0]), YS(P2[1]));
      c.stroke();
      c.restore();
    }
    if (dotA > 0) {
      for (let d = 0; d < 2; d++) {
        const u = (t * 0.3 + i * 0.19 + d * 0.5) % 1;
        const pt = sQ(P0, P1, P2, u);
        c.globalAlpha = fade * dotA * Math.sin(Math.PI * u);
        c.fillStyle = COLORS.green;
        c.beginPath();
        c.arc(X(pt[0]), YS(pt[1]), 3 * sc, 0, TAU);
        c.fill();
      }
    }
  });

  if (tl.halo > 0) {
    const g = c.createRadialGradient(X(SRC[0]), Y(SRC[1]), 20 * sc, X(SRC[0]), Y(SRC[1]), 170 * sc);
    g.addColorStop(0, hexA(COLORS.green, (0.16 + 0.1 * Math.sin(t * 3)) * tl.halo));
    g.addColorStop(1, hexA(COLORS.green, 0));
    c.globalAlpha = fade;
    c.fillStyle = g;
    c.fillRect(0, 0, w, h);
  }

  // layers: the ring group moves as one piece, the rest float on their own
  const gm = ringGroupMotion(t);
  art.layers.forEach((L) => {
    const al = (L.id === "ring" ? 1 : dim) * fade;
    if (al <= 0.003) return;
    c.save();
    c.globalAlpha = al;
    if (SGRP[L.id]) {
      c.translate(X(SRC[0]) + gm.dx * sc + spx * 5, Y(SRC[1]) + gm.dy * sc + spy * 3);
      c.rotate(gm.rot);
      c.scale(gm.scale, gm.scale);
      c.drawImage(L.img, (L.x - SRC[0]) * sc, (L.y - SRC[1]) * sc, L.w * sc, L.h * sc);
    } else {
      const M = SMOT[L.id];
      if (M) {
        const dy = M.a * Math.sin(t * M.s + M.ph);
        const dx = M.a * 0.5 * Math.cos(t * M.s * 0.8 + M.ph);
        const rot = (M.r || 0) * Math.sin(t * (M.rs || 0.5) + M.ph);
        c.translate(X(L.x + L.w / 2 + dx) + spx * M.dep, Y(L.y + L.h / 2 + dy) + spy * M.dep * 0.6);
        c.rotate(rot);
        c.drawImage(L.img, (-L.w / 2) * sc, (-L.h / 2) * sc, L.w * sc, L.h * sc);
      } else {
        c.drawImage(L.img, X(L.x), Y(L.y), L.w * sc, L.h * sc);
      }
    }
    c.restore();
  });

  // scan arc around the ring
  const sa = tl.scan;
  if (sa > 0) {
    c.save();
    c.translate(X(SRC[0]), Y(SRC[1]));
    c.lineCap = "round";
    const a = t * 2.4;
    c.strokeStyle = hexA(COLORS.green, 0.85 * sa * fade);
    c.lineWidth = 5 * sc;
    c.beginPath();
    c.arc(0, 0, 124 * sc, a, a + 0.9);
    c.stroke();
    c.strokeStyle = hexA(COLORS.green, 0.3 * sa * fade);
    c.lineWidth = 2 * sc;
    c.beginPath();
    c.arc(0, 0, 124 * sc, a - 0.7, a);
    c.stroke();
    c.restore();
  }

  // insights write themselves in (minimum on-screen text sizes: numbers 15px, labels 10px)
  const bigPx = Math.max(30 * sc, 15);
  const smPx = Math.max(11.5 * sc, 10);
  SINS.forEach((q, k) => {
    const al = tl.insights[k].alpha * fade;
    if (al <= 0.01) return;
    const fp = tl.insights[k].progress;
    c.globalAlpha = al;
    // the icon keeps its exact offset from the number, whatever the vertical spread is
    sIcon(c, X, (yy: number) => Y(q.y) + (yy - q.y) * sc, sc, q.ic, q.ix, q.iy, fp, boil);
    handText(c, fonts, q.big, X(q.x), Y(q.y), bigPx, al, clamp(fp * 1.6));
    c.globalAlpha = al * clamp(fp * 2 - 0.4);
    c.fillStyle = COLORS.muted;
    c.font = `600 ${smPx}px ${fonts.sans}`;
    c.textAlign = "left";
    c.textBaseline = "middle";
    c.fillText(q.sm, X(q.x + 2), Y(q.y) + Math.max(24 * sc, bigPx * 0.5 + smPx * 0.75));
  });
  c.globalAlpha = 1;
}

function readFonts(): Fonts {
  const cs = getComputedStyle(document.documentElement);
  const hand = cs.getPropertyValue("--font-caveat").trim();
  const sans = cs.getPropertyValue("--font-manrope").trim();
  return {
    hand: hand ? `${hand}, cursive` : `"Segoe Print", cursive`,
    sans: sans ? `${sans}, system-ui, sans-serif` : "system-ui, sans-serif",
  };
}

function firstFamily(stack: string) {
  return stack.split(",")[0].trim();
}

export function HeroStoryboardVisual({ onRingMounted, isPaused = false }: HeroStoryboardVisualProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ringAnchorRef = useRef<HTMLDivElement | null>(null);
  const isPausedRef = useRef(isPaused);
  const syncRef = useRef<() => void>(() => {});
  const onRingMountedRef = useRef(onRingMounted);
  onRingMountedRef.current = onRingMounted;

  // Tell the parent where the ring anchor is (same contract as the old video visual).
  useEffect(() => {
    if (ringAnchorRef.current && onRingMountedRef.current) onRingMountedRef.current(ringAnchorRef.current);
  }, []);

  useEffect(() => {
    isPausedRef.current = isPaused;
    syncRef.current();
  }, [isPaused]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let disposed = false;
    let cssW = 0;
    let cssH = 0;
    let placement: Placement = computePlacement(1, 1);
    let poster: HTMLImageElement | null = null;
    let art: Art | null = null;
    let fonts = readFonts();

    // time: storyT runs only once the layered art is up; introT drives the one-time fade-in.
    let storyT = 0;
    let introT = 0;
    let lastTs: number | null = null;
    let rafId: number | null = null;

    let docVisible = typeof document === "undefined" ? true : document.visibilityState !== "hidden";
    let onScreen = true;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduced = mq.matches;

    // pointer parallax (wrapper is pointer-events-none, so listen on window)
    const ptr = { nx: 0, ny: 0, active: false };
    let spx = 0;
    let spy = 0;

    const draw = () => {
      if (!cssW || !cssH) return;
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      const fade = reduced ? 1 : clamp(introT / 0.5);
      if (art) {
        const t = reduced ? SETTLED_T : storyT;
        drawStory(ctx, cssW, cssH, placement, art, t, timeline(t), fade, reduced ? 0 : spx, reduced ? 0 : spy, fonts);
      } else if (poster) {
        ctx.globalAlpha = fade;
        ctx.drawImage(poster, placement.x0, placeY(placement, 0), ART_W * placement.sc, ART_H * placement.sc * placement.vy);
        ctx.globalAlpha = 1;
      }
    };

    const frame = (ts: number) => {
      rafId = null;
      if (disposed) return;
      const dt = lastTs === null ? 0 : Math.min((ts - lastTs) / 1000, 0.1);
      lastTs = ts;
      introT += dt;
      if (art) storyT += dt;
      const tx = ptr.active ? ptr.nx : 0;
      const ty = ptr.active ? ptr.ny : 0;
      spx += (tx - spx) * 0.06;
      spy += (ty - spy) * 0.06;
      draw();
      if (shouldRun()) rafId = requestAnimationFrame(frame);
    };

    function shouldRun() {
      return !disposed && !reduced && !isPausedRef.current && docVisible && onScreen && (art !== null || poster !== null);
    }

    const sync = () => {
      if (shouldRun()) {
        if (rafId === null) {
          lastTs = null; // resume without a time jump
          rafId = requestAnimationFrame(frame);
        }
      } else {
        if (rafId !== null) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
        draw(); // keep the last frame (or the settled still for reduced motion)
      }
    };
    syncRef.current = sync;

    const resize = () => {
      const r = wrap.getBoundingClientRect();
      cssW = Math.max(0, Math.round(r.width));
      cssH = Math.max(0, Math.round(r.height));
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      const bw = Math.max(1, Math.round(cssW * dpr));
      const bh = Math.max(1, Math.round(cssH * dpr));
      if (canvas.width !== bw) canvas.width = bw;
      if (canvas.height !== bh) canvas.height = bh;
      placement = computePlacement(cssW, cssH);
      const anchor = ringAnchorRef.current;
      if (anchor) {
        anchor.style.left = `${placement.ringPctX}%`;
        anchor.style.top = `${placement.ringPctY}%`;
      }
      draw();
    };

    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    resize();

    const io = new IntersectionObserver(
      (entries) => {
        onScreen = entries.some((e) => e.isIntersecting);
        sync();
      },
      { threshold: 0 }
    );
    io.observe(wrap);

    const onVisibility = () => {
      docVisible = document.visibilityState !== "hidden";
      sync();
    };
    document.addEventListener("visibilitychange", onVisibility);

    const onMotionPref = () => {
      reduced = mq.matches;
      sync();
    };
    mq.addEventListener?.("change", onMotionPref);

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") {
        ptr.active = false;
        return;
      }
      const r = canvas.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      ptr.active = inside;
      if (inside) {
        ptr.nx = clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1);
        ptr.ny = clamp(((e.clientY - r.top) / r.height) * 2 - 1, -1, 1);
      }
    };
    const onPointerOut = (e: PointerEvent) => {
      if (!e.relatedTarget) ptr.active = false;
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerout", onPointerOut, { passive: true });

    // fonts for the insight text: never block the first paint, redraw when ready
    const loadFonts = () => {
      if (!("fonts" in document)) return;
      fonts = readFonts();
      Promise.all([
        document.fonts.load(`700 30px ${firstFamily(fonts.hand)}`),
        document.fonts.load(`600 12px ${firstFamily(fonts.sans)}`),
      ])
        .then(() => {
          if (!disposed) {
            fonts = readFonts();
            if (rafId === null) draw();
          }
        })
        .catch(() => {});
    };
    loadFonts();

    // poster first, then the layered render once every layer has loaded
    loadImage(`${BASE}poster.webp`)
      .then((img) => {
        if (disposed) return;
        if (!art) poster = img;
        sync();
        draw();
      })
      .catch(() => {});

    fetch(`${BASE}manifest.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`manifest ${r.status}`);
        return r.json() as Promise<Manifest>;
      })
      .then(async (m) => {
        const byId = new Map(m.layers.map((l) => [l.id, l]));
        const order = (m.drawOrder?.length ? m.drawOrder : m.layers.map((l) => l.id)).filter((id) => byId.has(id));
        const [plateImg, ...imgs] = await Promise.all([
          loadImage(BASE + m.plate),
          ...order.map((id) => loadImage(BASE + byId.get(id)!.file)),
        ]);
        if (disposed) return;
        const fx = m.feather?.x ?? 44;
        const fy = m.feather?.y ?? 36;
        art = {
          plate: buildFeatheredPlate(plateImg, fx, fy),
          layers: order.map((id, i) => {
            const l = byId.get(id)!;
            return { id, x: l.x, y: l.y, w: l.w, h: l.h, img: imgs[i] };
          }),
        };
        // the poster was on screen at full strength: do not fade the layered art in again
        if (poster) introT = Math.max(introT, 0.5);
        sync();
        draw();
      })
      .catch(() => {
        // keep showing the poster
      });

    return () => {
      disposed = true;
      syncRef.current = () => {};
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = null;
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      mq.removeEventListener?.("change", onMotionPref);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerout", onPointerOut);
    };
  }, []);

  return (
    <div ref={wrapRef} className="relative w-full h-full select-none pointer-events-none overflow-hidden bg-[#FAF8F5]">
      <canvas ref={canvasRef} aria-hidden="true" role="presentation" className="absolute inset-0 w-full h-full" />
      {/* Ring centre anchor (kept for the inert iris-portal code); positioned on the real ring centre on resize */}
      <div
        ref={ringAnchorRef}
        id="hero-ring-portal"
        className="absolute pointer-events-none w-2 h-2"
        style={{ left: "62.87%", top: "49.12%", transform: "translate(-50%, -50%)" }}
      />
    </div>
  );
}
