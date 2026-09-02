"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Mail } from "lucide-react";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion, smoothScrollTo } from "@/lib/gsap";

export function BlueprintFooter() {
  const containerRef = useRef<HTMLElement | null>(null);
  const ctaContentRef = useRef<HTMLDivElement | null>(null);
  const orbitalArtRef = useRef<HTMLDivElement | null>(null);
  const footerGridRef = useRef<HTMLDivElement | null>(null);
  const bottomBarRef = useRef<HTMLDivElement | null>(null);

  const handleAnchorClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    if (!href.startsWith("#")) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    smoothScrollTo(href);
  };

  useGSAP(
    () => {
      if (prefersReducedMotion() || !containerRef.current) return;

      // Scroll-triggered reveal animation for the CTA section
      if (ctaContentRef.current && orbitalArtRef.current) {
        gsap.fromTo(
          ctaContentRef.current,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 1.3,
            ease: "power2.out",
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top 80%",
            },
          }
        );

        gsap.fromTo(
          orbitalArtRef.current,
          { opacity: 0, scale: 0.95 },
          {
            opacity: 1,
            scale: 1,
            duration: 1.5,
            ease: "power2.out",
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top 80%",
            },
          }
        );

        // Subtle ambient continuous breathing on the wireframe aperture core
        gsap.to(".footer-aperture-ring", {
          rotation: 360,
          transformOrigin: "center center",
          duration: 180,
          repeat: -1,
          ease: "none",
        });

        gsap.to(".footer-pulse-dot", {
          scale: 1.25,
          opacity: 0.9,
          duration: 3.5,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          stagger: 0.5,
        });
      }

      // Scroll-triggered reveal for footer navigation & bottom bar
      if (footerGridRef.current) {
        gsap.fromTo(
          footerGridRef.current,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 1.1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: footerGridRef.current,
              start: "top 90%",
            },
          }
        );
      }

      if (bottomBarRef.current) {
        gsap.fromTo(
          bottomBarRef.current,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.9,
            ease: "power2.out",
            scrollTrigger: {
              trigger: bottomBarRef.current,
              start: "top 96%",
            },
          }
        );
      }
    },
    { scope: containerRef }
  );

  return (
    <footer
      id="site-footer"
      ref={containerRef}
      className="relative w-full bg-[#020403] text-[#FAF8F5] select-none overflow-hidden"
    >
      {/* Seamless Top Blend from Contact */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#030604] to-transparent z-10" />

      {/* =========================================================================
          UPPER PORTION: CINEMATIC MONUMENTAL CTA SECTION
         ========================================================================= */}
      <div className="relative w-full min-h-[520px] sm:min-h-[580px] lg:min-h-[640px] flex items-center px-6 sm:px-12 lg:px-20 py-20 sm:py-28 overflow-hidden">
        
        {/* Subtle Ambient Radial Lighting */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(34,197,94,0.06)_0%,transparent_60%)] z-0" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(74,222,128,0.03)_0%,transparent_50%)] z-0" />

        {/* =========================================================================
            RIGHT SIDE: RESTRAINED APERTURE / ORBITAL WIREFRAME ARTWORK
           ========================================================================= */}
        <div
          ref={orbitalArtRef}
          className="pointer-events-none absolute top-1/2 right-[-10%] sm:right-[0%] lg:right-[4%] -translate-y-1/2 w-[520px] sm:w-[700px] md:w-[840px] lg:w-[960px] h-[520px] sm:h-[700px] md:h-[840px] lg:h-[960px] z-0 overflow-visible opacity-90"
        >
          <svg
            viewBox="0 0 900 900"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            <defs>
              {/* Soft Atmospheric Haze */}
              <radialGradient id="footerApertureGlow" cx="450" cy="450" r="300" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#22C55E" stopOpacity="0.22" />
                <stop offset="45%" stopColor="#15803D" stopOpacity="0.08" />
                <stop offset="75%" stopColor="#041409" stopOpacity="0.02" />
                <stop offset="100%" stopColor="#020403" stopOpacity="0" />
              </radialGradient>

              {/* Rim Light Blur Filter */}
              <filter id="apertureRimGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="12" result="blurWide" />
                <feGaussianBlur stdDeviation="4" result="blurMid" />
                <feMerge>
                  <feMergeNode in="blurWide" />
                  <feMergeNode in="blurMid" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Core Atmospheric Glow */}
            <circle cx="450" cy="450" r="260" fill="url(#footerApertureGlow)" />

            {/* Concentric / Intersecting Delicate Orbital Ellipse Trajectories with slow rotation */}
            <g className="footer-aperture-ring" style={{ transformOrigin: "450px 450px" }}>
              <ellipse cx="450" cy="450" rx="380" ry="240" stroke="#4ADE80" strokeWidth="0.5" strokeOpacity="0.15" transform="rotate(-15 450 450)" />
              <ellipse cx="450" cy="450" rx="350" ry="210" stroke="#4ADE80" strokeWidth="0.6" strokeOpacity="0.2" transform="rotate(10 450 450)" />
              <ellipse cx="450" cy="450" rx="300" ry="170" stroke="#4ADE80" strokeWidth="0.75" strokeOpacity="0.28" transform="rotate(-30 450 450)" />
              <ellipse cx="450" cy="450" rx="260" ry="140" stroke="#4ADE80" strokeWidth="0.8" strokeOpacity="0.32" transform="rotate(25 450 450)" strokeDasharray="3 6" />
              <ellipse cx="450" cy="450" rx="220" ry="110" stroke="#4ADE80" strokeWidth="0.9" strokeOpacity="0.35" transform="rotate(-8 450 450)" />
              <ellipse cx="450" cy="450" rx="180" ry="90" stroke="#4ADE80" strokeWidth="0.7" strokeOpacity="0.25" transform="rotate(40 450 450)" strokeDasharray="4 8" />
            </g>

            {/* Primary Glowing Neon Green Focal Ring */}
            <circle
              cx="450"
              cy="450"
              r="135"
              stroke="#22C55E"
              strokeWidth="4"
              strokeOpacity="0.4"
              filter="url(#apertureRimGlow)"
            />
            <circle
              cx="450"
              cy="450"
              r="135"
              stroke="#86EFAC"
              strokeWidth="1.6"
              strokeOpacity="0.85"
            />

            {/* Fine Stippled Particles & Nodes along Orbital Intersections */}
            <circle className="footer-pulse-dot" cx="340" cy="380" r="2.5" fill="#86EFAC" filter="drop-shadow(0 0 6px #4ADE80)" />
            <circle cx="340" cy="380" r="1.2" fill="#FFFFFF" />

            <circle className="footer-pulse-dot" cx="560" cy="390" r="3" fill="#86EFAC" filter="drop-shadow(0 0 7px #4ADE80)" />
            <circle cx="560" cy="390" r="1.5" fill="#FFFFFF" />

            <circle className="footer-pulse-dot" cx="490" cy="580" r="2.8" fill="#4ADE80" filter="drop-shadow(0 0 6px #4ADE80)" />
            <circle cx="490" cy="580" r="1.3" fill="#FFFFFF" />

            <circle className="footer-pulse-dot" cx="280" cy="490" r="2.2" fill="#86EFAC" filter="drop-shadow(0 0 5px #4ADE80)" />
            <circle className="footer-pulse-dot" cx="630" cy="470" r="2.6" fill="#86EFAC" filter="drop-shadow(0 0 6px #4ADE80)" />
          </svg>
        </div>

        {/* =========================================================================
            LEFT SIDE: CTA HEADLINE, COPY & REQUEST ACCESS BUTTON
           ========================================================================= */}
        <div
          ref={ctaContentRef}
          className="relative z-10 max-w-7xl mx-auto w-full flex flex-col justify-center items-start space-y-6 sm:space-y-8"
        >
          {/* Eyebrow with Luminous Green Indicator Dot */}
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#4ADE80] shadow-[0_0_8px_#4ADE80]" />
            <span className="font-mono text-xs sm:text-sm text-[#4ADE80] uppercase tracking-[0.25em] font-semibold">
              READY FOR A
            </span>
          </div>

          {/* Monumental Headline */}
          <h2 className="font-sans font-light text-5xl sm:text-6xl md:text-7xl lg:text-[84px] text-white tracking-tight leading-[0.95] uppercase">
            CLEARER VIEW?
          </h2>

          {/* Supporting Copy */}
          <p className="font-sans font-light text-lg sm:text-xl md:text-2xl text-[#8E9B91] leading-snug max-w-md">
            Let’s bring your finances <br />
            into focus.
          </p>

          {/* Request Access Button */}
          <div className="pt-2">
            <Link
              href="#contact"
              onClick={(e) => handleAnchorClick(e, "#contact")}
              className="group inline-flex items-center gap-3 rounded-2xl border border-[#4ADE80]/50 bg-[#07130c]/90 px-8 sm:px-10 py-4 sm:py-4.5 font-mono text-xs sm:text-sm font-semibold text-[#4ADE80] uppercase tracking-[0.22em] shadow-[0_0_30px_rgba(74,222,128,0.12)] hover:bg-[#102a1b] hover:border-[#4ADE80] hover:text-[#86EFAC] hover:shadow-[0_0_40px_rgba(74,222,128,0.25)] transition-all duration-300 active:scale-[0.98]"
            >
              <span>REQUEST ACCESS</span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
        </div>

      </div>

      {/* =========================================================================
          LOWER PORTION: FOOTER NAVIGATION & BRANDING GRID
         ========================================================================= */}
      <div className="relative z-10 border-t border-white/[0.06] bg-[#020403] px-6 sm:px-12 lg:px-20 py-16 sm:py-20">
        <div
          ref={footerGridRef}
          className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 sm:gap-16 items-start"
        >
          {/* Column 1 (Left): Logo Glyph + Logotype + Tagline */}
          <div className="md:col-span-5 space-y-4">
            <Link
              href="#hero"
              onClick={(e) => handleAnchorClick(e, "#hero")}
              className="inline-flex items-center group transition-transform duration-300 hover:opacity-95"
            >
              <Image
                src="/Logo/unifolio-wordmark-white.png"
                alt="Unifolio"
                width={145}
                height={33}
                className="h-7 sm:h-8 w-auto object-contain select-none transition-transform duration-300 group-hover:scale-[1.02]"
              />
            </Link>

            <p className="font-sans text-sm text-[#8E9B91] font-normal leading-relaxed">
              One view. Complete clarity.
            </p>
          </div>

          {/* Column 2 (Center): Navigation Links */}
          <div className="md:col-span-3 space-y-3.5 font-mono text-xs tracking-[0.25em] text-[#8E9B91] uppercase">
            <div>
              <Link href="#hero" onClick={(e) => handleAnchorClick(e, "#hero")} className="hover:text-white transition-colors">
                HOME
              </Link>
            </div>
            <div>
              <Link href="#statement" onClick={(e) => handleAnchorClick(e, "#statement")} className="hover:text-white transition-colors">
                PRODUCT
              </Link>
            </div>
            <div>
              <Link href="#offerings" onClick={(e) => handleAnchorClick(e, "#offerings")} className="hover:text-white transition-colors">
                OFFERINGS
              </Link>
            </div>
            <div>
              <Link href="#about" onClick={(e) => handleAnchorClick(e, "#about")} className="hover:text-white transition-colors">
                ABOUT
              </Link>
            </div>
            <div>
              <Link href="#contact" onClick={(e) => handleAnchorClick(e, "#contact")} className="hover:text-white transition-colors">
                CONTACT
              </Link>
            </div>
          </div>

          {/* Column 3 (Right): Contact Header, Email Row & Social Outlined Buttons */}
          <div className="md:col-span-4 space-y-6">
            {/* Contact Header */}
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] shadow-[0_0_6px_#4ADE80]" />
              <span className="font-mono text-xs text-[#4ADE80] uppercase tracking-[0.25em] font-semibold">
                CONTACT
              </span>
            </div>

            {/* Email Row */}
            <div className="flex items-center gap-3.5 group">
              <div className="w-9 h-9 rounded-full border border-white/15 bg-white/[0.03] flex items-center justify-center text-[#4ADE80] group-hover:border-[#4ADE80] group-hover:bg-[#122418] transition-all duration-300">
                <Mail className="w-4 h-4" />
              </div>
              <a
                href="mailto:hello@unifolio.in"
                className="font-sans text-sm font-medium text-[#FAF8F5] group-hover:text-[#4ADE80] transition-colors"
              >
                hello@unifolio.in
              </a>
            </div>

            {/* Divider */}
            <div className="w-full h-[1px] bg-white/[0.06]" />

            {/* Social Outlined Circular Icons */}
            <div className="flex items-center gap-3">
              {/* Instagram */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full border border-white/15 bg-white/[0.03] flex items-center justify-center text-[#4ADE80] hover:border-[#4ADE80] hover:bg-[#122418] hover:scale-105 transition-all duration-300"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
              </a>
              {/* LinkedIn */}
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="w-9 h-9 rounded-full border border-white/15 bg-white/[0.03] flex items-center justify-center text-[#4ADE80] hover:border-[#4ADE80] hover:bg-[#122418] hover:scale-105 transition-all duration-300"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                  <rect width="4" height="12" x="2" y="9"/>
                  <circle cx="4" cy="4" r="2"/>
                </svg>
              </a>
              {/* Twitter / X */}
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Twitter / X"
                className="w-9 h-9 rounded-full border border-white/15 bg-white/[0.03] flex items-center justify-center text-[#4ADE80] hover:border-[#4ADE80] hover:bg-[#122418] hover:scale-105 transition-all duration-300"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* =========================================================================
          BOTTOM BAR: COPYRIGHT, PRIVACY & TERMS
         ========================================================================= */}
      <div
        ref={bottomBarRef}
        className="relative z-10 border-t border-white/[0.06] bg-[#010302] px-6 sm:px-12 lg:px-20 py-6"
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-[#8E9B91]/80 tracking-wider">
          <div>
            © 2026 UNIFOLIO. All rights reserved.
          </div>

          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">
              PRIVACY POLICY
            </Link>
            <span className="text-white/20">|</span>
            <Link href="/terms" className="hover:text-white transition-colors">
              TERMS OF SERVICE
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
