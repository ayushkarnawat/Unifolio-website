"use client";

import { useEffect, useRef } from "react";
import {
  ARR,
  ARROWS_INTRO_INDEX,
  ASSET_BASE,
  CHART,
  COLORS,
  DONUT,
  FEATHER_X,
  FEATHER_Y,
  LAYERS,
  PLATE,
  SCREEN_GLOW,
  SETTLED_T,
  SPARKS,
  TAU,
  arrowDotU,
  arrowPulse,
  backingSize,
  bezierPoint,
  bezierTangent,
  chartProgress,
  glowPing,
  intro,
  layerMotion,
  plateTransform,
  polylinePoint,
  sparkAlpha,
  type Layer,
} from "@/lib/productStoryboard";
import { PRODUCT_VISUAL_LABEL } from "@/lib/productCopy";

/**
 * Product section illustration: six asset cards feeding the laptop dashboard, drawn on a canvas.
 * Ported from Docs/reference/product-section-prototype.html (the approved design).
 * Pure geometry and timing live in lib/productStoryboard.ts.
 */

type LoadedLayer = Layer & { img: HTMLImageElement };
type Art = { plate: HTMLCanvasElement; layers: LoadedLayer[] };

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

/** Plate multiplied with the section cream and feathered at the edges, built once at source resolution. */
function buildPlate(plate: HTMLImageElement): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = PLATE.w;
  c.height = PLATE.h;
  const o = c.getContext("2d");
  if (!o) return c;
  o.drawImage(plate, 0, 0, PLATE.w, PLATE.h);
  o.globalCompositeOperation = "multiply";
  o.fillStyle = COLORS.bg;
  o.fillRect(0, 0, PLATE.w, PLATE.h);
  o.globalCompositeOperation = "destination-in";
  const F = FEATHER_X / PLATE.w;
  const gx = o.createLinearGradient(0, 0, PLATE.w, 0);
  gx.addColorStop(0, "rgba(0,0,0,0)");
  gx.addColorStop(F, "#000");
  gx.addColorStop(1 - F, "#000");
  gx.addColorStop(1, "rgba(0,0,0,0)");
  o.fillStyle = gx;
  o.fillRect(0, 0, PLATE.w, PLATE.h);
  const G = FEATHER_Y / PLATE.h;
  const gy = o.createLinearGradient(0, 0, 0, PLATE.h);
  gy.addColorStop(0, "rgba(0,0,0,0)");
  gy.addColorStop(G, "#000");
  gy.addColorStop(1 - G, "#000");
  gy.addColorStop(1, "rgba(0,0,0,0)");
  o.fillStyle = gy;
  o.fillRect(0, 0, PLATE.w, PLATE.h);
  return c;
}

/** One frame in source-pixel coordinates (the caller has applied plateTransform). */
function drawScene(ctx: CanvasRenderingContext2D, art: Art, t: number, reduced: boolean) {
  const io = (i: number) => intro(t, i, reduced);

  ctx.globalAlpha = 1;
  ctx.drawImage(art.plate, PLATE.x, PLATE.y);

  // arrows: solid green with an arrowhead and two travelling dots each
  const arrowA = io(ARROWS_INTRO_INDEX) * 0.9;
  ARR.forEach((p, i) => {
    ctx.globalAlpha = arrowA;
    ctx.strokeStyle = COLORS.green;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(p[0][0], p[0][1]);
    ctx.bezierCurveTo(p[1][0], p[1][1], p[2][0], p[2][1], p[3][0], p[3][1]);
    ctx.stroke();

    const e = p[3];
    const dv = bezierTangent(p, 1);
    ctx.save();
    ctx.translate(e[0], e[1]);
    ctx.rotate(Math.atan2(dv[1], dv[0]));
    ctx.globalAlpha = arrowA * arrowPulse(t, i);
    ctx.beginPath();
    ctx.moveTo(-13, -8);
    ctx.lineTo(0, 0);
    ctx.lineTo(-13, 8);
    ctx.stroke();
    ctx.restore();

    for (let k = 0; k < 2; k++) {
      const u = arrowDotU(t, i, k);
      const q = bezierPoint(p, u);
      ctx.globalAlpha = arrowA * Math.sin(Math.PI * u);
      ctx.fillStyle = "#fff";
      ctx.shadowColor = COLORS.green;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(q[0], q[1], 3.4, 0, TAU);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = COLORS.green;
      ctx.beginPath();
      ctx.arc(q[0], q[1], 2.1, 0, TAU);
      ctx.fill();
    }
  });

  // sparks above the laptop
  SPARKS.forEach((s, i) => {
    ctx.globalAlpha = sparkAlpha(t, i) * io(ARROWS_INTRO_INDEX);
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = 3.2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(s[0], s[1]);
    ctx.lineTo(s[2], s[3]);
    ctx.stroke();
  });

  // cards, then the laptop with its screen effects
  art.layers.forEach((L, i) => {
    const e = io(i);
    if (e <= 0) return;
    const { dx, dy, rot } = layerMotion(L.id, t, e);
    const cx = L.x + L.w / 2;
    const cy = L.y + L.h / 2;
    ctx.save();
    ctx.globalAlpha = e;
    ctx.translate(cx + dx, cy + dy);
    ctx.rotate(rot);
    ctx.drawImage(L.img, -L.w / 2, -L.h / 2, L.w, L.h);
    if (L.id === "lap") {
      ctx.translate(-cx, -cy);
      const ping = glowPing(t);
      const g = ctx.createRadialGradient(SCREEN_GLOW.x, SCREEN_GLOW.y, SCREEN_GLOW.r0, SCREEN_GLOW.x, SCREEN_GLOW.y, SCREEN_GLOW.r1);
      g.addColorStop(0, `rgba(34,197,94,${0.1 * ping + 0.02})`);
      g.addColorStop(1, "rgba(34,197,94,0)");
      ctx.fillStyle = g;
      const b = SCREEN_GLOW.box;
      ctx.fillRect(b.x, b.y, b.w, b.h);

      // highlight circling the donut
      const a0 = t * 1.5;
      ctx.strokeStyle = "rgba(34,197,94,.9)";
      ctx.lineWidth = 5;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(DONUT.x, DONUT.y, DONUT.r, a0, a0 + 0.9);
      ctx.stroke();
      ctx.strokeStyle = "rgba(34,197,94,.28)";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(DONUT.x, DONUT.y, DONUT.r, a0 - 0.8, a0);
      ctx.stroke();

      // dot riding the chart line
      const [px, py] = polylinePoint(CHART, chartProgress(t));
      const gl = ctx.createRadialGradient(px, py, 0, px, py, 14);
      gl.addColorStop(0, "rgba(34,197,94,.6)");
      gl.addColorStop(1, "rgba(34,197,94,0)");
      ctx.fillStyle = gl;
      ctx.beginPath();
      ctx.arc(px, py, 14, 0, TAU);
      ctx.fill();
      ctx.fillStyle = COLORS.green;
      ctx.beginPath();
      ctx.arc(px, py, 3.6, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  });
  ctx.globalAlpha = 1;
}

export function ProductStoryboardVisual({ className = "" }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let disposed = false;
    let art: Art | null = null;
    // time only runs once the art is loaded and while the canvas is on screen, so the intro plays on arrival
    let t = 0;
    let lastTs: number | null = null;
    let rafId: number | null = null;
    let docVisible = document.visibilityState !== "hidden";
    let onScreen = false;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduced = mq.matches;

    const draw = () => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (!art) return;
      ctx.setTransform(...plateTransform(canvas.width));
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      drawScene(ctx, art, reduced ? SETTLED_T : t, reduced);
    };

    const shouldRun = () => !disposed && !reduced && docVisible && onScreen && art !== null;

    const frame = (ts: number) => {
      rafId = null;
      if (disposed) return;
      const dt = lastTs === null ? 0 : Math.min((ts - lastTs) / 1000, 0.1);
      lastTs = ts;
      t += dt;
      draw();
      if (shouldRun()) rafId = requestAnimationFrame(frame);
    };

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

    const resize = () => {
      const r = wrap.getBoundingClientRect();
      const { w, h } = backingSize(r.width, r.height, window.devicePixelRatio || 1);
      if (canvas.width !== w) canvas.width = w;
      if (canvas.height !== h) canvas.height = h;
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

    Promise.all([loadImage(ASSET_BASE + PLATE.file), ...LAYERS.map((l) => loadImage(ASSET_BASE + l.file))])
      .then(([plateImg, ...imgs]) => {
        if (disposed) return;
        art = { plate: buildPlate(plateImg), layers: LAYERS.map((l, i) => ({ ...l, img: imgs[i] })) };
        sync();
      })
      .catch(() => {
        // leave the canvas empty; the section text carries the meaning
      });

    return () => {
      disposed = true;
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = null;
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      mq.removeEventListener?.("change", onMotionPref);
    };
  }, []);

  return (
    <div ref={wrapRef} className={`relative w-full aspect-[1070/328] ${className}`}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={PRODUCT_VISUAL_LABEL}
        className="absolute inset-0 block w-full h-full"
      />
    </div>
  );
}
