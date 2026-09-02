"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { smoothScrollTo } from "@/lib/gsap";

export function BlueprintNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleAnchorClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    if (!href.startsWith("#")) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    smoothScrollTo(href);
  };

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 sm:px-10 lg:px-16 py-4 select-none transition-all duration-500 ease-out ${
        scrolled
          ? "bg-[#040705]/85 border-b border-white/[0.08] backdrop-blur-xl shadow-[0_12px_32px_rgba(0,0,0,0.6)] py-3.5"
          : "bg-transparent border-b border-transparent py-5"
      }`}
    >
      {/* Left Brand Logo */}
      <Link
        href="#hero"
        onClick={(e) => handleAnchorClick(e, "#hero")}
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

      {/* Center Navigation Links */}
      <div className="hidden md:flex items-center gap-7 lg:gap-10 font-mono text-[11px] lg:text-xs tracking-[0.25em] text-[#8E9B91] uppercase">
        {[
          { label: "HOME", href: "#hero" },
          { label: "PRODUCT", href: "#statement" },
          { label: "OFFERINGS", href: "#offerings" },
          { label: "ABOUT", href: "#about" },
          { label: "CONTACT", href: "#contact" },
        ].map((item) => (
          <Link
            key={item.label}
            href={item.href}
            onClick={(e) => handleAnchorClick(e, item.href)}
            className="relative py-1 hover:text-[#FAF8F5] transition-colors duration-200 group"
          >
            <span>{item.label}</span>
            <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#4ADE80] transition-all duration-300 ease-out group-hover:w-full opacity-80" />
          </Link>
        ))}
      </div>

      {/* Right Request Access CTA */}
      <Link
        href="#contact"
        onClick={(e) => handleAnchorClick(e, "#contact")}
        className="flex items-center gap-2.5 px-4 py-2 rounded-full border border-white/15 bg-white/[0.03] hover:border-[#4ADE80]/60 hover:bg-[#0f2418] font-mono text-[11px] lg:text-xs tracking-[0.22em] text-[#FAF8F5] uppercase transition-all duration-300 group shadow-[0_0_15px_rgba(74,222,128,0.06)] active:scale-95"
      >
        <span className="group-hover:text-[#4ADE80] transition-colors">REQUEST ACCESS</span>
        <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] shadow-[0_0_6px_#4ADE80] group-hover:scale-125 transition-transform" />
      </Link>
    </nav>
  );
}

