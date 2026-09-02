"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

export function LivingGrowthTrajectoryIllustration({
  className = "w-full max-w-[560px] h-[380px]",
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
        {/* 1. MINT WATERCOLOR PEAK WASHES                           */}
        {/* ======================================================== */}
        <motion.g style={{ opacity: washOpacity }}>
          {/* Wash under Wave 1 Peak */}
          <path
            d="M 120 280 C 140 240, 170 170, 200 170 C 230 170, 240 220, 260 250 L 260 290 L 120 290 Z"
            fill="#8CD49E"
            fillOpacity="0.3"
          />
          {/* Wash under Wave 2 Peak (Higher) */}
          <path
            d="M 230 250 C 250 180, 280 130, 310 130 C 340 130, 360 180, 390 200 L 390 290 L 230 290 Z"
            fill="#8CD49E"
            fillOpacity="0.45"
          />
          {/* Wash under Final Ascending Surge */}
          <path
            d="M 360 200 C 390 150, 430 80, 460 35 L 460 290 L 360 290 Z"
            fill="#DCFCE7"
            fillOpacity="0.75"
          />
        </motion.g>

        {/* ======================================================== */}
        {/* 2. BASELINE & VERTICAL STIPPLED PROJECTION LINES         */}
        {/* ======================================================== */}
        {/* Faint Ground Baseline */}
        <motion.path
          d="M 40 290 L 480 290"
          stroke="#1C241E"
          strokeWidth="1"
          strokeDasharray="4 4"
          strokeOpacity="0.2"
          style={{ pathLength: secondaryStroke }}
        />

        {/* Vertical Drop Lines with Milestone Base Dots */}
        <g id="drop-lines">
          {/* Drop Line 1 (at x=200) */}
          <motion.line
            x1="200"
            y1="170"
            x2="200"
            y2="290"
            stroke="#1C241E"
            strokeWidth="1"
            strokeDasharray="3 3"
            strokeOpacity="0.35"
            style={{ pathLength: secondaryStroke }}
          />
          <motion.circle
            cx="200"
            cy="290"
            r="3"
            fill="#1C241E"
            style={{ opacity: detailsOpacity }}
          />

          {/* Drop Line 2 (at x=310) */}
          <motion.line
            x1="310"
            y1="130"
            x2="310"
            y2="290"
            stroke="#1C241E"
            strokeWidth="1"
            strokeDasharray="3 3"
            strokeOpacity="0.35"
            style={{ pathLength: secondaryStroke }}
          />
          <motion.circle
            cx="310"
            cy="290"
            r="3"
            fill="#1C241E"
            style={{ opacity: detailsOpacity }}
          />

          {/* Drop Line 3 (at x=410) */}
          <motion.line
            x1="410"
            y1="110"
            x2="410"
            y2="290"
            stroke="#1C241E"
            strokeWidth="1"
            strokeDasharray="3 3"
            strokeOpacity="0.35"
            style={{ pathLength: secondaryStroke }}
          />
          <motion.circle
            cx="410"
            cy="290"
            r="3"
            fill="#2E7D4E"
            style={{ opacity: detailsOpacity }}
          />
        </g>

        {/* ======================================================== */}
        {/* 3. INTERTWINING GROWTH CURVES (INSPIRATION 1 SIGNATURE)  */}
        {/* ======================================================== */}
        {/* Secondary Baseline Wavy Line (Faint Rhythm) */}
        <motion.path
          d="M 40 270 C 80 240, 130 290, 180 240 C 230 190, 270 260, 330 200 C 380 150, 420 180, 460 120"
          stroke="#1C241E"
          strokeWidth="1.6"
          strokeLinecap="round"
          style={{ pathLength: secondaryStroke }}
        />

        {/* Primary Soaring Green Compounding Arc with Upward Arrow */}
        <motion.path
          d="M 60 280 C 110 280, 140 210, 190 180 C 240 150, 270 210, 310 140 C 350 70, 400 110, 460 35"
          stroke="#2E7D4E"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ pathLength: pathStroke }}
        />

        {/* Soaring Arrowhead at (460, 35) */}
        <motion.g style={{ opacity: detailsOpacity }}>
          <path
            d="M 442 38 L 462 33 L 458 55"
            stroke="#2E7D4E"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </motion.g>

        {/* Milestone Nodes on the Curve */}
        <motion.g style={{ opacity: detailsOpacity }}>
          <circle cx="190" cy="180" r="5" fill="#FAF8F5" stroke="#1C241E" strokeWidth="1.6" />
          <circle cx="190" cy="180" r="2.5" fill="#2E7D4E" />

          <circle cx="310" cy="140" r="5" fill="#FAF8F5" stroke="#1C241E" strokeWidth="1.6" />
          <circle cx="310" cy="140" r="2.5" fill="#8CD49E" />

          <circle cx="410" cy="95" r="5.5" fill="#FAF8F5" stroke="#2E7D4E" strokeWidth="1.8" />
          <circle cx="410" cy="95" r="3" fill="#2E7D4E" />
        </motion.g>

        {/* ======================================================== */}
        {/* 4. HANDWRITTEN ANNOTATIONS & SPARKLES                    */}
        {/* ======================================================== */}
        <motion.g style={{ opacity: detailsOpacity }} className="pointer-events-none">
          {/* Note 1: Top Left 'long term clarity' */}
          <g transform="translate(140, 75)">
            <text
              x="0"
              y="0"
              fontFamily="var(--font-caveat, cursive)"
              fontSize="20"
              fill="#1C241E"
              fontStyle="italic"
            >
              long term clarity
            </text>
            <path
              d="M 2 8 Q 35 4, 75 8 T 115 6"
              stroke="#2E7D4E"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
          </g>

          {/* Note 2: Bottom Right 'built for what matters' */}
          <g transform="translate(415, 230)">
            <text
              x="0"
              y="0"
              fontFamily="var(--font-caveat, cursive)"
              fontSize="19"
              fill="#1C241E"
              fontStyle="italic"
            >
              built for what matters
            </text>
            <path
              d="M 2 8 Q 45 4, 90 7 T 145 6"
              stroke="#2E7D4E"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
          </g>

          {/* Floating Four-Point Pencil Sparkles */}
          <g transform="translate(110, 140)">
            <path d="M 0 -6 C 0 -1.8, 1.8 0, 6 0 C 1.8 0, 0 1.8, 0 6 C 0 1.8, -1.8 0, -6 0 C -1.8 0, 0 -1.8, 0 -6 Z" fill="#FAF8F5" stroke="#1C241E" strokeWidth="1" strokeLinejoin="round" />
          </g>
          <g transform="translate(240, 90)">
            <path d="M 0 -6 C 0 -1.8, 1.8 0, 6 0 C 1.8 0, 0 1.8, 0 6 C 0 1.8, -1.8 0, -6 0 C -1.8 0, 0 -1.8, 0 -6 Z" fill="#8CD49E" stroke="#1C241E" strokeWidth="1" strokeLinejoin="round" />
          </g>
          <g transform="translate(420, 50)">
            <path d="M 0 -7 C 0 -2, 2 0, 7 0 C 2 0, 0 2, 0 7 C 0 2, -2 0, -7 0 C -2 0, 0 -2, 0 -7 Z" fill="#FAF8F5" stroke="#1C241E" strokeWidth="1.2" strokeLinejoin="round" />
          </g>
          <g transform="translate(485, 80)">
            <path d="M 0 -5 C 0 -1.5, 1.5 0, 5 0 C 1.5 0, 0 1.5, 0 5 C 0 1.5, -1.5 0, -5 0 C -1.5 0, 0 -1.5, 0 -5 Z" fill="#8CD49E" stroke="#1C241E" strokeWidth="1" strokeLinejoin="round" />
          </g>
        </motion.g>
      </svg>
    </div>
  );
}
