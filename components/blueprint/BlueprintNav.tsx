"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { gsap, prefersReducedMotion, smoothScrollTo } from "@/lib/gsap";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useTheme } from "@/components/theme/ThemeProvider";
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
  const { theme } = useTheme();
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
        forcedSectionRef.current = ce.detail.section;
        setActiveId(ce.detail.section);
      }
    };

    window.addEventListener("unifolio-active-section", handleActiveSection);
    return () => window.removeEventListener("unifolio-active-section", handleActiveSection);
  }, []);

  // Scroll listener for backdrop styling & active section sync
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setScrolled(scrollY > 60);

      const contactEl = document.getElementById("contact");
      const faqEl = document.getElementById("faq");
      const aboutEl = document.getElementById("about");

      const scrollMid = scrollY + window.innerHeight * 0.40;
      const isAtBottom = scrollY + window.innerHeight >= document.documentElement.scrollHeight - 50;

      // 1. Bottom of page or within Contact section
      if (isAtBottom || (contactEl && scrollMid >= contactEl.offsetTop)) {
        forcedSectionRef.current = null;
        setActiveId("contact");
        return;
      }

      // 2. Within FAQ section
      if (faqEl && scrollMid >= faqEl.offsetTop) {
        forcedSectionRef.current = null;
        setActiveId("faq");
        return;
      }

      // 3. Within About section
      if (aboutEl && scrollMid >= aboutEl.offsetTop) {
        forcedSectionRef.current = null;
        setActiveId("about");
        return;
      }

      // 3. Above About section (Hero / Product / Security)
      // If an explicit section was signaled (e.g. user entered the card ring experience)
      if (forcedSectionRef.current === "security") {
        setActiveId("security");
        return;
      }

      // Otherwise, the user is in the Product section (landing hero, aperture zoom, product cards, or scrolled back)
      forcedSectionRef.current = null;
      setActiveId("product");
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
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

    forcedSectionRef.current = id;
    setActiveId(id);

    if (href === "#hero" || id === "hero") {
      forcedSectionRef.current = null;
      setActiveId("product");
      window.dispatchEvent(new CustomEvent("unifolio-reset-hero"));
      smoothScrollTo(0, { duration: 0.85, ease: "power2.inOut" });
      return;
    }

    if (href === "#product" || id === "product") {
      forcedSectionRef.current = "product";
      setActiveId("product");
      window.dispatchEvent(new CustomEvent("unifolio-show-product"));
      return;
    }

    if (href === "#security" || id === "security") {
      forcedSectionRef.current = "security";
      setActiveId("security");
      window.dispatchEvent(new CustomEvent("unifolio-show-security"));
      return;
    }

    if (href === "#about" || id === "about") {
      forcedSectionRef.current = "about";
      setActiveId("about");
      window.dispatchEvent(new CustomEvent("unifolio-show-about"));
      const navbarOffset = 75;
      smoothScrollTo(href, { offset: navbarOffset, duration: 0.85, ease: "power2.inOut" });
      return;
    }

    if (href === "#faq" || id === "faq") {
      forcedSectionRef.current = "faq";
      setActiveId("faq");
      window.dispatchEvent(new CustomEvent("unifolio-show-faq"));
      if (typeof document !== "undefined") {
        document.documentElement.style.overflow = "";
        document.body.style.overflow = "";
      }
      const navbarOffset = 75;
      smoothScrollTo(href, { offset: navbarOffset, duration: 0.85, ease: "power2.inOut" });
      return;
    }

    // Direct, controlled smooth navigation with sticky navbar offset (75px)
    const navbarOffset = 75;
    smoothScrollTo(href, { offset: navbarOffset, duration: 0.85, ease: "power2.inOut" });
  };

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 sm:px-10 lg:px-16 select-none transition-all duration-500 ease-out ${
        isLogoDocked ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
      } ${
        scrolled
          ? "bg-[#FAF8F5]/85 dark:bg-[#000000]/85 border-b border-black/[0.06] dark:border-white/[0.08] backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_32px_rgba(0,0,0,0.6)] py-3.5"
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
              forcedSectionRef.current = null;
              setActiveId("product");
              window.dispatchEvent(new CustomEvent("unifolio-reset-hero"));
              smoothScrollTo(0, { duration: 0.85, ease: "power2.inOut" });
            }
          }
        }}
        className={`flex items-center group transition-opacity duration-300 hover:opacity-95 ${
          isLogoDocked ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Dark theme logo */}
        <Image
          src="/Logo/unifolio-wordmark-white.png"
          alt="Unifolio"
          width={132}
          height={30}
          priority
          className="hidden dark:block h-6 sm:h-7 w-auto object-contain select-none transition-transform duration-300 group-hover:scale-[1.02]"
        />
        {/* Light theme logo */}
        <Image
          src="/Logo/unifolio-wordmark-dark.png"
          alt="Unifolio"
          width={132}
          height={30}
          priority
          className="block dark:hidden h-6 sm:h-7 w-auto object-contain select-none transition-transform duration-300 group-hover:scale-[1.02]"
        />
      </Link>

      {/* Center Navigation: Translucent Crystal Glass Pill enclosing the 5 3D Glass Illustrations */}
      <div
        ref={navContainerRef}
        className={`hidden md:flex relative items-center gap-6 sm:gap-7 lg:gap-8 h-[52px] sm:h-[56px] px-6 sm:px-8 rounded-full transition-all duration-[360ms] ease-[cubic-bezier(0.16,1,0.3,1)] select-none ${
          isLogoDocked ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
        } bg-white/[0.05] dark:bg-white/[0.03] backdrop-blur-[10px] border border-white/50 dark:border-white/15 shadow-[0_8px_24px_-4px_rgba(0,0,0,0.05),0_1px_3px_0_rgba(0,0,0,0.02),0_0_14px_-2px_rgba(34,197,94,0.10),inset_0_1px_1px_0_rgba(255,255,255,0.70),inset_0_-1px_1.5px_0_rgba(34,197,94,0.25)] dark:shadow-[0_12px_32px_-6px_rgba(0,0,0,0.5),0_0_16px_0_rgba(34,197,94,0.15),inset_0_1px_1px_0_rgba(255,255,255,0.18),inset_0_-1px_1.5px_0_rgba(34,197,94,0.32)]`}
      >
        {/* Top Rim Specular Glass Highlight */}
        <div className="pointer-events-none absolute inset-x-8 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 dark:via-white/30 to-transparent rounded-full opacity-85" />

        {/* Bottom Emerald Refractive Edge Line */}
        <div className="pointer-events-none absolute inset-x-10 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-[#22C55E]/35 dark:via-[#22C55E]/55 to-transparent rounded-full opacity-75" />

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
                  ? "bg-[#22C55E]/[0.10] dark:bg-[#22C55E]/[0.18] border border-[#22C55E]/30 dark:border-[#22C55E]/45 backdrop-blur-md shadow-[0_4px_20px_-2px_rgba(34,197,94,0.22),0_0_12px_rgba(34,197,94,0.16)] pl-2.5 pr-3.5"
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
                    : "scale-100 opacity-80 dark:opacity-75 group-hover:opacity-100 group-hover:scale-[1.04]"
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
                <div className="w-[1px] h-3.5 bg-[#22C55E]/45 dark:bg-[#22C55E]/55 mr-2 shrink-0" />

                {/* Section Name Label */}
                <span className="font-sans text-[12.5px] sm:text-[13px] font-bold tracking-[0.06em] uppercase text-neutral-900 dark:text-white whitespace-nowrap">
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Right Navigation Actions: 3D Theme Toggle + Login + Sign Up */}
      <div
        className={`flex items-center gap-2 sm:gap-3 transition-all duration-700 delay-200 ${
          isLogoDocked ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
        }`}
      >
        {/* Sculptural 3D Theme Toggle */}
        <ThemeToggle className="mr-0.5 sm:mr-1" />

        {/* Login: Secondary Physical Iridescent Glass Button */}
        <LinkButton
          href="#contact"
          size="sm"
          variant="secondary"
          onClick={(e) => handleAnchorClick(e, "#contact", "contact")}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-black/20 dark:bg-white/30 group-hover:bg-[#22C55E]/80 transition-colors" />
          <span>Login</span>
        </LinkButton>

        {/* Sign Up: Primary Physical Iridescent Glass Button */}
        <LinkButton
          href="#contact"
          size="sm"
          variant="primary"
          onClick={(e) => handleAnchorClick(e, "#contact", "contact")}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] shadow-[0_0_8px_#22C55E] group-hover:scale-125 transition-transform" />
          <span>Sign Up</span>
        </LinkButton>
      </div>
    </nav>
  );
}
