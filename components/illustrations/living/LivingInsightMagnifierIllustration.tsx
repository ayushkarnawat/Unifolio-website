"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

export function LivingInsightMagnifierIllustration({
  className = "w-full max-w-[560px] h-[400px]",
}: {
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeNote, setActiveNote] = useState<string | null>(null);
  const [lensOffset, setLensOffset] = useState({ x: 0, y: 0 });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const smooth = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 20,
    restDelta: 0.001,
  });

  const pathStroke = useTransform(smooth, [0.05, 0.45], [0, 1]);
  const secondaryStroke = useTransform(smooth, [0.15, 0.6], [0, 1]);
  const washOpacity = useTransform(smooth, [0.35, 0.75], [0, 1]);
  const detailsOpacity = useTransform(smooth, [0.45, 0.9], [0, 1]);

  return (
    <div
      ref={containerRef}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const relX = (e.clientX - rect.left) / rect.width - 0.5;
        const relY = (e.clientY - rect.top) / rect.height - 0.5;
        setLensOffset({ x: relX * 14, y: relY * 14 });
      }}
      onMouseLeave={() => setLensOffset({ x: 0, y: 0 })}
      className={`relative select-none flex items-center justify-center ${className}`}
    >
      {/* Background Mint Halo */}
      <motion.div
        style={{ opacity: washOpacity }}
        className="pointer-events-none absolute inset-0 bg-[#EAF5ED]/60 rounded-full blur-3xl"
      />

      <svg
        viewBox="0 0 560 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible"
      >
        {/* ======================================================== */}
        {/* 1. MINT WATERCOLOR WASHES                                */}
        {/* ======================================================== */}
        <motion.g style={{ opacity: washOpacity }}>
          {/* Document Stack Wash */}
          <path
            d="M 330 110 L 400 95 L 420 250 L 350 265 Z"
            fill="#FFFFFF"
            fillOpacity="0.9"
          />
          <path
            d="M 350 135 L 420 120 L 440 270 L 370 285 Z"
            fill="#FAF8F5"
            fillOpacity="0.9"
          />

          {/* Sticky Note 1 (Top Left) Wash */}
          <path
            d="M 120 70 L 195 60 L 205 130 L 130 140 Z"
            fill="#FFFFFF"
            fillOpacity="0.9"
          />
          {/* Sticky Note 2 (Top Right) Wash */}
          <path
            d="M 270 75 L 350 85 L 340 150 L 260 140 Z"
            fill="#FFFFFF"
            fillOpacity="0.9"
          />
          {/* Sticky Note 3 (Bottom Left) Wash */}
          <path
            d="M 90 230 L 170 230 L 165 300 L 85 300 Z"
            fill="#EAF5ED"
            fillOpacity="0.8"
          />
        </motion.g>

        {/* ======================================================== */}
        {/* 2. BACKGROUND STACKED DOCUMENTS & BULLET LIST            */}
        {/* ======================================================== */}
        <g id="documents">
          {/* Back Sheet */}
          <motion.path
            d="M 350 135 L 420 120 L 440 270 L 370 285 Z"
            stroke="#1C241E"
            strokeWidth="1.6"
            strokeLinejoin="round"
            style={{ pathLength: secondaryStroke }}
          />

          {/* Front Sheet */}
          <motion.path
            d="M 330 110 L 400 95 L 420 250 L 350 265 Z"
            stroke="#1C241E"
            strokeWidth="2"
            strokeLinejoin="round"
            style={{ pathLength: pathStroke }}
          />

          {/* Bullet List on Front Sheet (Inspiration 1 signature) */}
          <motion.g style={{ opacity: detailsOpacity }}>
            {/* Bullet 1 */}
            <circle cx="350" cy="145" r="2.5" fill="#2E7D4E" />
            <line x1="360" y1="145" x2="395" y2="140" stroke="#1C241E" strokeWidth="1.4" strokeLinecap="round" />

            {/* Bullet 2 */}
            <circle cx="353" cy="170" r="2.5" fill="#2E7D4E" />
            <line x1="363" y1="170" x2="400" y2="165" stroke="#1C241E" strokeWidth="1.4" strokeLinecap="round" />

            {/* Bullet 3 */}
            <circle cx="356" cy="195" r="2.5" fill="#2E7D4E" />
            <line x1="366" y1="195" x2="390" y2="190" stroke="#1C241E" strokeWidth="1.4" strokeLinecap="round" />
          </motion.g>
        </g>

        {/* ======================================================== */}
        {/* 3. FLOATING STICKY NOTES WITH PENCIL CALLOUTS            */}
        {/* ======================================================== */}
        {/* Sticky Note 1: 'Higher expense ratio' */}
        <motion.g
          animate={{ y: [-2, 3, -2] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          onMouseEnter={() => setActiveNote("ratio")}
          onMouseLeave={() => setActiveNote(null)}
          className="cursor-pointer"
        >
          <motion.path
            d="M 120 70 L 195 60 L 205 130 L 130 140 Z"
            stroke="#1C241E"
            strokeWidth="1.6"
            strokeLinejoin="round"
            style={{ pathLength: secondaryStroke }}
          />
          {/* Note Sparkle Rays on corner */}
          <path d="M 195 50 L 200 42 M 205 55 L 215 50 M 208 65 L 218 68" stroke="#2E7D4E" strokeWidth="1.3" strokeLinecap="round" />
          <text
            x="135"
            y="95"
            fontFamily="var(--font-caveat, cursive)"
            fontSize="14"
            fill="#1C241E"
          >
            Higher
          </text>
          <text
            x="135"
            y="112"
            fontFamily="var(--font-caveat, cursive)"
            fontSize="14"
            fill="#1C241E"
          >
            expense ratio
          </text>
        </motion.g>

        {/* Sticky Note 2: 'Rebalancing opportunity' */}
        <motion.g
          animate={{ y: [3, -3, 3] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          onMouseEnter={() => setActiveNote("rebalance")}
          onMouseLeave={() => setActiveNote(null)}
          className="cursor-pointer"
        >
          <motion.path
            d="M 270 75 L 350 85 L 340 150 L 260 140 Z"
            stroke="#1C241E"
            strokeWidth="1.6"
            strokeLinejoin="round"
            style={{ pathLength: secondaryStroke }}
          />
          <text
            x="272"
            y="105"
            fontFamily="var(--font-caveat, cursive)"
            fontSize="14"
            fill="#1C241E"
          >
            Rebalancing
          </text>
          <text
            x="272"
            y="122"
            fontFamily="var(--font-caveat, cursive)"
            fontSize="14"
            fill="#1C241E"
          >
            opportunity
          </text>
        </motion.g>

        {/* Sticky Note 3: 'Tax saving potential' with Curled Corner */}
        <motion.g
          animate={{ y: [-3, 2, -3] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
          onMouseEnter={() => setActiveNote("tax")}
          onMouseLeave={() => setActiveNote(null)}
          className="cursor-pointer"
        >
          <motion.path
            d="M 90 230 L 170 230 L 165 300 L 85 300 Z"
            stroke="#1C241E"
            strokeWidth="1.6"
            strokeLinejoin="round"
            style={{ pathLength: secondaryStroke }}
          />
          {/* Curled fold on bottom left */}
          <path d="M 85 300 Q 100 285, 115 300" stroke="#1C241E" strokeWidth="1.4" fill="#FAF8F5" />
          <text
            x="98"
            y="260"
            fontFamily="var(--font-caveat, cursive)"
            fontSize="14"
            fill="#1C241E"
          >
            Tax saving
          </text>
          <text
            x="98"
            y="278"
            fontFamily="var(--font-caveat, cursive)"
            fontSize="14"
            fill="#1C241E"
          >
            potential
          </text>
        </motion.g>

        {/* ======================================================== */}
        {/* 4. THE HAND-DRAWN MAGNIFYING GLASS                       */}
        {/* ======================================================== */}
        <motion.g
          animate={{
            x: lensOffset.x,
            y: lensOffset.y,
          }}
          transition={{ type: "spring", stiffness: 150, damping: 18 }}
        >
          {/* Magnifier Mint Glass Fill */}
          <motion.circle
            cx="245"
            cy="215"
            r="65"
            fill="#8CD49E"
            fillOpacity="0.4"
            style={{ opacity: washOpacity }}
          />
          {/* Magnifier Glass Highlight Crescent */}
          <path
            d="M 205 180 C 220 160, 255 160, 275 175"
            stroke="#FFFFFF"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Internal Bar Chart Inspected Under Lens (Inspiration 2 signature) */}
          <motion.g style={{ opacity: detailsOpacity }}>
            <rect x="215" y="210" width="10" height="35" rx="2" fill="#FAF8F5" stroke="#1C241E" strokeWidth="1.4" />
            <rect x="235" y="185" width="10" height="60" rx="2" fill="#2E7D4E" stroke="#1C241E" strokeWidth="1.4" />
            <rect x="255" y="200" width="10" height="45" rx="2" fill="#FAF8F5" stroke="#1C241E" strokeWidth="1.4" />
          </motion.g>

          {/* Outer Lens Metal Rim */}
          <motion.circle
            cx="245"
            cy="215"
            r="65"
            stroke="#1C241E"
            strokeWidth="3.2"
            style={{ pathLength: pathStroke }}
          />
          {/* Inner Rim */}
          <motion.circle
            cx="245"
            cy="215"
            r="60"
            stroke="#1C241E"
            strokeWidth="1.2"
            strokeOpacity="0.5"
            style={{ pathLength: secondaryStroke }}
          />

          {/* Magnifier Angled Handle */}
          <motion.path
            d="M 292 262 L 345 325 C 352 332, 362 328, 368 322 C 374 316, 372 305, 365 298 L 312 235"
            stroke="#1C241E"
            strokeWidth="2.8"
            fill="#FAF8F5"
            strokeLinejoin="round"
            style={{ pathLength: pathStroke }}
          />
          {/* Handle Hatching / Grip */}
          <path d="M 330 290 L 340 302 M 340 280 L 350 292" stroke="#2E7D4E" strokeWidth="1.2" />
        </motion.g>

        {/* ======================================================== */}
        {/* 5. FLOWING CONNECTOR LINE & SPARKLES                     */}
        {/* ======================================================== */}
        <motion.path
          d="M 40 220 C 110 200, 160 250, 245 215 C 320 180, 420 230, 490 200"
          stroke="#2E7D4E"
          strokeWidth="1.8"
          strokeLinecap="round"
          style={{ pathLength: secondaryStroke }}
        />

        {/* Pencil Sparkles */}
        <motion.g style={{ opacity: detailsOpacity }}>
          <g transform="translate(180, 275)">
            <path d="M 0 -6 C 0 -1.8, 1.8 0, 6 0 C 1.8 0, 0 1.8, 0 6 C 0 1.8, -1.8 0, -6 0 C -1.8 0, 0 -1.8, 0 -6 Z" fill="#8CD49E" stroke="#1C241E" strokeWidth="1.1" strokeLinejoin="round" />
          </g>
          <g transform="translate(450, 150)">
            <path d="M 0 -6 C 0 -1.8, 1.8 0, 6 0 C 1.8 0, 0 1.8, 0 6 C 0 1.8, -1.8 0, -6 0 C -1.8 0, 0 -1.8, 0 -6 Z" fill="#FAF8F5" stroke="#1C241E" strokeWidth="1.1" strokeLinejoin="round" />
          </g>
          <g transform="translate(480, 310)">
            <path d="M 0 -5 C 0 -1.5, 1.5 0, 5 0 C 1.5 0, 0 1.5, 0 5 C 0 1.5, -1.5 0, -5 0 C -1.5 0, 0 -1.5, 0 -5 Z" fill="#8CD49E" stroke="#1C241E" strokeWidth="1" strokeLinejoin="round" />
          </g>
        </motion.g>
      </svg>
    </div>
  );
}
