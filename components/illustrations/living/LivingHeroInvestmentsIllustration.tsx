"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

export function LivingHeroInvestmentsIllustration({
  className = "w-full max-w-[540px] h-[440px]",
}: {
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const smooth = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 20,
    restDelta: 0.001,
  });

  // Staggered linework drawing phases
  const pathStroke = useTransform(smooth, [0.05, 0.45], [0, 1]);
  const secondaryStroke = useTransform(smooth, [0.15, 0.55], [0, 1]);
  const washOpacity = useTransform(smooth, [0.35, 0.7], [0, 1]);
  const detailsOpacity = useTransform(smooth, [0.45, 0.85], [0, 1]);

  return (
    <div
      ref={containerRef}
      className={`relative select-none flex items-center justify-center ${className}`}
    >
      {/* Background Soft Mint Radiance */}
      <motion.div
        style={{ opacity: washOpacity }}
        className="pointer-events-none absolute inset-0 bg-[#EAF5ED]/70 rounded-full blur-3xl"
      />

      <svg
        viewBox="0 0 540 440"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible"
      >
        {/* ======================================================== */}
        {/* 1. MINT WATERCOLOR WASHES (BLOOM IN ON SCROLL)           */}
        {/* ======================================================== */}
        <motion.g style={{ opacity: washOpacity }}>
          {/* Folder interior pocket mint wash */}
          <path
            d="M 175 190 L 325 180 L 335 340 L 195 355 Z"
            fill="#DCFCE7"
            fillOpacity="0.55"
          />
          {/* Folder front flap soft wash */}
          <path
            d="M 180 230 L 330 220 L 325 345 L 190 355 Z"
            fill="#EAF5ED"
            fillOpacity="0.85"
          />
          {/* Flying Sheet 1 Top-Left Soft Wash */}
          <path
            d="M 95 130 L 175 110 L 195 210 L 115 235 Z"
            fill="#FFFFFF"
            fillOpacity="0.9"
          />
          {/* Flying Sheet 2 Top Center Wash */}
          <path
            d="M 185 85 L 255 75 L 265 165 L 195 175 Z"
            fill="#FFFFFF"
            fillOpacity="0.95"
          />
          {/* Flying Sheet 2 Top Mint Header Bar */}
          <path
            d="M 188 88 L 252 79 L 254 105 L 190 112 Z"
            fill="#8CD49E"
            fillOpacity="0.4"
          />
          {/* Flying Sheet 3 Top Right Diamond Tag */}
          <path
            d="M 285 70 L 335 65 L 345 115 L 295 120 Z"
            fill="#FFFFFF"
            fillOpacity="0.85"
          />
        </motion.g>

        {/* ======================================================== */}
        {/* 2. THE OPEN UNIFOLIO FOLDER (CONTOUR LINEWORK)           */}
        {/* ======================================================== */}
        <g id="folder-lines">
          {/* Back Body of Folder */}
          <motion.path
            d="M 175 190 L 325 180 L 335 340 L 195 355 Z"
            stroke="#1C241E"
            strokeWidth="2.2"
            strokeLinejoin="round"
            strokeLinecap="round"
            style={{ pathLength: pathStroke }}
          />

          {/* Folder Tab at Top Left */}
          <motion.path
            d="M 175 190 L 180 172 L 230 168 L 240 185"
            stroke="#1C241E"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
            style={{ pathLength: pathStroke }}
          />

          {/* Front Open Flap of Folder */}
          <motion.path
            d="M 180 230 L 330 220 L 325 345 L 190 355 Z"
            stroke="#1C241E"
            strokeWidth="2.2"
            strokeLinejoin="round"
            strokeLinecap="round"
            style={{ pathLength: pathStroke }}
          />

          {/* Folder Bottom Hatching Shadows */}
          <motion.path
            d="M 198 358 L 205 372 M 225 356 L 232 370 M 255 353 L 262 367 M 285 350 L 292 364 M 315 347 L 322 361"
            stroke="#1C241E"
            strokeWidth="1.2"
            strokeOpacity="0.4"
            style={{ pathLength: secondaryStroke }}
          />
        </g>

        {/* ======================================================== */}
        {/* 3. FLYING STATEMENTS & SHEETS (CONVERGING INTO FOLDER)   */}
        {/* ======================================================== */}
        {/* Sheet 1: Left Angled Statement */}
        <motion.g
          animate={{ y: [-3, 4, -3], rotate: [-0.5, 0.5, -0.5] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          <motion.path
            d="M 95 130 L 175 110 L 195 210 L 115 235 Z"
            stroke="#1C241E"
            strokeWidth="1.8"
            strokeLinejoin="round"
            style={{ pathLength: secondaryStroke }}
          />
          {/* Subtle text lines on Sheet 1 */}
          <motion.path
            d="M 110 148 L 155 138 M 114 165 L 172 150 M 118 182 L 165 170 M 122 200 L 150 192"
            stroke="#1C241E"
            strokeWidth="1.2"
            strokeOpacity="0.45"
            strokeLinecap="round"
            style={{ pathLength: secondaryStroke }}
          />
          {/* Top circle emblem on sheet 1 */}
          <motion.circle
            cx="112"
            cy="132"
            r="4"
            stroke="#2E7D4E"
            strokeWidth="1.4"
            style={{ opacity: detailsOpacity }}
          />
        </motion.g>

        {/* Sheet 2: Top Center Document with Curled Corner */}
        <motion.g
          animate={{ y: [3, -4, 3], rotate: [0.5, -0.5, 0.5] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <motion.path
            d="M 185 85 L 255 75 L 265 165 L 195 175 Z"
            stroke="#1C241E"
            strokeWidth="1.8"
            strokeLinejoin="round"
            style={{ pathLength: secondaryStroke }}
          />
          {/* Curled sheet bottom left */}
          <motion.path
            d="M 195 175 Q 210 160, 225 170"
            stroke="#1C241E"
            strokeWidth="1.4"
            fill="#FAF8F5"
            style={{ pathLength: secondaryStroke }}
          />
          {/* Header bar on sheet 2 */}
          <motion.path
            d="M 188 88 L 252 79"
            stroke="#2E7D4E"
            strokeWidth="2.5"
            strokeLinecap="round"
            style={{ pathLength: secondaryStroke }}
          />
          {/* Text lines */}
          <motion.path
            d="M 195 120 L 245 112 M 198 135 L 235 130"
            stroke="#1C241E"
            strokeWidth="1.2"
            strokeOpacity="0.4"
            strokeLinecap="round"
            style={{ pathLength: secondaryStroke }}
          />
        </motion.g>

        {/* Sheet 3: Top Right Tilted Sheet */}
        <motion.g
          animate={{ y: [-2, 3, -2], rotate: [-1, 1, -1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <motion.path
            d="M 285 70 L 335 65 L 345 115 L 295 120 Z"
            stroke="#1C241E"
            strokeWidth="1.6"
            strokeLinejoin="round"
            style={{ pathLength: secondaryStroke }}
          />
          <motion.path
            d="M 295 85 L 325 82 M 297 98 L 330 94"
            stroke="#1C241E"
            strokeWidth="1.1"
            strokeOpacity="0.35"
            strokeLinecap="round"
            style={{ pathLength: secondaryStroke }}
          />
        </motion.g>

        {/* ======================================================== */}
        {/* 4. FLUID CONVERGING INK LOOPS & SPHERES                  */}
        {/* ======================================================== */}
        {/* Left Fluid Loop Swirling into the Folder */}
        <motion.path
          d="M 60 250 C 70 200, 110 240, 160 270 C 180 280, 200 320, 180 340"
          stroke="#1C241E"
          strokeWidth="1.8"
          strokeLinecap="round"
          style={{ pathLength: pathStroke }}
        />

        {/* Right Fluid Loop Swirling behind */}
        <motion.path
          d="M 330 200 C 370 170, 390 220, 370 270 C 350 320, 310 330, 340 370"
          stroke="#1C241E"
          strokeWidth="1.8"
          strokeLinecap="round"
          style={{ pathLength: pathStroke }}
        />

        {/* ======================================================== */}
        {/* 5. FLOATING GREEN DROPLETS / MARBLES                     */}
        {/* ======================================================== */}
        {/* Droplet 1: Bottom Left */}
        <motion.g
          animate={{ y: [2, -3, 2] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          style={{ opacity: detailsOpacity }}
        >
          <circle cx="130" cy="345" r="7" fill="#8CD49E" stroke="#1C241E" strokeWidth="1.5" />
          <path d="M 127 342 C 128 340, 131 340, 133 341" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" />
        </motion.g>

        {/* Droplet 2: Top Right */}
        <motion.g
          animate={{ y: [-3, 3, -3] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          style={{ opacity: detailsOpacity }}
        >
          <circle cx="280" cy="155" r="8" fill="#8CD49E" stroke="#1C241E" strokeWidth="1.5" />
          <path d="M 277 152 C 278 150, 281 150, 283 151" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" />
        </motion.g>

        {/* Droplet 3: Far Left Mid */}
        <motion.g
          animate={{ y: [3, -2, 3] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          style={{ opacity: detailsOpacity }}
        >
          <circle cx="78" cy="235" r="5.5" fill="#DCFCE7" stroke="#1C241E" strokeWidth="1.4" />
        </motion.g>

        {/* ======================================================== */}
        {/* 6. FOUR-POINT PENCIL SPARKLES (INSPIRATION 1 SIGNATURE)  */}
        {/* ======================================================== */}
        <motion.g style={{ opacity: detailsOpacity }}>
          {/* Sparkle Top Left */}
          <g transform="translate(100, 75)">
            <path d="M 0 -7 C 0 -2, 2 0, 7 0 C 2 0, 0 2, 0 7 C 0 2, -2 0, -7 0 C -2 0, 0 -2, 0 -7 Z" fill="#FAF8F5" stroke="#1C241E" strokeWidth="1.2" strokeLinejoin="round" />
          </g>

          {/* Sparkle Top Center */}
          <g transform="translate(200, 40)">
            <path d="M 0 -8 C 0 -2.5, 2.5 0, 8 0 C 2.5 0, 0 2.5, 0 8 C 0 2.5, -2.5 0, -8 0 C -2.5 0, 0 -2.5, 0 -8 Z" fill="#8CD49E" stroke="#1C241E" strokeWidth="1.2" strokeLinejoin="round" />
          </g>

          {/* Sparkle Right Mid */}
          <g transform="translate(375, 205)">
            <path d="M 0 -7 C 0 -2, 2 0, 7 0 C 2 0, 0 2, 0 7 C 0 2, -2 0, -7 0 C -2 0, 0 -2, 0 -7 Z" fill="#FAF8F5" stroke="#1C241E" strokeWidth="1.2" strokeLinejoin="round" />
          </g>

          {/* Sparkle Bottom Right */}
          <g transform="translate(305, 290)">
            <path d="M 0 -6 C 0 -1.8, 1.8 0, 6 0 C 1.8 0, 0 1.8, 0 6 C 0 1.8, -1.8 0, -6 0 C -1.8 0, 0 -1.8, 0 -6 Z" fill="#8CD49E" stroke="#1C241E" strokeWidth="1.1" strokeLinejoin="round" />
          </g>

          {/* Stippled Stardust Points */}
          <circle cx="85" cy="180" r="1.5" fill="#1C241E" />
          <circle cx="70" cy="220" r="1.2" fill="#2E7D4E" />
          <circle cx="340" cy="160" r="1.5" fill="#2E7D4E" />
          <circle cx="380" cy="240" r="1.2" fill="#1C241E" />
        </motion.g>

        {/* ======================================================== */}
        {/* 7. EXITING TRANSITION CONNECTOR INK LINE                 */}
        {/* ======================================================== */}
        {/* Continuous wandering ink stroke leading out to next act */}
        <motion.path
          d="M 190 355 C 160 380, 140 410, 180 440"
          stroke="#2E7D4E"
          strokeWidth="2"
          strokeLinecap="round"
          style={{ pathLength: secondaryStroke }}
        />
      </svg>
    </div>
  );
}
