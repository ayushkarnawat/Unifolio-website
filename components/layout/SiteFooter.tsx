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
