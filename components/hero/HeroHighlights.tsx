"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  HERO_HIGHLIGHT_STATES,
  OUT_MS,
  STATE_MS,
  keywordDelayMs,
  nextStateIndex,
  plainLine,
  type HeroHighlightState,
  type HeroHighlightVisual,
} from "@/lib/heroHighlights";

const TICK_MS = 40;
/** Largest step the clock may take in one tick (guards against throttled timers). */
const MAX_STEP_MS = 100;

type Phase = "show" | "out";

function Lock({ className, strokeWidth = 2 }: { className?: string; strokeWidth?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
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

const CHIP_CLASS =
  "hero-hl-chip absolute left-0 flex h-[13px] w-[28px] items-center justify-center rounded-[4px] border-[1.4px] border-[#111613] bg-white shadow-[1px_1px_0_rgba(17,22,19,0.25)]";
const CHIP_ICON_PROPS = {
  viewBox: "0 0 20 8",
  className: "h-2 w-5",
  fill: "none",
  stroke: "#15803D",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** 1: three account chips curve into one ring whose green arc fills a quarter more on each arrival. */
function ConsolidateVisual() {
  const chips = [
    { top: 0, dy: "12px", delay: "0s", d: "M2 7V4M7 7V2M12 7V4M17 7V1" },
    { top: 10, dy: "2px", delay: "0.14s", d: "M1 7L6 4L10 5.5L18 1" },
    { top: 21, dy: "-9px", delay: "0.28s", d: "M2 7H18M4 7V3M8 7V3M12 7V3M16 7V3M2 3L10 0.5L18 3" },
  ];
  return (
    <div className="relative h-[34px] w-[170px]">
      {chips.map((c) => (
        <i
          key={c.top}
          className={CHIP_CLASS}
          style={{ top: c.top, animationDelay: c.delay, "--hero-hl-dy": c.dy } as CSSProperties}
        >
          <svg {...CHIP_ICON_PROPS} aria-hidden="true">
            <path d={c.d} />
          </svg>
        </i>
      ))}
      <span className="hero-hl-ring absolute left-[118px] top-0 h-[34px] w-[34px]">
        <svg viewBox="0 0 34 34" className="h-[34px] w-[34px] overflow-visible" fill="none" aria-hidden="true">
          <circle cx="17" cy="17" r="16" stroke="#111613" strokeWidth={0.8} strokeDasharray="2 3" opacity={0.55} />
          <circle cx="17" cy="17" r="11.5" stroke="#E4E0D6" strokeWidth={3} />
          <circle
            className="hero-hl-ring-arc"
            cx="17"
            cy="17"
            r="11.5"
            pathLength={100}
            stroke="#22C55E"
            strokeWidth={3}
            strokeLinecap="round"
            style={{ transform: "rotate(-90deg)", transformOrigin: "17px 17px" }}
          />
        </svg>
        <b className="absolute inset-0 flex items-center justify-center text-[12px] font-extrabold text-[#15803D]">₹</b>
      </span>
      <i className="hero-hl-ring-ripple absolute left-[118px] top-0 h-[34px] w-[34px] rounded-full border-[1.5px] border-[#22C55E]" />
    </div>
  );
}

const PACKET_CLASS =
  "hero-hl-packet absolute -top-[3px] left-0 h-2 w-2 rounded-[2px] bg-[#22C55E] shadow-[-6px_0_6px_-2px_rgba(34,197,94,0.45)]";

/** 2: data packets travel past a lock to a store whose lock badge turns green. */
function ProtectVisual() {
  return (
    <div className="flex items-center gap-2">
      <span className="h-5 w-3.5 flex-none rounded border-[1.6px] border-[#111613] opacity-80" />
      <span className="relative h-0.5 w-[120px] flex-none bg-[rgba(17,22,19,0.14)]">
        <i className={PACKET_CLASS} />
        <i className={PACKET_CLASS} style={{ animationDelay: "-0.8s" }} />
        <span className="absolute left-1/2 top-1/2 -ml-[9px] -mt-[9px] flex h-[18px] w-[18px] items-center justify-center rounded-full border border-[rgba(17,22,19,0.14)] bg-white text-[#15803D]">
          <Lock className="h-[11px] w-[11px]" />
        </span>
      </span>
      <span className="relative h-5 w-[22px] flex-none rounded-[5px] border-[1.6px] border-[#111613] bg-white opacity-90">
        <b className="hero-hl-badge absolute -bottom-2 -right-2 flex h-4 w-4 items-center justify-center rounded-[6px]">
          <Lock className="h-2.5 w-2.5" strokeWidth={2.2} />
        </b>
        <i className="hero-hl-badge-ripple absolute -bottom-2 -right-2 h-4 w-4 rounded-[6px] border-[1.5px] border-[#22C55E]" />
      </span>
    </div>
  );
}

const PERF_PATH = "M2 26 L22 21 L40 24 L62 14 L84 18 L108 8 L146 4";

/** 3: a green performance line draws past a dashed benchmark, then a "+12.4% vs index" pill pops in. */
function PerformVisual({ paused }: { paused: boolean }) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Start the SMIL dot in step with the CSS line draw (each state remounts this visual).
  useEffect(() => {
    try {
      svgRef.current?.setCurrentTime?.(0);
    } catch {
      /* SMIL not supported: the dot simply runs on its own clock */
    }
  }, []);

  // The SMIL dot does not follow animation-play-state, so pause it with the rest of the block.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    try {
      if (paused) svg.pauseAnimations?.();
      else svg.unpauseAnimations?.();
    } catch {
      /* ignore */
    }
  }, [paused]);

  return (
    <div className="flex items-center gap-2.5">
      <svg
        ref={svgRef}
        width="150"
        height="32"
        viewBox="0 0 150 32"
        className="overflow-visible"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M2 24 L148 17" stroke="#9AA59D" strokeWidth={1.4} strokeDasharray="4 4" />
        <path className="hero-hl-perf-area" d={`${PERF_PATH} V32 H2Z`} fill="rgba(34,197,94,0.13)" stroke="none" />
        <path className="hero-hl-perf-line" d={PERF_PATH} stroke="#22C55E" strokeWidth={2.4} />
        <circle className="hero-hl-perf-dot" cx="146" cy="4" r="3.4" fill="#22C55E" />
        <circle r="3" fill="#22C55E" stroke="none">
          <animateMotion
            dur="3.8s"
            repeatCount="indefinite"
            keyPoints="0;1;1"
            keyTimes="0;.5;1"
            calcMode="linear"
            path={PERF_PATH}
          />
        </circle>
      </svg>
      <span className="hero-hl-perf-pill whitespace-nowrap rounded-full bg-[#EAF8EF] px-[9px] py-[3px] text-[12px] font-extrabold text-[#15803D]">
        +12.4%<small className="ml-[3px] font-semibold text-[#5A685D]">vs index</small>
      </span>
    </div>
  );
}

/** 4: an access toggle switches from on to off. */
function ControlVisual() {
  return (
    <div className="flex items-center gap-[9px] text-[12.5px]">
      <span className="hero-hl-toggle relative h-[19px] w-8 flex-none rounded-[10px] bg-[#22C55E]">
        <i className="hero-hl-toggle-knob absolute left-0.5 top-0.5 h-[15px] w-[15px] rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.25)]" />
      </span>
      <span className="relative inline-block h-4 w-[112px] text-left font-semibold leading-4 text-[#5A685D]">
        <span className="hero-hl-access-on absolute left-0 top-0 whitespace-nowrap">Access on</span>
        <span className="hero-hl-access-off absolute left-0 top-0 whitespace-nowrap">Access stopped</span>
      </span>
    </div>
  );
}

/** Holding tiles: pie, bars, line, bars, building (the pie's circle written as two arcs). */
const HOLDING_ICONS = [
  "M3.5 7a5.5 5.5 0 1 0 11 0a5.5 5.5 0 1 0 -11 0M9 7V1.5M9 7L13.8 9.8",
  "M2 13V8M7 13V3M12 13V6M16 13V1.5",
  "M1.5 12L6 7L9.5 9L16.5 2",
  "M2 13V8M7 13V3M12 13V6M16 13V1.5",
  "M2 13H16M4 13V6.5L9 2L14 6.5V13M7.5 13V9H10.5V13",
];

/** 5: a glowing highlighter hops along five holdings, one at a time. */
function RisksVisual() {
  return (
    <div className="relative h-10 w-[170px]">
      {HOLDING_ICONS.map((d, i) => (
        <i
          key={i}
          className="absolute bottom-0 flex h-[26px] w-7 items-center justify-center rounded-[6px] border-[1.5px] border-[#111613] bg-white shadow-[1px_1px_0_rgba(17,22,19,0.2)]"
          style={{ left: 2 + i * 34 }}
        >
          <svg
            viewBox="0 0 18 14"
            className="h-[14px] w-[18px]"
            fill="none"
            stroke="#15803D"
            strokeWidth={1.7}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d={d} />
          </svg>
        </i>
      ))}
      <i className="hero-hl-scan absolute -bottom-0.5 left-px h-[30px] w-[30px] rounded-[8px] border-2 border-[#22C55E] shadow-[0_0_7px_rgba(34,197,94,0.5)]" />
    </div>
  );
}

const STONE_CLASS =
  "absolute bottom-[3px] h-[7px] w-[22px] rounded-[2px] border-[1.4px] border-[#111613] bg-white shadow-[1px_1px_0_rgba(17,22,19,0.2)]";

/** 6: a marker hops along stepping stones, lighting each green, until a flag rises on the last. */
function ScenariosVisual() {
  return (
    <div className="relative h-[38px] w-[166px]">
      {[0, 1, 2, 3, 4].map((i) => (
        <i key={i} className={`${STONE_CLASS}${i ? ` hero-hl-stone-${i}` : ""}`} style={{ left: 2 + i * 30 }} />
      ))}
      <i className="hero-hl-flag-ring absolute bottom-[5px] left-[121px] h-6 w-6 rounded-full border-[1.5px] border-[#22C55E]" />
      <i className="hero-hl-hop-x absolute bottom-[11px] left-[7px] h-3 w-3">
        <b className="hero-hl-hop-y block h-3 w-3 rounded-full border-[1.6px] border-[#111613] bg-white shadow-[inset_-2px_-2px_0_rgba(34,197,94,0.45)]" />
      </i>
      <span className="hero-hl-flag absolute bottom-[11px] left-[150px] h-[22px] w-3">
        <svg viewBox="0 0 12 22" className="h-[22px] w-3 overflow-visible" aria-hidden="true">
          <path d="M1 22V1" stroke="#111613" strokeWidth={1.6} strokeLinecap="round" fill="none" />
          <path d="M1.5 1.5L11 5L1.5 9Z" fill="#22C55E" stroke="#111613" strokeWidth={1.2} strokeLinejoin="round" />
        </svg>
      </span>
    </div>
  );
}

function HighlightVisual({ visual, paused }: { visual: HeroHighlightVisual; paused: boolean }) {
  switch (visual) {
    case "consolidate":
      return <ConsolidateVisual />;
    case "protect":
      return <ProtectVisual />;
    case "perform":
      return <PerformVisual paused={paused} />;
    case "control":
      return <ControlVisual />;
    case "risks":
      return <RisksVisual />;
    case "scenarios":
      return <ScenariosVisual />;
  }
}

/**
 * The hero highlight block under the "Join the waitlist" button. Cycles through six states
 * (lib/heroHighlights.ts), each with a small looping visual, a heading and a line whose key words
 * get a green underline (the i-th starts 500 + i x 650 ms after the state appears). Every state
 * stays 3 s on every device, then slides out (170 ms) and the next slides in (320 ms).
 * Pauses when the tab is hidden, the block is off screen, or `isPaused` is true.
 * Reduced motion: state 1, fully drawn, no cycling.
 * Approved design: Docs/reference/hero-section-prototype.html.
 */
export function HeroHighlights({ isPaused = false }: { isPaused?: boolean }) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  const [reduced, setReduced] = useState(false);
  const [docVisible, setDocVisible] = useState(true);
  const [inView, setInView] = useState(true);

  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("show");

  // Pausable clock state, mutated by the tick loop.
  const clock = useRef({ index: 0, phase: "show" as Phase, elapsed: 0, outElapsed: 0 });

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

  // Reduced motion: state 1, fully drawn, no cycling.
  useEffect(() => {
    if (!reduced) return;
    clock.current = { index: 0, phase: "show", elapsed: 0, outElapsed: 0 };
    setIndex(0);
    setPhase("show");
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
        if (c.elapsed >= STATE_MS) {
          c.phase = "out";
          c.outElapsed = 0;
          setPhase("out");
        }
      } else {
        c.outElapsed += dt;
        if (c.outElapsed >= OUT_MS) {
          c.index = nextStateIndex(c.index);
          c.phase = "show";
          c.elapsed = 0;
          setIndex(c.index);
          setPhase("show");
        }
      }
    }, TICK_MS);

    return () => window.clearInterval(id);
  }, [active]);

  const state: HeroHighlightState = HERO_HIGHLIGHT_STATES[index];
  const slideClass = reduced ? "" : phase === "out" ? "trust-slide-out" : "trust-slide-in";
  // Order of each key word within the line (drives its underline delay).
  const kwOrder = state.line.map((_, i) => state.line.slice(0, i).filter((p) => p.kw).length);

  return (
    <div ref={rootRef} className={`mt-7 w-full ${active ? "" : "hero-hl-paused"}`}>
      <ul className="sr-only">
        {HERO_HIGHLIGHT_STATES.map((s) => (
          <li key={s.heading}>
            {s.heading.replace(/[.]$/, "")}. {plainLine(s)}
          </li>
        ))}
      </ul>

      <div
        key={index}
        aria-hidden="true"
        className={`flex min-h-[214px] flex-col items-center text-center will-change-transform sm:min-h-[196px] lg:min-h-[178px] lg:items-start lg:text-left ${slideClass}`}
      >
        <div className="flex h-[30px] -translate-y-3 items-center">
          <div className="scale-[1.2] origin-center lg:origin-left">
            <HighlightVisual visual={state.visual} paused={!active} />
          </div>
        </div>

        <p className="mt-3 font-heading text-[24px] sm:text-[27px] font-extrabold leading-[1.1] tracking-[-0.035em] text-[#111613]">
          {state.heading}
        </p>

        <p className="mt-1.5 max-w-[44ch] text-[16px] md:text-[18px] font-bold leading-[1.38] tracking-[-0.01em] text-[#3A473E]">
          {state.line.map((part, i) =>
            part.kw ? (
              <span key={i} className="hero-hl-kw" style={{ animationDelay: `${keywordDelayMs(kwOrder[i])}ms` }}>
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
