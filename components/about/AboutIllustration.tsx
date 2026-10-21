"use client";

import { useEffect, useRef } from "react";
import {
  ASSET_BASE,
  CEN,
  COLORS,
  DEV,
  DONUT,
  GLOW,
  LAYERS,
  ORDER,
  RING,
  SETTLED_T,
  STR,
  TAU,
  arrivalPulse,
  backingSize,
  bezierPoint,
  dashboardScale,
  devicePingU,
  glowAlpha,
  intro,
  layerMotion,
  streamDotAlpha,
  streamDotU,
  viewTransform,
  type Layer,
} from "@/lib/aboutIllustration";
import { ABOUT_VISUAL_LABEL } from "@/lib/aboutCopy";

/**
 * About section illustration: four family members (cut from the user's sketch) connected to one shared
 * dashboard, drawn on a canvas. Ported from Docs/reference/about-section-prototype.html (the approved design).
 * Pure geometry and timing live in lib/aboutIllustration.ts.
 */

type LoadedLayer = Layer & { img: HTMLImageElement };

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

/** One frame in picture coordinates (the caller has applied viewTransform). */
function drawScene(ctx: CanvasRenderingContext2D, layers: LoadedLayer[], t: number, reduced: boolean) {
  const io = (i: number) => intro(t, i, reduced);

  // breathing glow behind the dashboard
  const g = ctx.createRadialGradient(CEN[0], CEN[1], GLOW.r0, CEN[0], CEN[1], GLOW.r1);
  g.addColorStop(0, `rgba(34,197,94,${glowAlpha(t) * io(0)})`);
  g.addColorStop(1, "rgba(34,197,94,0)");
  ctx.fillStyle = g;
  ctx.fillRect(GLOW.box.x, GLOW.box.y, GLOW.box.w, GLOW.box.h);

  // dashed flows from each person to the dashboard, each with a travelling dot
  STR.forEach((p, i) => {
    const a = io(i + 1) * 0.85;
    ctx.save();
    ctx.globalAlpha = a * 0.7;
    ctx.strokeStyle = COLORS.flow;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.setLineDash([6, 10]);
    ctx.lineDashOffset = -t * 20;
    ctx.beginPath();
    ctx.moveTo(p[0][0], p[0][1]);
    ctx.bezierCurveTo(p[1][0], p[1][1], p[2][0], p[2][1], p[3][0], p[3][1]);
    ctx.stroke();
    ctx.restore();

    const u = streamDotU(t, i);
    const q = bezierPoint(p, u);
    ctx.globalAlpha = a * streamDotAlpha(u);
    ctx.fillStyle = "#fff";
    ctx.shadowColor = COLORS.green;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(q[0], q[1], 5, 0, TAU);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = COLORS.green;
    ctx.beginPath();
    ctx.arc(q[0], q[1], 3.2, 0, TAU);
    ctx.fill();
  });
  ctx.globalAlpha = 1;

  // arrivals in the middle trigger a soft ring
  const pulse = arrivalPulse(t);

  // the layers: dashboard first, then the people; multiplied so the paper white melts into the page
  layers.forEach((L, i) => {
    const e = io(i);
    if (e <= 0) return;
    const { dx, dy, rot } = layerMotion(L.id, t, e);
    const cx = L.x + L.w / 2;
    const cy = L.y + L.h / 2;
    const zs = L.id === "c" ? dashboardScale(t, pulse) : 1;
    ctx.save();
    ctx.globalAlpha = e;
    ctx.translate(cx + dx, cy + dy);
    ctx.rotate(rot);
    ctx.scale(zs, zs);
    ctx.globalCompositeOperation = "multiply";
    // depth: a soft ground shadow under each piece, and darker, bolder ink
    const sh = ctx.createRadialGradient(0, L.h * 0.36, 4, 0, L.h * 0.36, L.w * 0.42);
    sh.addColorStop(0, L.id === "c" ? "rgba(21,128,61,0.2)" : "rgba(17,22,19,0.2)");
    sh.addColorStop(1, "rgba(17,22,19,0)");
    ctx.save();
    ctx.translate(0, L.h * 0.36);
    ctx.scale(1, L.id === "c" ? 0.2 : 0.16);
    ctx.translate(0, -L.h * 0.36);
    ctx.fillStyle = sh;
    ctx.fillRect(-L.w * 0.5, L.h * 0.36 - L.w * 0.5, L.w, L.w);
    ctx.restore();
    ctx.filter = "contrast(1.35) brightness(0.95)";
    ctx.drawImage(L.img, -L.w / 2, -L.h / 2, L.w, L.h);
    ctx.filter = "none";
    ctx.globalCompositeOperation = "source-over";
    ctx.restore();

    if (L.id === "c") {
      // green highlight circling the donut
      const a0 = t * 1.5;
      ctx.save();
      ctx.translate(DONUT.x, DONUT.y);
      ctx.lineCap = "round";
      ctx.strokeStyle = "rgba(34,197,94,.95)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, DONUT.r, a0, a0 + 0.9);
      ctx.stroke();
      ctx.strokeStyle = "rgba(34,197,94,.3)";
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(0, 0, DONUT.r, a0 - 0.8, a0);
      ctx.stroke();
      ctx.restore();

      if (pulse > 0) {
        ctx.save();
        ctx.globalAlpha = pulse * 0.5 * e;
        ctx.strokeStyle = COLORS.green;
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.ellipse(
          CEN[0],
          CEN[1],
          RING.rx + (1 - pulse) * RING.grow.rx,
          RING.ry + (1 - pulse) * RING.grow.ry,
          0,
          0,
          TAU
        );
        ctx.stroke();
        ctx.restore();
      }
    }
  });

  // little pings on each person's screen
  DEV.forEach((d, i) => {
    const u = devicePingU(t, i);
    ctx.save();
    ctx.globalAlpha = (1 - u) * 0.65 * io(i + 1);
    ctx.strokeStyle = COLORS.green;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(d[0], d[1], 8 + u * 30, 0, TAU);
    ctx.stroke();
    ctx.restore();
  });
  ctx.globalAlpha = 1;
}

export function AboutIllustration({ className = "" }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let disposed = false;
    let layers: LoadedLayer[] | null = null;
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
      if (!layers) return;
      ctx.setTransform(...viewTransform(canvas.width, canvas.height));
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      drawScene(ctx, layers, reduced ? SETTLED_T : t, reduced);
    };

    const shouldRun = () => !disposed && !reduced && docVisible && onScreen && layers !== null;

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

    Promise.all(ORDER.map((id) => loadImage(ASSET_BASE + LAYERS[id].file)))
      .then((imgs) => {
        if (disposed) return;
        layers = ORDER.map((id, i) => ({ ...LAYERS[id], img: imgs[i] }));
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
    <div ref={wrapRef} className={`relative aspect-[1330/800] ${className}`}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={ABOUT_VISUAL_LABEL}
        className="absolute inset-0 block w-full h-full"
      />
    </div>
  );
}
