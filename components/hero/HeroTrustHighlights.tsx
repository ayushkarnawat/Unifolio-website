"use client";

import { useCallback, useEffect, useRef, useState, type AnimationEvent } from "react";
import {
  BADGE_ON_MS,
  HOLD_MS,
  OUT_MS,
  SAFETY_MS,
  SAMPLE_FIGURE,
  TOGGLE_OFF_MS,
  TRUST_STATES,
  dotProgress,
  maskFigure,
  plainSubtext,
  type TrustState,
} from "@/lib/trustHighlights";

const GREEN = "#22C55E";
const MONO = "ui-monospace, Menlo, monospace";
const TICK_MS = 40;
/** Largest step the clock may take in one tick (guards against throttled timers). */
const MAX_STEP_MS = 100;

type Phase = "show" | "out";

function LockIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <rect x="5" y="11" width="14" height="9" rx="2.5" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function RestVisual({ figure, badgeOn }: { figure: string; badgeOn: boolean }) {
  return (
    <div className="flex items-center gap-2 whitespace-nowrap text-[12.5px] text-[#111613]">
      <span className="text-[10px] font-bold tracking-[0.1em] text-[#5A685D]">BALANCE</span>
      <span className="min-w-[10ch] tracking-[0.06em]" style={{ fontFamily: MONO }}>
        {figure}
      </span>
      <span
        className={`flex h-[22px] w-[22px] items-center justify-center rounded-[7px] transition-[background-color,color,transform] duration-[400ms] ease-[cubic-bezier(.3,1.5,.5,1)] ${
          badgeOn ? "scale-[1.12] bg-[#22C55E] text-white" : "bg-[#E8E4DA] text-[#5A685D]"
        }`}
      >
        <LockIcon className="h-[13px] w-[13px]" />
      </span>
    </div>
  );
}

function TransitVisual() {
  return (
    <div className="flex items-center gap-2">
      <span className="h-5 w-3.5 flex-none rounded border-[1.6px] border-[#111613] opacity-80" />
      <span className="relative h-0.5 w-[150px] lg:w-[200px] flex-none bg-[rgba(17,22,19,0.14)]">
        <i className="trust-packet absolute -top-[3px] left-0 h-2 w-2 rounded-[2px] bg-[#22C55E]" />
        <i
          className="trust-packet absolute -top-[3px] left-0 h-2 w-2 rounded-[2px] bg-[#22C55E]"
          style={{ animationDelay: "-0.85s" }}
        />
        <span className="absolute left-1/2 top-1/2 flex h-[18px] w-[18px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[rgba(17,22,19,0.14)] bg-white">
          <LockIcon className="h-[11px] w-[11px] text-[#15803D]" />
        </span>
      </span>
      <span className="h-4 w-3.5 flex-none rounded-[3px] border-[1.6px] border-[#111613] opacity-80" />
    </div>
  );
}

function ConsentVisual({ off }: { off: boolean }) {
  return (
    <div className="flex items-center gap-2 whitespace-nowrap text-[12.5px]">
      <span
        className={`relative h-[19px] w-8 flex-none rounded-[10px] transition-colors duration-300 ${
          off ? "bg-[#D9D5CB]" : "bg-[#22C55E]"
        }`}
      >
        <i
          className={`absolute left-0.5 top-0.5 h-[15px] w-[15px] rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.25)] transition-transform duration-300 ${
            off ? "translate-x-0" : "translate-x-[13px]"
          }`}
        />
      </span>
      <span className="font-medium text-[#5A685D]">{off ? "Sharing stopped" : "Connected"}</span>
    </div>
  );
}

/**
 * Compact animated "trust highlight" shown under the hero CTA. Cycles through
 * three states (at rest, in transit, consent); each advances once its key-word
 * underline has been drawn, then holds briefly and slides to the next.
 * Pauses when the tab is hidden, the block is off screen, or `isPaused` is true.
 */
export function HeroTrustHighlights({ isPaused = false }: { isPaused?: boolean }) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  const [reduced, setReduced] = useState(false);
  const [docVisible, setDocVisible] = useState(true);
  const [inView, setInView] = useState(true);

  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("show");
  const [figure, setFigure] = useState(SAMPLE_FIGURE);
  const [badgeOn, setBadgeOn] = useState(false);
  const [toggleOff, setToggleOff] = useState(false);

  // Pausable clock state, mutated by the tick loop.
  const clock = useRef({
    index: 0,
    phase: "show" as Phase,
    elapsed: 0,
    outElapsed: 0,
    underlineDoneAt: null as number | null,
  });

  const active = !reduced && !isPaused && docVisible && inView;

  // prefers-reduced-motion
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  // Tab visibility
  useEffect(() => {
    const update = () => setDocVisible(document.visibilityState !== "hidden");
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  // On screen
  useEffect(() => {
    const node = rootRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver((entries) => {
      const entry = entries[entries.length - 1];
      if (entry) setInView(entry.isIntersecting);
    });
    io.observe(node);
    return () => io.disconnect();
  }, []);

  // Reduced motion: state 1, fully locked, no cycling.
  useEffect(() => {
    if (!reduced) return;
    clock.current = { index: 0, phase: "show", elapsed: 0, outElapsed: 0, underlineDoneAt: null };
    setIndex(0);
    setPhase("show");
    setFigure(maskFigure(SAMPLE_FIGURE, 1));
    setBadgeOn(true);
    setToggleOff(false);
  }, [reduced]);

  // Tick loop: only runs while active, so pausing simply stops the clock.
  useEffect(() => {
    if (!active) return;
    let last = performance.now();

    const id = window.setInterval(() => {
      const now = performance.now();
      const dt = Math.min(MAX_STEP_MS, Math.max(0, now - last));
      last = now;
      const c = clock.current;

      if (c.phase === "show") {
        c.elapsed += dt;
        if (c.underlineDoneAt === null && c.elapsed >= SAFETY_MS) c.underlineDoneAt = c.elapsed;
        if (c.underlineDoneAt !== null && c.elapsed >= c.underlineDoneAt + HOLD_MS) {
          c.phase = "out";
          c.outElapsed = 0;
          setPhase("out");
        }
      } else {
        c.outElapsed += dt;
        if (c.outElapsed >= OUT_MS) {
          c.index = (c.index + 1) % TRUST_STATES.length;
          c.phase = "show";
          c.elapsed = 0;
          c.underlineDoneAt = null;
          setIndex(c.index);
          setPhase("show");
        }
      }

      const visual = TRUST_STATES[c.index].visual;
      setFigure(visual === "rest" ? maskFigure(SAMPLE_FIGURE, dotProgress(c.elapsed)) : SAMPLE_FIGURE);
      setBadgeOn(visual === "rest" && c.elapsed >= BADGE_ON_MS);
      setToggleOff(visual === "consent" && c.elapsed >= TOGGLE_OFF_MS);
    }, TICK_MS);

    return () => window.clearInterval(id);
  }, [active]);

  const onUnderlineEnd = useCallback((e: AnimationEvent<HTMLSpanElement>) => {
    if (e.target !== e.currentTarget) return;
    const c = clock.current;
    if (c.phase === "show" && c.underlineDoneAt === null) c.underlineDoneAt = c.elapsed;
  }, []);

  const state: TrustState = TRUST_STATES[index];
  const slideClass = reduced ? "" : phase === "out" ? "trust-slide-out" : "trust-slide-in";

  return (
    <div ref={rootRef} className={`mt-7 w-full ${active ? "" : "trust-paused"}`}>
      <ul className="sr-only">
        {TRUST_STATES.map((s) => (
          <li key={s.heading}>
            {s.heading}. {plainSubtext(s)}
          </li>
        ))}
      </ul>

      <div
        key={index}
        aria-hidden="true"
        className={`flex flex-col items-center lg:items-start text-center lg:text-left will-change-transform ${slideClass}`}
      >
        <div className="flex h-[30px] -translate-y-3 items-center">
          <div className="scale-[1.2] origin-center lg:origin-left">
            {state.visual === "rest" && <RestVisual figure={figure} badgeOn={badgeOn} />}
            {state.visual === "transit" && <TransitVisual />}
            {state.visual === "consent" && <ConsentVisual off={toggleOff} />}
          </div>
        </div>

        <p className="mt-3 text-[24px] sm:text-[27px] font-extrabold leading-[1.08] tracking-[-0.035em] text-[#111613]">
          {state.heading}
        </p>

        <p className="mt-1.5 min-h-[2.7em] md:min-h-0 text-[16px] md:text-[18px] font-bold leading-[1.35] tracking-[-0.01em] text-[#3A473E] md:whitespace-nowrap">
          {state.subtext.map((part, i) =>
            part.kw ? (
              <span
                key={i}
                className="trust-kw"
                style={{ color: GREEN }}
                onAnimationEnd={onUnderlineEnd}
              >
                {part.text}
              </span>
            ) : (
              <span key={i}>{part.text}</span>
            )
          )}
        </p>
      </div>
    </div>
  );
}
