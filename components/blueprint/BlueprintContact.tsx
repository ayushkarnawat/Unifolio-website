"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Mail, ArrowRight, ArrowLeft, X, Check, Sparkles, ChevronRight } from "lucide-react";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion, smoothScrollTo } from "@/lib/gsap";
import { Button } from "@/components/ui/Button";

interface FormData {
  name: string;
  organization: string;
  focusArea: string;
  primaryGoal: string;
  email: string;
}

const FOCUS_PILLS = [
  "CAS & CAMS Direct Import",
  "Hidden Fee Dissection",
  "Portfolio Sovereign Intelligence",
  "Institutional Demo",
];

const GOAL_PILLS = [
  "Audit Portfolio Costs",
  "Unify Multi-Broker Accounts",
  "Family Office Clarity",
  "Direct Wealth Migration",
];

export function BlueprintContact() {
  const containerRef = useRef<HTMLElement | null>(null);
  const introViewRef = useRef<HTMLDivElement | null>(null);
  const interactiveViewRef = useRef<HTMLDivElement | null>(null);
  const stepContainerRef = useRef<HTMLDivElement | null>(null);
  const orbLayerRef = useRef<HTMLDivElement | null>(null);
  const parallaxBgRef = useRef<HTMLDivElement | null>(null);
  const cursorGlowRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const inputMagneticRef = useRef<HTMLDivElement | null>(null);
  const nextBtnRef = useRef<HTMLButtonElement | null>(null);

  const [mode, setMode] = useState<"intro" | "interactive" | "completed">("intro");
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [inputFocused, setInputFocused] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    organization: "",
    focusArea: "",
    primaryGoal: "",
    email: "",
  });

  const totalSteps = 5;

  // Validation to conditionally reveal the next button
  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return formData.name.trim().length > 0;
      case 1:
        return formData.organization.trim().length > 0;
      case 2:
        return formData.focusArea.trim().length > 0;
      case 3:
        return formData.primaryGoal.trim().length > 0;
      case 4:
        return formData.email.trim().length > 0;
      default:
        return false;
    }
  };

  const handleAnchorClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    if (!href.startsWith("#")) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (href === "#hero") {
      window.dispatchEvent(new CustomEvent("unifolio-reset-hero"));
    }
    smoothScrollTo(href);
  };

  // Auto-focus input on step change
  useEffect(() => {
    if (mode === "interactive") {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [currentStep, mode]);

  // Initial scroll entrance animation for Intro View
  useGSAP(
    () => {
      if (prefersReducedMotion() || !containerRef.current) return;

      gsap.from(".contact-hero-left", {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 75%",
        },
        y: 35,
        opacity: 0,
        duration: 1.2,
        ease: "power2.out",
      });

      gsap.from(".contact-hero-right", {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 75%",
        },
        y: 35,
        opacity: 0,
        duration: 1.2,
        delay: 0.15,
        ease: "power2.out",
      });

      gsap.from(".contact-footer-bar", {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 65%",
        },
        opacity: 0,
        duration: 1.2,
        delay: 0.3,
        ease: "power2.out",
      });
    },
    { scope: containerRef }
  );

  // Subtle ambient cursor glow & background parallax tracking
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (prefersReducedMotion() || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 1. Smooth ambient cursor radial glow tracking
    if (cursorGlowRef.current) {
      gsap.to(cursorGlowRef.current, {
        x: x - 170,
        y: y - 170,
        opacity: 0.85,
        duration: 0.7,
        ease: "power2.out",
        overwrite: "auto",
      });
    }

    // 2. Subtle background parallax response
    if (parallaxBgRef.current) {
      const normX = (x / rect.width - 0.5) * 2;
      const normY = (y / rect.height - 0.5) * 2;

      gsap.to(parallaxBgRef.current, {
        x: normX * 14,
        y: normY * 10,
        duration: 1.2,
        ease: "power2.out",
        overwrite: "auto",
      });
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (cursorGlowRef.current) {
      gsap.to(cursorGlowRef.current, {
        opacity: 0,
        duration: 0.8,
        ease: "power2.out",
      });
    }
    if (parallaxBgRef.current) {
      gsap.to(parallaxBgRef.current, {
        x: 0,
        y: 0,
        duration: 1.4,
        ease: "power2.out",
      });
    }
  }, []);

  // Magnetic interaction for input capsule
  const handleInputMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion() || !inputMagneticRef.current) return;
    const rect = inputMagneticRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    gsap.to(inputMagneticRef.current, {
      x: x * 0.05,
      y: y * 0.05,
      duration: 0.4,
      ease: "power2.out",
      overwrite: "auto",
    });
  }, []);

  const handleInputMouseLeave = useCallback(() => {
    if (!inputMagneticRef.current) return;
    gsap.to(inputMagneticRef.current, {
      x: 0,
      y: 0,
      duration: 0.6,
      ease: "power3.out",
    });
  }, []);

  // Magnetic interaction for refined continue button
  const handleBtnMouseMove = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (prefersReducedMotion() || !nextBtnRef.current) return;
    const rect = nextBtnRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    gsap.to(nextBtnRef.current, {
      x: x * 0.18,
      y: y * 0.18,
      duration: 0.35,
      ease: "power2.out",
      overwrite: "auto",
    });
  }, []);

  const handleBtnMouseLeave = useCallback(() => {
    if (nextBtnRef.current) {
      gsap.to(nextBtnRef.current, {
        x: 0,
        y: 0,
        duration: 0.6,
        ease: "elastic.out(1, 0.4)",
      });
    }
  }, []);

  // Transition from Intro to Interactive Conversational Mode
  const startConversation = useCallback(() => {
    if (prefersReducedMotion()) {
      setMode("interactive");
      setCurrentStep(0);
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        setMode("interactive");
        setCurrentStep(0);
      },
    });

    if (orbLayerRef.current) {
      tl.to(
        orbLayerRef.current,
        {
          scale: 1.4,
          opacity: 0.9,
          duration: 0.8,
          ease: "power3.inOut",
        },
        0
      );
    }

    if (introViewRef.current) {
      tl.to(
        introViewRef.current,
        {
          opacity: 0,
          y: -20,
          scale: 0.98,
          duration: 0.5,
          ease: "power2.inOut",
        },
        0
      );
    }
  }, []);

  // Exit Interactive Mode back to Editorial Intro
  const closeConversation = useCallback(() => {
    if (prefersReducedMotion()) {
      setMode("intro");
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        setMode("intro");
        setCurrentStep(0);
      },
    });

    if (interactiveViewRef.current) {
      tl.to(interactiveViewRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.45,
        ease: "power2.inOut",
      });
    }

    if (orbLayerRef.current) {
      tl.to(
        orbLayerRef.current,
        {
          scale: 1,
          opacity: 0.75,
          duration: 0.8,
          ease: "power3.out",
        },
        0.1
      );
    }
  }, []);

  // Transition between steps
  const goToStep = useCallback(
    (nextStep: number) => {
      if (nextStep < 0 || nextStep >= totalSteps) return;

      if (prefersReducedMotion() || !stepContainerRef.current) {
        setCurrentStep(nextStep);
        return;
      }

      const isForward = nextStep > currentStep;

      gsap.to(stepContainerRef.current, {
        opacity: 0,
        y: isForward ? -24 : 24,
        scale: 0.98,
        duration: 0.3,
        ease: "power2.inOut",
        onComplete: () => {
          setCurrentStep(nextStep);
          gsap.fromTo(
            stepContainerRef.current,
            {
              opacity: 0,
              y: isForward ? 24 : -24,
              scale: 0.98,
            },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.45,
              ease: "power3.out",
            }
          );
        },
      });
    },
    [currentStep]
  );

  const handleNext = () => {
    if (!canProceed()) return;

    if (currentStep < totalSteps - 1) {
      goToStep(currentStep + 1);
    } else {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setMode("completed");
      }, 800);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      goToStep(currentStep - 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (canProceed()) {
        handleNext();
      }
    }
  };

  return (
    <section
      id="contact"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative w-full ${
        mode === "intro"
          ? "min-h-screen flex flex-col justify-between"
          : "min-h-[680px] sm:min-h-[740px] lg:min-h-[820px] py-20 sm:py-28 lg:py-32 px-6 sm:px-12 lg:px-16 xl:px-20 flex items-center justify-center"
      } bg-[#FAF8F5] text-[#111613] select-none overflow-hidden border-t border-black/[0.08]`}
    >
      {/* Seamless Top Blend from FAQ */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#FAF8F5] to-transparent z-20" />

      {/* =========================================================================
          SUBTLE AMBIENT RADIAL CURSOR GLOW (Soft Green Accent at Low Opacity)
         ========================================================================= */}
      <div
        ref={cursorGlowRef}
        className="pointer-events-none absolute w-[340px] h-[340px] rounded-full bg-gradient-to-br from-[#22C55E]/10 via-[#06B6D4]/6 to-transparent blur-[75px] opacity-0 z-0 will-change-transform"
      />

      {/* =========================================================================
          ATMOSPHERIC CELESTIAL ORB & PARALLAX BACKGROUND LAYER
         ========================================================================= */}
      <div
        ref={orbLayerRef}
        className="pointer-events-none absolute inset-0 w-full h-full flex items-center justify-center z-0 transition-all duration-1000 overflow-hidden"
      >
        <div ref={parallaxBgRef} className="absolute inset-0 w-full h-full will-change-transform">
          {/* Large Glowing Planetary Sphere on Left */}
          <div className="absolute -left-[18%] sm:-left-[12%] lg:-left-[8%] top-[15%] sm:top-[12%] lg:top-[10%] w-[520px] sm:w-[720px] md:w-[880px] lg:w-[1020px] h-[520px] sm:h-[720px] md:h-[880px] lg:h-[1020px] rounded-full bg-gradient-to-br from-[#06B6D4]/30 via-[#22C55E]/20 to-transparent blur-[110px] sm:blur-[140px] opacity-75 animate-pulse will-change-transform" />

          {/* Secondary Deep Atmospheric Orbs on Right & Center */}
          <div className="absolute right-[-10%] top-[20%] w-[580px] h-[580px] rounded-full bg-[#22C55E]/10 blur-[130px] opacity-50" />
          <div className="absolute right-[15%] bottom-[10%] w-[480px] h-[480px] rounded-full bg-[#06B6D4]/10 blur-[120px] opacity-40" />

          {/* Fine Star Dust & Micro Particle Flecks */}
          <div className="absolute inset-0 bg-[radial-gradient(rgba(0,0,0,0.06)_1px,transparent_1px)] [background-size:48px_48px] opacity-30" />
        </div>
      </div>

      {/* =========================================================================
          STATE A: UNIFIED FULL-SCREEN CLOSING EXPERIENCE
         ========================================================================= */}
      {mode === "intro" && (
        <div
          ref={introViewRef}
          className="relative z-10 w-full flex-1 flex flex-col justify-between px-6 sm:px-12 lg:px-20 xl:px-24 pt-24 sm:pt-28 lg:pt-32 pb-8 sm:pb-10 max-w-[1520px] mx-auto"
        >
          {/* Main Visual Center Stage */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 xl:gap-24 items-center my-auto py-8">
            
            {/* Left Column: Oversized Monumental Headline & Interactive CTA */}
            <div className="contact-hero-left lg:col-span-7 space-y-9 sm:space-y-11">
              <div className="space-y-4">
                <h2 className="font-sans font-light md:font-normal text-5xl sm:text-7xl lg:text-[84px] xl:text-[96px] text-[#111613] tracking-tight leading-[0.98]">
                  Ask us anything.
                </h2>

                <p className="font-sans text-sm sm:text-base text-[#5A685D] leading-relaxed max-w-lg font-light pt-2">
                  Have a question about Unifolio, or something else on your mind? Send us a note and we&apos;ll respond personally.
                </p>
              </div>

              {/* Glowing Interactive Physical Iridescent CTA Button */}
              <div className="pt-2">
                <Button
                  type="button"
                  size="lg"
                  variant="primary"
                  onClick={startConversation}
                  className="shadow-[0_4px_30px_rgba(34,197,94,0.18)]"
                >
                  <span>Let’s connect</span>
                  <div className="w-8 h-8 rounded-full bg-[#22C55E] text-black flex items-center justify-center group-hover:translate-x-1 transition-transform">
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </div>
                </Button>
              </div>
            </div>

            {/* Right Column: Clean Structured Editorial Contact Info & Socials */}
            <div className="contact-hero-right lg:col-span-5 space-y-10 sm:space-y-12 lg:pl-6 xl:pl-10">
              
              {/* Email Block */}
              <div className="space-y-2">
                <p className="font-mono text-[11px] text-[#5A685D] uppercase tracking-[0.24em] font-medium">
                  EMAIL
                </p>
                <a
                  href="mailto:support@unifolio.in"
                  className="font-sans text-xl sm:text-2xl text-[#111613] hover:text-[#22C55E] transition-colors duration-200 block"
                >
                  support@unifolio.in
                </a>
              </div>

              {/* Location Block */}
              <div className="space-y-2 pt-2">
                <p className="font-mono text-[11px] text-[#5A685D] uppercase tracking-[0.24em] font-medium">
                  LOCATION
                </p>
                <p className="font-sans text-sm sm:text-base text-[#111613]/90 leading-relaxed">
                  Pune, India
                </p>
              </div>

              {/* Follow Us / Social Links */}
              <div className="space-y-3 pt-2">
                <p className="font-mono text-[11px] text-[#5A685D] uppercase tracking-[0.24em] font-medium">
                  FOLLOW US
                </p>
                <div className="flex items-center gap-5 sm:gap-6">
                  {/* Instagram */}
                  <a
                    href="https://instagram.com/unifolio"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Instagram"
                    className="group relative inline-flex items-center justify-center text-[#111613] hover:text-[#22C55E] transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-110 drop-shadow-none hover:drop-shadow-[0_4px_12px_rgba(34,197,94,0.35)]"
                  >
                    <svg className="w-5 h-5 sm:w-[22px] sm:h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5.5" ry="5.5" />
                      <circle cx="12" cy="12" r="4.2" />
                      <circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" stroke="none" />
                    </svg>
                  </a>

                  {/* Facebook */}
                  <a
                    href="https://facebook.com/unifolio"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Facebook"
                    className="group relative inline-flex items-center justify-center text-[#111613] hover:text-[#22C55E] transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-110 drop-shadow-none hover:drop-shadow-[0_4px_12px_rgba(34,197,94,0.35)]"
                  >
                    <svg className="w-5 h-5 sm:w-[22px] sm:h-[22px]" viewBox="0 0 24 24" fill="currentColor">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"/>
                    </svg>
                  </a>

                  {/* Twitter / X */}
                  <a
                    href="https://twitter.com/unifolio"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Twitter / X"
                    className="group relative inline-flex items-center justify-center text-[#111613] hover:text-[#22C55E] transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-110 drop-shadow-none hover:drop-shadow-[0_4px_12px_rgba(34,197,94,0.35)]"
                  >
                    <svg className="w-5 h-5 sm:w-[22px] sm:h-[22px]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </a>

                  {/* LinkedIn */}
                  <a
                    href="https://linkedin.com/company/unifolio"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="LinkedIn"
                    className="group relative inline-flex items-center justify-center text-[#111613] hover:text-[#22C55E] transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-110 drop-shadow-none hover:drop-shadow-[0_4px_12px_rgba(34,197,94,0.35)]"
                  >
                    <svg className="w-5 h-5 sm:w-[22px] sm:h-[22px]" viewBox="0 0 24 24" fill="currentColor">
                      <path fillRule="evenodd" clipRule="evenodd" d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14zm-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75zm-11.49 0v-8.37h-2.79v8.37h2.79zM5.62 8.63a1.62 1.62 0 1 0 0-3.24 1.62 1.62 0 0 0 0 3.24z"/>
                    </svg>
                  </a>
                </div>
              </div>

            </div>

          </div>

          {/* Bottom Integrated Footer Bar: Seamless Minimal Strip */}
          <div className="contact-footer-bar pt-10 border-t border-black/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 font-sans text-xs text-[#5A685D]">
            <div>
              Copyright © 2025 Unifolio. All Rights Reserved.
            </div>

            <div className="flex items-center gap-6 sm:gap-8 font-mono text-[11px] uppercase tracking-wider">
              <Link href="/privacy" className="hover:text-[#111613] transition-colors duration-200">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-[#111613] transition-colors duration-200">
                Terms of Service
              </Link>
              <Link
                href="#hero"
                onClick={(e) => handleAnchorClick(e, "#hero")}
                className="hover:text-[#111613] transition-colors duration-200 hidden sm:inline-block"
              >
                Back to Top ↑
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          STATE B: FULL INTERACTIVE CONVERSATIONAL FLOW
         ========================================================================= */}
      {mode === "interactive" && (
        <div
          ref={interactiveViewRef}
          className="relative z-10 w-full max-w-4xl mx-auto flex flex-col justify-between min-h-[560px] sm:min-h-[620px] py-4 -translate-y-4 sm:-translate-y-6 md:-translate-y-8"
        >
          {/* Top Bar: Previous Button + Official Unifolio Wordmark Logo + Close Button */}
          <div className="flex items-center justify-between w-full pb-8 sm:pb-10">
            {/* Previous Button */}
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className={`inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] transition-all duration-300 cursor-pointer ${
                currentStep === 0
                  ? "opacity-0 pointer-events-none"
                  : "text-[#5A685D] hover:text-[#111613]"
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>PREVIOUS</span>
            </button>

            {/* Official Logo Asset */}
            <div className="flex items-center justify-center">
              <Image
                src="/Logo/unifolio-wordmark-dark.png"
                alt="Unifolio"
                width={125}
                height={28}
                className="h-6 sm:h-7 w-auto object-contain select-none opacity-90 transition-opacity hover:opacity-100"
              />
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={closeConversation}
              className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.2em] text-[#5A685D] hover:text-[#111613] transition-colors cursor-pointer"
            >
              <span>CLOSE</span>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Center Step Question & Integrated Animated Input Area */}
          <div
            ref={stepContainerRef}
            className="flex-1 flex flex-col items-center justify-center text-center px-4 space-y-7 sm:space-y-8 my-auto"
          >
            {/* Minimal Premium Segmented Progress Bar */}
            <div className="w-full max-w-[180px] sm:max-w-[220px] mx-auto flex items-center gap-1.5 pb-2">
              {Array.from({ length: totalSteps }).map((_, idx) => (
                <div
                  key={idx}
                  className="h-[2px] flex-1 rounded-full overflow-hidden bg-black/10 relative transition-all duration-500"
                >
                  <div
                    className={`h-full w-full rounded-full transition-all duration-500 ease-out ${
                      idx < currentStep
                        ? "bg-[#22C55E]/60"
                        : idx === currentStep
                        ? "bg-[#22C55E] shadow-[0_0_10px_#22C55E]"
                        : "bg-transparent"
                    }`}
                  />
                </div>
              ))}
            </div>

            {/* Step 1: Name */}
            {currentStep === 0 && (
              <div className="space-y-6 w-full max-w-xl">
                <h3 className="font-sans font-light text-3xl sm:text-4xl md:text-5xl lg:text-[46px] text-[#111613] tracking-tight leading-tight">
                  Hi, my name is
                </h3>
                <div
                  ref={inputMagneticRef}
                  onMouseMove={handleInputMouseMove}
                  onMouseLeave={handleInputMouseLeave}
                  className="relative w-full max-w-md mx-auto group/input will-change-transform"
                >
                  {/* Subtle Border Light Shimmer on Hover/Focus */}
                  <div
                    className={`absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-transparent via-[#22C55E]/40 to-transparent opacity-0 transition-opacity duration-500 pointer-events-none ${
                      inputFocused ? "opacity-100 animate-pulse" : "group-hover/input:opacity-70"
                    }`}
                  />
                  <input
                    ref={inputRef}
                    type="text"
                    value={formData.name}
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => setInputFocused(false)}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    onKeyDown={handleKeyDown}
                    placeholder="John Doe"
                    className="relative w-full text-center bg-black/[0.03] border border-black/15 focus:border-[#22C55E] focus:bg-black/[0.06] rounded-2xl px-6 py-4 text-xl sm:text-2xl text-[#111613] placeholder-black/30 focus:outline-none focus:shadow-[0_0_35px_rgba(34,197,94,0.22)] transition-all duration-300 font-sans font-normal tracking-tight"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Organization / Portfolio Type */}
            {currentStep === 1 && (
              <div className="space-y-6 w-full max-w-xl">
                <h3 className="font-sans font-light text-3xl sm:text-4xl md:text-5xl lg:text-[46px] text-[#111613] tracking-tight leading-tight">
                  I represent / invest as
                </h3>
                <div
                  ref={inputMagneticRef}
                  onMouseMove={handleInputMouseMove}
                  onMouseLeave={handleInputMouseLeave}
                  className="relative w-full max-w-md mx-auto group/input will-change-transform"
                >
                  {/* Subtle Border Light Shimmer on Hover/Focus */}
                  <div
                    className={`absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-transparent via-[#22C55E]/40 to-transparent opacity-0 transition-opacity duration-500 pointer-events-none ${
                      inputFocused ? "opacity-100 animate-pulse" : "group-hover/input:opacity-70"
                    }`}
                  />
                  <input
                    ref={inputRef}
                    type="text"
                    value={formData.organization}
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => setInputFocused(false)}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    onKeyDown={handleKeyDown}
                    placeholder="Family Office / Fund / Private Portfolio"
                    className="relative w-full text-center bg-black/[0.03] border border-black/15 focus:border-[#22C55E] focus:bg-black/[0.06] rounded-2xl px-6 py-4 text-lg sm:text-xl text-[#111613] placeholder-black/30 focus:outline-none focus:shadow-[0_0_35px_rgba(34,197,94,0.22)] transition-all duration-300 font-sans font-normal tracking-tight"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Focus Area with Refined Tactile Option Buttons */}
            {currentStep === 2 && (
              <div className="space-y-6 w-full max-w-2xl">
                <h3 className="font-sans font-light text-3xl sm:text-4xl md:text-5xl lg:text-[46px] text-[#111613] tracking-tight leading-tight">
                  I would like to explore
                </h3>
                <div
                  ref={inputMagneticRef}
                  onMouseMove={handleInputMouseMove}
                  onMouseLeave={handleInputMouseLeave}
                  className="relative w-full max-w-md mx-auto group/input will-change-transform"
                >
                  {/* Subtle Border Light Shimmer on Hover/Focus */}
                  <div
                    className={`absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-transparent via-[#22C55E]/40 to-transparent opacity-0 transition-opacity duration-500 pointer-events-none ${
                      inputFocused ? "opacity-100 animate-pulse" : "group-hover/input:opacity-70"
                    }`}
                  />
                  <input
                    ref={inputRef}
                    type="text"
                    value={formData.focusArea}
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => setInputFocused(false)}
                    onChange={(e) => setFormData({ ...formData, focusArea: e.target.value })}
                    onKeyDown={handleKeyDown}
                    placeholder="Choose below or type custom..."
                    className="relative w-full text-center bg-black/[0.03] border border-black/15 focus:border-[#22C55E] focus:bg-black/[0.06] rounded-2xl px-6 py-4 text-base sm:text-lg text-[#111613] placeholder-black/30 focus:outline-none focus:shadow-[0_0_35px_rgba(34,197,94,0.22)] transition-all duration-300 font-sans font-normal tracking-tight"
                  />
                </div>

                {/* Tactile Response Option Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto pt-2">
                  {FOCUS_PILLS.map((pill) => {
                    const isSelected = formData.focusArea === pill;
                    return (
                      <button
                        key={pill}
                        type="button"
                        onClick={() => setFormData({ ...formData, focusArea: pill })}
                        className={`group relative flex items-center gap-3.5 px-5 py-3.5 rounded-2xl border transition-all duration-300 cursor-pointer active:scale-[0.98] overflow-hidden ${
                          isSelected
                            ? "border-[#22C55E]/60 bg-[#22C55E]/10 text-[#0A2E14] shadow-[0_4px_24px_rgba(34,197,94,0.22)] -translate-y-0.5"
                            : "border-black/[0.08] bg-white/60 text-[#111613]/80 hover:border-black/20 hover:bg-white/90 hover:text-[#111613] hover:-translate-y-0.5 shadow-[0_2px_12px_rgba(0,0,0,0.03)]"
                        }`}
                      >
                        <div
                          className={`pointer-events-none absolute -inset-[150%] m-auto w-[400%] h-[400%] transition-opacity duration-500 will-change-transform ${
                            isSelected
                              ? "bg-iridescent-conic animate-iridescent-spin opacity-45"
                              : "bg-iridescent-subtle animate-iridescent-spin opacity-0 group-hover:opacity-35"
                          }`}
                        />
                        <div
                          className={`relative z-10 w-4 h-4 rounded-full flex items-center justify-center border transition-all duration-300 ${
                            isSelected
                              ? "border-[#22C55E] bg-[#22C55E] text-black"
                              : "border-black/20 group-hover:border-[#22C55E]/60"
                          }`}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                        <span className="relative z-10 font-sans text-xs sm:text-[13px] font-medium tracking-wide text-left">
                          {pill}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 4: Primary Goal with Refined Tactile Option Buttons */}
            {currentStep === 3 && (
              <div className="space-y-6 w-full max-w-2xl">
                <h3 className="font-sans font-light text-3xl sm:text-4xl md:text-5xl lg:text-[46px] text-[#111613] tracking-tight leading-tight">
                  My primary goal is
                </h3>
                <div
                  ref={inputMagneticRef}
                  onMouseMove={handleInputMouseMove}
                  onMouseLeave={handleInputMouseLeave}
                  className="relative w-full max-w-md mx-auto group/input will-change-transform"
                >
                  {/* Subtle Border Light Shimmer on Hover/Focus */}
                  <div
                    className={`absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-transparent via-[#22C55E]/40 to-transparent opacity-0 transition-opacity duration-500 pointer-events-none ${
                      inputFocused ? "opacity-100 animate-pulse" : "group-hover/input:opacity-70"
                    }`}
                  />
                  <input
                    ref={inputRef}
                    type="text"
                    value={formData.primaryGoal}
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => setInputFocused(false)}
                    onChange={(e) => setFormData({ ...formData, primaryGoal: e.target.value })}
                    onKeyDown={handleKeyDown}
                    placeholder="Choose below or type custom..."
                    className="relative w-full text-center bg-black/[0.03] border border-black/15 focus:border-[#22C55E] focus:bg-black/[0.06] rounded-2xl px-6 py-4 text-base sm:text-lg text-[#111613] placeholder-black/30 focus:outline-none focus:shadow-[0_0_35px_rgba(34,197,94,0.22)] transition-all duration-300 font-sans font-normal tracking-tight"
                  />
                </div>

                {/* Tactile Response Option Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto pt-2">
                  {GOAL_PILLS.map((pill) => {
                    const isSelected = formData.primaryGoal === pill;
                    return (
                      <button
                        key={pill}
                        type="button"
                        onClick={() => setFormData({ ...formData, primaryGoal: pill })}
                        className={`group relative flex items-center gap-3.5 px-5 py-3.5 rounded-2xl border transition-all duration-300 cursor-pointer active:scale-[0.98] overflow-hidden ${
                          isSelected
                            ? "border-[#22C55E]/60 bg-[#22C55E]/10 text-[#0A2E14] shadow-[0_4px_24px_rgba(34,197,94,0.22)] -translate-y-0.5"
                            : "border-black/[0.08] bg-white/60 text-[#111613]/80 hover:border-black/20 hover:bg-white/90 hover:text-[#111613] hover:-translate-y-0.5 shadow-[0_2px_12px_rgba(0,0,0,0.03)]"
                        }`}
                      >
                        <div
                          className={`pointer-events-none absolute -inset-[150%] m-auto w-[400%] h-[400%] transition-opacity duration-500 will-change-transform ${
                            isSelected
                              ? "bg-iridescent-conic animate-iridescent-spin opacity-45"
                              : "bg-iridescent-subtle animate-iridescent-spin opacity-0 group-hover:opacity-35"
                          }`}
                        />
                        <div
                          className={`relative z-10 w-4 h-4 rounded-full flex items-center justify-center border transition-all duration-300 ${
                            isSelected
                              ? "border-[#22C55E] bg-[#22C55E] text-black"
                              : "border-black/20 group-hover:border-[#22C55E]/60"
                          }`}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                        <span className="relative z-10 font-sans text-xs sm:text-[13px] font-medium tracking-wide text-left">
                          {pill}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 5: Email & Final Submission */}
            {currentStep === 4 && (
              <div className="space-y-6 w-full max-w-xl">
                <h3 className="font-sans font-light text-3xl sm:text-4xl md:text-5xl lg:text-[46px] text-[#111613] tracking-tight leading-tight">
                  You can reach me at
                </h3>
                <div
                  ref={inputMagneticRef}
                  onMouseMove={handleInputMouseMove}
                  onMouseLeave={handleInputMouseLeave}
                  className="relative w-full max-w-md mx-auto group/input will-change-transform"
                >
                  {/* Subtle Border Light Shimmer on Hover/Focus */}
                  <div
                    className={`absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-transparent via-[#22C55E]/40 to-transparent opacity-0 transition-opacity duration-500 pointer-events-none ${
                      inputFocused ? "opacity-100 animate-pulse" : "group-hover/input:opacity-70"
                    }`}
                  />
                  <input
                    ref={inputRef}
                    type="email"
                    value={formData.email}
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => setInputFocused(false)}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    onKeyDown={handleKeyDown}
                    placeholder="hello@example.com"
                    className="relative w-full text-center bg-black/[0.03] border border-black/15 focus:border-[#22C55E] focus:bg-black/[0.06] rounded-2xl px-6 py-4 text-lg sm:text-xl text-[#111613] placeholder-black/30 focus:outline-none focus:shadow-[0_0_35px_rgba(34,197,94,0.22)] transition-all duration-300 font-sans font-normal tracking-tight"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Bottom Navigation Control Action (Matching Reference Circular Chevron Button) */}
          <div className="flex flex-col items-center justify-center pt-6 sm:pt-8 min-h-[72px]">
            <div
              className={`flex flex-col items-center transition-all duration-500 ease-out will-change-transform ${
                canProceed()
                  ? "opacity-100 translate-y-0 pointer-events-auto scale-100"
                  : "opacity-0 translate-y-3 pointer-events-none scale-90"
              }`}
            >
              {currentStep === totalSteps - 1 ? (
                <Button
                  ref={nextBtnRef}
                  type="button"
                  size="lg"
                  variant="primary"
                  onClick={handleNext}
                  onMouseMove={handleBtnMouseMove}
                  onMouseLeave={handleBtnMouseLeave}
                  disabled={loading || !canProceed()}
                  aria-label="Get Started"
                  className="shadow-[0_4px_30px_rgba(34,197,94,0.3)]"
                >
                  <span>{loading ? "Transmitting..." : "Get Started"}</span>
                  <div className="w-7 h-7 rounded-full bg-[#22C55E] text-black flex items-center justify-center group-hover:translate-x-1 transition-transform duration-300">
                    <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                </Button>
              ) : (
                <>
                  <div
                    className="relative group inline-flex rounded-full p-[1.5px] overflow-hidden transition-all duration-300 will-change-transform active:scale-90 hover:-translate-y-0.5 cursor-pointer shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
                  >
                    <div className="pointer-events-none absolute -inset-[180%] m-auto w-[460%] h-[460%] bg-iridescent-conic animate-iridescent-spin opacity-80 group-hover:opacity-100 will-change-transform" />
                    <div className="pointer-events-none absolute -inset-[180%] m-auto w-[460%] h-[460%] bg-iridescent-conic animate-iridescent-spin blur-[2.5px] opacity-50 group-hover:opacity-80 will-change-transform" />
                    <button
                      ref={nextBtnRef}
                      type="button"
                      onClick={handleNext}
                      onMouseMove={handleBtnMouseMove}
                      onMouseLeave={handleBtnMouseLeave}
                      disabled={loading || !canProceed()}
                      aria-label="Next Step"
                      className="relative z-10 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/80 hover:bg-white/95 backdrop-blur-xl flex items-center justify-center text-[#111613] transition-all duration-300 btn-physical-surface-light cursor-pointer"
                    >
                      <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.8] text-[#111613] group-hover:translate-x-0.5 transition-all duration-200" />
                    </button>
                  </div>

                  {/* Minimal Bottom Pill Indicator Under Button */}
                  <div className="w-7 h-1 rounded-full bg-black/10 mt-3" />
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          STATE C: REFINED CONFIRMATION & THANK YOU STATE
         ========================================================================= */}
      {mode === "completed" && (
        <div className="relative z-10 max-w-xl mx-auto text-center space-y-6 py-12">
          {/* Luminous Pulsing Badge */}
          <div className="w-20 h-20 rounded-full bg-[#22C55E]/15 border border-[#22C55E] text-[#22C55E] flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(34,197,94,0.35)] animate-pulse">
            <Check className="w-10 h-10 stroke-[2.5]" />
          </div>

          <div className="space-y-3">
            <h3 className="font-sans font-light text-3xl sm:text-4xl text-[#111613] tracking-tight">
              Brief received, {formData.name || "friend"}.
            </h3>
            <p className="font-sans text-sm sm:text-base text-[#5A685D] leading-relaxed max-w-md mx-auto font-light">
              Thank you for sharing your portfolio brief. Our intelligence specialist will review your details and connect within 24 hours.
            </p>
          </div>

          <div className="pt-4">
            <button
              type="button"
              onClick={() => {
                setMode("intro");
                setCurrentStep(0);
                setFormData({
                  name: "",
                  organization: "",
                  focusArea: "",
                  primaryGoal: "",
                  email: "",
                });
              }}
              className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-[#22C55E] hover:text-[#111613] transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>START ANOTHER CONVERSATION</span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
