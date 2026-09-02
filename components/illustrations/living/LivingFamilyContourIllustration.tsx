"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

export function LivingFamilyContourIllustration({
  className = "w-full max-w-[560px] h-[380px]",
}: {
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activePersona, setActivePersona] = useState<string | null>(null);

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
      className={`relative select-none flex items-center justify-center ${className}`}
    >
      {/* Background Soft Mint Radiance */}
      <motion.div
        style={{ opacity: washOpacity }}
        className="pointer-events-none absolute inset-0 bg-[#EAF5ED]/60 rounded-full blur-3xl"
      />

      <svg
        viewBox="0 0 560 380"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible"
      >
        {/* ======================================================== */}
        {/* 1. MINT WATERCOLOR SILHOUETTE WASHES                     */}
        {/* ======================================================== */}
        <motion.g style={{ opacity: washOpacity }}>
          {/* Persona 1: Woman (Left) Wash */}
          <path
            d="M 110 240 C 100 210, 105 180, 125 155 C 135 140, 140 120, 135 100 C 150 95, 170 110, 175 135 C 180 160, 165 190, 160 215 C 155 240, 140 250, 110 240 Z"
            fill="#EAF5ED"
            fillOpacity="0.85"
          />
          {/* Persona 2: Man (Center) Wash */}
          <path
            d="M 230 245 C 220 200, 230 160, 250 135 C 255 120, 258 100, 255 85 C 270 80, 295 95, 298 120 C 300 150, 290 180, 295 210 C 300 245, 280 255, 230 245 Z"
            fill="#8CD49E"
            fillOpacity="0.4"
          />
          {/* Persona 3: Child (Right) Wash */}
          <path
            d="M 360 250 C 355 230, 360 205, 375 190 C 380 175, 385 160, 380 145 C 390 142, 410 150, 412 170 C 415 190, 405 215, 410 235 C 415 255, 395 260, 360 250 Z"
            fill="#DCFCE7"
            fillOpacity="0.75"
          />
        </motion.g>

        {/* ======================================================== */}
        {/* 2. CONTINUOUS CONTOUR FAMILY SILHOUETTES (INSPIRATION 1) */}
        {/* ======================================================== */}
        {/* Single flowing continuous contour connecting the household */}
        <motion.path
          d="
            M 60 245
            C 90 245, 105 230, 115 190
            C 120 165, 125 140, 115 130
            C 125 110, 140 100, 155 105
            C 170 110, 175 125, 170 145
            C 165 165, 150 180, 155 220
            C 160 245, 190 255, 225 245
            C 240 240, 245 200, 245 170
            C 245 140, 240 115, 245 95
            C 255 75, 280 75, 290 90
            C 298 105, 295 125, 295 150
            C 295 180, 280 210, 295 240
            C 310 260, 335 255, 360 250
            C 370 248, 375 220, 375 195
            C 375 175, 370 160, 375 145
            C 382 130, 402 130, 410 142
            C 415 155, 412 170, 412 190
            C 412 215, 400 235, 415 250
            C 435 265, 465 240, 495 250
          "
          stroke="#1C241E"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ pathLength: pathStroke }}
        />

        {/* ======================================================== */}
        {/* 3. WINDING GROUND LINE, DROPLETS & MILESTONE NODES       */}
        {/* ======================================================== */}
        {/* Lower winding ground loop with spheres */}
        <motion.path
          d="M 40 250 C 90 280, 140 230, 190 265 C 240 300, 310 240, 370 270 C 430 300, 470 230, 510 250"
          stroke="#2E7D4E"
          strokeWidth="1.8"
          strokeLinecap="round"
          style={{ pathLength: secondaryStroke }}
        />

        {/* Milestone Sphere 1 (Left near Woman) */}
        <motion.g
          animate={{ y: [-2, 3, -2] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          style={{ opacity: detailsOpacity }}
          onMouseEnter={() => setActivePersona("partner")}
          onMouseLeave={() => setActivePersona(null)}
          className="cursor-pointer"
        >
          <circle cx="85" cy="245" r="9" fill="#8CD49E" stroke="#1C241E" strokeWidth="1.6" />
          <path d="M 82 242 C 83 240, 86 240, 88 241" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" />
        </motion.g>

        {/* Milestone Sphere 2 (Center near Man) */}
        <motion.g
          animate={{ y: [3, -3, 3] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          style={{ opacity: detailsOpacity }}
          onMouseEnter={() => setActivePersona("primary")}
          onMouseLeave={() => setActivePersona(null)}
          className="cursor-pointer"
        >
          <circle cx="210" cy="255" r="7" fill="#FAF8F5" stroke="#1C241E" strokeWidth="1.5" />
          <circle cx="210" cy="255" r="3" fill="#2E7D4E" />
        </motion.g>

        {/* Milestone Sphere 3 (Right near Child) */}
        <motion.g
          animate={{ y: [-3, 2, -3] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          style={{ opacity: detailsOpacity }}
          onMouseEnter={() => setActivePersona("child")}
          onMouseLeave={() => setActivePersona(null)}
          className="cursor-pointer"
        >
          <circle cx="340" cy="255" r="6" fill="#FAF8F5" stroke="#1C241E" strokeWidth="1.5" />
          <circle cx="340" cy="255" r="2.5" fill="#8CD49E" />
        </motion.g>

        {/* Milestone Sphere 4 (Far Right Goal Token) */}
        <motion.g
          animate={{ y: [2, -2, 2] }}
          transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
          style={{ opacity: detailsOpacity }}
        >
          <circle cx="460" cy="245" r="8" fill="#8CD49E" stroke="#1C241E" strokeWidth="1.6" />
          <path d="M 457 242 C 458 240, 461 240, 463 241" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" />
        </motion.g>

        {/* ======================================================== */}
        {/* 4. SPROUTING LEAF BRANCH & SPARKLES                      */}
        {/* ======================================================== */}
        {/* Sprouting leaf on far right */}
        <motion.g style={{ opacity: detailsOpacity }}>
          <path d="M 495 250 C 495 220, 510 205, 518 190" stroke="#1C241E" strokeWidth="1.8" strokeLinecap="round" />
          {/* Leaf 1 */}
          <path d="M 518 190 C 528 180, 538 185, 535 198 C 528 202, 520 196, 518 190 Z" fill="#8CD49E" stroke="#1C241E" strokeWidth="1.4" />
          {/* Leaf 2 */}
          <path d="M 505 210 C 495 200, 490 208, 494 216 C 500 218, 504 214, 505 210 Z" fill="#DCFCE7" stroke="#1C241E" strokeWidth="1.4" />
        </motion.g>

        {/* Floating Pencil Sparkles */}
        <motion.g style={{ opacity: detailsOpacity }}>
          <g transform="translate(195, 120)">
            <path d="M 0 -6 C 0 -1.8, 1.8 0, 6 0 C 1.8 0, 0 1.8, 0 6 C 0 1.8, -1.8 0, -6 0 C -1.8 0, 0 -1.8, 0 -6 Z" fill="#FAF8F5" stroke="#1C241E" strokeWidth="1.1" strokeLinejoin="round" />
          </g>
          <g transform="translate(325, 95)">
            <path d="M 0 -7 C 0 -2, 2 0, 7 0 C 2 0, 0 2, 0 7 C 0 2, -2 0, -7 0 C -2 0, 0 -2, 0 -7 Z" fill="#8CD49E" stroke="#1C241E" strokeWidth="1.2" strokeLinejoin="round" />
          </g>
          <g transform="translate(460, 160)">
            <path d="M 0 -5 C 0 -1.5, 1.5 0, 5 0 C 1.5 0, 0 1.5, 0 5 C 0 1.5, -1.5 0, -5 0 C -1.5 0, 0 -1.5, 0 -5 Z" fill="#FAF8F5" stroke="#1C241E" strokeWidth="1" strokeLinejoin="round" />
          </g>
        </motion.g>
      </svg>
    </div>
  );
}
