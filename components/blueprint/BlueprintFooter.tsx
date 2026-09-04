"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail } from "lucide-react";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion, smoothScrollTo } from "@/lib/gsap";

export function BlueprintFooter() {
  const containerRef = useRef<HTMLElement | null>(null);
  const footerGridRef = useRef<HTMLDivElement | null>(null);
  const bottomBarRef = useRef<HTMLDivElement | null>(null);

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

  useGSAP(
    () => {
      if (prefersReducedMotion() || !containerRef.current) return;

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
              start: "top 85%",
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
              start: "top 95%",
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
      className="relative w-full bg-[#000000] text-[#FAF8F5] select-none overflow-hidden border-t border-white/[0.08]"
    >
      {/* =========================================================================
          LARGE DECORATIVE FOOTER ILLUSTRATION (Bottom-Right Area & Cropped Bleed)
         ========================================================================= */}
      <div className="pointer-events-none absolute bottom-0 right-[-10%] sm:right-[-6%] md:right-[-2%] lg:right-[0%] xl:right-[1%] w-[440px] sm:w-[580px] md:w-[720px] lg:w-[860px] xl:w-[980px] h-[340px] sm:h-[450px] md:h-[560px] lg:h-[660px] xl:h-[720px] z-0 overflow-visible opacity-90">
        <Image
          src="/footer illustration.png"
          alt="Unifolio Footer Artwork"
          fill
          className="object-contain object-bottom-right select-none pointer-events-none drop-shadow-[0_0_60px_rgba(34,197,94,0.18)]"
        />
      </div>

      {/* =========================================================================
          MAIN EDITORIAL NAVIGATION & BRANDING GRID
         ========================================================================= */}
      <div className="relative z-10 px-6 sm:px-12 lg:px-20 pt-16 sm:pt-20 pb-20 sm:pb-28">
        <div
          ref={footerGridRef}
          className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-14 items-start"
        >
          {/* Column 1 (Left): Brand Logo, Tagline & Green Dot */}
          <div className="md:col-span-12 lg:col-span-3 space-y-4">
            <Link
              href="#hero"
              onClick={(e) => handleAnchorClick(e, "#hero")}
              className="inline-flex items-center group transition-transform duration-300 hover:opacity-95"
            >
              <Image
                src="/Logo/unifolio-wordmark-white.png"
                alt="Unifolio"
                width={140}
                height={32}
                className="h-7 sm:h-8 w-auto object-contain select-none transition-transform duration-300 group-hover:scale-[1.02]"
              />
            </Link>

            <div className="space-y-1 pt-1">
              <p className="font-sans text-xs sm:text-sm text-[#8E9B91] leading-relaxed">
                Unifolio brings clarity to complexity.
              </p>
              <p className="font-sans text-xs sm:text-sm text-[#8E9B91] leading-relaxed">
                One view. Complete clarity.
              </p>
            </div>

            <div className="pt-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] shadow-[0_0_6px_#22C55E] inline-block" />
            </div>
          </div>

          {/* Center Columns: Structured Navigation Columns */}
          <div className="md:col-span-8 lg:col-span-6 grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-6">
            
            {/* PLATFORM Column */}
            <div className="space-y-3.5">
              <h4 className="font-mono text-xs font-semibold text-[#8E9B91] uppercase tracking-[0.22em]">
                PLATFORM
              </h4>
              <ul className="space-y-2.5 font-sans text-xs sm:text-sm text-[#FAF8F5]/70">
                <li>
                  <Link
                    href="#product"
                    onClick={(e) => handleAnchorClick(e, "#product")}
                    className="hover:text-white transition-colors duration-200"
                  >
                    Product
                  </Link>
                </li>
                <li>
                  <Link
                    href="#security"
                    onClick={(e) => handleAnchorClick(e, "#security")}
                    className="hover:text-white transition-colors duration-200"
                  >
                    Security
                  </Link>
                </li>
                <li>
                  <Link
                    href="#about"
                    onClick={(e) => handleAnchorClick(e, "#about")}
                    className="hover:text-white transition-colors duration-200"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="#contact"
                    onClick={(e) => handleAnchorClick(e, "#contact")}
                    className="hover:text-white transition-colors duration-200"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* COMPANY Column */}
            <div className="space-y-3.5">
              <h4 className="font-mono text-xs font-semibold text-[#8E9B91] uppercase tracking-[0.22em]">
                COMPANY
              </h4>
              <ul className="space-y-2.5 font-sans text-xs sm:text-sm text-[#FAF8F5]/70">
                <li>
                  <Link
                    href="#about"
                    onClick={(e) => handleAnchorClick(e, "#about")}
                    className="hover:text-white transition-colors duration-200"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="#contact"
                    onClick={(e) => handleAnchorClick(e, "#contact")}
                    className="hover:text-white transition-colors duration-200"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    href="#about"
                    onClick={(e) => handleAnchorClick(e, "#about")}
                    className="hover:text-white transition-colors duration-200"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="#contact"
                    onClick={(e) => handleAnchorClick(e, "#contact")}
                    className="hover:text-white transition-colors duration-200"
                  >
                    Press
                  </Link>
                </li>
              </ul>
            </div>

            {/* RESOURCES Column */}
            <div className="space-y-3.5">
              <h4 className="font-mono text-xs font-semibold text-[#8E9B91] uppercase tracking-[0.22em]">
                RESOURCES
              </h4>
              <ul className="space-y-2.5 font-sans text-xs sm:text-sm text-[#FAF8F5]/70">
                <li>
                  <Link
                    href="#statement"
                    onClick={(e) => handleAnchorClick(e, "#statement")}
                    className="hover:text-white transition-colors duration-200"
                  >
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link
                    href="#faq"
                    onClick={(e) => handleAnchorClick(e, "#faq")}
                    className="hover:text-white transition-colors duration-200"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    href="#contact"
                    onClick={(e) => handleAnchorClick(e, "#contact")}
                    className="hover:text-white transition-colors duration-200"
                  >
                    API
                  </Link>
                </li>
                <li>
                  <Link
                    href="#hero"
                    onClick={(e) => handleAnchorClick(e, "#hero")}
                    className="hover:text-white transition-colors duration-200"
                  >
                    Status
                  </Link>
                </li>
              </ul>
            </div>

            {/* LEGAL Column */}
            <div className="space-y-3.5">
              <h4 className="font-mono text-xs font-semibold text-[#8E9B91] uppercase tracking-[0.22em]">
                LEGAL
              </h4>
              <ul className="space-y-2.5 font-sans text-xs sm:text-sm text-[#FAF8F5]/70">
                <li>
                  <Link href="/privacy" className="hover:text-white transition-colors duration-200">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white transition-colors duration-200">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white transition-colors duration-200">
                    Data Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white transition-colors duration-200">
                    Compliance
                  </Link>
                </li>
              </ul>
            </div>

          </div>

          {/* Column 3 (Right): Stay Connected Social Outlined Icons */}
          <div className="md:col-span-4 lg:col-span-3 space-y-4">
            <h4 className="font-mono text-xs font-semibold text-[#8E9B91] uppercase tracking-[0.22em]">
              STAY CONNECTED
            </h4>

            <div className="flex items-center gap-3 pt-1">
              {/* LinkedIn */}
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="w-9 h-9 rounded-full border border-white/15 bg-white/[0.02] flex items-center justify-center text-white hover:border-[#22C55E] hover:text-[#22C55E] hover:bg-[#22C55E]/10 transition-all duration-300"
              >
                <span className="font-sans font-bold text-xs">in</span>
              </a>

              {/* Twitter / X */}
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Twitter / X"
                className="w-9 h-9 rounded-full border border-white/15 bg-white/[0.02] flex items-center justify-center text-white hover:border-[#22C55E] hover:text-[#22C55E] hover:bg-[#22C55E]/10 transition-all duration-300"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>

              {/* Email */}
              <a
                href="mailto:hello@unifolio.in"
                aria-label="Email"
                className="w-9 h-9 rounded-full border border-white/15 bg-white/[0.02] flex items-center justify-center text-white hover:border-[#22C55E] hover:text-[#22C55E] hover:bg-[#22C55E]/10 transition-all duration-300"
              >
                <Mail className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* =========================================================================
          BOTTOM BAR: Clean Editorial Strip (Copyright + Brand Statement)
         ========================================================================= */}
      <div
        ref={bottomBarRef}
        className="relative z-10 border-t border-white/[0.08] bg-[#000000] px-6 sm:px-12 lg:px-20 py-6"
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-[#8E9B91]/80">
          <div>
            © 2025 Unifolio. All rights reserved.
          </div>

          <div className="flex items-center gap-2">
            <span>Built for clarity. Designed for better decisions.</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] shadow-[0_0_6px_#22C55E] inline-block ml-1" />
          </div>
        </div>
      </div>
    </footer>
  );
}
