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
        y: 35,
        opacity: 0,
        duration: 1.4,
        ease: "power3.out",
      });

      gsap.from(".contact-form-card", {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 78%",
        },
        y: 45,
        opacity: 0,
        duration: 1.55,
        delay: 0.2,
        ease: "power3.out",
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
      className="relative w-full bg-[#FAF8F5] py-24 sm:py-32 lg:py-36 px-6 sm:px-12 lg:px-20 text-[#121915] select-none overflow-hidden"
    >
      {/* Seamless Top Blend from FAQ */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#F5F3EE] to-transparent z-10" />
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
              <stop offset="0%" stopColor="#1E6B3E" stopOpacity="0.18" />
              <stop offset="40%" stopColor="#1E6B3E" stopOpacity="0.08" />
              <stop offset="75%" stopColor="#1E6B3E" stopOpacity="0.02" />
              <stop offset="100%" stopColor="#FAF8F5" stopOpacity="0" />
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
          <ellipse cx="500" cy="500" rx="90" ry="170" stroke="#1E6B3E" strokeWidth="0.75" strokeOpacity="0.15" />
          <ellipse cx="500" cy="500" rx="120" ry="220" stroke="#1E6B3E" strokeWidth="0.85" strokeOpacity="0.22" />
          <ellipse cx="500" cy="500" rx="155" ry="275" stroke="#1E6B3E" strokeWidth="0.9" strokeOpacity="0.28" />
          <ellipse cx="500" cy="500" rx="195" ry="335" stroke="#1E6B3E" strokeWidth="1" strokeOpacity="0.32" />
          <ellipse cx="500" cy="500" rx="245" ry="400" stroke="#1E6B3E" strokeWidth="0.8" strokeOpacity="0.25" />
          <ellipse cx="500" cy="500" rx="300" ry="470" stroke="#1E6B3E" strokeWidth="0.7" strokeOpacity="0.18" strokeDasharray="4 8" />
          <ellipse cx="500" cy="500" rx="365" ry="540" stroke="#1E6B3E" strokeWidth="0.55" strokeOpacity="0.12" />

          {/* Radiant Neon Green Core Arc (Focal Luminous Rim) */}
          <path
            d="M 445 280 C 490 340, 508 420, 508 500 C 508 580, 490 660, 445 720"
            stroke="#1E6B3E"
            strokeWidth="5"
            strokeOpacity="0.25"
            strokeLinecap="round"
            filter="url(#tunnelArcGlow)"
          />
          <path
            d="M 445 280 C 490 340, 508 420, 508 500 C 508 580, 490 660, 445 720"
            stroke="#1E6B3E"
            strokeWidth="1.6"
            strokeOpacity="0.8"
            strokeLinecap="round"
          />

          {/* Luminous Node Particles along the Tunnel Ellipses */}
          <circle cx="590" cy="500" r="3.5" fill="#1E6B3E" />
          <circle cx="590" cy="500" r="1.5" fill="#121915" />
          <circle cx="410" cy="500" r="3.5" fill="#1E6B3E" />
          <circle cx="410" cy="500" r="1.5" fill="#121915" />
        </svg>
      </div>

      {/* =========================================================================
          MAIN CONTACT CONTENT GRID (Two-Column Layout)
         ========================================================================= */}
      <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        
        {/* Left Column: Eyebrow, Statement, Description & Contact Details */}
        <div className="contact-info-col lg:col-span-5 space-y-10 lg:sticky lg:top-28">
          
          <div className="space-y-4">
            {/* Eyebrow */}
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs sm:text-sm text-[#1E6B3E] uppercase tracking-[0.25em] font-semibold">
                CONTACT —
              </span>
            </div>

            {/* Monumental Editorial Statement */}
            <h2 className="font-sans font-light md:font-normal text-4xl sm:text-5xl lg:text-[58px] text-[#121915] tracking-tight leading-[1.06]">
              Begin Your <br />
              Migration
            </h2>

            {/* Supporting Copy */}
            <p className="font-sans text-xs sm:text-sm md:text-base text-[#525E56] leading-relaxed max-w-sm pt-2">
              Ready to unmask hidden distribution drag and consolidate your multi-entity portfolio? Our sovereign intelligence team is here to assist.
            </p>
          </div>

          {/* Minimal Outlined Contact Detail List */}
          <div className="space-y-6 pt-4 border-t border-black/[0.06]">
            
            {/* Email */}
            <div className="flex items-center gap-4 group">
              <div className="w-11 h-11 rounded-full border border-black/10 bg-black/[0.03] flex items-center justify-center text-[#1E6B3E] group-hover:border-[#1E6B3E] group-hover:bg-[#EDF7EF] transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                <Mail className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <p className="text-[11px] font-mono text-[#525E56] uppercase tracking-wider">
                  Email us at
                </p>
                <a
                  href="mailto:hello@unifolio.in"
                  className="font-sans text-sm font-medium text-[#121915] group-hover:text-[#1E6B3E] transition-colors"
                >
                  hello@unifolio.in
                </a>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-4 group">
              <div className="w-11 h-11 rounded-full border border-black/10 bg-black/[0.03] flex items-center justify-center text-[#1E6B3E] group-hover:border-[#1E6B3E] group-hover:bg-[#EDF7EF] transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                <Phone className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <p className="text-[11px] font-mono text-[#525E56] uppercase tracking-wider">
                  Call us at
                </p>
                <a
                  href="tel:+919876543210"
                  className="font-sans text-sm font-medium text-[#121915] group-hover:text-[#1E6B3E] transition-colors"
                >
                  +91 98765 43210
                </a>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center gap-4 group">
              <div className="w-11 h-11 rounded-full border border-black/10 bg-black/[0.03] flex items-center justify-center text-[#1E6B3E] group-hover:border-[#1E6B3E] group-hover:bg-[#EDF7EF] transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <p className="text-[11px] font-mono text-[#525E56] uppercase tracking-wider">
                  Visit us
                </p>
                <p className="font-sans text-sm font-medium text-[#121915]">
                  Bengaluru, India
                </p>
              </div>
            </div>

          </div>

        </div>

        {/* Right Column: Premium Light Rounded Contact Form Panel */}
        <div className="contact-form-card lg:col-span-7">
          <div className="relative rounded-[32px] sm:rounded-[36px] border border-black/10 bg-white/95 backdrop-blur-2xl p-7 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.06),0_0_30px_rgba(30,107,62,0.04)] overflow-hidden">
            
            {/* Specular Top Border Sheen */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-black/10 to-transparent" />

            {submitted ? (
              <div className="py-16 text-center space-y-5">
                <div className="w-16 h-16 rounded-full bg-[#EDF7EF] border border-[#1E6B3E] text-[#1E6B3E] flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(30,107,62,0.2)]">
                  <Check className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-sans font-light text-2xl sm:text-3xl text-[#121915]">
                    Message Received
                  </h3>
                  <p className="font-sans text-sm text-[#525E56] max-w-md mx-auto leading-relaxed">
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
                  className="mt-4 font-mono text-xs text-[#1E6B3E] uppercase tracking-widest hover:underline cursor-pointer"
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
                      className="block font-sans text-xs text-[#525E56] mb-1.5 font-medium"
                    >
                      First Name <span className="text-[#1E6B3E]">*</span>
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      placeholder="e.g. John"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full rounded-xl bg-[#FAF8F5] border border-black/10 px-4 py-3 text-sm text-[#121915] placeholder:text-black/30 focus:outline-none focus:border-[#1E6B3E] focus:ring-1 focus:ring-[#1E6B3E]/40 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="lastName"
                      className="block font-sans text-xs text-[#525E56] mb-1.5 font-medium"
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
                      className="w-full rounded-xl bg-[#FAF8F5] border border-black/10 px-4 py-3 text-sm text-[#121915] placeholder:text-black/30 focus:outline-none focus:border-[#1E6B3E] focus:ring-1 focus:ring-[#1E6B3E]/40 transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Row 2: Email Address & Phone Number */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="email"
                      className="block font-sans text-xs text-[#525E56] mb-1.5 font-medium"
                    >
                      Email Address <span className="text-[#1E6B3E]">*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="e.g. john@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full rounded-xl bg-[#FAF8F5] border border-black/10 px-4 py-3 text-sm text-[#121915] placeholder:text-black/30 focus:outline-none focus:border-[#1E6B3E] focus:ring-1 focus:ring-[#1E6B3E]/40 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="phone"
                      className="block font-sans text-xs text-[#525E56] mb-1.5 font-medium"
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
                      className="w-full rounded-xl bg-[#FAF8F5] border border-black/10 px-4 py-3 text-sm text-[#121915] placeholder:text-black/30 focus:outline-none focus:border-[#1E6B3E] focus:ring-1 focus:ring-[#1E6B3E]/40 transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Row 3: Subject */}
                <div>
                  <label
                    htmlFor="subject"
                    className="block font-sans text-xs text-[#525E56] mb-1.5 font-medium"
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
                    className="w-full rounded-xl bg-[#FAF8F5] border border-black/10 px-4 py-3 text-sm text-[#121915] placeholder:text-black/30 focus:outline-none focus:border-[#1E6B3E] focus:ring-1 focus:ring-[#1E6B3E]/40 transition-all duration-200"
                  />
                </div>

                {/* Row 4: Message */}
                <div>
                  <label
                    htmlFor="message"
                    className="block font-sans text-xs text-[#525E56] mb-1.5 font-medium"
                  >
                    Your Message <span className="text-[#1E6B3E]">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    required
                    placeholder="How can we help you?"
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full rounded-xl bg-[#FAF8F5] border border-black/10 px-4 py-3 text-sm text-[#121915] placeholder:text-black/30 focus:outline-none focus:border-[#1E6B3E] focus:ring-1 focus:ring-[#1E6B3E]/40 transition-all duration-200 resize-none"
                  />
                </div>

                {/* Premium Send Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full group rounded-xl border border-[#1E6B3E]/40 bg-gradient-to-r from-[#1E6B3E] via-[#247A46] to-[#1E6B3E] px-8 py-4 font-mono font-semibold text-xs sm:text-sm text-white tracking-[0.22em] uppercase shadow-[0_4px_20px_rgba(30,107,62,0.25)] hover:shadow-[0_6px_25px_rgba(30,107,62,0.35)] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                  >
                    <span>{loading ? "SENDING..." : "SEND MESSAGE"}</span>
                    <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </button>
                </div>

                {/* Privacy Assurance */}
                <div className="flex items-center justify-center gap-1.5 text-xs text-[#525E56] pt-1">
                  <Lock className="w-3.5 h-3.5 text-[#1E6B3E]" />
                  <span>We respect your privacy. Your information is safe with us.</span>
                </div>

              </form>
            )}

          </div>
        </div>

      </div>

      {/* Seamless Bottom Section Blend into Footer */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#FAF8F5] to-transparent z-10" />
    </section>
  );
}
