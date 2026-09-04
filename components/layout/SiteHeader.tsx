"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useRef } from "react";
import { Menu, X } from "lucide-react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, createMagneticEffect, prefersReducedMotion } from "@/lib/gsap";

import { ThemeToggle } from "@/components/theme/ThemeToggle";

export function SiteHeader() {
  const pathname = usePathname();
  const isHomepage = pathname === "/";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);
  const lineRef = useRef<HTMLDivElement | null>(null);
  const ctaRef = useRef<HTMLAnchorElement | null>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion() || !headerRef.current) return;

      if (isHomepage) {
        // On homepage, hide header during hero video playback, reveal on scroll past hero
        gsap.set(headerRef.current, { yPercent: -100, opacity: 0 });

        ScrollTrigger.create({
          start: "top -80%",
          end: 99999,
          onEnter: () => {
            gsap.to(headerRef.current, {
              yPercent: 0,
              opacity: 1,
              duration: 0.5,
              ease: "power2.out",
            });
          },
          onLeaveBack: () => {
            gsap.to(headerRef.current, {
              yPercent: -100,
              opacity: 0,
              duration: 0.4,
              ease: "power2.in",
            });
          },
        });
      } else {
        // On other pages, immediately visible
        gsap.set(headerRef.current, { yPercent: 0, opacity: 1 });
      }

      // Subtle scale-down of logo on scroll past 100px
      ScrollTrigger.create({
        start: "top -100px",
        end: 99999,
        toggleClass: {
          targets: headerRef.current,
          className: "is-scrolled",
        },
      });

      // Magnetic hover physics on CTA button
      if (ctaRef.current) {
        createMagneticEffect(ctaRef.current, { strength: 0.2 });
      }
    },
    { scope: headerRef, dependencies: [isHomepage] }
  );

  return (
    <header
      ref={headerRef}
      className="fixed top-0 inset-x-0 z-50 w-full bg-[#FAF8F5]/95 dark:bg-[#000000]/90 backdrop-blur-md transition-all py-3.5 shadow-[0_4px_20px_-2px_rgba(28,36,30,0.04)] dark:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.5)] border-b border-black/[0.06] dark:border-white/[0.08]"
    >
      <div className="mx-auto flex max-w-content items-center justify-between px-6 sm:px-8">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center group transition-transform duration-300 hover:opacity-95"
        >
          <Image
            src="/Logo/unifolio-wordmark-dark.png"
            alt="Unifolio"
            width={132}
            height={30}
            priority
            className="block dark:hidden h-6 sm:h-7 w-auto object-contain select-none transition-transform duration-300 group-hover:scale-[1.02]"
          />
          <Image
            src="/Logo/unifolio-wordmark-white.png"
            alt="Unifolio"
            width={132}
            height={30}
            priority
            className="hidden dark:block h-6 sm:h-7 w-auto object-contain select-none transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 md:flex font-sans text-sm text-[#525E55] dark:text-[#8E9B91]">
          <Link href="/features" className="hover:text-[#1C241E] dark:hover:text-[#FAF8F5] transition-colors">
            Product
          </Link>
          <Link href="/pricing" className="hover:text-[#1C241E] dark:hover:text-[#FAF8F5] transition-colors">
            Pricing
          </Link>
          <Link href="/about" className="hover:text-[#1C241E] dark:hover:text-[#FAF8F5] transition-colors">
            About
          </Link>
          <Link href="/contact" className="hover:text-[#1C241E] dark:hover:text-[#FAF8F5] transition-colors">
            Contact
          </Link>
        </nav>

        {/* Right CTA Button, Theme Toggle & Hamburger */}
        <div className="flex items-center gap-3 sm:gap-4">
          <ThemeToggle />

          <Link
            ref={ctaRef}
            href="/get-started"
            className="inline-flex items-center justify-center rounded-full bg-[#22C55E] dark:bg-[#22C55E] px-4 sm:px-5 py-2 font-sans text-xs font-semibold text-black border border-black/10 dark:border-white/10 shadow-xs hover:bg-[#16A34A] transition-all active:scale-95"
          >
            Get early access
          </Link>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1 text-[#1C241E] dark:text-[#FAF8F5] md:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Subtle Bottom Hairline */}
      <div
        ref={lineRef}
        className="absolute bottom-0 inset-x-0 h-[1px] bg-[#1C241E]/10 origin-center"
      />

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-[#1C241E]/10 bg-[#FAF8F5] px-6 py-4 md:hidden">
          <div className="flex flex-col gap-3 font-sans text-sm text-[#1C241E]">
            <Link href="/features" onClick={() => setMobileMenuOpen(false)} className="py-1">
              Product
            </Link>
            <Link href="/pricing" onClick={() => setMobileMenuOpen(false)} className="py-1">
              Pricing
            </Link>
            <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="py-1">
              About
            </Link>
            <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="py-1">
              Contact
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
