"use client";

import { useEffect, useRef } from "react";

interface InteractiveFieldCanvasProps {
  className?: string;
  gridSize?: number;
  distortionRadius?: number;
  maxDisplacement?: number;
}

interface Point {
  originX: number;
  originY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  intensity: number;
  speed: number;
}

export function InteractiveFieldCanvas({
  className = "",
  gridSize = 36,
  distortionRadius = 160,
  maxDisplacement = 28,
}: InteractiveFieldCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let isVisible = true;
    let width = 0;
    let height = 0;
    let points: Point[] = [];
    let ripples: Ripple[] = [];

    // Pointer state with smooth interpolation
    const mouse = {
      x: -9999,
      y: -9999,
      targetX: -9999,
      targetY: -9999,
      active: false,
      speed: 0,
      lastX: 0,
      lastY: 0,
    };

    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      // Draw static grid once and exit
      const drawStatic = () => {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        ctx.fillStyle = "rgba(17, 17, 17, 0.05)";
        for (let x = gridSize; x < rect.width; x += gridSize) {
          for (let y = gridSize; y < rect.height; y += gridSize) {
            ctx.beginPath();
            ctx.arc(x, y, 1, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      };
      drawStatic();
      return;
    }

    const initPoints = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);

      points = [];
      const cols = Math.ceil(width / gridSize) + 1;
      const rows = Math.ceil(height / gridSize) + 1;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const originX = i * gridSize;
          const originY = j * gridSize;
          points.push({
            originX,
            originY,
            x: originX,
            y: originY,
            vx: 0,
            vy: 0,
          });
        }
      }
    };

    initPoints();

    // Resize Observer
    const resizeObserver = new ResizeObserver(() => {
      initPoints();
    });
    resizeObserver.observe(canvas);

    // Intersection Observer for performance
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    });
    observer.observe(canvas);

    // Mouse listeners on window so pointer tracks smoothly even over overlaid UI elements
    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
      mouse.active = true;

      const dx = mouse.targetX - mouse.lastX;
      const dy = mouse.targetY - mouse.lastY;
      mouse.speed = Math.sqrt(dx * dx + dy * dy);
      mouse.lastX = mouse.targetX;
      mouse.lastY = mouse.targetY;
    };

    const onMouseLeave = () => {
      mouse.targetX = -9999;
      mouse.targetY = -9999;
      mouse.active = false;
    };

    const onClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      if (clickX >= 0 && clickX <= width && clickY >= 0 && clickY <= height) {
        ripples.push({
          x: clickX,
          y: clickY,
          radius: 0,
          maxRadius: 280,
          intensity: 18,
          speed: 4.5,
        });
      }
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("click", onClick, { passive: true });

    // Physics Animation Loop
    const spring = 0.08;
    const damping = 0.82;

    const render = () => {
      if (!isVisible) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // Smooth mouse lerp
      mouse.x += (mouse.targetX - mouse.x) * 0.18;
      mouse.y += (mouse.targetY - mouse.y) * 0.18;

      // Update ripples
      for (let r = ripples.length - 1; r >= 0; r--) {
        const ripple = ripples[r];
        ripple.radius += ripple.speed;
        ripple.intensity *= 0.96;

        if (ripple.radius >= ripple.maxRadius || ripple.intensity < 0.05) {
          ripples.splice(r, 1);
        }
      }

      // Update points and draw
      const pointCount = points.length;

      for (let i = 0; i < pointCount; i++) {
        const p = points[i];

        let targetX = p.originX;
        let targetY = p.originY;

        // Mouse magnetic distortion
        if (mouse.active) {
          const dx = mouse.x - p.originX;
          const dy = mouse.y - p.originY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < distortionRadius && dist > 0) {
            const factor = Math.pow(1 - dist / distortionRadius, 2);
            // Pull gently toward cursor with subtle rotational twist
            const pull = factor * maxDisplacement;
            const angle = Math.atan2(dy, dx);
            targetX = p.originX + Math.cos(angle) * pull;
            targetY = p.originY + Math.sin(angle) * pull;
          }
        }

        // Ripple displacement
        for (let r = 0; r < ripples.length; r++) {
          const rip = ripples[r];
          const rdx = p.originX - rip.x;
          const rdy = p.originY - rip.y;
          const rdist = Math.sqrt(rdx * rdx + rdy * rdy);
          const diff = Math.abs(rdist - rip.radius);

          if (diff < 35 && rdist > 0) {
            const wave = Math.sin((diff / 35) * Math.PI) * rip.intensity;
            const angle = Math.atan2(rdy, rdx);
            targetX += Math.cos(angle) * wave;
            targetY += Math.sin(angle) * wave;
          }
        }

        // Spring integration
        const ax = (targetX - p.x) * spring;
        const ay = (targetY - p.y) * spring;
        p.vx = (p.vx + ax) * damping;
        p.vy = (p.vy + ay) * damping;
        p.x += p.vx;
        p.y += p.vy;

        // Render point
        const distFromMouse = Math.hypot(p.x - mouse.x, p.y - mouse.y);
        const isNear = distFromMouse < distortionRadius;

        if (isNear) {
          const alpha = 0.15 + (1 - distFromMouse / distortionRadius) * 0.35;
          ctx.fillStyle = `rgba(34, 197, 94, ${alpha})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 1.4, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = "rgba(17, 17, 17, 0.05)";
          ctx.beginPath();
          ctx.arc(p.x, p.y, 0.9, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw subtle connecting lines between distorted points near cursor
      if (mouse.active) {
        ctx.strokeStyle = "rgba(34, 197, 94, 0.08)";
        ctx.lineWidth = 0.75;
        ctx.beginPath();

        for (let i = 0; i < pointCount; i++) {
          const p = points[i];
          const dist = Math.hypot(p.x - mouse.x, p.y - mouse.y);

          if (dist < distortionRadius * 0.8) {
            // Find right and bottom neighbors
            const right = points[i + 1];
            if (right && Math.abs(right.originY - p.originY) < 1) {
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(right.x, right.y);
            }
          }
        }
        ctx.stroke();
      }

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
  }, [gridSize, distortionRadius, maxDisplacement]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 h-full w-full select-none ${className}`}
      aria-hidden="true"
    />
  );
}
