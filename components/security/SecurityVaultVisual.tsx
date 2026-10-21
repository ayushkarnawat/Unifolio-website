"use client";

import { useEffect, useRef } from "react";
import {
  ASSET_BASE,
  CARDS,
  COLORS,
  DOTS,
  DOTS_INTRO_INDEX,
  FEATHER_X,
  FEATHER_Y,
  LOGO_GLOW,
  PLATE,
  SETTLED_T,
  STR,
  STREAK_DASH,
  STREAK_FLOW,
  TAU,
  TICKS,
  WHEEL,
  backingSize,
  bezierPoint,
  cardMotion,
  dotIsGreen,
  glowPing,
  intro,
  pingU,
  plateTransform,
  streakDotU,
  tickAlpha,
  wheelAngle,
  wheelMatrix,
  type CardLayer,
} from "@/lib/securityStoryboard";
import { SECURITY_VISUAL_LABEL } from "@/lib/securityCopy";

/**
 * Security section illustration: the vault door (wheel turning slowly in perspective), green streaks
 * flowing out to six floating asset cards, pings on the dots and flickering tick marks, drawn on a canvas.
 * Ported from Docs/reference/security-section-prototype.html (the approved design).
 * Pure geometry and timing live in lib/securityStoryboard.ts.
 */

type LoadedCard = CardLayer & { img: HTMLImageElement };
type Art = { plate: HTMLCanvasElement; wheel: HTMLImageElement; cards: LoadedCard[] };

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

  // soft green glow pulsing behind the logo
  const ping = glowPing(t);
  const g = ctx.createRadialGradient(LOGO_GLOW.x, LOGO_GLOW.y, LOGO_GLOW.r0, LOGO_GLOW.x, LOGO_GLOW.y, LOGO_GLOW.r1);
  g.addColorStop(0, `rgba(34,197,94,${0.16 * ping + 0.03})`);
  g.addColorStop(1, "rgba(34,197,94,0)");
  ctx.fillStyle = g;
  const b = LOGO_GLOW.box;
  ctx.fillRect(b.x, b.y, b.w, b.h);

  // the wheel turns slowly, in the door's own perspective
  ctx.save();
  ctx.transform(...wheelMatrix(wheelAngle(t, io(0), reduced)));
  ctx.drawImage(art.wheel, -WHEEL.cx, -WHEEL.cy, WHEEL.w, WHEEL.h);
  ctx.restore();

  // green dashed streaks flowing out of the door, two travelling dots on each
  STR.forEach((p, i) => {
    const a = io(i) * 0.8;
    ctx.save();
    ctx.globalAlpha = a * 0.55;
    ctx.strokeStyle = COLORS.green;
    ctx.lineCap = "round";
    ctx.lineWidth = 2.2;
    ctx.setLineDash(STREAK_DASH);
    ctx.lineDashOffset = -t * STREAK_FLOW;
    ctx.beginPath();
    ctx.moveTo(p[0][0], p[0][1]);
    ctx.bezierCurveTo(p[1][0], p[1][1], p[2][0], p[2][1], p[3][0], p[3][1]);
    ctx.stroke();
    ctx.restore();

    for (let k = 0; k < 2; k++) {
      const u = streakDotU(t, i, k);
      const q = bezierPoint(p, u);
      ctx.globalAlpha = a * Math.sin(Math.PI * u);
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

  // pings on the dots
  const dotsIn = io(DOTS_INTRO_INDEX);
  DOTS.forEach((d, i) => {
    const u = pingU(t, i);
    ctx.globalAlpha = (1 - u) * 0.7 * dotsIn;
    ctx.strokeStyle = COLORS.green;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(d[0], d[1], d[2] * 0.9 + u * 16, 0, TAU);
    ctx.stroke();
    ctx.globalAlpha = dotsIn;
    ctx.fillStyle = dotIsGreen(i) ? COLORS.green : COLORS.bg;
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(d[0], d[1], d[2] * 0.62, 0, TAU);
    ctx.fill();
    ctx.stroke();
  });

  // tick marks that flicker
  TICKS.forEach((s, i) => {
    ctx.globalAlpha = tickAlpha(t, i) * dotsIn;
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = 2.6;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(s[0], s[1]);
    ctx.lineTo(s[2], s[3]);
    ctx.stroke();
  });

  // the six asset cards
  art.cards.forEach((L, i) => {
    const e = io(i + 1);
    if (e <= 0) return;
    const { dx, dy, rot } = cardMotion(L.id, t, e);
    ctx.save();
    ctx.globalAlpha = e;
    ctx.translate(L.x + L.w / 2 + dx, L.y + L.h / 2 + dy);
    ctx.rotate(rot);
    ctx.drawImage(L.img, -L.w / 2, -L.h / 2, L.w, L.h);
    ctx.restore();
  });
  ctx.globalAlpha = 1;
}

export function SecurityVaultVisual({ className = "" }: { className?: string }) {
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

    Promise.all([
      loadImage(ASSET_BASE + PLATE.file),
      loadImage(ASSET_BASE + WHEEL.file),
      ...CARDS.map((c) => loadImage(ASSET_BASE + c.file)),
    ])
      .then(([plateImg, wheelImg, ...imgs]) => {
        if (disposed) return;
        art = {
          plate: buildPlate(plateImg),
          wheel: wheelImg,
          cards: CARDS.map((c, i) => ({ ...c, img: imgs[i] })),
        };
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
    <div ref={wrapRef} className={`relative w-full aspect-[706/652] ${className}`}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={SECURITY_VISUAL_LABEL}
        className="absolute inset-0 block w-full h-full"
      />
    </div>
  );
}
