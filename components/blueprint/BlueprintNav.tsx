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
}

const NAV_ITEMS: NavItem[] = [
  { label: "Product", href: "#product", id: "product" },
  { label: "Security", href: "#security", id: "security" },
  { label: "About", href: "#about", id: "about" },
  { label: "Contact", href: "#contact", id: "contact" },
];

export function BlueprintNav() {
  const { theme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [activeId, setActiveId] = useState<string>("product");
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
      const contactEl = document.getElementById("contact");
      const aboutEl = document.getElementById("about");
      const securityEl = document.getElementById("security");
      const productEl = document.getElementById("product") || document.getElementById("statement");

      const contactTop = contactEl ? contactEl.offsetTop : Infinity;
      const aboutTop = aboutEl ? aboutEl.offsetTop : Infinity;
      const securityTop = securityEl ? securityEl.offsetTop : Infinity;
      const productTop = productEl ? productEl.offsetTop : Infinity;

      const triggerPos = scrollY + window.innerHeight * 0.35;

      if (triggerPos >= contactTop) {
        setActiveId("contact");
      } else if (triggerPos >= aboutTop) {
        setActiveId("about");
      } else if (triggerPos >= securityTop) {
        setActiveId("security");
      } else if (triggerPos >= productTop) {
        setActiveId("product");
      } else {
        setActiveId("hero");
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

      {/* Center Navigation Links with Smooth Gliding Active Indicator */}
      <div
        ref={navContainerRef}
        className={`hidden md:flex relative items-center gap-7 lg:gap-9 py-1 transition-all duration-700 delay-100 ${
          isLogoDocked ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
        }`}
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
                  ? "text-[#111613] dark:text-white font-medium"
                  : "text-[#5A685D] dark:text-[#8E9B91]/80 hover:text-[#111613] dark:hover:text-white font-normal"
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
