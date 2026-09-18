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
  { label: "FAQ", href: "#faq", id: "faq" },
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
  const strokeColor = isHovered || isActive ? "#22C55E" : "#111613";

  if (id === "product") {
    return (
      <svg
        viewBox="0 0 28 28"
        fill="none"
        className="w-[26px] h-[26px] sm:w-[28px] sm:h-[28px] transition-colors duration-300"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="6.5" y="6.5" width="15" height="14" rx="1.5" strokeWidth="1.6" strokeOpacity="0.75" />
        <rect x="3.5" y="9.5" width="14" height="13.5" rx="1.5" strokeWidth="2" />
        <line x1="6.5" y1="13.5" x2="13" y2="13.5" strokeWidth="1.6" />
        <line x1="6.5" y1="17" x2="11" y2="17" strokeWidth="1.6" />
        <circle cx="14.5" cy="20" r="1.1" fill={strokeColor} stroke="none" />
      </svg>
    );
  }

  if (id === "security") {
    return (
      <svg
        viewBox="0 0 28 28"
        fill="none"
        className="w-[26px] h-[26px] sm:w-[28px] sm:h-[28px] transition-colors duration-300"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="14" cy="14" r="9.5" strokeWidth="2" />
        <circle cx="14" cy="14" r="3.8" strokeWidth="2" />
        <line x1="14" y1="10.2" x2="14" y2="6.5" strokeWidth="1.6" />
        <line x1="10.8" y1="15.9" x2="7.5" y2="17.8" strokeWidth="1.6" />
        <line x1="17.2" y1="15.9" x2="20.5" y2="17.8" strokeWidth="1.6" />
        <circle cx="14" cy="14" r="1.4" fill={strokeColor} stroke="none" />
      </svg>
    );
  }

  if (id === "about") {
    return (
      <svg
        viewBox="0 0 28 28"
        fill="none"
        className="w-[26px] h-[26px] sm:w-[28px] sm:h-[28px] transition-colors duration-300"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="14" cy="14" r="4.2" strokeWidth="2" />
        <ellipse cx="14" cy="14" rx="10.5" ry="4.2" transform="rotate(-28 14 14)" strokeWidth="1.6" />
        <circle cx="21.5" cy="9.8" r="1.8" fill={strokeColor} stroke="none" />
      </svg>
    );
  }

  if (id === "faq") {
    return (
      <svg
        viewBox="0 0 28 28"
        fill="none"
        className="w-[26px] h-[26px] sm:w-[28px] sm:h-[28px] transition-colors duration-300"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 6.5h14a3 3 0 0 1 3 3v7.5a3 3 0 0 1-3 3h-6l-4 3.5v-3.5H6a3 3 0 0 1-3-3V9.5a3 3 0 0 1 3-3z" strokeWidth="2" />
        <path d="M11.5 11.5a2.2 2.2 0 0 1 4.2.8c0 1.4-1.7 1.8-1.7 2.7" strokeWidth="1.8" />
        <circle cx="14" cy="17.5" r="1.15" fill={strokeColor} stroke="none" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 28 28"
      fill="none"
      className="w-[26px] h-[26px] sm:w-[28px] sm:h-[28px] transition-colors duration-300"
      stroke={strokeColor}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="4" y="7" width="20" height="14" rx="2" strokeWidth="2" />
      <path d="M4.5 8l9.5 7.5L23.5 8" strokeWidth="1.6" />
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
                  {item.label}
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
