"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

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

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 sm:px-10 lg:px-16 py-4 select-none transition-all duration-500 ease-out ${
        scrolled
          ? "bg-[#FAF8F5]/85 border-b border-black/[0.06] backdrop-blur-xl shadow-[0_12px_32px_rgba(0,0,0,0.05)] py-3.5"
          : "bg-transparent border-b border-transparent py-5"
      }`}
    >
      {/* Left Brand Glyph + Logotype */}
      <Link href="#hero" className="flex items-center gap-3 group">
        <svg viewBox="0 0 40 40" className="w-6 h-6 sm:w-7 sm:h-7 overflow-visible transition-transform duration-300 group-hover:scale-105">
          <circle
            cx="20"
            cy="20"
            r="16"
            stroke="#121915"
            strokeWidth="3"
            strokeOpacity="0.2"
            fill="none"
          />
          <path
            d="M 20 4 A 16 16 0 0 1 36 20"
            stroke="#1E6B3E"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
            filter="drop-shadow(0px 0px 4px rgba(30, 107, 62, 0.4))"
          />
        </svg>
        <span className="font-sans font-black text-sm sm:text-base tracking-[0.18em] text-[#121915] group-hover:text-[#1E6B3E] transition-colors">
          UNIFOLIO<sup className="text-[9px] font-normal ml-0.5 opacity-70">®</sup>
        </span>
      </Link>

      {/* Center Navigation Links */}
      <div className="hidden md:flex items-center gap-7 lg:gap-10 font-mono text-[11px] lg:text-xs tracking-[0.25em] text-[#525E56] uppercase">
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
            className="relative py-1 hover:text-[#121915] transition-colors duration-200 group"
          >
            <span>{item.label}</span>
            <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#1E6B3E] transition-all duration-300 ease-out group-hover:w-full opacity-80" />
          </Link>
        ))}
      </div>

      {/* Right Request Access CTA */}
      <Link
        href="#contact"
        className="flex items-center gap-2.5 px-4 py-2 rounded-full border border-black/10 bg-black/[0.03] hover:border-[#1E6B3E]/40 hover:bg-[#EDF7EF] font-mono text-[11px] lg:text-xs tracking-[0.22em] text-[#121915] uppercase transition-all duration-300 group shadow-[0_2px_10px_rgba(0,0,0,0.03)] active:scale-95"
      >
        <span className="group-hover:text-[#1E6B3E] transition-colors">REQUEST ACCESS</span>
        <span className="w-1.5 h-1.5 rounded-full bg-[#1E6B3E] shadow-[0_0_6px_rgba(30,107,62,0.6)] group-hover:scale-125 transition-transform" />
      </Link>
    </nav>
  );
}

