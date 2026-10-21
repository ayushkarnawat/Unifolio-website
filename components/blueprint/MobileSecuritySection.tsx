"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { gsap } from "@/lib/gsap";
import { SafeVault3D, type SafeVault3DRef } from "./SafeVault3D";
const PASSWORD_LETTERS = ["p", "a", "s", "s", "w", "o", "r", "d", "s"];
const LOCKED_LETTERS = ["L", "o", "c", "k", "e", "d"];
const CONNECTION_LETTERS = ["c", "o", "n", "n", "e", "c", "t", "i", "o", "n"];
const INDIA_LETTERS = ["I", "n", "d", "i", "a"];
const MONEY_LETTERS = ["m", "o", "n", "e", "y"];
const SELL_LETTERS = ["s", "e", "l", "l"];
const CLOSING_BLACK_WORDS = ["Security", "isn't", "just", "a", "feature", "here,"];
const CLOSING_GREEN_WORDS = ["It's", "the", "baseline", "everything", "else", "is", "built", "on."];

interface SecurityStateItem {
  type: "hero" | "principle" | "closing";
  headline?: string;
  body?: React.ReactNode;
}

const SECURITY_STATES: SecurityStateItem[] = [
  {
    type: "hero",
    headline: "We take your data as seriously as you take your money.",
  },
  {
    type: "principle",
    headline: "Read-only, always",
    body: (
      <>
        Unifolio can see your accounts. <br className="hidden sm:inline" />{" "}
        It can never move your money.
      </>
    ),
  },
  {
    type: "principle",
    headline: "We never save your passwords",
    body: (
      <>
        Your bank login stays with your bank, so your credentials never reach us.
      </>
    ),
  },
  {
    type: "principle",
    headline: "Locked down, everywhere",
    body: (
      <>
        Your data is encrypted with AES-256 at rest and TLS in transit. <br className="hidden sm:inline" />{" "}
        The same standard banks use.
      </>
    ),
  },
  {
    type: "principle",
    headline: "You control the connection",
    body: (
      <>
        Every account you link is approved by you and revocable anytime. <br className="hidden sm:inline" />{" "}
        Revoke it, and data sharing stops instantly.
      </>
    ),
  },
  {
    type: "principle",
    headline: "Stored in India",
    body: (
      <>
        Your data stays on secure infrastructure based in India, <br className="hidden sm:inline" />{" "}
        meeting RBI&apos;s data localization requirements.
      </>
    ),
  },
  {
    type: "principle",
    headline: "We don't sell your data",
    body: (
      <>
        It&apos;s used only to show you your own financial picture, never sold,{" "}
        never used for advertising, in line with India&apos;s DPDP Act.
      </>
    ),
  },
  {
    type: "closing",
    headline: "Security isn't just a feature here, It's the baseline everything else is built on.",
  },
];

const DURATION_MS = 3500;
const STATES_COUNT = SECURITY_STATES.length;


export function MobileSecuritySection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0); // 0 to 1
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const vaultRef = useRef<SafeVault3DRef | null>(null);

  // Interaction & timer refs
  const isInteractingRef = useRef(false);
  const isVisibleRef = useRef(false);
  const hasEnteredRef = useRef(false);
  const resumeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const rafRef = useRef<number | null>(null);

  // Micro-animation refs
  const contentWrapperRef = useRef<HTMLDivElement | null>(null);
  const moneyWrapperRef = useRef<HTMLSpanElement | null>(null);
  const moneyBill1Ref = useRef<SVGGElement | null>(null);
  const moneyBill2Ref = useRef<SVGGElement | null>(null);
  const moneyCharRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const typoEyesRef = useRef<HTMLSpanElement | null>(null);
  const typoLeftWordRef = useRef<HTMLSpanElement | null>(null);
  const typoRightWordRef = useRef<HTMLSpanElement | null>(null);
  const typoPupilsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const typoEyelidsRef = useRef<(HTMLSpanElement | null)[]>([]);

  const pwdLetterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const pwdMaskRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const lockIconWrapperRef = useRef<HTMLSpanElement | null>(null);
  const lockShackleRef = useRef<SVGPathElement | null>(null);
  const lockCharRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const connectionWrapperRef = useRef<HTMLSpanElement | null>(null);
  const connectionCharRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const indiaMapWrapperRef = useRef<HTMLSpanElement | null>(null);
  const indiaCharRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const sellShieldWrapperRef = useRef<HTMLSpanElement | null>(null);
  const sellShieldIconRef = useRef<SVGSVGElement | null>(null);
  const sellCharRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const activeTlRef = useRef<gsap.core.Timeline | null>(null);

  // Function to trigger micro-animations based on active state index
  const triggerStateAnimation = useCallback((idx: number) => {
    // Kill any existing running state timeline
    if (activeTlRef.current) {
      activeTlRef.current.kill();
      activeTlRef.current = null;
    }

    // 1. Vault dial step
    vaultRef.current?.triggerRimStep?.(1, idx);

    // 2. Text entrance animation
    if (contentWrapperRef.current) {
      gsap.fromTo(
        contentWrapperRef.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }
      );
    }

    // 3. State-specific micro-animation
    if (idx === 0) {
      // State 0: Money fanning banknotes
      const chars = moneyCharRefs.current.filter(Boolean) as HTMLElement[];
      const wrapper = moneyWrapperRef.current;
      const b1 = moneyBill1Ref.current;
      const b2 = moneyBill2Ref.current;
      if (chars.length > 0 && wrapper) {
        gsap.killTweensOf([...chars, wrapper, b1, b2].filter(Boolean));
        gsap.set(chars, { opacity: 1, scale: 1, x: 0, y: 0 });
        gsap.set(wrapper, { opacity: 0, scale: 0.85 });
        if (b1) gsap.set(b1, { x: 0, y: 0, rotate: 0 });
        if (b2) gsap.set(b2, { x: 0, y: 0, rotate: 0 });

        const tl = gsap.timeline({
          onComplete: () => {
            gsap.set(chars, { opacity: 1, scale: 1, x: 0, y: 0, clearProps: "all" });
            gsap.set(wrapper, { opacity: 0, scale: 0.85 });
          },
        });
        activeTlRef.current = tl;

        chars.forEach((char, i) => {
          tl.to(char, { x: (i - 2) * 4, scale: 0.35, opacity: 0, duration: 0.22, ease: "power2.in" }, 0.25 + i * 0.015);
        });
        tl.to(wrapper, { opacity: 1, scale: 1, duration: 0.28, ease: "back.out(1.8)" }, 0.35);
        if (b1) tl.to(b1, { rotate: -12, x: -7, duration: 0.32, ease: "back.out(1.5)" }, 0.55);
        if (b2) tl.to(b2, { rotate: 12, x: 7, duration: 0.32, ease: "back.out(1.5)" }, 0.55);
        if (b1 || b2) tl.to([b1, b2].filter(Boolean), { x: 0, y: 0, rotate: 0, duration: 0.24, ease: "power2.inOut" }, 1.8);
        tl.to(wrapper, { opacity: 0, scale: 0.85, duration: 0.2, ease: "power2.in" }, 1.95);
        chars.forEach((char, i) => {
          tl.fromTo(
            char,
            { opacity: 0, scale: 0.35, x: (i - 2) * 4, y: 0 },
            { opacity: 1, scale: 1, x: 0, y: 0, duration: 0.24, ease: "back.out(1.8)" },
            2.05 + i * 0.02
          );
        });
      }
    } else if (idx === 1) {
      // State 1: Living eyes peeking between "Read-only," and "always"
      const eyes = typoEyesRef.current;
      const leftWord = typoLeftWordRef.current;
      const rightWord = typoRightWordRef.current;
      const pupils = typoPupilsRef.current.filter(Boolean) as HTMLElement[];
      const eyelids = typoEyelidsRef.current.filter(Boolean) as HTMLElement[];
      if (eyes && leftWord && rightWord) {
        gsap.killTweensOf([eyes, leftWord, rightWord, ...pupils, ...eyelids].filter(Boolean));
        gsap.set(eyes, { x: 0, y: 16, opacity: 0, visibility: "visible" });
        gsap.set([leftWord, rightWord], { x: 0 });
        if (pupils.length > 0) gsap.set(pupils, { x: 0, y: 0 });
        if (eyelids.length > 0) gsap.set(eyelids, { scaleY: 0 });

        const tl = gsap.timeline({
          onComplete: () => {
            gsap.set([leftWord, rightWord], { x: 0, clearProps: "transform" });
            gsap.set(eyes, { x: 0, y: 16, opacity: 0, visibility: "hidden" });
          },
        });
        activeTlRef.current = tl;

        // leftWord stays at x: 0 so "Read-only," never shifts left or clips off the card edge!
        // rightWord opens a clean 68px gap; eyes centers at x: 34 so its left edge (34 - 28 = +6px) never touches "only,"
        tl.to(rightWord, { x: 68, duration: 0.35, ease: "back.out(1.4)" }, 0.25);
        tl.to(eyes, { x: 34, y: 0, opacity: 1, duration: 0.35, ease: "power2.out" }, 0.25);
        if (pupils[0]) tl.to(pupils[0], { x: -5, duration: 0.25, ease: "power2.inOut" }, 0.7);
        if (pupils[1]) tl.to(pupils[1], { x: -4, duration: 0.25, ease: "power2.inOut" }, 0.7);
        if (pupils[0]) tl.to(pupils[0], { x: 5, duration: 0.35, ease: "power2.inOut" }, 1.1);
        if (pupils[1]) tl.to(pupils[1], { x: 6, duration: 0.35, ease: "power2.inOut" }, 1.1);
        if (eyelids.length > 0) {
          tl.to(eyelids, { scaleY: 1, duration: 0.08, ease: "power2.in" }, 1.6);
          tl.to(eyelids, { scaleY: 0, duration: 0.1, ease: "power2.out" }, 1.68);
        }
        if (pupils.length > 0) tl.to(pupils, { x: 0, y: 0, duration: 0.2 }, 1.7);
        // Sinks straight down into the gap at x: 34 without drifting left over "only,"
        tl.to(eyes, { y: 16, opacity: 0, duration: 0.25, ease: "power2.in" }, 2.05);
        // Then rightWord slides smoothly back over the gap to rest
        tl.to(rightWord, { x: 0, duration: 0.35, ease: "power3.inOut" }, 2.20);
      }
    } else if (idx === 2) {
      // State 2: Password masking asterisks
      const letters = pwdLetterRefs.current.filter(Boolean) as HTMLElement[];
      const masks = pwdMaskRefs.current.filter(Boolean) as HTMLElement[];
      if (letters.length > 0 && masks.length > 0) {
        gsap.killTweensOf([...letters, ...masks]);
        gsap.set(letters, { opacity: 1, scale: 1, clearProps: "all" });
        gsap.set(masks, { opacity: 0, scale: 0.35 });

        const tl = gsap.timeline({
          onComplete: () => {
            gsap.set(letters, { opacity: 1, scale: 1, clearProps: "all" });
            gsap.set(masks, { opacity: 0, scale: 0.35 });
          },
        });
        activeTlRef.current = tl;

        letters.forEach((letter, i) => {
          const t = 0.35 + i * 0.08;
          tl.to(letter, { opacity: 0, scale: 0.35, duration: 0.1, ease: "power2.in" }, t);
          if (masks[i]) tl.to(masks[i], { opacity: 1, scale: 1, duration: 0.15, ease: "back.out(2.2)" }, t + 0.03);
        });
        const unmaskStart = 0.35 + letters.length * 0.08 + 0.45;
        for (let j = letters.length - 1; j >= 0; j--) {
          const t = unmaskStart + (letters.length - 1 - j) * 0.08;
          if (masks[j]) tl.to(masks[j], { opacity: 0, scale: 0.35, duration: 0.1, ease: "power2.in" }, t);
          tl.to(letters[j], { opacity: 1, scale: 1, duration: 0.15, ease: "back.out(1.8)" }, t + 0.03);
        }
      }
    } else if (idx === 3) {
      // State 3: Padlock snap shut on "Locked"
      const chars = lockCharRefs.current.filter(Boolean) as HTMLElement[];
      const icon = lockIconWrapperRef.current;
      const shackle = lockShackleRef.current;
      if (chars.length > 0 && icon) {
        gsap.killTweensOf([...chars, icon, shackle].filter(Boolean));
        gsap.set(chars, { opacity: 1, scale: 1, clearProps: "all" });
        gsap.set(icon, { opacity: 0, scale: 0.35 });
        if (shackle) gsap.set(shackle, { y: -5 });

        const tl = gsap.timeline({
          onComplete: () => {
            gsap.set(chars, { opacity: 1, scale: 1, clearProps: "all" });
            gsap.set(icon, { opacity: 0, scale: 0.35 });
          },
        });
        activeTlRef.current = tl;

        chars.forEach((char, i) => {
          tl.to(char, { scale: 0.3, opacity: 0, duration: 0.18, ease: "power2.in" }, 0.25 + i * 0.012);
        });
        tl.to(icon, { opacity: 1, scale: 1, duration: 0.26, ease: "back.out(1.8)" }, 0.35);
        if (shackle) tl.to(shackle, { y: 0, duration: 0.14, ease: "power3.in" }, 0.65);
        tl.to(icon, { scale: 1.08, duration: 0.08, yoyo: true, repeat: 1, ease: "power2.out" }, 0.72);
        tl.to(icon, { opacity: 0, scale: 0.35, duration: 0.2, ease: "power2.in" }, 1.9);
        chars.forEach((char, i) => {
          tl.fromTo(char, { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.22, ease: "back.out(1.8)" }, 2.0 + i * 0.015);
        });
      }
    } else if (idx === 4) {
      // State 4: Connection pulse icon
      const chars = connectionCharRefs.current.filter(Boolean) as HTMLElement[];
      const wrapper = connectionWrapperRef.current;
      if (chars.length > 0 && wrapper) {
        gsap.killTweensOf([...chars, wrapper]);
        gsap.set(chars, { opacity: 1, scale: 1, clearProps: "all" });
        gsap.set(wrapper, { opacity: 0, scale: 0.35, y: 0 });

        const tl = gsap.timeline({
          onComplete: () => {
            gsap.set(chars, { opacity: 1, scale: 1, clearProps: "all" });
            gsap.set(wrapper, { opacity: 0, scale: 0.35 });
          },
        });
        activeTlRef.current = tl;

        chars.forEach((char, i) => {
          tl.to(char, { scale: 0.3, opacity: 0, duration: 0.16, ease: "power2.in" }, 0.25 + i * 0.01);
        });
        tl.to(wrapper, { opacity: 1, scale: 1, y: 0, duration: 0.28, ease: "back.out(1.6)" }, 0.38);
        tl.to(wrapper, { scale: 1.14, y: 0, duration: 0.4, yoyo: true, repeat: 2, ease: "sine.inOut" }, 0.7);
        tl.to(wrapper, { opacity: 0, scale: 0.35, y: 0, duration: 0.2, ease: "power2.in" }, 2.1);
        chars.forEach((char, i) => {
          tl.fromTo(char, { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.22, ease: "back.out(1.6)" }, 2.2 + i * 0.01);
        });
      }
    } else if (idx === 5) {
      // State 5: Minimal India map glow
      const chars = indiaCharRefs.current.filter(Boolean) as HTMLElement[];
      const map = indiaMapWrapperRef.current;
      if (chars.length > 0 && map) {
        gsap.killTweensOf([...chars, map]);
        gsap.set(chars, { opacity: 1, scale: 1, clearProps: "all" });
        gsap.set(map, { opacity: 0, scale: 0.35, y: 0 });

        const tl = gsap.timeline({
          onComplete: () => {
            gsap.set(chars, { opacity: 1, scale: 1, clearProps: "all" });
            gsap.set(map, { opacity: 0, scale: 0.35 });
          },
        });
        activeTlRef.current = tl;

        chars.forEach((char, i) => {
          tl.to(char, { scale: 0.3, opacity: 0, duration: 0.18, ease: "power2.in" }, 0.25 + i * 0.015);
        });
        tl.to(map, { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: "back.out(1.8)" }, 0.36);
        tl.to(map, { filter: "drop-shadow(0 0 10px rgba(34,197,94,0.7))", duration: 0.4, yoyo: true, repeat: 2 }, 0.7);
        tl.to(map, { opacity: 0, scale: 0.35, y: 0, duration: 0.2, ease: "power2.in" }, 2.1);
        chars.forEach((char, i) => {
          tl.fromTo(char, { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.22, ease: "back.out(1.8)" }, 2.2 + i * 0.015);
        });
      }
    } else if (idx === 6) {
      // State 6: Security shield badge
      const chars = sellCharRefs.current.filter(Boolean) as HTMLElement[];
      const wrapper = sellShieldWrapperRef.current;
      const icon = sellShieldIconRef.current;
      if (chars.length > 0 && wrapper) {
        gsap.killTweensOf([...chars, wrapper, icon].filter(Boolean));
        gsap.set(chars, { opacity: 1, scale: 1, clearProps: "all" });
        gsap.set(wrapper, { opacity: 0, scale: 0.35, y: 0 });
        if (icon) gsap.set(icon, { rotateY: 0 });

        const tl = gsap.timeline({
          onComplete: () => {
            gsap.set(chars, { opacity: 1, scale: 1, clearProps: "all" });
            gsap.set(wrapper, { opacity: 0, scale: 0.35 });
          },
        });
        activeTlRef.current = tl;

        chars.forEach((char, i) => {
          tl.to(char, { scale: 0.3, opacity: 0, duration: 0.18, ease: "power2.in" }, 0.25 + i * 0.015);
        });
        tl.to(wrapper, { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: "back.out(1.8)" }, 0.35);
        if (icon) tl.to(icon, { rotateY: 360, duration: 0.8, ease: "power2.inOut" }, 0.7);
        tl.to(wrapper, { opacity: 0, scale: 0.35, y: 0, duration: 0.2, ease: "power2.in" }, 2.1);
        chars.forEach((char, i) => {
          tl.fromTo(char, { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.22, ease: "back.out(1.8)" }, 2.2 + i * 0.015);
        });
      }
    }
  }, []);

  const progressRef = useRef(0);
  const isHoldingRef = useRef(false);

  const goToState = useCallback((targetIdx: number) => {
    isHoldingRef.current = false;
    setActiveIndex(targetIdx);
    setProgress(0);
    progressRef.current = 0;
    startTimeRef.current = Date.now();
    if (targetIdx === 0) {
      vaultRef.current?.resetRim?.();
    }
  }, []);

  // Next / Prev actions
  const nextState = useCallback(() => {
    const next = (activeIndex + 1) % STATES_COUNT;
    goToState(next);
  }, [activeIndex, goToState]);

  const prevState = useCallback(() => {
    const prev = (activeIndex - 1 + STATES_COUNT) % STATES_COUNT;
    goToState(prev);
  }, [activeIndex, goToState]);

  // Instagram stories-like Tap-and-Hold to Pause / Release to Resume immediately
  const handleHoldStart = useCallback(() => {
    isHoldingRef.current = true;
    // Pause any currently playing GSAP micro-animation
    if (activeTlRef.current && activeTlRef.current.isActive()) {
      activeTlRef.current.pause();
    }
  }, []);

  const handleHoldEnd = useCallback(() => {
    if (!isHoldingRef.current) return;
    isHoldingRef.current = false;
    // Resume elapsed time seamlessly from exact current progress percentage
    startTimeRef.current = Date.now() - progressRef.current * DURATION_MS;
    // Resume GSAP micro-animation
    if (activeTlRef.current && activeTlRef.current.paused()) {
      activeTlRef.current.resume();
    }
  }, []);

  // Swipe left / right on the card to move between states (in addition to the automatic advance)
  const swipeStartRef = useRef<{ x: number; y: number } | null>(null);
  const handleSwipeStart = useCallback((e: React.PointerEvent) => {
    swipeStartRef.current = { x: e.clientX, y: e.clientY };
  }, []);
  const handleSwipeEnd = useCallback(
    (e: React.PointerEvent) => {
      const start = swipeStartRef.current;
      swipeStartRef.current = null;
      if (!start) return;
      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
      if (dx < 0) nextState();
      else prevState();
    },
    [nextState, prevState]
  );

  // IntersectionObserver: Only start auto-advancing when user reaches the Security section
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          isVisibleRef.current = true;
          if (!hasEnteredRef.current) {
            hasEnteredRef.current = true;
            setActiveIndex(0);
            setProgress(0);
            progressRef.current = 0;
            startTimeRef.current = Date.now();
            vaultRef.current?.resetRim?.();
            triggerStateAnimation(0);
          }
        } else {
          isVisibleRef.current = false;
          // Reset so re-entering always starts cleanly from state 0
          hasEnteredRef.current = false;
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [triggerStateAnimation]);

  // Whenever activeIndex changes and the section has been reached, trigger state animation after DOM commit
  useEffect(() => {
    if (!hasEnteredRef.current && !isVisibleRef.current) return;

    // Trigger vault rotation dial step
    vaultRef.current?.triggerRimStep?.(1, activeIndex);

    // Give React time to commit DOM for new activeIndex, then trigger animation
    const timer = setTimeout(() => {
      triggerStateAnimation(activeIndex);
    }, 60);

    return () => clearTimeout(timer);
  }, [activeIndex, triggerStateAnimation]);

  // Auto-advance continuous requestAnimationFrame loop (only runs when section is visible in viewport)
  useEffect(() => {
    const loop = () => {
      if (isVisibleRef.current && !isHoldingRef.current) {
        const elapsed = Date.now() - startTimeRef.current;
        const p = Math.min(1, elapsed / DURATION_MS);
        setProgress(p);
        progressRef.current = p;

        if (p >= 1) {
          startTimeRef.current = Date.now();
          setProgress(0);
          progressRef.current = 0;
          setActiveIndex((prev) => {
            const next = (prev + 1) % STATES_COUNT;
            if (next === 0) {
              vaultRef.current?.resetRim?.();
            }
            return next;
          });
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const currentState = SECURITY_STATES[activeIndex];

  return (
    <div
      ref={sectionRef}
      className="w-full max-w-lg mx-auto flex flex-col items-center select-none py-1"
      onPointerDown={handleHoldStart}
      onPointerUp={handleHoldEnd}
      onPointerCancel={handleHoldEnd}
    >
      {/* 1. TOP: Ambient Floating 3D Chrome/Gold Safe Vault */}
      <div className="relative w-[275px] min-[390px]:w-[295px] sm:w-[330px] aspect-square flex items-center justify-center -mt-3 sm:-mt-5 mb-2.5 shrink-0">
        {/* Soft Ambient Radial Shadow Underneath */}
        <div
          className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-[90%] h-[28px] rounded-[100%] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 65% 35% at 50% 50%, rgba(18, 26, 22, 0.2) 0%, rgba(34, 197, 94, 0.08) 40%, transparent 70%)",
            filter: "blur(14px)",
          }}
        />

        {/* 3D Chrome/Gold Vault Door */}
        <SafeVault3D ref={vaultRef} className="w-full h-full max-w-full max-h-full" />
      </div>

      {/* 2. Glassmorphic Interactive Narrative Card (Standard Stable Size) */}
      <div
        onPointerDown={(e) => {
          handleHoldStart();
          handleSwipeStart(e);
        }}
        onPointerUp={(e) => {
          handleHoldEnd();
          handleSwipeEnd(e);
        }}
        onPointerCancel={handleHoldEnd}
        onPointerLeave={handleHoldEnd}
        style={{ touchAction: "pan-y" }}
        className="w-full rounded-[22px] p-5 sm:p-5.5 relative overflow-hidden flex flex-col justify-start bg-[rgba(232,243,236,0.88)] backdrop-blur-xl border border-white/80 shadow-[0_16px_36px_-12px_rgba(16,44,28,0.08),inset_0_1.5px_1px_0_rgba(255,255,255,0.9)] h-[268px] min-[390px]:h-[278px] sm:h-[288px] cursor-pointer"
      >
        {/* Top Edge Ambient Highlight */}
        <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/90 to-transparent pointer-events-none" />

        {/* 8-Segment Story Progress Bars (Option 3) */}
        <div className="flex items-center gap-1 sm:gap-1.5 w-full mb-3.5 sm:mb-4 shrink-0">
          {Array.from({ length: STATES_COUNT }).map((_, sIdx) => {
            const isCompleted = sIdx < activeIndex;
            const isCurrent = sIdx === activeIndex;
            return (
              <button
                key={sIdx}
                type="button"
                onClick={() => goToState(sIdx)}
                aria-label={`Jump to security state ${sIdx + 1}`}
                className="flex-1 h-[3.5px] rounded-full overflow-hidden bg-black/[0.08] relative transition-all"
              >
                {isCompleted && <div className="absolute inset-0 bg-[#22C55E]" />}
                {isCurrent && (
                  <div
                    className="absolute inset-y-0 left-0 bg-[#22C55E] rounded-full shadow-[0_0_6px_#22C55E]"
                    style={{ width: `${Math.round(progress * 100)}%` }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Animated Headline & Narrative Content */}
        <div ref={contentWrapperRef} className="flex-1 flex flex-col justify-start pt-2">
          {currentState.type === "hero" ? (
            <div>
              <h3 className="font-sans font-black text-[23px] min-[390px]:text-[25px] sm:text-[27px] tracking-[-0.035em] text-neutral-950 leading-[1.2] mb-1.5">
                <span>We take your data as </span>
                <span className="text-[#22C55E]">seriously </span>
                <span>as you take your&nbsp;</span>
                <span className="relative inline-flex items-center justify-center align-baseline">
                  {/* Letters of "money" */}
                  <span className="inline-flex items-baseline text-neutral-950 font-black">
                    {MONEY_LETTERS.map((char, cIdx) => (
                      <span
                        key={cIdx}
                        ref={(el) => {
                          moneyCharRefs.current[cIdx] = el;
                        }}
                        className="inline-block"
                      >
                        {char}
                      </span>
                    ))}
                  </span>

                  {/* Banknote Stack Animation */}
                  <span
                    ref={moneyWrapperRef}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
                    style={{ opacity: 0, transform: "scale(0.85)" }}
                    aria-hidden="true"
                  >
                    <svg viewBox="-56 -28 112 56" className="w-full h-full max-h-[1.15em] overflow-visible drop-shadow-[0_4px_16px_rgba(34,197,94,0.35)]" fill="none">
                      <defs>
                        <g id="mobile-money-bill">
                          <rect x="-48" y="-25" width="96" height="50" rx="5" fill="#4ADE80" stroke="#15803D" strokeWidth="2.8" />
                          <circle cx="-27" cy="0" r="5" fill="#15803D" />
                          <circle cx="27" cy="0" r="5" fill="#15803D" />
                          <circle cx="0" cy="0" r="15" fill="#15803D" />
                          <text x="0" y="6.5" fontFamily="system-ui, sans-serif" fontSize="19" fontWeight="900" fill="#4ADE80" textAnchor="middle">₹</text>
                        </g>
                      </defs>
                      <g ref={moneyBill1Ref}><use href="#mobile-money-bill" /></g>
                      <g ref={moneyBill2Ref}><use href="#mobile-money-bill" /></g>
                    </svg>
                  </span>
                </span>
                .
              </h3>
              <p className="font-sans text-[14.5px] min-[390px]:text-[15.5px] sm:text-[16px] text-neutral-700 font-medium leading-[1.45] mt-1.5">
                Your family&apos;s financial information deserves bank-grade protection from the ground up.
              </p>
            </div>
          ) : currentState.type === "principle" ? (
            <div className={activeIndex === 4 ? "pt-5 min-[390px]:pt-6 sm:pt-7" : activeIndex >= 5 && activeIndex <= 6 ? "pt-2.5 sm:pt-3.5" : ""}>
              {activeIndex === 1 ? (
                // State 2: "Read-only, always" with Living Eyes Easter Egg
                <h3 className="font-sans font-black text-[23px] min-[390px]:text-[25px] sm:text-[27px] tracking-[-0.035em] text-neutral-950 leading-[1.2] mb-1.5 relative inline-flex items-baseline">
                  <span ref={typoLeftWordRef} className="inline-block">Read-only,</span>
                  <span className="relative inline-flex items-center justify-center w-[0.2em] overflow-visible align-baseline">
                    <span
                      ref={typoEyesRef}
                      className="absolute -top-[20px] left-1/2 -translate-x-1/2 pointer-events-none select-none inline-flex items-center gap-1 px-0.5 z-20"
                      style={{ opacity: 0, visibility: "hidden" }}
                    >
                      <span className="relative w-[24px] h-[24px] rounded-full overflow-hidden flex items-center justify-center border border-white/60 shadow-md">
                        <span className="absolute inset-0 bg-white" />
                        <span ref={(el) => { typoPupilsRef.current[0] = el; }} className="relative w-[12px] h-[12px] rounded-full bg-[#020603] shadow-[0_0_0_2px_rgba(34,197,94,0.95)]">
                          <span className="absolute top-[1.5px] left-[2.5px] w-[3px] h-[3px] rounded-full bg-white" />
                        </span>
                        <span ref={(el) => { typoEyelidsRef.current[0] = el; }} className="absolute inset-0 bg-[#06180e] rounded-full origin-top" style={{ transform: "scaleY(0)" }} />
                      </span>
                      <span className="relative w-[24px] h-[24px] rounded-full overflow-hidden flex items-center justify-center border border-white/60 shadow-md">
                        <span className="absolute inset-0 bg-white" />
                        <span ref={(el) => { typoPupilsRef.current[1] = el; }} className="relative w-[12px] h-[12px] rounded-full bg-[#020603] shadow-[0_0_0_2px_rgba(34,197,94,0.95)]">
                          <span className="absolute top-[1.5px] left-[2.5px] w-[3px] h-[3px] rounded-full bg-white" />
                        </span>
                        <span ref={(el) => { typoEyelidsRef.current[1] = el; }} className="absolute inset-0 bg-[#06180e] rounded-full origin-top" style={{ transform: "scaleY(0)" }} />
                      </span>
                    </span>
                  </span>
                  <span ref={typoRightWordRef} className="inline-block text-[#22C55E]">always</span>
                </h3>
              ) : activeIndex === 2 ? (
                // State 3: "We never save your passwords" with password asterisks
                <h3 className="font-sans font-black text-[23px] min-[390px]:text-[25px] sm:text-[27px] tracking-[-0.035em] text-neutral-950 leading-[1.2] mb-1.5">
                  <span>We never save your </span>
                  <span className="text-[#22C55E] inline-flex items-baseline">
                    {PASSWORD_LETTERS.map((char, cIdx) => (
                      <span key={cIdx} className="relative inline-block text-center align-baseline">
                        <span ref={(el) => { pwdLetterRefs.current[cIdx] = el; }} className="inline-block">{char}</span>
                        <span ref={(el) => { pwdMaskRefs.current[cIdx] = el; }} className="absolute inset-0 flex items-center justify-center text-[1.1em] font-black text-[#22C55E]" style={{ opacity: 0 }}>*</span>
                      </span>
                    ))}
                  </span>
                </h3>
              ) : activeIndex === 3 ? (
                // State 4: "Locked down, everywhere" with lock morph
                <h3 className="font-sans font-black text-[23px] min-[390px]:text-[25px] sm:text-[27px] tracking-[-0.035em] text-neutral-950 leading-[1.2] mb-1.5">
                  <span className="relative inline-flex items-center justify-center align-baseline">
                    <span className="inline-flex items-baseline">
                      {LOCKED_LETTERS.map((char, cIdx) => (
                        <span key={cIdx} ref={(el) => { lockCharRefs.current[cIdx] = el; }} className="inline-block">{char}</span>
                      ))}
                    </span>
                    <span ref={lockIconWrapperRef} className="absolute inset-0 flex items-center justify-center" style={{ opacity: 0, transform: "scale(0.35)" }}>
                      <svg viewBox="0 0 44 48" className="w-[1.2em] h-[1.3em] overflow-visible drop-shadow-[0_4px_12px_rgba(34,197,94,0.4)]" fill="none">
                        <path ref={lockShackleRef} d="M 13 21 V 13 C 13 7.5 17 3.5 22 3.5 C 27 3.5 31 7.5 31 13 V 21" stroke="#18181B" strokeWidth="4.8" strokeLinecap="round" />
                        <rect x="6" y="18" width="32" height="26" rx="7.5" fill="#22C55E" />
                        <circle cx="22" cy="28" r="2.8" fill="#18181B" />
                        <path d="M 20.6 28.5 L 19.8 36 L 24.2 36 L 23.4 28.5 Z" fill="#18181B" />
                      </svg>
                    </span>
                  </span>
                  <span> down, </span>
                  <span className="text-[#22C55E]">everywhere</span>
                </h3>
              ) : activeIndex === 4 ? (
                // State 5: "You control the connection" with connection SVG
                <h3 className="font-sans font-black text-[19px] min-[360px]:text-[20px] min-[390px]:text-[22px] sm:text-[24px] tracking-[-0.035em] text-neutral-950 leading-tight whitespace-nowrap mb-2.5 sm:mb-3">
                  <span className="text-neutral-950 font-black">You control the&nbsp;</span>
                  <span className="relative inline-flex items-center justify-center align-baseline">
                    <span className="inline-flex items-baseline text-[#22C55E] font-black">
                      {CONNECTION_LETTERS.map((char, cIdx) => (
                        <span key={cIdx} ref={(el) => { connectionCharRefs.current[cIdx] = el; }} className="inline-block font-black">{char}</span>
                      ))}
                    </span>
                    <span ref={connectionWrapperRef} className="absolute inset-0 flex items-center justify-center pointer-events-none z-10" style={{ opacity: 0, transform: "scale(0.35)" }}>
                      <img src="/connection.svg" alt="" className="w-[3.0em] h-[3.0em] min-[390px]:w-[3.3em] min-[390px]:h-[3.3em] object-contain drop-shadow-[0_6px_20px_rgba(34,197,94,0.45)]" />
                    </span>
                  </span>
                </h3>
              ) : activeIndex === 5 ? (
                // State 6: "Stored in India" with glowing India map outline
                <h3 className="font-sans font-black text-[22px] min-[390px]:text-[24px] sm:text-[26px] tracking-[-0.035em] text-neutral-950 leading-tight mb-2.5 sm:mb-3">
                  <span className="inline-block text-neutral-950">Stored in&nbsp;</span>
                  <span className="relative inline-flex items-center justify-center align-middle h-[1.35em]">
                    <span className="inline-flex items-baseline text-[#22C55E]">
                      {INDIA_LETTERS.map((char, cIdx) => (
                        <span key={cIdx} ref={(el) => { indiaCharRefs.current[cIdx] = el; }} className="inline-block">{char}</span>
                      ))}
                    </span>
                    <span ref={indiaMapWrapperRef} className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ opacity: 0 }}>
                      <svg viewBox="0 0 200 200" className="w-[2.2em] h-[2.2em] overflow-visible drop-shadow-[0_4px_16px_rgba(34,197,94,0.4)]" fill="none">
                        <path d="M 59.2 13.0 C 61.8 12.9 65.5 12.6 68.7 14.1 C 71.9 15.6 75.5 21.1 78.3 22.0 C 81.0 23.0 82.9 20.3 85.2 19.9 C 87.4 19.6 89.6 19.5 91.5 19.9 C 93.5 20.4 97.2 20.5 96.8 22.6 C 96.5 24.6 90.6 30.1 89.4 32.1 C 88.2 34.2 89.0 33.8 89.4 34.8 C 89.7 35.7 91.2 36.9 91.5 38.0 C 91.8 39.0 92.1 40.1 91.0 41.1 C 89.8 42.2 83.3 42.1 84.6 44.3 C 85.9 46.5 96.5 52.4 98.9 54.4 C 101.4 56.3 99.8 54.7 99.5 56.0 C 99.1 57.2 95.5 59.8 96.8 61.8 C 98.1 63.9 103.3 66.4 107.4 68.2 C 111.6 69.9 117.7 71.6 121.7 72.4 C 125.8 73.2 129.5 73.3 131.8 73.0 C 134.1 72.6 134.5 72.0 135.5 70.3 C 136.6 68.6 137.2 64.5 138.2 62.9 C 139.2 61.3 139.0 59.6 141.4 60.8 C 143.8 61.9 149.9 68.2 152.5 69.8 C 155.1 71.4 155.2 70.8 156.7 70.3 C 158.3 69.8 159.7 69.2 162.0 66.6 C 164.4 63.9 168.9 56.8 171.1 54.4 C 173.3 52.0 173.8 52.6 175.3 52.3 C 176.8 51.9 178.7 51.9 180.1 52.3 C 181.5 52.6 182.6 52.9 183.8 54.4 C 185.0 55.9 187.1 59.3 187.5 61.3 C 187.9 63.2 187.6 64.8 186.4 66.1 C 185.3 67.3 182.1 67.7 180.6 68.7 C 179.1 69.8 178.8 69.7 177.4 72.4 C 176.1 75.2 173.5 80.8 172.7 85.2 C 171.8 89.5 173.7 96.6 172.1 98.4 C 170.5 100.3 165.3 97.4 163.1 96.3 C 160.9 95.1 159.6 93.1 158.9 91.5 C 158.2 89.9 158.1 88.3 158.9 86.7 C 159.7 85.2 162.8 83.2 163.6 82.0 C 164.4 80.7 165.5 79.4 163.6 79.3 C 161.8 79.2 155.9 79.9 152.5 81.4 C 149.1 82.9 144.6 86.5 143.0 88.3 C 141.3 90.2 141.5 90.1 142.4 92.6 C 143.4 95.1 149.0 101.2 148.8 103.2 C 148.6 105.1 143.3 103.7 141.4 104.2 C 139.4 104.8 139.5 103.5 137.1 106.4 C 134.7 109.2 130.0 117.4 127.0 121.2 C 124.1 125.0 123.1 126.6 119.6 129.2 C 116.2 131.7 109.4 134.6 106.4 136.6 C 103.4 138.5 102.7 139.2 101.6 140.8 C 100.4 142.5 99.9 143.2 99.5 146.7 C 99.0 150.1 99.6 156.8 98.9 161.5 C 98.2 166.2 96.5 171.4 95.2 174.8 C 94.0 178.1 93.3 179.6 91.5 181.7 C 89.7 183.7 86.4 186.3 84.6 187.0 C 82.9 187.7 82.5 187.3 80.9 185.9 C 79.3 184.5 78.3 184.1 75.1 178.5 C 71.9 172.8 65.3 159.5 61.8 152.0 C 58.4 144.5 56.1 139.7 54.4 133.4 C 52.7 127.1 52.4 117.7 51.7 114.3 C 51.1 111.0 52.9 111.8 50.7 113.3 C 48.5 114.7 41.5 121.2 38.5 122.8 C 35.5 124.4 34.2 123.1 32.7 122.8 C 31.1 122.5 30.8 122.6 28.9 121.2 C 27.1 119.8 21.2 116.0 21.5 114.3 C 21.9 112.6 28.9 112.2 31.1 111.1 C 33.3 110.1 33.7 109.3 34.8 108.0 C 35.8 106.6 39.1 104.2 37.4 103.2 C 35.7 102.2 27.5 102.7 24.7 102.1 C 21.9 101.6 22.5 101.9 20.5 100.0 C 18.4 98.1 13.6 92.9 12.5 91.0 C 11.4 89.0 12.6 89.1 13.6 88.3 C 14.5 87.5 14.7 86.9 18.3 86.2 C 22.0 85.5 32.2 84.7 35.3 84.1 C 38.4 83.5 37.1 84.1 36.9 82.5 C 36.7 80.9 34.5 76.8 34.2 74.5 C 34.0 72.3 34.7 70.6 35.3 69.2 C 35.9 67.9 37.1 67.0 38.0 66.6 C 38.8 66.1 39.3 66.1 40.6 66.6 C 41.9 67.1 41.5 73.8 45.9 69.8 C 50.3 65.8 63.9 47.9 67.1 42.7 C 70.4 37.6 67.1 40.5 65.5 39.0 C 63.9 37.5 58.5 35.9 57.6 33.7 C 56.6 31.5 60.8 28.2 59.7 25.8 C 58.6 23.3 52.4 20.6 51.2 18.9 C 50.1 17.1 51.5 16.1 52.8 15.2 C 54.1 14.2 56.5 13.2 59.2 13.0 Z" stroke="#22C55E" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </span>
                </h3>
              ) : activeIndex === 6 ? (
                // State 7: "We don't sell your data" with protective shield badge
                <h3 className="font-sans font-black text-[19px] min-[360px]:text-[20px] min-[390px]:text-[22px] sm:text-[24px] tracking-[-0.035em] text-neutral-950 leading-tight whitespace-nowrap mb-2.5 sm:mb-3">
                  <span className="text-neutral-950">We don&apos;t&nbsp;</span>
                  <span className="relative inline-flex items-center justify-center align-middle h-[1.35em]">
                    <span className="inline-flex items-baseline text-[#22C55E]">
                      {SELL_LETTERS.map((char, cIdx) => (
                        <span key={cIdx} ref={(el) => { sellCharRefs.current[cIdx] = el; }} className="inline-block">{char}</span>
                      ))}
                    </span>
                    <span ref={sellShieldWrapperRef} className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ opacity: 0 }}>
                      <svg ref={sellShieldIconRef} viewBox="0 0 100 100" className="w-[2.2em] h-[2.2em] overflow-visible drop-shadow-[0_4px_16px_rgba(34,197,94,0.4)]" fill="none">
                        <path d="M 26 13 L 74 13 C 78 13 83 17 85 22 C 86.5 25 86 48 86 52 C 86 68 70 82 50 89 C 30 82 14 68 14 52 C 14 48 13.5 25 15 22 C 17 17 22 13 26 13 Z" fill="rgba(34, 197, 94, 0.12)" stroke="#22C55E" strokeWidth="3.2" strokeLinejoin="round" />
                        <circle cx="50" cy="49" r="16" fill="rgba(34, 197, 94, 0.16)" stroke="#22C55E" strokeWidth="2.4" />
                        <path d="M 50.0 39.0 L 52.8 45.4 L 59.8 45.8 L 54.3 50.2 L 56.1 57.0 L 50.0 53.2 L 43.9 57.0 L 45.7 50.2 L 40.2 45.8 L 47.2 45.4 Z" fill="#22C55E" />
                      </svg>
                    </span>
                  </span>
                  <span className="text-neutral-950">&nbsp;your data</span>
                </h3>
              ) : (
                <h3 className="font-sans font-black text-[23px] min-[390px]:text-[25px] sm:text-[27px] tracking-[-0.035em] text-neutral-950 leading-[1.2] mb-1.5">
                  {currentState.headline}
                </h3>
              )}
              <div className="font-sans text-[14px] min-[390px]:text-[14.5px] sm:text-[15.5px] text-neutral-700 font-medium leading-[1.44] mt-1">
                {currentState.body}
              </div>
            </div>
          ) : (
            // State 8: Closing baseline statement
            <div>
              <h3 className="font-sans font-black text-[23px] min-[390px]:text-[25px] sm:text-[27px] tracking-[-0.035em] text-neutral-950 leading-[1.2] mb-1">
                {CLOSING_BLACK_WORDS.join(" ")}
              </h3>
              <h3 className="font-sans font-black text-[23px] min-[390px]:text-[25px] sm:text-[27px] tracking-[-0.035em] text-[#22C55E] leading-[1.2]">
                {CLOSING_GREEN_WORDS.join(" ")}
              </h3>
              <p className="font-sans text-[14.5px] min-[390px]:text-[15.5px] sm:text-[16px] text-neutral-700 font-medium leading-[1.45] mt-1.5">
                Everything we design begins and ends with protecting your household wealth.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 3. External Navigation Controls: same dock as the product carousel (arrows + indicator pills) */}
      <div className="flex items-center justify-center gap-3 mt-4 px-4">
        <button
          type="button"
          onClick={prevState}
          aria-label="Previous security state"
          className="w-8 h-8 rounded-full bg-white/80 border border-black/[0.08] flex items-center justify-center text-neutral-700 shadow-sm hover:bg-white active:scale-95 transition-all"
        >
          <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Indicator pills, one per state */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 backdrop-blur-md border border-black/[0.06] shadow-sm">
          {Array.from({ length: STATES_COUNT }).map((_, idx) => {
            const isActive = activeIndex === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => goToState(idx)}
                aria-label={`Go to security state ${idx + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  isActive
                    ? "w-7 bg-[#22C55E] shadow-[0_0_8px_rgba(34,197,94,0.45)]"
                    : "w-2 bg-neutral-300 hover:bg-neutral-400"
                }`}
              />
            );
          })}
        </div>

        <button
          type="button"
          onClick={nextState}
          aria-label="Next security state"
          className="w-8 h-8 rounded-full bg-white/80 border border-black/[0.08] flex items-center justify-center text-neutral-700 shadow-sm hover:bg-white active:scale-95 transition-all"
        >
          <ChevronRight className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
}
