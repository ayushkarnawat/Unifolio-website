"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";

interface SecurityPrinciple {
  id: string;
  title: string;
  body: string;
}

const PRINCIPLES: SecurityPrinciple[] = [
  {
    id: "read-only",
    title: "Read-only, always",
    body: "Unifolio can see your accounts. It can never move your money.",
  },
  {
    id: "no-passwords",
    title: "We never see your passwords",
    body: "Your bank login stays with your bank. We connect through India's RBI-regulated Account Aggregator framework, so your credentials never reach us, by design.",
  },
  {
    id: "encryption",
    title: "Locked down, everywhere",
    body: "Your data is encrypted with AES-256 at rest and TLS in transit, the same standard banks use.",
  },
  {
    id: "user-control",
    title: "You control the connection",
    body: "Every account you link is approved by you and revocable anytime. Revoke it, and data sharing stops instantly.",
  },
  {
    id: "india-stored",
    title: "Stored in India",
    body: "Your data stays on secure infrastructure based in India, meeting RBI's data localization requirements.",
  },
  {
    id: "no-sell",
    title: "We don't sell your data",
    body: "It's used only to show you your own financial picture, never sold, never used for advertising, only ever with your consent, in line with India's DPDP Act.",
  },
];

export function SecurityExperience() {
  const containerRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const heroRef = useRef<HTMLDivElement | null>(null);
  const principleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const closingRef = useRef<HTMLDivElement | null>(null);
  const zoomPortalRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      const container = containerRef.current;
      const stage = stageRef.current;
      const hero = heroRef.current;
      const closing = closingRef.current;
      const zoomPortal = zoomPortalRef.current;
      const principles = principleRefs.current.filter(Boolean) as HTMLDivElement[];

      if (!container || !stage || !hero || !closing || !zoomPortal) return;

      // Master ScrollTrigger timeline pinning the stage
      // End at "bottom top" so that as soon as the zoom finishes at 1.00,
      // the scroll has arrived directly at the top of About Us (#about) with zero gap!
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: "bottom top",
          pin: stage,
          scrub: 1.3,
          anticipatePin: 1,
        },
      });

      // Initial positions: All elements share the exact same central focal anchor
      gsap.set(hero, {
        opacity: 1,
        scale: 1,
        yPercent: 0,
        xPercent: 0,
        force3D: true,
      });

      principles.forEach((el) => {
        gsap.set(el, {
          opacity: 0,
          scale: 0.96,
          yPercent: 6,
          xPercent: 0,
          force3D: true,
        });
      });

      gsap.set(closing, {
        opacity: 0,
        scale: 0.96,
        yPercent: 6,
        xPercent: 0,
        force3D: true,
      });

      gsap.set(zoomPortal, {
        scale: 1,
        opacity: 1,
        transformOrigin: "center center",
        force3D: true,
      });

      gsap.set(stage, {
        opacity: 1,
        force3D: true,
      });

      // -------------------------------------------------------------------------
      // SMOOTH, CENTERED SEQUENCE CHOREOGRAPHY
      // Each statement rests firmly in dead-center during its dwell phase.
      // Transitions use gentle power1.inOut cross-fades with subtle vertical momentum.
      // -------------------------------------------------------------------------

      // 1. Transition: Hero -> Principle 0 (0.07 to 0.12)
      tl.to(
        hero,
        {
          opacity: 0,
          scale: 0.96,
          yPercent: -6,
          duration: 0.05,
          ease: "power1.inOut",
        },
        0.07
      );

      tl.fromTo(
        principles[0],
        { opacity: 0, scale: 0.96, yPercent: 6 },
        {
          opacity: 1,
          scale: 1,
          yPercent: 0,
          duration: 0.05,
          ease: "power1.inOut",
        },
        0.07
      );

      // 2. Principle transitions (0 -> 1, 1 -> 2, 2 -> 3, 3 -> 4, 4 -> 5)
      const STAGES = [
        { time: 0.19, from: 0, to: 1 },
        { time: 0.31, from: 1, to: 2 },
        { time: 0.43, from: 2, to: 3 },
        { time: 0.55, from: 3, to: 4 },
        { time: 0.67, from: 4, to: 5 },
      ];

      STAGES.forEach(({ time, from, to }) => {
        // Outgoing: Softly recedes upward into negative space
        tl.to(
          principles[from],
          {
            opacity: 0,
            scale: 0.96,
            yPercent: -6,
            duration: 0.05,
            ease: "power1.inOut",
          },
          time
        );

        // Incoming: Softly rises into the exact same central focal anchor
        tl.fromTo(
          principles[to],
          { opacity: 0, scale: 0.96, yPercent: 6 },
          {
            opacity: 1,
            scale: 1,
            yPercent: 0,
            duration: 0.05,
            ease: "power1.inOut",
          },
          time
        );
      });

      // 3. Transition: Principle 5 -> Closing Statement (0.79 to 0.84)
      tl.to(
        principles[5],
        {
          opacity: 0,
          scale: 0.96,
          yPercent: -6,
          duration: 0.05,
          ease: "power1.inOut",
        },
        0.79
      );

      tl.fromTo(
        closing,
        { opacity: 0, scale: 0.96, yPercent: 6 },
        {
          opacity: 1,
          scale: 1,
          yPercent: 0,
          duration: 0.05,
          ease: "power1.inOut",
        },
        0.79
      );

      // 4. Cinematic Ending Zoom Transition directly into About Us (0.91 to 1.00)
      // The closing statement scales forward dramatically while dissolving,
      // and the stage dissolves into transparency right as the unpin brings About Us to top: 0!
      tl.to(
        zoomPortal,
        {
          scale: 4.2,
          opacity: 0,
          duration: 0.09,
          ease: "power2.in",
        },
        0.91
      );

      tl.to(
        stage,
        {
          opacity: 0,
          duration: 0.06,
          ease: "power1.in",
        },
        0.94
      );

      // Explicit timeline duration anchor at exactly 1.00
      tl.to({}, { duration: 0.01 }, 1.0);
    },
    { scope: containerRef }
  );

  return (
    <section
      id="security"
      ref={containerRef}
      className="relative w-full bg-[#FAF8F5] dark:bg-[#000000] select-none transition-colors duration-500 overflow-hidden"
      style={{ height: "700vh" }}
    >
      {/* Anchor for direct jump */}
      <div id="security-top" className="absolute top-0 pointer-events-none" />

      {/* Pinned Viewport Stage */}
      <div
        ref={stageRef}
        className="relative h-screen w-full overflow-hidden flex items-center justify-center bg-[#FAF8F5] dark:bg-[#000000] transition-colors duration-500"
      >
        {/* Subtle Architectural Reference Lines — Continuity with Product & About Section */}
        <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-gradient-to-r from-transparent via-black/[0.03] dark:via-white/[0.04] to-transparent z-0" />
        <div className="pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1px] bg-gradient-to-b from-transparent via-black/[0.02] dark:via-white/[0.03] to-transparent z-0" />

        {/* Ambient emerald radial glow matching Unifolio atmosphere */}
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] rounded-full bg-[#22C55E]/[0.025] dark:bg-[#22C55E]/[0.035] blur-[120px] z-0" />

        {/* ZOOM PORTAL: Wraps the spatial storytelling elements for the cinematic ending zoom */}
        <div
          ref={zoomPortalRef}
          className="relative w-full h-full flex items-center justify-center pointer-events-none z-10 will-change-transform"
        >
          {/* =========================================================================
              HERO / OPENING STATEMENT — CENTERED
             ========================================================================= */}
          <div
            ref={heroRef}
            className="absolute inset-0 flex flex-col items-center justify-center px-6 sm:px-12 lg:px-20 max-w-5xl mx-auto text-center will-change-transform z-20 pointer-events-none"
          >
            <div className="max-w-4xl mx-auto flex flex-col items-center">
              <h2 className="font-sans font-black text-3xl sm:text-5xl lg:text-[62px] text-[#111613] dark:text-white tracking-[-0.035em] uppercase leading-[0.98]">
                We take your data <br />
                <span className="text-[#22C55E]">as seriously as you</span> <br />
                take your money.
              </h2>
            </div>
          </div>

          {/* =========================================================================
              THE 6 PRINCIPLES: CENTERED SPATIAL TYPOGRAPHY
              (All statements share the exact same central focal anchor as the opening text)
             ========================================================================= */}
          {PRINCIPLES.map((principle, idx) => (
            <div
              key={principle.id}
              ref={(el) => {
                principleRefs.current[idx] = el;
              }}
              className="absolute inset-0 flex flex-col items-center justify-center px-6 sm:px-12 lg:px-20 max-w-5xl mx-auto text-center will-change-transform z-20 pointer-events-none"
            >
              <div className="max-w-4xl mx-auto flex flex-col items-center text-center -translate-y-8 sm:-translate-y-12">
                {/* Primary Headline: Centered, Large, Sculptural */}
                <h3 className="font-sans font-black text-3xl sm:text-5xl lg:text-[56px] text-[#111613] dark:text-white tracking-[-0.035em] uppercase leading-[1.0] mb-5">
                  {principle.title}
                </h3>

                {/* High-Readability Editorial Body: Centered */}
                <p className="font-sans text-base sm:text-xl lg:text-2xl text-[#5A685D] dark:text-[#8E9B91] font-light leading-relaxed max-w-2xl mx-auto">
                  {principle.body}
                </p>
              </div>
            </div>
          ))}

          {/* =========================================================================
              CLOSING LINE: CENTERED BASELINE RESOLUTION
             ========================================================================= */}
          <div
            ref={closingRef}
            className="absolute inset-0 flex flex-col items-center justify-center px-6 sm:px-12 lg:px-20 max-w-5xl mx-auto text-center will-change-transform z-20 pointer-events-none"
          >
            <div className="max-w-4xl mx-auto flex flex-col items-center text-center -translate-y-8 sm:-translate-y-12">
              <h3 className="font-sans font-black text-3xl sm:text-5xl lg:text-[62px] text-[#111613] dark:text-white tracking-[-0.035em] uppercase leading-[0.98]">
                Security isn&apos;t a feature here. <br />
                <span className="text-[#22C55E]">
                  It&apos;s the baseline everything else is built on.
                </span>
              </h3>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
