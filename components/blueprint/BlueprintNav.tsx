"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { gsap, prefersReducedMotion, smoothScrollTo } from "@/lib/gsap";
import { LinkButton } from "@/components/ui/Button";

interface NavItem {
  label: string;
  href: string;
  id: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Product", href: "#product", id: "product" },
  { label: "Security", href: "#security", id: "security" },
  { label: "About", href: "#about", id: "about" },
  { label: "FAQs", href: "#faq", id: "faq" },
  { label: "Contact", href: "#contact", id: "contact" },
];

function NavSketchIcon({
  id,
  isActive,
  isHovered,
}: {
  id: string;
  isActive: boolean;
  isHovered: boolean;
}) {
  const inkStroke = isHovered || isActive ? "#22C55E" : "#111613";
  const hatchStroke = isHovered || isActive ? "rgba(34, 197, 94, 0.60)" : "rgba(17, 22, 19, 0.40)";
  const guideStroke = isHovered || isActive ? "rgba(34, 197, 94, 0.35)" : "rgba(17, 22, 19, 0.22)";
  const watercolorTint = isHovered || isActive ? "rgba(34, 197, 94, 0.14)" : "rgba(17, 22, 19, 0.02)";
  const watercolorDeep = isHovered || isActive ? "rgba(34, 197, 94, 0.24)" : "rgba(34, 197, 94, 0.06)";
  const paperBack = isHovered || isActive ? "rgba(34, 197, 94, 0.06)" : "rgba(255, 255, 255, 0.65)";

  // 1. PRODUCT: 3-Tier Floating Isometric Card Stack (Hand-Inked Drafting Pen with Underside Hatching)
  if (id === "product") {
    return (
      <svg
        viewBox="0 0 32 32"
        fill="none"
        className="w-[28px] h-[28px] sm:w-[30px] sm:h-[30px] transition-all duration-300 overflow-visible"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Tier 3 (Bottom Card) */}
        <path
          d="M16 23.5L25.5 19.5L16 15.5L6.5 19.5L16 23.5Z"
          fill={watercolorTint}
          stroke={inkStroke}
          strokeWidth="1.5"
        />
        {/* Tier 3 Rim Extrusion */}
        <path
          d="M6.5 19.5v1.8c0 .4.3.7.6.8L16 25.5l8.9-3.4c.3-.1.6-.4.6-.8v-1.8"
          stroke={inkStroke}
          strokeWidth="1.5"
          fill="none"
        />
        {/* Tier 3 Underside Shadow Hatch Marks */}
        <line x1="10" y1="21.5" x2="11.8" y2="23" stroke={hatchStroke} strokeWidth="1" />
        <line x1="13" y1="22.8" x2="14.8" y2="24.3" stroke={hatchStroke} strokeWidth="1" />
        <line x1="16" y1="24" x2="17.8" y2="25.5" stroke={hatchStroke} strokeWidth="1" />

        {/* Tier 2 (Middle Card - Signature Emerald Core Wash) */}
        <path
          d="M16 18.5L25.5 14.5L16 10.5L6.5 14.5L16 18.5Z"
          fill={watercolorDeep}
          stroke={inkStroke}
          strokeWidth="1.6"
        />
        {/* Tier 2 Rim Extrusion */}
        <path
          d="M6.5 14.5v1.6c0 .4.3.7.6.8L16 20.5l8.9-3.4c.3-.1.6-.4.6-.8v-1.6"
          stroke={inkStroke}
          strokeWidth="1.5"
          fill="none"
        />
        {/* Tier 2 Underside Shadow Hatch Marks */}
        <line x1="10" y1="16.5" x2="11.8" y2="18" stroke={hatchStroke} strokeWidth="1" />
        <line x1="13" y1="17.8" x2="14.8" y2="19.3" stroke={hatchStroke} strokeWidth="1" />
        <line x1="16" y1="19" x2="17.8" y2="20.5" stroke={hatchStroke} strokeWidth="1" />

        {/* Tier 1 (Top Floating Glass Plate) */}
        <path
          d="M16 13.5L25.5 9.5L16 5.5L6.5 9.5L16 13.5Z"
          fill={paperBack}
          stroke={inkStroke}
          strokeWidth="1.8"
        />
        {/* Tier 1 Rim Extrusion */}
        <path
          d="M6.5 9.5v1.6c0 .4.3.7.6.8L16 15.5l8.9-3.4c.3-.1.6-.4.6-.8v-1.6"
          stroke={inkStroke}
          strokeWidth="1.6"
          fill="none"
        />

        {/* Architectural Drafting Corner Overshoot Ticks */}
        <line x1="5.8" y1="9.8" x2="7.4" y2="9.1" stroke={guideStroke} strokeWidth="1" />
        <line x1="24.8" y1="9.1" x2="26.4" y2="9.8" stroke={guideStroke} strokeWidth="1" />
        <line x1="15.2" y1="5.1" x2="16.8" y2="5.9" stroke={guideStroke} strokeWidth="1" />

        {/* Diagonal Hand-Inked Glare Reflection Stroke */}
        <line x1="11" y1="9.5" x2="15.5" y2="11.5" stroke={hatchStroke} strokeWidth="1.2" />
      </svg>
    );
  }

  // 2. SECURITY: 3D Beveled Shield (Architectural Pen with Right-Flank Hatching)
  if (id === "security") {
    return (
      <svg
        viewBox="0 0 32 32"
        fill="none"
        className="w-[28px] h-[28px] sm:w-[30px] sm:h-[30px] transition-all duration-300 overflow-visible"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* 3D Extruded Depth Flank (Right Bevel Outline) */}
        <path
          d="M22.8 6.5C23.6 7 24.5 7.8 25.2 9c1 1.7.9 7 .6 9.8-.4 3.4-3.5 6.4-9.8 8.4V26c6.5-2 10.2-5.5 10.8-9.5.3-3.2.3-8.8-.8-10.8-.7-1.3-1.8-2-3.2-2.4v3.2z"
          fill={watercolorTint}
          stroke={guideStroke}
          strokeWidth="0.8"
        />

        {/* Architectural Diagonal Cross-Hatch Lines on Right 3D Flank */}
        <line x1="23.2" y1="8.5" x2="25.2" y2="10.2" stroke={hatchStroke} strokeWidth="1" />
        <line x1="22.5" y1="12" x2="25.5" y2="14" stroke={hatchStroke} strokeWidth="1" />
        <line x1="21.5" y1="15.8" x2="24.8" y2="17.8" stroke={hatchStroke} strokeWidth="1" />
        <line x1="19.2" y1="19.8" x2="22.2" y2="21.8" stroke={hatchStroke} strokeWidth="1" />
        <line x1="17.2" y1="23.2" x2="19.2" y2="24.8" stroke={hatchStroke} strokeWidth="1" />

        {/* Outer Shield Hand-Inked Perimeter */}
        <path
          d="M8.5 6.8C12 7.8 15 6 16 5.5c1 .5 4 2.3 7.5 1.3 1 3.5 1.5 9.5-.5 13.8C20.8 24.8 16 27 16 27s-4.8-2.2-7-6.4c-2-4.3-1.5-10.3-.5-13.8z"
          fill={paperBack}
          stroke={inkStroke}
          strokeWidth="1.8"
        />

        {/* Inner Recessed Bevel Core with Watercolor Emerald Wash */}
        <path
          d="M10.8 9.5C13.2 10.2 15 9 16 8.5c1 .5 2.8 1.7 5.2 1 .7 2.8 1 7.2-.4 10.4-1.7 3.2-4.8 4.8-4.8 4.8s-3.1-1.6-4.8-4.8c-1.4-3.2-1.1-7.6-.4-10.4z"
          fill={watercolorDeep}
          stroke={isHovered || isActive ? "#22C55E" : hatchStroke}
          strokeWidth="1.2"
        />

        {/* Center Vertical Crest Crease Line with Overshoot at Top/Bottom */}
        <line x1="16" y1="4.8" x2="16" y2="27.5" stroke={inkStroke} strokeWidth="1.2" />

        {/* Architectural Drafting Top Corner Ticks */}
        <line x1="7.8" y1="6.5" x2="9.2" y2="7.2" stroke={guideStroke} strokeWidth="1" />
        <line x1="22.8" y1="7.2" x2="24.2" y2="6.5" stroke={guideStroke} strokeWidth="1" />
      </svg>
    );
  }

  // 3. ABOUT: 3D Celestial Sphere & Orbital Ring (Hand-Inked Planet with Shading Hatch)
  if (id === "about") {
    return (
      <svg
        viewBox="0 0 32 32"
        fill="none"
        className="w-[28px] h-[28px] sm:w-[30px] sm:h-[30px] transition-all duration-300 overflow-visible"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Orbital Ring - Rear Ellipse Arc (Drafting Construction Line behind Sphere) */}
        <path
          d="M6.2 18.2C5.5 16.5 6.2 14.8 8.5 13.2C13.2 10 21 9 25.8 11.2C27.5 12 28.2 13 28 14.2"
          stroke={guideStroke}
          strokeWidth="1.3"
          strokeDasharray="1.5 2"
          fill="none"
        />

        {/* Central 3D Celestial Sphere Body */}
        <circle
          cx="16"
          cy="15.5"
          r="7.8"
          fill={paperBack}
          stroke={inkStroke}
          strokeWidth="1.8"
        />

        {/* Hand-Inked Curvature Latitude Arcs */}
        <path
          d="M9.5 13.8C12 16.2 20 16.2 22.5 13.8"
          stroke={hatchStroke}
          strokeWidth="1.1"
          fill="none"
        />

        {/* Lower-Right Crescent Shading Hatch Marks (Representing 3D Sphere Volume) */}
        <path d="M15 19.5C17 19.5 19.5 18 20.5 16" stroke={hatchStroke} strokeWidth="1" fill="none" />
        <path d="M17 21C19 20.8 21.2 19 22 17" stroke={hatchStroke} strokeWidth="1" fill="none" />
        <path d="M19 22C20.5 21.5 22.5 20 23 18.5" stroke={guideStroke} strokeWidth="0.9" fill="none" />

        {/* Orbital Ring - Front Sweeping Arc (Bold Hand-Inked Foreground Curve) */}
        <path
          d="M5 16.5C4.2 18.2 5.5 20 8.8 21.6C14.2 24.2 22.5 24 27.2 20.8C28.8 19.8 29.2 18.5 28.5 17.2"
          stroke={inkStroke}
          strokeWidth="1.9"
          fill="none"
        />

        {/* Ring Orbit Tangent Overshoot Ticks (Classic Drafting Style) */}
        <line x1="3.8" y1="15.8" x2="5.5" y2="17" stroke={guideStroke} strokeWidth="1" />
        <line x1="28.2" y1="17" x2="29.8" y2="15.8" stroke={guideStroke} strokeWidth="1" />

        {/* Hand-Drafted Orbital Satellite Node with Crosshair Axis */}
        <line x1="6.8" y1="16.5" x2="6.8" y2="21" stroke={guideStroke} strokeWidth="0.8" />
        <line x1="4.5" y1="18.8" x2="9" y2="18.8" stroke={guideStroke} strokeWidth="0.8" />
        <circle
          cx="6.8"
          cy="18.8"
          r="1.8"
          fill={isHovered || isActive ? "#22C55E" : inkStroke}
          stroke={isHovered || isActive ? "#FFFFFF" : "none"}
          strokeWidth="0.8"
        />
      </svg>
    );
  }

  // 4. FAQ: Dimensional Dual Speech Bubbles (Architectural Drafting with Depth Hatching)
  if (id === "faq") {
    return (
      <svg
        viewBox="0 0 32 32"
        fill="none"
        className="w-[28px] h-[28px] sm:w-[30px] sm:h-[30px] transition-all duration-300 overflow-visible"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Rear Offset Bubble with Shadow Hatching */}
        <path
          d="M13.5 6.5h8c3.2 0 5.5 2.2 5.5 5.2v2.8c0 3-2.3 5.2-5.5 5.2h-.8l1.8 3.5-3.8-2.2"
          stroke={hatchStroke}
          strokeWidth="1.4"
          fill={watercolorDeep}
        />
        {/* Rear Bubble Corner Drafting Ticks */}
        <line x1="13" y1="6.5" x2="14.5" y2="6.5" stroke={guideStroke} strokeWidth="1" />
        <line x1="27" y1="11.5" x2="27" y2="13" stroke={guideStroke} strokeWidth="1" />

        {/* Diagonal Hatching Inside Rear Bubble Shadow */}
        <line x1="18" y1="8.5" x2="21" y2="10.5" stroke={hatchStroke} strokeWidth="1" />
        <line x1="21.5" y1="9.5" x2="24.5" y2="11.5" stroke={hatchStroke} strokeWidth="1" />
        <line x1="23.5" y1="12.5" x2="26" y2="14.5" stroke={hatchStroke} strokeWidth="1" />

        {/* Front Primary Speech Bubble */}
        <path
          d="M7 10h11.5c3.2 0 5.5 2.2 5.5 5.2v3.2c0 3-2.3 5.2-5.5 5.2h-3.8L9 26.5v-2.9H7C3.8 23.6 2 21.4 2 18.4v-3.2C2 12.2 3.8 10 7 10z"
          fill={paperBack}
          stroke={inkStroke}
          strokeWidth="1.8"
        />

        {/* Front Bubble Corner Overshoot Line */}
        <line x1="6.5" y1="10" x2="5.5" y2="10" stroke={guideStroke} strokeWidth="1" />

        {/* 3 Communication Message Dots ··· inside Front Bubble */}
        <circle cx="8" cy="16.5" r="1.3" fill={inkStroke} stroke="none" />
        <circle cx="12.8" cy="16.5" r="1.3" fill={inkStroke} stroke="none" />
        <circle cx="17.6" cy="16.5" r="1.3" fill={isHovered || isActive ? "#22C55E" : inkStroke} stroke="none" />
      </svg>
    );
  }

  // 5. CONTACT: 3D Perspective Open Envelope (Hand-Inked Drafting Mail with Inner Glow Wash)
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className="w-[28px] h-[28px] sm:w-[30px] sm:h-[30px] transition-all duration-300 overflow-visible"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Open Top Flap Folded Upward & Back in Perspective */}
      <path
        d="M5.5 12.5L16 4.8L26.5 12.5"
        stroke={inkStroke}
        strokeWidth="1.6"
        fill={watercolorTint}
      />
      {/* Apex Drafting Overshoot Cross-Lines at (16, 4.8) */}
      <line x1="15.2" y1="5.4" x2="16.8" y2="4.2" stroke={guideStroke} strokeWidth="1" />
      <line x1="16.8" y1="5.4" x2="15.2" y2="4.2" stroke={guideStroke} strokeWidth="1" />

      {/* Luminous Emerald Watercolor Pocket Lining (Signature SS2 Green Interior) */}
      <path
        d="M6 12.5L16 6L26 12.5L16 19.5Z"
        fill={watercolorDeep}
        stroke={isHovered || isActive ? "#22C55E" : hatchStroke}
        strokeWidth="1.1"
      />

      {/* Interior Shadow Hatch Lines inside Open Pocket */}
      <line x1="12" y1="11" x2="14" y2="12.5" stroke={hatchStroke} strokeWidth="0.9" />
      <line x1="15" y1="12" x2="17" y2="13.5" stroke={hatchStroke} strokeWidth="0.9" />
      <line x1="18" y1="11" x2="20" y2="12.5" stroke={hatchStroke} strokeWidth="0.9" />

      {/* Main Perspective Envelope Body / Pouch */}
      <path
        d="M5.5 12.5h21c.8 0 1.5.6 1.4 1.4l-1.2 10.2c-.1.8-.8 1.4-1.6 1.4H6.9c-.8 0-1.5-.6-1.6-1.4L4.1 13.9c-.1-.8.6-1.4 1.4-1.4z"
        fill={paperBack}
        stroke={inkStroke}
        strokeWidth="1.8"
      />

      {/* Folded Pouch Front V-Seams with Hand-Drawn Overlap at Center */}
      <path
        d="M4.5 13.5L13.8 20.2c1.3.9 3.1.9 4.4 0L27.5 13.5"
        stroke={inkStroke}
        strokeWidth="1.5"
        fill="none"
      />

      {/* Bottom Envelope Fold Creases with Corner Drafting Ticks */}
      <path
        d="M5.5 24.5L12 19M26.5 24.5L20 19"
        stroke={hatchStroke}
        strokeWidth="1.2"
        fill="none"
      />
      <line x1="4.8" y1="24.8" x2="6.2" y2="24.2" stroke={guideStroke} strokeWidth="1" />
      <line x1="25.8" y1="24.2" x2="27.2" y2="24.8" stroke={guideStroke} strokeWidth="1" />
    </svg>
  );
}

export function BlueprintNav() {
  const [scrolled, setScrolled] = useState(false);
  const [activeId, setActiveId] = useState<string>("product");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isLogoDocked, setIsLogoDocked] = useState(false);
  const [isHeroSection, setIsHeroSection] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (prefersReducedMotion() || window.location.pathname !== "/") {
        setIsLogoDocked(true);
      }
    }

    const handleDocked = () => setIsLogoDocked(true);
    window.addEventListener("unifolio-logo-docked", handleDocked);
    window.addEventListener("unifolio-intro-complete", handleDocked);
    return () => {
      window.removeEventListener("unifolio-logo-docked", handleDocked);
      window.removeEventListener("unifolio-intro-complete", handleDocked);
    };
  }, []);

  const navContainerRef = useRef<HTMLDivElement | null>(null);
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

  const forcedSectionRef = useRef<string | null>(null);

  useEffect(() => {
    const handleActiveSection = (e: Event) => {
      const ce = e as CustomEvent<{ section: string }>;
      if (ce.detail?.section) {
        const isHero = ce.detail.section === "hero";
        setIsHeroSection(isHero);
        const mapped = isHero ? "product" : ce.detail.section;
        forcedSectionRef.current = mapped;
        setActiveId(mapped);
      }
    };

    const handleResetHero = () => {
      setIsHeroSection(true);
    };

    const handleNavClick = (e: Event) => {
      const ce = e as CustomEvent<{ section: string }>;
      if (ce.detail?.section === "hero") {
        setIsHeroSection(true);
      } else if (ce.detail?.section) {
        setIsHeroSection(false);
      }
    };

    window.addEventListener("unifolio-active-section", handleActiveSection);
    window.addEventListener("unifolio-reset-hero", handleResetHero);
    window.addEventListener("unifolio-nav-click", handleNavClick);
    return () => {
      window.removeEventListener("unifolio-active-section", handleActiveSection);
      window.removeEventListener("unifolio-reset-hero", handleResetHero);
      window.removeEventListener("unifolio-nav-click", handleNavClick);
    };
  }, []);

  // Scroll listener for backdrop styling & active section sync (only for unpinned sections FAQ/Contact)
  useEffect(() => {
    const NAVBAR_HEIGHT = 56; // fixed header py-3.5 + logo h-7

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const isScrolledNow = scrollY > 60;
      setScrolled(isScrolledNow);
      if (isScrolledNow) {
        setIsHeroSection(false);
      }

      // Pinned BlueprintHero manages sections while scrollY <= 120.
      // Do not infer or clobber activeId when scrollY is in the pinned region.
      if (scrollY <= 120) {
        return;
      }

      const contactEl = document.getElementById("contact");
      const faqEl = document.getElementById("faq");

      const triggerY = scrollY + NAVBAR_HEIGHT + 40;
      const isAtBottom =
        scrollY + window.innerHeight >= document.documentElement.scrollHeight - 50;

      // 1. Bottom of page or contact cleared navbar -> Contact
      if (isAtBottom || (contactEl && triggerY >= contactEl.offsetTop)) {
        setActiveId("contact");
        return;
      }

      // 2. FAQ section cleared navbar -> FAQ
      if (faqEl && triggerY >= faqEl.offsetTop) {
        setActiveId("faq");
        return;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // sync on mount
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isHero = isHeroSection && !scrolled;

  const handleAnchorClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string,
    id: string
  ) => {
    if (!href.startsWith("#")) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();

    // Do not set activeId here: the dot must reflect where the user actually
    // *is*, not where they just clicked. BlueprintHero's state machine is the
    // single source of truth — it dispatches "unifolio-active-section" only
    // once the cinematic transition has genuinely landed on the destination.
    window.dispatchEvent(
      new CustomEvent("unifolio-nav-click", { detail: { section: id } })
    );
  };

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 sm:px-10 lg:px-16 select-none transition-opacity duration-500 ease-out ${
        isLogoDocked ? "opacity-100" : "opacity-0 pointer-events-none"
      } ${
        scrolled
          ? "bg-[#FAF8F5]/85 border-b border-black/[0.06] backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] py-3.5"
          : "bg-transparent border-b border-transparent py-5"
      }`}
    >
      {/* Left Brand Logo: Seamlessly swaps dark vs white wordmark */}
      <Link
        id="navbar-brand-logo"
        href="/"
        onClick={(e) => {
          if (typeof window !== "undefined") {
            if (window.location.pathname === "/" || window.location.pathname === "") {
              e.preventDefault();
              // No local setActiveId: wait for BlueprintHero's own
              // "unifolio-active-section" dispatch once Hero is actually reached.
              window.dispatchEvent(
                new CustomEvent("unifolio-nav-click", { detail: { section: "hero" } })
              );
            }
          }
        }}
        className={`flex items-center group transition-opacity duration-300 hover:opacity-95 ${
          isLogoDocked ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Dark theme logo */}
        <Image
          src="/Logo/unifolio-wordmark-dark.png"
          alt="Unifolio"
          width={152}
          height={35}
          priority
          className={`w-auto object-contain select-none transition-all duration-300 group-hover:scale-[1.02] ${
            isHero ? "h-[27px] sm:h-8" : "h-6 sm:h-7"
          }`}
        />
      </Link>

      {/* Center Navigation: Translucent Crystal Glass Pill enclosing the 5 3D Glass Illustrations */}
      <div
        ref={navContainerRef}
        className={`hidden md:flex relative items-center gap-6 sm:gap-7 lg:gap-8 h-[52px] sm:h-[56px] px-6 sm:px-8 rounded-full transition-opacity duration-[360ms] ease-[cubic-bezier(0.16,1,0.3,1)] select-none ${
          isLogoDocked ? "opacity-100" : "opacity-0 pointer-events-none"
        } bg-white/[0.05] backdrop-blur-[10px] border border-white/50 shadow-[0_8px_24px_-4px_rgba(0,0,0,0.05),0_1px_3px_0_rgba(0,0,0,0.02),0_0_14px_-2px_rgba(34,197,94,0.10),inset_0_1px_1px_0_rgba(255,255,255,0.70),inset_0_-1px_1.5px_0_rgba(34,197,94,0.25)]`}
      >
        {/* Top Rim Specular Glass Highlight */}
        <div className="pointer-events-none absolute inset-x-8 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent rounded-full opacity-85" />

        {/* Bottom Emerald Refractive Edge Line */}
        <div className="pointer-events-none absolute inset-x-10 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-[#22C55E]/35 to-transparent rounded-full opacity-75" />

        {NAV_ITEMS.map((item) => {
          const isActive = activeId === item.id;
          const isHovered = hoveredId === item.id;

          return (
            <Link
              key={item.id}
              id={`nav-link-${item.id}`}
              ref={(el) => {
                linkRefs.current[item.id] = el;
              }}
              href={item.href}
              onClick={(e) => handleAnchorClick(e, item.href, item.id)}
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
              onFocus={() => setHoveredId(item.id)}
              onBlur={() => setHoveredId(null)}
              aria-label={item.label}
              className={`group relative flex items-center h-[38px] sm:h-[40px] rounded-full cursor-pointer transition-all duration-[360ms] ease-[cubic-bezier(0.16,1,0.3,1)] select-none ${
                isHovered
                  ? "bg-[#22C55E]/[0.10] border border-[#22C55E]/30 backdrop-blur-md shadow-[0_4px_20px_-2px_rgba(34,197,94,0.22),0_0_12px_rgba(34,197,94,0.16)] pl-2.5 pr-3.5"
                  : "bg-transparent border border-transparent px-1 shadow-none"
              }`}
            >
              {/* Illustration element */}
              <div
                className={`relative flex items-center justify-center shrink-0 transition-all duration-[360ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  isHovered
                    ? "scale-[1.08] drop-shadow-[0_2px_10px_rgba(34,197,94,0.45)]"
                    : isActive
                    ? "scale-100 opacity-100 drop-shadow-[0_2px_8px_rgba(34,197,94,0.30)]"
                    : "scale-100 opacity-80 group-hover:opacity-100 group-hover:scale-[1.04]"
                }`}
              >
                <NavSketchIcon id={item.id} isActive={isActive} isHovered={isHovered} />

                {/* Subtle active pip centered underneath the active illustration */}
                {isActive && !isHovered && (
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#22C55E] shadow-[0_0_8px_#22C55E]" />
                )}
              </div>

              {/* Expanding Label Container: Smooth horizontal reveal */}
              <div
                className={`overflow-hidden flex items-center transition-all duration-[360ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  isHovered
                    ? "max-w-[150px] opacity-100 translate-x-0 ml-2"
                    : "max-w-0 opacity-0 -translate-x-2 ml-0 pointer-events-none"
                }`}
              >
                {/* Subtle emerald hairline vertical divider */}
                <div className="w-[1px] h-3.5 bg-[#22C55E]/45 mr-2 shrink-0" />

                {/* Section Name Label */}
                <span className="font-sans text-[12.5px] sm:text-[13px] font-bold tracking-[0.06em] uppercase text-neutral-900 whitespace-nowrap">
                  {item.id === "faq" ? (
                    <>
                      FAQ<span className="lowercase text-[0.88em] font-bold tracking-normal">s</span>
                    </>
                  ) : (
                    item.label
                  )}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Right Navigation Actions: Login + Sign Up */}
      <div
        className={`flex items-center gap-2 sm:gap-2.5 transition-opacity duration-700 delay-200 ${
          isLogoDocked ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Login: Clean, Minimal Outlined/Ghost Glass Treatment */}
        <Link
          href="https://staging.unifolio.in/login"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative inline-flex items-center gap-1.5 sm:gap-2 h-[34px] sm:h-[36px] px-3.5 sm:px-4 rounded-full bg-white/80 hover:bg-white active:bg-white/90 backdrop-blur-md border border-black/[0.07] hover:border-black/[0.12] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.07)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 ease-out select-none"
        >
          <svg
            className="w-3.5 h-3.5 sm:w-[15px] sm:h-[15px] text-[#2D3748] transition-colors group-hover:text-black shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span className="font-sans font-medium text-[13px] sm:text-[13.5px] text-[#1A202C] group-hover:text-black tracking-[-0.01em]">
            Login
          </span>
        </Link>

        {/* Sign Up: Subtle Primary Action with Soft Green Glow & Accent */}
        <Link
          href="https://staging.unifolio.in/signup"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative inline-flex items-center gap-1.5 sm:gap-2 h-[34px] sm:h-[36px] px-3.5 sm:px-4 rounded-full bg-[#22C55E]/[0.08] hover:bg-[#22C55E]/[0.14] active:bg-[#22C55E]/[0.10] backdrop-blur-md border border-[#22C55E]/35 hover:border-[#22C55E]/55 shadow-[0_1px_4px_rgba(34,197,94,0.08),0_2px_8px_rgba(34,197,94,0.08)] hover:shadow-[0_3px_14px_rgba(34,197,94,0.20),0_0_10px_rgba(34,197,94,0.14)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 ease-out select-none"
        >
          <svg
            className="w-3.5 h-3.5 sm:w-[15px] sm:h-[15px] text-[#16A34A] transition-transform duration-200 group-hover:scale-110 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2C12 7.5 7.5 12 2 12C7.5 12 12 16.5 12 22C12 16.5 16.5 12 22 12C16.5 12 12 7.5 12 2Z" />
          </svg>
          <span className="font-sans font-medium text-[13px] sm:text-[13.5px] text-[#0F4A2C] group-hover:text-[#064E3B] tracking-[-0.01em]">
            Sign Up
          </span>
        </Link>
      </div>
    </nav>
  );
}
