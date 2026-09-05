"use client";

import { useEffect, useRef } from "react";

export function InteractiveFluidBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // Honor accessibility reduced motion
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    let animId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let isDark = document.documentElement.classList.contains("dark");

    // Theme observer
    const themeObserver = new MutationObserver(() => {
      isDark = document.documentElement.classList.contains("dark");
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    // High DPI sizing
    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.resetTransform?.();
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize, { passive: true });

    // Multi-node fluid inertia chain (simulates organic fluid resistance & viscous drag)
    const mouse = {
      targetX: width * 0.5,
      targetY: height * 0.4,
      prevTargetX: width * 0.5,
      prevTargetY: height * 0.4,
      speed: 0,
      smoothSpeed: 0,
      isHovering: false,
      lastMoveTime: 0,
    };

    // Node 0: Primary fluid core (moderate inertia)
    const node0 = { x: mouse.targetX, y: mouse.targetY };
    // Node 1: Trailing viscous wake (heavier lag, creates elongation)
    const node1 = { x: mouse.targetX, y: mouse.targetY };
    // Node 2: Ambient diffuse field (deep lag, breathing dispersion)
    const node2 = { x: mouse.targetX, y: mouse.targetY };

    // Energy state for smooth bloom & slow dissipation
    let energy = 0; // 0 (dissipated) to 1 (full fluid bloom)
    let targetEnergy = 0;

    const handlePointerMove = (e: PointerEvent | MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.isHovering = true;
      mouse.lastMoveTime = performance.now();
      targetEnergy = 1;
    };

    const handlePointerLeave = () => {
      mouse.isHovering = false;
      targetEnergy = 0;
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.addEventListener("mouseleave", handlePointerLeave);

    let startTime = performance.now();

    // Render loop
    const render = () => {
      const now = performance.now();
      const time = (now - startTime) * 0.001;

      // Calculate instantaneous mouse velocity
      const vx = mouse.targetX - mouse.prevTargetX;
      const vy = mouse.targetY - mouse.prevTargetY;
      mouse.speed = Math.hypot(vx, vy);
      mouse.smoothSpeed += (mouse.speed - mouse.smoothSpeed) * 0.12;
      mouse.prevTargetX = mouse.targetX;
      mouse.prevTargetY = mouse.targetY;

      // Idle relaxation: after 1.4s of stillness, gently relax to a soft breathing resting state
      if (mouse.isHovering) {
        if (now - mouse.lastMoveTime > 1400) {
          targetEnergy = 0.22; // subtle resting presence
        } else {
          targetEnergy = 1.0;
        }
      }

      // Smooth energy dissipation & ramp interpolation
      energy += (targetEnergy - energy) * 0.045;

      // If fully dissipated and not hovering, idle cleanly
      if (energy > 0.001) {
        // Multi-tier smooth spring/lerp physics
        node0.x += (mouse.targetX - node0.x) * 0.085;
        node0.y += (mouse.targetY - node0.y) * 0.085;

        node1.x += (node0.x - node1.x) * 0.055;
        node1.y += (node0.y - node1.y) * 0.055;

        node2.x += (node1.x - node2.x) * 0.035;
        node2.y += (node1.y - node2.y) * 0.035;

        ctx.clearRect(0, 0, width, height);

        // Fluid undulation breathing factor
        const pulse = 1 + Math.sin(time * 1.8) * 0.06 + Math.cos(time * 1.1) * 0.04;
        const dragAngle = Math.atan2(node0.y - node1.y, node0.x - node1.x);
        const stretch = Math.min(mouse.smoothSpeed * 0.015, 0.42);

        // Dynamic theme opacity levels:
        // Dark mode: luminous #22C55E fluid glow with deep falloff
        // Light mode: ultra-soft, refreshing emerald-champagne silk reflection
        const alphaScale = isDark ? 1.0 : 0.48;

        // -------------------------------------------------------------------
        // LAYER 1: Deep Ambient Diffusion Field (Node 2)
        // Soft, wide breathing halo that anchors the disturbance
        // -------------------------------------------------------------------
        const r2 = Math.min(width, height) * 0.42 * pulse;
        const grad2 = ctx.createRadialGradient(node2.x, node2.y, 0, node2.x, node2.y, r2);
        grad2.addColorStop(0, `rgba(34, 197, 94, ${0.045 * energy * alphaScale})`);
        grad2.addColorStop(0.4, `rgba(16, 185, 129, ${0.022 * energy * alphaScale})`);
        grad2.addColorStop(0.8, `rgba(5, 150, 105, ${0.008 * energy * alphaScale})`);
        grad2.addColorStop(1, "rgba(34, 197, 94, 0)");

        ctx.fillStyle = grad2;
        ctx.beginPath();
        ctx.arc(node2.x, node2.y, r2, 0, Math.PI * 2);
        ctx.fill();

        // -------------------------------------------------------------------
        // LAYER 2: Trailing Viscous Wake (Node 1)
        // Stretches along the velocity vector like moving liquid silk
        // -------------------------------------------------------------------
        const r1 = Math.min(width, height) * 0.28;
        ctx.save();
        ctx.translate(node1.x, node1.y);
        ctx.rotate(dragAngle);
        ctx.scale(1 + stretch, 1 / (1 + stretch * 0.5));
        ctx.translate(-node1.x, -node1.y);

        const grad1 = ctx.createRadialGradient(node1.x, node1.y, 0, node1.x, node1.y, r1);
        grad1.addColorStop(0, `rgba(16, 185, 129, ${0.075 * energy * alphaScale})`);
        grad1.addColorStop(0.35, `rgba(34, 197, 94, ${0.038 * energy * alphaScale})`);
        grad1.addColorStop(0.7, `rgba(5, 150, 105, ${0.012 * energy * alphaScale})`);
        grad1.addColorStop(1, "rgba(16, 185, 129, 0)");

        ctx.fillStyle = grad1;
        ctx.beginPath();
        ctx.arc(node1.x, node1.y, r1, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // -------------------------------------------------------------------
        // LAYER 3: Primary Fluid Core (Node 0)
        // Follows cursor with silky lag, providing smooth focal illumination
        // -------------------------------------------------------------------
        const r0 = (180 + Math.sin(time * 2.2) * 15) * pulse;
        const grad0 = ctx.createRadialGradient(node0.x, node0.y, 0, node0.x, node0.y, r0);
        grad0.addColorStop(0, `rgba(34, 197, 94, ${0.11 * energy * alphaScale})`);
        grad0.addColorStop(0.25, `rgba(34, 197, 94, ${0.065 * energy * alphaScale})`);
        grad0.addColorStop(0.6, `rgba(16, 185, 129, ${0.02 * energy * alphaScale})`);
        grad0.addColorStop(1, "rgba(34, 197, 94, 0)");

        ctx.fillStyle = grad0;
        ctx.beginPath();
        ctx.arc(node0.x, node0.y, r0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.clearRect(0, 0, width, height);
      }

      animId = requestAnimationFrame(render);
    };

    // Pause when tab is hidden to save battery & CPU
    const handleVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(animId);
      } else {
        startTime = performance.now();
        animId = requestAnimationFrame(render);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("mouseleave", handlePointerLeave);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      themeObserver.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[1] h-full w-full select-none overflow-hidden will-change-transform"
      style={{
        transform: "translate3d(0, 0, 0)",
      }}
    />
  );
}
