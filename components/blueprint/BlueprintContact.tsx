"use client";

import { useState, useRef } from "react";
import { Mail, Phone, MapPin, ArrowUpRight, Check, Lock } from "lucide-react";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

export function BlueprintContact() {
  const containerRef = useRef<HTMLElement | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useGSAP(
    () => {
      if (prefersReducedMotion() || !containerRef.current) return;

      gsap.from(".contact-info-col", {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
        },
        y: 24,
        opacity: 0,
        duration: 1.2,
        ease: "power2.out",
      });

      gsap.from(".contact-form-card", {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 78%",
        },
        y: 28,
        opacity: 0,
        duration: 1.3,
        delay: 0.1,
        ease: "power2.out",
      });
    },
    { scope: containerRef }
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <section
      id="contact"
      ref={containerRef}
      className="relative w-full bg-[#030604] py-24 sm:py-32 lg:py-36 px-6 sm:px-12 lg:px-20 text-[#FAF8F5] select-none overflow-hidden"
    >
      {/* Seamless Top Blend from FAQ */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#030604] to-transparent z-10" />
      {/* =========================================================================
          ATMOSPHERIC BACKGROUND VISUALS & ORBITAL TUNNEL LINEWORK
         ========================================================================= */}

      {/* Center/Left-Leaning Luminous Orbital Tunnel & Particle Nodes */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-[62%] sm:-translate-x-[55%] -translate-y-1/2 w-[700px] sm:w-[950px] lg:w-[1200px] h-[700px] sm:h-[950px] lg:h-[1200px] z-0 overflow-visible">
        <svg
          viewBox="0 0 1000 1000"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full opacity-85"
        >
          <defs>
            <radialGradient
              id="contactCoreGlow"
              cx="500"
              cy="500"
              r="400"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#22C55E" stopOpacity="0.25" />
              <stop offset="40%" stopColor="#15803D" stopOpacity="0.10" />
              <stop offset="75%" stopColor="#041409" stopOpacity="0.02" />
              <stop offset="100%" stopColor="#030604" stopOpacity="0" />
            </radialGradient>
            <filter id="tunnelArcGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="14" result="blurWide" />
              <feGaussianBlur stdDeviation="5" result="blurMid" />
              <feMerge>
                <feMergeNode in="blurWide" />
                <feMergeNode in="blurMid" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Central Atmospheric Glow */}
          <circle cx="500" cy="500" r="320" fill="url(#contactCoreGlow)" />

          {/* Concentric Elliptical Orbital Ring Lines (Tunnel Effect) */}
          <ellipse cx="500" cy="500" rx="90" ry="170" stroke="#4ADE80" strokeWidth="0.75" strokeOpacity="0.15" />
          <ellipse cx="500" cy="500" rx="120" ry="220" stroke="#4ADE80" strokeWidth="0.85" strokeOpacity="0.22" />
          <ellipse cx="500" cy="500" rx="155" ry="275" stroke="#4ADE80" strokeWidth="0.9" strokeOpacity="0.28" />
          <ellipse cx="500" cy="500" rx="195" ry="335" stroke="#4ADE80" strokeWidth="1" strokeOpacity="0.32" />
          <ellipse cx="500" cy="500" rx="245" ry="400" stroke="#4ADE80" strokeWidth="0.8" strokeOpacity="0.25" />
          <ellipse cx="500" cy="500" rx="300" ry="470" stroke="#4ADE80" strokeWidth="0.7" strokeOpacity="0.18" strokeDasharray="4 8" />
          <ellipse cx="500" cy="500" rx="365" ry="540" stroke="#4ADE80" strokeWidth="0.55" strokeOpacity="0.12" />

          {/* Radiant Neon Green Core Arc (Focal Luminous Rim) */}
          <path
            d="M 445 280 C 490 340, 508 420, 508 500 C 508 580, 490 660, 445 720"
            stroke="#22C55E"
            strokeWidth="5"
            strokeOpacity="0.35"
            strokeLinecap="round"
            filter="url(#tunnelArcGlow)"
          />
          <path
            d="M 445 280 C 490 340, 508 420, 508 500 C 508 580, 490 660, 445 720"
            stroke="#86EFAC"
            strokeWidth="1.6"
            strokeOpacity="0.9"
            strokeLinecap="round"
          />

          {/* Luminous Node Particles along the Tunnel Ellipses */}
          {/* Top Node */}
          <circle cx="515" cy="180" r="3" fill="#86EFAC" filter="drop-shadow(0 0 6px #4ADE80)" />
          <circle cx="515" cy="180" r="1.5" fill="#FFFFFF" />

          {/* Upper Right Node */}
          <circle cx="410" cy="285" r="3.5" fill="#86EFAC" filter="drop-shadow(0 0 7px #4ADE80)" />
          <circle cx="410" cy="285" r="1.6" fill="#FFFFFF" />

          {/* Middle Left Node */}
          <circle cx="335" cy="485" r="2.8" fill="#4ADE80" filter="drop-shadow(0 0 6px #4ADE80)" />
          <circle cx="335" cy="485" r="1.3" fill="#FFFFFF" />

          {/* Bottom Center Node */}
          <circle cx="508" cy="815" r="3.5" fill="#86EFAC" filter="drop-shadow(0 0 8px #4ADE80)" />
          <circle cx="508" cy="815" r="1.8" fill="#FFFFFF" />
        </svg>
      </div>

      {/* Subtle Top Border Hairline */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

      {/* =========================================================================
          MAIN CONTACT CONTENT GRID (Two-Column Layout)
         ========================================================================= */}
      <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        
        {/* Left Column: Eyebrow, Statement, Description & Contact Details */}
        <div className="contact-info-col lg:col-span-5 space-y-10 lg:sticky lg:top-28">
          
          <div className="space-y-6">
            {/* Eyebrow */}
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs sm:text-sm text-[#4ADE80] uppercase tracking-[0.25em] font-semibold">
                CONTACT US —
              </span>
            </div>

            {/* Monumental Editorial Statement */}
            <h2 className="font-sans font-light md:font-normal text-4xl sm:text-5xl lg:text-[54px] text-[#FAF8F5] tracking-tight leading-[1.08]">
              You’ve got portfolios. <br />
              We’ve got clarity. <br />
              <span className="text-[#4ADE80] font-normal">Let’s connect.</span>
            </h2>

            {/* Supporting Copy */}
            <p className="font-sans text-xs sm:text-sm text-[#8E9B91] leading-relaxed max-w-md">
              Whether you have a question, need a demo, or want to explore how Unifolio can help — our team is here for you.
            </p>
          </div>

          {/* Minimal Outlined Contact Detail List */}
          <div className="space-y-6 pt-2">
            
            {/* Email */}
            <div className="flex items-center gap-4 group">
              <div className="w-11 h-11 rounded-full border border-white/15 bg-white/[0.03] flex items-center justify-center text-[#4ADE80] group-hover:border-[#4ADE80] group-hover:bg-[#122418] transition-all duration-300 shadow-[0_0_12px_rgba(74,222,128,0.06)]">
                <Mail className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <p className="text-[11px] font-mono text-[#8E9B91] uppercase tracking-wider">
                  Email us at
                </p>
                <a
                  href="mailto:hello@unifolio.in"
                  className="font-sans text-sm font-medium text-white group-hover:text-[#4ADE80] transition-colors"
                >
                  hello@unifolio.in
                </a>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-4 group">
              <div className="w-11 h-11 rounded-full border border-white/15 bg-white/[0.03] flex items-center justify-center text-[#4ADE80] group-hover:border-[#4ADE80] group-hover:bg-[#122418] transition-all duration-300 shadow-[0_0_12px_rgba(74,222,128,0.06)]">
                <Phone className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <p className="text-[11px] font-mono text-[#8E9B91] uppercase tracking-wider">
                  Call us at
                </p>
                <a
                  href="tel:+919876543210"
                  className="font-sans text-sm font-medium text-white group-hover:text-[#4ADE80] transition-colors"
                >
                  +91 98765 43210
                </a>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center gap-4 group">
              <div className="w-11 h-11 rounded-full border border-white/15 bg-white/[0.03] flex items-center justify-center text-[#4ADE80] group-hover:border-[#4ADE80] group-hover:bg-[#122418] transition-all duration-300 shadow-[0_0_12px_rgba(74,222,128,0.06)]">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <p className="text-[11px] font-mono text-[#8E9B91] uppercase tracking-wider">
                  Visit us
                </p>
                <p className="font-sans text-sm font-medium text-white">
                  Bengaluru, India
                </p>
              </div>
            </div>

          </div>

        </div>

        {/* Right Column: Premium Dark Rounded Contact Form Panel */}
        <div className="contact-form-card lg:col-span-7">
          <div className="relative rounded-[32px] sm:rounded-[36px] border border-white/[0.1] bg-[#070c09]/95 backdrop-blur-2xl p-7 sm:p-10 shadow-[0_24px_60px_rgba(0,0,0,0.85),0_0_50px_rgba(74,222,128,0.06)] overflow-hidden">
            
            {/* Specular Top Border Sheen */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            {submitted ? (
              <div className="py-16 text-center space-y-5">
                <div className="w-16 h-16 rounded-full bg-[#132c1d] border border-[#4ADE80] text-[#4ADE80] flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(74,222,128,0.3)]">
                  <Check className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-sans font-light text-2xl sm:text-3xl text-white">
                    Message Received
                  </h3>
                  <p className="font-sans text-sm text-[#8E9B91] max-w-md mx-auto leading-relaxed">
                    Thank you, {formData.firstName || "there"}. A portfolio intelligence specialist will reach out to you within 24 hours.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({
                      firstName: "",
                      lastName: "",
                      email: "",
                      phone: "",
                      subject: "",
                      message: "",
                    });
                  }}
                  className="mt-4 font-mono text-xs text-[#4ADE80] uppercase tracking-widest hover:underline cursor-pointer"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Row 1: First Name & Last Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block font-sans text-xs text-[#8E9B91] mb-1.5 font-medium"
                    >
                      First Name <span className="text-[#4ADE80]">*</span>
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      placeholder="e.g. John"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full rounded-xl bg-[#040805]/90 border border-white/[0.08] px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#4ADE80] focus:ring-1 focus:ring-[#4ADE80]/40 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="lastName"
                      className="block font-sans text-xs text-[#8E9B91] mb-1.5 font-medium"
                    >
                      Last Name
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      placeholder="e.g. Doe"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full rounded-xl bg-[#040805]/90 border border-white/[0.08] px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#4ADE80] focus:ring-1 focus:ring-[#4ADE80]/40 transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Row 2: Email Address & Phone Number */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="email"
                      className="block font-sans text-xs text-[#8E9B91] mb-1.5 font-medium"
                    >
                      Email Address <span className="text-[#4ADE80]">*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="e.g. john@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full rounded-xl bg-[#040805]/90 border border-white/[0.08] px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#4ADE80] focus:ring-1 focus:ring-[#4ADE80]/40 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="phone"
                      className="block font-sans text-xs text-[#8E9B91] mb-1.5 font-medium"
                    >
                      Phone Number
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="e.g. +91 98765 43210"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full rounded-xl bg-[#040805]/90 border border-white/[0.08] px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#4ADE80] focus:ring-1 focus:ring-[#4ADE80]/40 transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Row 3: Subject */}
                <div>
                  <label
                    htmlFor="subject"
                    className="block font-sans text-xs text-[#8E9B91] mb-1.5 font-medium"
                  >
                    Subject
                  </label>
                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    placeholder="e.g. Portfolio Audit / CAS Import Support"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full rounded-xl bg-[#040805]/90 border border-white/[0.08] px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#4ADE80] focus:ring-1 focus:ring-[#4ADE80]/40 transition-all duration-200"
                  />
                </div>

                {/* Row 4: Message */}
                <div>
                  <label
                    htmlFor="message"
                    className="block font-sans text-xs text-[#8E9B91] mb-1.5 font-medium"
                  >
                    Your Message <span className="text-[#4ADE80]">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    required
                    placeholder="How can we help you?"
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full rounded-xl bg-[#040805]/90 border border-white/[0.08] px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#4ADE80] focus:ring-1 focus:ring-[#4ADE80]/40 transition-all duration-200 resize-none"
                  />
                </div>

                {/* Premium Send Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full group rounded-xl border border-[#4ADE80]/50 bg-gradient-to-r from-[#0d1f14] via-[#142f1f] to-[#0d1f14] px-8 py-4 font-mono font-semibold text-xs sm:text-sm text-[#4ADE80] tracking-[0.22em] uppercase shadow-[0_0_25px_rgba(74,222,128,0.12)] hover:bg-[#1a3a27] hover:border-[#4ADE80] hover:text-[#86EFAC] hover:shadow-[0_0_35px_rgba(74,222,128,0.25)] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                  >
                    <span>{loading ? "SENDING..." : "SEND MESSAGE"}</span>
                    <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </button>
                </div>

                {/* Privacy Assurance */}
                <div className="flex items-center justify-center gap-1.5 text-xs text-[#8E9B91] pt-1">
                  <Lock className="w-3.5 h-3.5 text-[#4ADE80]/80" />
                  <span>We respect your privacy. Your information is safe with us.</span>
                </div>

              </form>
            )}

          </div>
        </div>

      </div>

      {/* Seamless Bottom Section Blend into Footer */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#020403] to-transparent z-10" />
    </section>
  );
}
