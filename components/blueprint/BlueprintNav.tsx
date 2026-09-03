"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { gsap, prefersReducedMotion, smoothScrollTo } from "@/lib/gsap";

interface NavItem {
  label: string;
  href: string;
  id: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "#hero", id: "hero" },
  { label: "Product", href: "#statement", id: "statement" },
  { label: "Offerings", href: "#offerings", id: "offerings" },
  { label: "About", href: "#about", id: "about" },
  { label: "Contact", href: "#contact", id: "contact" },
];

export function BlueprintNav() {
  const [scrolled, setScrolled] = useState(false);
  const [activeId, setActiveId] = useState<string>("hero");

  const navContainerRef = useRef<HTMLDivElement | null>(null);
  const indicatorRef = useRef<HTMLDivElement | null>(null);
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

  const textRefs = useRef<Record<string, HTMLSpanElement | null>>({});

  // Scroll listener for backdrop styling & active section sync
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setScrolled(scrollY > 60);

      // 1. On landing / near top of page (Home)
      if (scrollY < window.innerHeight * 0.65) {
        setActiveId("hero");
        return;
      }

      // 2. Near bottom of page (Contact)
      if (scrollY + window.innerHeight >= document.documentElement.scrollHeight - 60) {
        setActiveId("contact");
        return;
      }

      // 3. Middle Section Thresholds
      const offeringsEl = document.getElementById("offerings");
      const aboutEl = document.getElementById("about");
      const contactEl = document.getElementById("contact");

      const contactTop = contactEl ? contactEl.offsetTop : Infinity;
      const aboutTop = aboutEl ? aboutEl.offsetTop : Infinity;
      const offeringsTop = offeringsEl ? offeringsEl.offsetTop : Infinity;

      const triggerPos = scrollY + window.innerHeight * 0.35;

      if (triggerPos >= contactTop) {
        setActiveId("contact");
      } else if (triggerPos >= aboutTop) {
        setActiveId("about");
      } else if (triggerPos >= offeringsTop) {
        setActiveId("offerings");
      } else {
        setActiveId("statement"); // Product
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Smooth Gliding Active Indicator Movement (GSAP Interpolation to exact text span)
  useEffect(() => {
    const activeElement = textRefs.current[activeId] || linkRefs.current[activeId];
    const containerElement = navContainerRef.current;
    if (!activeElement || !containerElement || !indicatorRef.current) return;

    const activeRect = activeElement.getBoundingClientRect();
    const containerRect = containerElement.getBoundingClientRect();

    const x = activeRect.left - containerRect.left;
    const width = activeRect.width;

    if (prefersReducedMotion()) {
      gsap.set(indicatorRef.current, { x, width, opacity: 1 });
    } else {
      gsap.to(indicatorRef.current, {
        x,
        width,
        opacity: 1,
        duration: 0.35,
        ease: "power2.out",
      });
    }
  }, [activeId]);

  // Window resize handler to reposition indicator precisely
  useEffect(() => {
    const handleResize = () => {
      const activeElement = textRefs.current[activeId] || linkRefs.current[activeId];
      const containerElement = navContainerRef.current;
      if (!activeElement || !containerElement || !indicatorRef.current) return;

      const activeRect = activeElement.getBoundingClientRect();
      const containerRect = containerElement.getBoundingClientRect();

      gsap.set(indicatorRef.current, {
        x: activeRect.left - containerRect.left,
        width: activeRect.width,
        opacity: 1,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [activeId]);

  const handleAnchorClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string,
    id: string
  ) => {
    if (!href.startsWith("#")) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();

    setActiveId(id);

    if (href === "#hero" || id === "hero") {
      window.dispatchEvent(new CustomEvent("unifolio-reset-hero"));
      smoothScrollTo(0, { duration: 0.85, ease: "power2.inOut" });
      return;
    }

    // If at top of Hero landing state, expand the existing anchored ring naturally
    if (window.scrollY < 80) {
      window.dispatchEvent(new CustomEvent("unifolio-trigger-hero"));
    }

    // Direct, controlled smooth navigation with sticky navbar offset (75px)
    const navbarOffset = 75;
    smoothScrollTo(href, { offset: navbarOffset, duration: 0.85, ease: "power2.inOut" });
  };

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 sm:px-10 lg:px-16 select-none transition-all duration-500 ease-out ${
        scrolled
          ? "bg-[#000000]/85 border-b border-white/[0.08] backdrop-blur-xl shadow-[0_12px_32px_rgba(0,0,0,0.6)] py-3.5"
          : "bg-transparent border-b border-transparent py-5"
      }`}
    >
      {/* Left Brand Logo */}
      <Link
        href="#hero"
        onClick={(e) => handleAnchorClick(e, "#hero", "hero")}
        className="flex items-center group transition-transform duration-300 hover:opacity-95"
      >
        <Image
          src="/Logo/unifolio-wordmark-white.png"
          alt="Unifolio"
          width={132}
          height={30}
          priority
          className="h-6 sm:h-7 w-auto object-contain select-none transition-transform duration-300 group-hover:scale-[1.02]"
        />
      </Link>

      {/* Center Navigation Links with Smooth Gliding Active Indicator */}
      <div
        ref={navContainerRef}
        className="hidden md:flex relative items-center gap-7 lg:gap-9 py-1"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = activeId === item.id;
          return (
            <Link
              key={item.id}
              ref={(el) => {
                linkRefs.current[item.id] = el;
              }}
              href={item.href}
              onClick={(e) => handleAnchorClick(e, item.href, item.id)}
              className={`relative py-1 font-sans text-[13px] sm:text-[14px] tracking-[0.03em] transition-colors duration-200 cursor-pointer ${
                isActive
                  ? "text-white font-medium"
                  : "text-[#8E9B91]/80 hover:text-white font-normal"
              }`}
            >
              <span
                ref={(el) => {
                  textRefs.current[item.id] = el;
                }}
                className="inline-block"
              >
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Gliding Hairline Emerald Active Indicator (Fitted Exactly to Text) */}
        <div
          ref={indicatorRef}
          className="pointer-events-none absolute bottom-0 left-0 h-[1.5px] bg-[#22C55E] shadow-[0_0_8px_#22C55E] rounded-full will-change-transform opacity-0"
        />
      </div>

      {/* Right Navigation Actions: Login + Sign Up */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Login: Quieter Secondary Action */}
        <Link
          href="#contact"
          onClick={(e) => handleAnchorClick(e, "#contact", "contact")}
          className="group relative flex items-center gap-2 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl border border-white/[0.09] bg-white/[0.03] text-[#FAF8F5]/80 hover:text-white hover:border-[#22C55E]/50 hover:bg-white/[0.06] hover:-translate-y-0.5 hover:shadow-[0_0_16px_rgba(34,197,94,0.12)] font-sans text-xs sm:text-[13px] font-light tracking-wide transition-all duration-300 active:scale-[0.97]"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-white/25 group-hover:bg-[#22C55E]/70 transition-colors" />
          <span>Login</span>
        </Link>

        {/* Sign Up: Primary Action (Soft Glow & Hairline Tint) */}
        <Link
          href="#contact"
          onClick={(e) => handleAnchorClick(e, "#contact", "contact")}
          className="group relative flex items-center gap-2 px-4 sm:px-4.5 py-1.5 sm:py-2 rounded-xl border border-[#22C55E]/50 bg-[#09170E]/85 text-white hover:border-[#22C55E] hover:bg-[#0E2416] hover:-translate-y-0.5 hover:shadow-[0_0_22px_rgba(34,197,94,0.3)] font-sans text-xs sm:text-[13px] font-normal tracking-wide transition-all duration-300 active:scale-[0.97]"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] shadow-[0_0_8px_#22C55E] group-hover:scale-125 transition-transform" />
          <span>Sign Up</span>
        </Link>
      </div>
    </nav>
  );
}
