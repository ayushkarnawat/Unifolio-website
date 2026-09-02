"use client";

import { useState } from "react";
import { motion, MotionValue, useTransform } from "framer-motion";
import { Eye, Sparkles, SlidersHorizontal } from "lucide-react";

export function Scene2OpticalReticle({
  progress, // 0.18 to 0.42 (active in Act 2)
}: {
  progress: MotionValue<number>;
}) {
  const [aperture, setAperture] = useState(0.65); // 0 (regular plan) to 1 (pure direct alpha)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Opacity and scale transforms for Scene 2
  const opacity = useTransform(progress, [0.18, 0.24, 0.38, 0.44], [0, 1, 1, 0]);
  const scale = useTransform(progress, [0.18, 0.24, 0.38, 0.44], [0.85, 1, 1, 1.15]);

  // Alpha compounding calculations based on optical aperture
  const regularDragYears = 15;
  const portfolioSize = 5000000; // 50 Lakhs
  const regularCommissionRate = 0.0125; // 1.25% trail
  const lostCompounding = Math.round(portfolioSize * Math.pow(1 + 0.12 - regularCommissionRate * (1 - aperture), regularDragYears) - portfolioSize * Math.pow(1 + 0.1075, regularDragYears));

  return (
    <motion.div
      style={{ opacity, scale }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMousePos({
          x: (e.clientX - rect.left) / rect.width - 0.5,
          y: (e.clientY - rect.top) / rect.height - 0.5,
        });
      }}
      className="absolute inset-0 flex flex-col items-center justify-center select-none overflow-hidden px-6"
    >
      {/* Background Optical Grid Lines */}
      <svg
        viewBox="0 0 1000 700"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-35 overflow-visible"
        fill="none"
      >
        {/* Polar Crosshairs */}
        <circle cx="500" cy="350" r="180" stroke="#2E7D4E" strokeWidth="1.2" strokeDasharray="3 3" />
        <circle cx="500" cy="350" r="280" stroke="#1C241E" strokeWidth="1" strokeDasharray="5 5" strokeOpacity="0.4" />
        <circle cx="500" cy="350" r="380" stroke="#8CD49E" strokeWidth="0.8" strokeDasharray="6 8" strokeOpacity="0.3" />

        {/* Optical Axis Ticks */}
        <line x1="500" y1="50" x2="500" y2="650" stroke="#1C241E" strokeWidth="0.8" strokeDasharray="4 4" strokeOpacity="0.3" />
        <line x1="50" y1="350" x2="950" y2="350" stroke="#1C241E" strokeWidth="0.8" strokeDasharray="4 4" strokeOpacity="0.3" />

        {/* Compass Protractor Angle Ticks */}
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
          <line
            key={deg}
            x1="500"
            y1="350"
            x2={500 + 290 * Math.cos((deg * Math.PI) / 180)}
            y2={350 + 290 * Math.sin((deg * Math.PI) / 180)}
            stroke="#2E7D4E"
            strokeWidth="0.6"
            strokeOpacity="0.25"
          />
        ))}
      </svg>

      {/* Act Header */}
      <div className="text-center mb-6 max-w-2xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#1C241E]/15 bg-[#FAF8F5] px-4 py-1.5 font-mono text-xs uppercase tracking-widest text-[#2E7D4E]">
          <Eye className="h-3.5 w-3.5" />
          <span>ACT 02 · THE OPTICAL RETICLE</span>
        </div>
        <h2 className="mt-3 font-serif text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#1C241E] leading-[1.04]">
          Peeling back the <span className="text-[#2E7D4E] italic font-normal">hidden toll.</span>
        </h2>
        <p className="mt-2 font-sans text-sm sm:text-base text-[#525E55]">
          Most portfolios look healthy until you inspect the microscopic 1.5% distributor drag compounding against your wealth.
        </p>
      </div>

      {/* The Central Interactive Optical Lens Aperture */}
      <div className="relative w-full max-w-2xl h-[280px] sm:h-[320px] flex items-center justify-center">
        {/* Dynamic Light-Bending Lens Cylinder */}
        <motion.div
          animate={{
            x: mousePos.x * 25,
            y: mousePos.y * 25,
          }}
          transition={{ type: "spring", stiffness: 150, damping: 18 }}
          className="relative w-72 sm:w-80 h-72 sm:h-80 rounded-full border-[2.5px] border-[#1C241E] bg-[#FFFFFF]/90 shadow-2xl backdrop-blur-xl flex items-center justify-center overflow-hidden"
        >
          {/* Mint Glass Refraction Halo */}
          <div
            className="absolute inset-0 transition-opacity duration-300 pointer-events-none"
            style={{
              background: `radial-gradient(circle at ${50 + mousePos.x * 30}% ${50 + mousePos.y * 30}%, rgba(140,212,158,0.45) 0%, rgba(46,125,78,0.1) 70%, transparent 100%)`,
            }}
          />

          {/* Slicing Optical Reticle Blades */}
          <svg viewBox="0 0 300 300" className="w-full h-full overflow-visible" fill="none">
            {/* Left Sector: Regular Plan (Distributor Cut Drag) */}
            <path
              d="M 150 150 L 30 150 A 120 120 0 0 1 150 30 Z"
              fill="#FAF8F5"
              fillOpacity={1 - aperture}
              stroke="#1C241E"
              strokeWidth="1.6"
            />
            {/* Right Sector: Direct Plan (Uncompromised Alpha Growth) */}
            <path
              d="M 150 150 L 150 30 A 120 120 0 1 1 270 150 Z"
              fill="#8CD49E"
              fillOpacity={aperture * 0.7}
              stroke="#2E7D4E"
              strokeWidth="2"
            />

            {/* Central Precision Target Dial */}
            <circle cx="150" cy="150" r="32" fill="#FFFFFF" stroke="#1C241E" strokeWidth="2" />
            <circle cx="150" cy="150" r="14" fill="#2E7D4E" />

            {/* Micro Crosshairs */}
            <line x1="130" y1="150" x2="170" y2="150" stroke="#FFFFFF" strokeWidth="1.5" />
            <line x1="150" y1="130" x2="150" y2="170" stroke="#FFFFFF" strokeWidth="1.5" />
          </svg>

          {/* Live Telemetry Readout in the Reticle */}
          <div className="absolute bottom-6 inset-x-0 text-center font-mono text-[10px] text-[#1C241E] font-bold">
            <span>DISSECTION RATIO: {(aperture * 100).toFixed(0)}% DIRECT</span>
          </div>
        </motion.div>

        {/* Floating Telemetry Callout: The Compounding Alpha Delta */}
        <motion.div
          animate={{ y: [-3, 3, -3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -right-2 sm:right-6 top-6 bg-[#FAF8F5] border border-[#1C241E] rounded-2xl p-4 shadow-md max-w-[200px] text-left"
        >
          <div className="flex items-center gap-1.5 text-[#2E7D4E] font-mono text-[10px] font-bold uppercase">
            <Sparkles className="h-3 w-3" />
            <span>Compounding Alpha</span>
          </div>
          <div className="mt-1 font-serif text-2xl font-black text-[#1C241E]">
            +₹{(lostCompounding / 100000).toFixed(1)}L
          </div>
          <p className="mt-1 font-sans text-[10px] text-[#525E55] leading-tight">
            Restored to your net worth over 15 yrs by eliminating distributor trail fees.
          </p>
        </motion.div>
      </div>

      {/* Interactive Aperture Scrubber Slider */}
      <div className="mt-6 flex flex-col items-center gap-2 max-w-sm w-full">
        <div className="flex items-center justify-between w-full font-mono text-xs text-[#525E55]">
          <span>REGULAR (1.5% TOLL)</span>
          <span className="font-bold text-[#2E7D4E]">DIRECT (0% KICKBACK)</span>
        </div>
        <div className="relative w-full flex items-center">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={aperture}
            onChange={(e) => setAperture(parseFloat(e.target.value))}
            className="w-full h-2 bg-[#EAF5ED] rounded-lg appearance-none cursor-pointer accent-[#2E7D4E]"
          />
        </div>
        <span className="font-sans text-xs text-[#8E9B91]">
          Drag slider to adjust optical inspection aperture
        </span>
      </div>
    </motion.div>
  );
}
