"use client";

import { useEffect, useRef } from "react";
import { moneyFrame } from "@/lib/securityStoryboard";

/**
 * The headline's "money": the letters fold into a banknote, two more bills fan out behind it, flutter,
 * hold, fold back, and the word returns. Loops (MONEY_CYCLE) while the word is on screen and the tab is
 * visible; prefers-reduced-motion shows the plain word. Same bill artwork as the original site animation
 * (`unifolio-money-bill` in components/blueprint/scenes/SecurityVaultScene.tsx).
 * Ported from Docs/reference/security-section-prototype.html; the timeline is lib/securityStoryboard.ts#moneyFrame.
 */

function Bill() {
  return (
    <>
      <rect x="-48" y="-25" width="96" height="50" rx="5" fill="#4ADE80" stroke="#15803D" strokeWidth="2.8" />
      <path d="M -48 -14 A 11 11 0 0 1 -37 -25 L -48 -25 Z" fill="#15803D" />
      <path d="M 48 -14 A 11 11 0 0 0 37 -25 L 48 -25 Z" fill="#15803D" />
      <path d="M -48 14 A 11 11 0 0 0 -37 25 L -48 25 Z" fill="#15803D" />
      <path d="M 48 14 A 11 11 0 0 1 37 25 L 48 25 Z" fill="#15803D" />
      <circle cx="-27" cy="0" r="5" fill="#15803D" />
      <circle cx="27" cy="0" r="5" fill="#15803D" />
      <circle cx="0" cy="0" r="15" fill="#15803D" />
      <text
        x="0"
        y="6.5"
        fontFamily="system-ui,sans-serif"
        fontSize="19"
        fontWeight="900"
        fill="#4ADE80"
        textAnchor="middle"
      >
        ₹
      </text>
    </>
  );
}

const BILL_REST_TRANSFORM = "translate(-50%,-50%) scale(0.85)";

export function MoneyWord({ word = "money" }: { word?: string }) {
  const rootRef = useRef<HTMLSpanElement | null>(null);
  const charRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const billRef = useRef<SVGSVGElement | null>(null);
  const b1Ref = useRef<SVGGElement | null>(null);
  const b2Ref = useRef<SVGGElement | null>(null);
  const letters = Array.from(word);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let disposed = false;
    let t = 0;
    let lastTs: number | null = null;
    let rafId: number | null = null;
    let docVisible = document.visibilityState !== "hidden";
    let onScreen = false;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduced = mq.matches;

    const apply = (time: number) => {
      const fr = moneyFrame(time, charRefs.current.length);
      charRefs.current.forEach((el, i) => {
        const c = fr.chars[i];
        if (!el || !c) return;
        el.style.opacity = String(c.opacity);
        el.style.transform = `translateX(${c.x}px) scale(${c.scale})`;
      });
      const bill = billRef.current;
      if (bill) {
        bill.style.opacity = String(fr.bill.opacity);
        bill.style.transform = `translate(-50%,-50%) scale(${fr.bill.scale})`;
      }
      b1Ref.current?.setAttribute("transform", `translate(${fr.b1.x},${fr.b1.y}) rotate(${fr.b1.rot})`);
      b2Ref.current?.setAttribute("transform", `translate(${fr.b2.x},${fr.b2.y}) rotate(${fr.b2.rot})`);
    };

    const showPlainWord = () => {
      charRefs.current.forEach((el) => {
        if (!el) return;
        el.style.opacity = "";
        el.style.transform = "";
      });
      if (billRef.current) {
        billRef.current.style.opacity = "0";
        billRef.current.style.transform = BILL_REST_TRANSFORM;
      }
      b1Ref.current?.removeAttribute("transform");
      b2Ref.current?.removeAttribute("transform");
    };

    const shouldRun = () => !disposed && !reduced && docVisible && onScreen;

    const frame = (ts: number) => {
      rafId = null;
      if (disposed) return;
      const dt = lastTs === null ? 0 : Math.min((ts - lastTs) / 1000, 0.1);
      lastTs = ts;
      t += dt;
      apply(t);
      if (shouldRun()) rafId = requestAnimationFrame(frame);
    };

    const sync = () => {
      if (shouldRun()) {
        if (rafId === null) {
          lastTs = null;
          rafId = requestAnimationFrame(frame);
        }
      } else {
        if (rafId !== null) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
        if (reduced) {
          t = 0;
          showPlainWord();
        }
      }
    };

    const io = new IntersectionObserver(
      (entries) => {
        onScreen = entries.some((e) => e.isIntersecting);
        sync();
      },
      { threshold: 0 }
    );
    io.observe(root);

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
    sync();

    return () => {
      disposed = true;
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = null;
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      mq.removeEventListener?.("change", onMotionPref);
    };
  }, [word]);

  return (
    <span ref={rootRef} className="relative inline-block whitespace-nowrap">
      <span className="sr-only">{word}</span>
      <span aria-hidden="true">
        {letters.map((ch, i) => (
          <span
            key={i}
            ref={(el) => {
              charRefs.current[i] = el;
            }}
            className="inline-block will-change-transform"
          >
            {ch}
          </span>
        ))}
      </span>
      <svg
        ref={billRef}
        viewBox="-56 -28 112 56"
        fill="none"
        aria-hidden="true"
        focusable="false"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[1.15em] w-[2.3em] overflow-visible drop-shadow-[0_4px_12px_rgba(34,197,94,0.35)]"
        style={{ opacity: 0, transform: BILL_REST_TRANSFORM }}
      >
        <g ref={b1Ref}>
          <Bill />
        </g>
        <g ref={b2Ref}>
          <Bill />
        </g>
      </svg>
    </span>
  );
}
