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
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Product", href: "#product", id: "product", icon: "/navbar/product.png" },
  { label: "Security", href: "#security", id: "security", icon: "/navbar/security.png" },
  { label: "About", href: "#about", id: "about", icon: "/navbar/about.png" },
  { label: "FAQ", href: "#faq", id: "faq", icon: "/navbar/faq.png" },
  { label: "Contact", href: "#contact", id: "contact", icon: "/navbar/contact.png" },
];

export function BlueprintNav() {
  const [scrolled, setScrolled] = useState(false);
  const [activeId, setActiveId] = useState<string>("product");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isLogoDocked, setIsLogoDocked] = useState(false);

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
        const mapped = ce.detail.section === "hero" ? "product" : ce.detail.section;
        forcedSectionRef.current = mapped;
        setActiveId(mapped);
      }
    };

    window.addEventListener("unifolio-active-section", handleActiveSection);
    return () => window.removeEventListener("unifolio-active-section", handleActiveSection);
  }, []);

  // Scroll listener for backdrop styling & active section sync (only for unpinned sections FAQ/Contact)
  useEffect(() => {
    const NAVBAR_HEIGHT = 56; // fixed header py-3.5 + logo h-7

    const handleScroll = () => {
      const scrollY = window.scrollY;
      setScrolled(scrollY > 60);

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

  const handleAnchorClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string,
    id: string
  ) => {
    if (!href.startsWith("#")) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();

    const mapped = id === "hero" ? "product" : id;
    setActiveId(mapped);

    window.dispatchEvent(
      new CustomEvent("unifolio-nav-click", { detail: { section: id } })
    );
  };

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 sm:px-10 lg:px-16 select-none transition-all duration-500 ease-out ${
        isLogoDocked ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
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
              setActiveId("product");
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
          width={132}
          height={30}
          priority
          className="h-6 sm:h-7 w-auto object-contain select-none transition-transform duration-300 group-hover:scale-[1.02]"
        />
      </Link>

      {/* Center Navigation: Translucent Crystal Glass Pill enclosing the 5 3D Glass Illustrations */}
      <div
        ref={navContainerRef}
        className={`hidden md:flex relative items-center gap-6 sm:gap-7 lg:gap-8 h-[52px] sm:h-[56px] px-6 sm:px-8 rounded-full transition-all duration-[360ms] ease-[cubic-bezier(0.16,1,0.3,1)] select-none ${
          isLogoDocked ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
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
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.icon}
                  alt={item.label}
                  className="h-[28px] sm:h-[30px] w-auto max-w-[44px] object-contain select-none pointer-events-none"
                />

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
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Right Navigation Actions: Login + Sign Up */}
      <div
        className={`flex items-center gap-2 sm:gap-2.5 transition-all duration-700 delay-200 ${
          isLogoDocked ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
        }`}
      >
        {/* Login: Refined Translucent Glass Button */}
        <Link
          href="#contact"
          onClick={(e) => handleAnchorClick(e, "#contact", "contact")}
          className="group relative inline-flex items-center h-[34px] sm:h-[36px] pl-2 pr-3.5 sm:pl-2.5 sm:pr-4 rounded-[14px] sm:rounded-[15px] bg-white/[0.12] hover:bg-white/[0.25] active:bg-white/[0.18] backdrop-blur-[12px] border border-white/60 hover:border-white/80 shadow-[0_4px_16px_rgba(0,0,0,0.03),0_1px_2px_rgba(0,0,0,0.02),inset_0_1px_1px_0_rgba(255,255,255,0.85)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.05),0_0_12px_rgba(34,197,94,0.08),inset_0_1px_1.5px_0_rgba(255,255,255,0.95)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 ease-out select-none"
        >
          {/* Top Specular Rim */}
          <div className="pointer-events-none absolute inset-x-3 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/90 to-transparent rounded-full opacity-80 group-hover:opacity-100 transition-opacity" />

          {/* Left Circular Accent: Subtle Frosted Gray/Transparent with Concentric Iris Dot */}
          <div className="relative flex items-center justify-center w-[18px] h-[18px] sm:w-[19px] sm:h-[19px] rounded-full border border-emerald-950/20 group-hover:border-emerald-600/40 bg-gradient-to-b from-white/90 via-white/55 to-neutral-200/50 shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.95),0_1px_2px_rgba(0,0,0,0.04)] group-hover:shadow-[inset_0_1px_1.5px_rgba(255,255,255,1),0_0_8px_rgba(34,197,94,0.22)] transition-all duration-200 shrink-0 mr-2">
            <span className="w-[5px] h-[5px] rounded-full bg-[#111613]/55 group-hover:bg-[#111613]/75 transition-colors" />
          </div>

          <span className="font-sans font-semibold text-[13px] sm:text-[13.5px] text-[#111613] tracking-[-0.01em]">
            Login
          </span>
        </Link>

        {/* Sign Up: Refined Translucent Glass Button with Luminous Emerald Glow */}
        <Link
          href="#contact"
          onClick={(e) => handleAnchorClick(e, "#contact", "contact")}
          className="group relative inline-flex items-center h-[34px] sm:h-[36px] pl-2 pr-3.5 sm:pl-2.5 sm:pr-4 rounded-[14px] sm:rounded-[15px] bg-white/[0.14] hover:bg-emerald-50/[0.30] active:bg-emerald-50/[0.20] backdrop-blur-[12px] border border-emerald-400/45 hover:border-emerald-400/70 shadow-[0_4px_16px_rgba(34,197,94,0.08),0_1px_2px_rgba(0,0,0,0.02),0_0_12px_rgba(34,197,94,0.12),inset_0_1px_1px_0_rgba(255,255,255,0.90)] hover:shadow-[0_6px_22px_rgba(34,197,94,0.20),0_0_18px_rgba(34,197,94,0.28),inset_0_1px_1.5px_0_rgba(255,255,255,1)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 ease-out select-none"
        >
          {/* Top Specular Rim */}
          <div className="pointer-events-none absolute inset-x-3 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/95 to-transparent rounded-full opacity-90 group-hover:opacity-100 transition-opacity" />

          {/* Left Circular Accent: Vivid #22C55E Emerald Sphere with Glowing White Dot */}
          <div className="relative flex items-center justify-center w-[18px] h-[18px] sm:w-[19px] sm:h-[19px] rounded-full bg-gradient-to-b from-[#34D399] via-[#22C55E] to-[#16A34A] shadow-[0_0_10px_rgba(34,197,94,0.45),inset_0_1px_1.5px_rgba(255,255,255,0.75),inset_0_-1px_1px_rgba(0,0,0,0.18)] group-hover:shadow-[0_0_16px_rgba(34,197,94,0.80),inset_0_1px_1.5px_rgba(255,255,255,0.95)] group-hover:scale-105 transition-all duration-200 shrink-0 mr-2">
            <span className="w-[5px] h-[5px] rounded-full bg-white shadow-[0_0_4px_rgba(255,255,255,0.95)]" />
          </div>

          <span className="font-sans font-semibold text-[13px] sm:text-[13.5px] text-[#111613] tracking-[-0.01em]">
            Sign Up
          </span>
        </Link>
      </div>
    </nav>
  );
}
