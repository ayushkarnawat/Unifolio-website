"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { NewsletterBand } from "@/components/layout/NewsletterBand";
import { footerNav, siteConfig } from "@/content/site";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";

export function SiteFooter() {
  const pathname = usePathname();
  const footerRef = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion() || !footerRef.current || pathname === "/") return;

      // Staggered reveal of footer columns on entrance
      gsap.from(".footer-column", {
        scrollTrigger: {
          trigger: footerRef.current,
          start: "top 85%",
        },
        y: 30,
        opacity: 0,
        stagger: 0.1,
        duration: 0.8,
        ease: "power3.out",
      });

      // Continuous breathing pulse on the operational green beacon
      gsap.to(".beacon-pulse", {
        scale: 1.8,
        opacity: 0,
        duration: 2,
        repeat: -1,
        ease: "power1.out",
      });
    },
    { scope: footerRef, dependencies: [pathname] }
  );

  // On homepage, the BlueprintFooter is rendered directly in page.tsx
  if (pathname === "/") return null;

  return (
    <footer ref={footerRef} className="border-t border-[#1C241E]/10 bg-[#FAF8F5] overflow-hidden">
      <NewsletterBand />

      <div className="mx-auto max-w-content px-6 py-14 sm:px-8 sm:py-16">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 md:grid-cols-12">
          {/* Brand Column */}
          <div className="footer-column md:col-span-6 space-y-4">
            <Link href="/" className="inline-flex items-center group transition-transform duration-300 hover:opacity-95">
              <Image
                src="/Logo/unifolio-wordmark-dark.png"
                alt="Unifolio"
                width={140}
                height={32}
                className="h-7 w-auto object-contain select-none transition-transform duration-300 group-hover:scale-[1.02]"
              />
            </Link>
            <p className="max-w-sm font-sans text-sm text-[#525E55] leading-relaxed">
              {siteConfig.tagline}
            </p>
            <div className="flex items-center gap-2.5 font-mono text-[11px] text-[#8E9B91]">
              <div className="relative flex h-2 w-2 items-center justify-center">
                <span className="beacon-pulse absolute h-2 w-2 rounded-full bg-[#2E7D4E]" />
                <span className="relative h-2 w-2 rounded-full bg-[#2E7D4E]" />
              </div>
              <span>MFCentral & CAS Sync Engine Operational</span>
            </div>

            {/* Social Media Links */}
            <div className="pt-2">
              <div className="flex items-center gap-4">
                {/* Instagram */}
                <a
                  href={siteConfig.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="group relative inline-flex items-center justify-center text-[#1C241E]/70 hover:text-[#22C55E] transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-110 drop-shadow-none hover:drop-shadow-[0_4px_12px_rgba(34,197,94,0.35)]"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5.5" ry="5.5" />
                    <circle cx="12" cy="12" r="4.2" />
                    <circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" stroke="none" />
                  </svg>
                </a>

                {/* Facebook */}
                <a
                  href={siteConfig.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="group relative inline-flex items-center justify-center text-[#1C241E]/70 hover:text-[#22C55E] transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-110 drop-shadow-none hover:drop-shadow-[0_4px_12px_rgba(34,197,94,0.35)]"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"/>
                  </svg>
                </a>

                {/* Twitter / X */}
                <a
                  href={siteConfig.social.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="X (formerly Twitter)"
                  className="group relative inline-flex items-center justify-center text-[#1C241E]/70 hover:text-[#22C55E] transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-110 drop-shadow-none hover:drop-shadow-[0_4px_12px_rgba(34,197,94,0.35)]"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>

                {/* LinkedIn */}
                <a
                  href={siteConfig.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="group relative inline-flex items-center justify-center text-[#1C241E]/70 hover:text-[#22C55E] transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-110 drop-shadow-none hover:drop-shadow-[0_4px_12px_rgba(34,197,94,0.35)]"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" clipRule="evenodd" d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14zm-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75zm-11.49 0v-8.37h-2.79v8.37h2.79zM5.62 8.63a1.62 1.62 0 1 0 0-3.24 1.62 1.62 0 0 0 0 3.24z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Product Nav */}
          <div className="footer-column md:col-span-3">
            <p className="font-sans text-xs uppercase tracking-widest text-[#8E9B91] font-bold">
              Product
            </p>
            <ul className="mt-4 space-y-2.5 font-sans text-sm">
              {footerNav.product.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-[#525E55] transition-colors hover:text-[#1C241E]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Nav */}
          <div className="footer-column md:col-span-3">
            <p className="font-sans text-xs uppercase tracking-widest text-[#8E9B91] font-bold">
              Company & Legal
            </p>
            <ul className="mt-4 space-y-2.5 font-sans text-sm">
              {footerNav.company.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-[#525E55] transition-colors hover:text-[#1C241E]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 flex flex-col gap-3 border-t border-[#1C241E]/10 pt-8 font-sans text-xs text-[#8E9B91] sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Unifolio Technologies Inc. All rights reserved.</p>
          <p className="text-[#525E55]">Art-directed Financial Sketchbook for Indian Wealth</p>
        </div>
      </div>
    </footer>
  );
}
