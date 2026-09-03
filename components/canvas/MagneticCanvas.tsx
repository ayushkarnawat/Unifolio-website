"use client";

import { useEffect, useRef } from "react";

interface NodeItem {
  label: string;
  category: "cams" | "kfintech" | "fee" | "xirr" | "fund";
  value: string;
  baseX: number; // 0 to 1 normalized
  baseY: number; // 0 to 1 normalized
  alignedX: number; // 0 to 1 normalized aligned position
  alignedY: number; // 0 to 1 normalized aligned position
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

interface MagneticCanvasProps {
  alignmentProgress?: number; // 0 (entropy) to 1 (aligned coherence)
  className?: string;
}

export function MagneticCanvas({
  alignmentProgress = 0,
  className = "",
}: MagneticCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const alignmentRef = useRef(alignmentProgress);

  useEffect(() => {
    alignmentRef.current = alignmentProgress;
  }, [alignmentProgress]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let isVisible = true;
    let width = 0;
    let height = 0;

    // Check reduced motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) return;

    // Pointer state
    const pointer = {
      x: -9999,
      y: -9999,
      active: false,
      pulse: 0,
    };

    // Node definitions
    const nodeTemplates: Array<Omit<NodeItem, "x" | "y" | "vx" | "vy" | "radius" | "color">> = [
      {
        label: "Parag Parikh Flexi Cap",
        value: "₹27.84 L",
        category: "fund",
        baseX: 0.18,
        baseY: 0.28,
        alignedX: 0.22,
        alignedY: 0.5,
      },
      {
        label: "CAMS eCAS Ingest",
        value: "9 Folios",
        category: "cams",
        baseX: 0.82,
        baseY: 0.22,
        alignedX: 0.36,
        alignedY: 0.5,
      },
      {
        label: "Nippon Small Cap",
        value: "₹18.92 L",
        category: "fund",
        baseX: 0.28,
        baseY: 0.72,
        alignedX: 0.5,
        alignedY: 0.5,
      },
      {
        label: "KFintech Statement",
        value: "5 Folios",
        category: "kfintech",
        baseX: 0.76,
        baseY: 0.75,
        alignedX: 0.64,
        alignedY: 0.5,
      },
      {
        label: "Direct Alpha Saved",
        value: "+₹8.44 L",
        category: "fee",
        baseX: 0.12,
        baseY: 0.52,
        alignedX: 0.78,
        alignedY: 0.5,
      },
      {
        label: "True Net XIRR",
        value: "+18.42%",
        category: "xirr",
        baseX: 0.88,
        baseY: 0.48,
        alignedX: 0.9,
        alignedY: 0.5,
      },
      {
        label: "HDFC Flexi Cap",
        value: "₹21.12 L",
        category: "fund",
        baseX: 0.42,
        baseY: 0.18,
        alignedX: 0.1,
        alignedY: 0.5,
      },
      {
        label: "Zero Trail Drag",
        value: "0.00% TER",
        category: "fee",
        baseX: 0.62,
        baseY: 0.85,
        alignedX: 0.45,
        alignedY: 0.5,
      },
    ];

    let nodes: NodeItem[] = [];

    const initCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);

      nodes = nodeTemplates.map((t, idx) => ({
        ...t,
        x: t.baseX * width,
        y: t.baseY * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: 4,
        color:
          t.category === "fee" || t.category === "xirr"
            ? "#22C55E"
            : "#111111",
      }));
    };

    initCanvas();

    const resizeObserver = new ResizeObserver(initCanvas);
    resizeObserver.observe(canvas);

    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    });
    observer.observe(canvas);

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.active = true;
    };

    const onMouseLeave = () => {
      pointer.active = false;
      pointer.x = -9999;
      pointer.y = -9999;
    };

    const onClick = () => {
      pointer.pulse = 18;
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("click", onClick, { passive: true });

    let time = 0;

    const render = () => {
      if (!isVisible) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);
      time += 0.015;

      if (pointer.pulse > 0.1) {
        pointer.pulse *= 0.92;
      }

      const alignP = alignmentRef.current;

      // Draw subtle background orbital guides when aligning
      if (alignP > 0.1) {
        ctx.strokeStyle = `rgba(17, 17, 17, ${0.04 * alignP})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(width * 0.05, height * 0.5);
        ctx.lineTo(width * 0.95, height * 0.5);
        ctx.stroke();
      }

      // Update and draw nodes
      nodes.forEach((node, i) => {
        // Target calculation based on alignment progress
        const gentleDriftX = Math.sin(time + i * 1.5) * 12;
        const gentleDriftY = Math.cos(time + i * 1.2) * 12;

        const entropyTargetX = node.baseX * width + gentleDriftX;
        const entropyTargetY = node.baseY * height + gentleDriftY;

        const alignedTargetX = node.alignedX * width;
        const alignedTargetY = node.alignedY * height;

        // Blend target
        let targetX = entropyTargetX * (1 - alignP) + alignedTargetX * alignP;
        let targetY = entropyTargetY * (1 - alignP) + alignedTargetY * alignP;

        // Pointer magnetic attraction
        if (pointer.active && alignP < 0.7) {
          const dx = pointer.x - node.x;
          const dy = pointer.y - node.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 220;

          if (dist < maxDist && dist > 0) {
            const force = Math.pow(1 - dist / maxDist, 2) * 35;
            targetX += (dx / dist) * force;
            targetY += (dy / dist) * force;

            // Draw organic filament tension line to cursor
            ctx.strokeStyle = `rgba(34, 197, 94, ${(1 - dist / maxDist) * 0.25})`;
            ctx.lineWidth = 0.75;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(pointer.x, pointer.y);
            ctx.stroke();
          }
        }

        // Gravitational impulse
        if (pointer.pulse > 0.5) {
          const pdx = width * 0.5 - node.x;
          const pdy = height * 0.5 - node.y;
          targetX += (pdx / 100) * pointer.pulse;
          targetY += (pdy / 100) * pointer.pulse;
        }

        // Spring integration
        const ax = (targetX - node.x) * 0.08;
        const ay = (targetY - node.y) * 0.08;
        node.vx = (node.vx + ax) * 0.82;
        node.vy = (node.vy + ay) * 0.82;
        node.x += node.vx;
        node.y += node.vy;

        // Draw inter-node filament web
        for (let j = i + 1; j < nodes.length; j++) {
          const other = nodes[j];
          const ndx = other.x - node.x;
          const ndy = other.y - node.y;
          const nDist = Math.hypot(ndx, ndy);

          if (nDist < 160) {
            const alpha = (1 - nDist / 160) * (alignP > 0.5 ? 0.15 : 0.06);
            ctx.strokeStyle = `rgba(17, 17, 17, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
          }
        }

        // Draw Node Core
        ctx.fillStyle = node.color === "#22C55E" ? "#22C55E" : "rgba(17, 17, 17, 0.8)";
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();

        // Draw Ambient Halo
        ctx.strokeStyle = node.color === "#22C55E" ? "rgba(34, 197, 94, 0.3)" : "rgba(17, 17, 17, 0.1)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + 4, 0, Math.PI * 2);
        ctx.stroke();

        // Render Tactile Pill Label
        ctx.font = "500 11px DM Sans, sans-serif";
        const text = `${node.label} · ${node.value}`;
        const metrics = ctx.measureText(text);
        const pillWidth = metrics.width + 16;
        const pillHeight = 22;
        const pillX = node.x - pillWidth / 2;
        const pillY = node.y + 12;

        // Pill background
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.strokeStyle = "rgba(17, 17, 17, 0.08)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(pillX, pillY, pillWidth, pillHeight, 11);
        ctx.fill();
        ctx.stroke();

        // Pill text
        ctx.fillStyle = node.color === "#22C55E" ? "#22C55E" : "#111111";
        ctx.fillText(text, pillX + 8, pillY + 15);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("click", onClick);
      resizeObserver.disconnect();
      observer.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 h-full w-full select-none ${className}`}
      aria-hidden="true"
    />
  );
}
