"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

export function LivingSecurityRibbonIllustration({
  className = "w-full max-w-5xl h-[160px]",
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
  const washOpacity = useTransform(smooth, [0.3, 0.75], [0, 1]);
  const detailsOpacity = useTransform(smooth, [0.4, 0.85], [0, 1]);

  return (
    <div
      ref={containerRef}
      className={`relative select-none flex items-center justify-center ${className}`}
    >
      <svg
        viewBox="0 0 1000 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible"
      >
        {/* ======================================================== */}
        {/* 1. MINT WATERCOLOR EMBLEM WASHES                         */}
        {/* ======================================================== */}
        <motion.g style={{ opacity: washOpacity }}>
          {/* Padlock Base Wash (at x=270) */}
          <rect x="258" y="70" width="24" height="22" rx="4" fill="#DCFCE7" fillOpacity="0.85" />

          {/* Checkmark Badge Wash (at x=390) */}
          <circle cx="390" cy="78" r="18" fill="#8CD49E" fillOpacity="0.35" />

          {/* Shield Wash (at x=670) */}
          <path
            d="M 655 60 C 655 60, 670 54, 685 60 C 685 85, 670 102, 670 102 C 670 102, 655 85, 655 60 Z"
            fill="#EAF5ED"
            fillOpacity="0.9"
          />

          {/* Target Rings Wash (at x=840) */}
          <circle cx="840" cy="78" r="22" fill="#8CD49E" fillOpacity="0.3" />
          <circle cx="840" cy="78" r="8" fill="#2E7D4E" fillOpacity="0.4" />
        </motion.g>

        {/* ======================================================== */}
        {/* 2. CONTINUOUS HORIZONTAL WANDERING INK LINE              */}
        {/* ======================================================== */}
        <motion.path
          d="
            M 30 90
            C 70 85, 110 105, 150 90
            C 190 75, 230 90, 270 80
            C 310 70, 350 95, 390 78
            C 430 65, 460 90, 490 90
            L 590 90
            C 620 90, 640 75, 670 80
            C 710 88, 750 65, 790 85
            C 815 95, 830 80, 850 78
            L 970 85
          "
          stroke="#1C241E"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ pathLength: pathStroke }}
        />

        {/* ======================================================== */}
        {/* 3. EMBLEM 1: MULTI-NODE DROPLETS (LEFT CLUSTER)          */}
        {/* ======================================================== */}
        <motion.g style={{ opacity: detailsOpacity }}>
          <circle cx="65" cy="88" r="4.5" fill="#FAF8F5" stroke="#1C241E" strokeWidth="1.4" />
          <circle cx="95" cy="98" r="5.5" fill="#8CD49E" stroke="#1C241E" strokeWidth="1.4" />
          <circle cx="125" cy="85" r="4" fill="#FAF8F5" stroke="#1C241E" strokeWidth="1.4" />
          <circle cx="150" cy="92" r="3" fill="#2E7D4E" />
        </motion.g>

        {/* ======================================================== */}
        {/* 4. EMBLEM 2: HAND-DRAWN PADLOCK (AT X=270)               */}
        {/* ======================================================== */}
        <g id="padlock">
          {/* Shackle */}
          <motion.path
            d="M 263 70 V 58 C 263 52, 277 52, 277 58 V 70"
            stroke="#1C241E"
            strokeWidth="1.8"
            strokeLinecap="round"
            style={{ pathLength: secondaryStroke }}
          />
          {/* Lock Body */}
          <motion.rect
            x="258"
            y="70"
            width="24"
            height="22"
            rx="4"
            stroke="#1C241E"
            strokeWidth="1.8"
            style={{ pathLength: secondaryStroke }}
          />
          {/* Keyhole */}
          <motion.circle cx="270" cy="79" r="2" fill="#1C241E" style={{ opacity: detailsOpacity }} />
          <motion.line x1="270" y1="81" x2="270" y2="86" stroke="#1C241E" strokeWidth="1.4" style={{ opacity: detailsOpacity }} />
        </g>

        {/* ======================================================== */}
        {/* 5. EMBLEM 3: CHECKMARK CIRCULAR BADGE (AT X=390)         */}
        {/* ======================================================== */}
        <g id="check-badge">
          <motion.circle
            cx="390"
            cy="78"
            r="18"
            stroke="#1C241E"
            strokeWidth="1.8"
            style={{ pathLength: pathStroke }}
          />
          <motion.circle
            cx="390"
            cy="78"
            r="14"
            stroke="#2E7D4E"
            strokeWidth="1.2"
            strokeDasharray="3 3"
            style={{ pathLength: secondaryStroke }}
          />
          {/* Hand-Drawn Checkmark */}
          <motion.path
            d="M 382 78 L 388 84 L 399 72"
            stroke="#2E7D4E"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ pathLength: secondaryStroke }}
          />
        </g>

        {/* ======================================================== */}
        {/* 6. CENTRAL TEXT: 'Secure. Private. Built to protect...'  */}
        {/* ======================================================== */}
        <motion.g
          style={{ opacity: detailsOpacity }}
          className="pointer-events-none select-none"
        >
          <text
            x="540"
            y="76"
            textAnchor="middle"
            fontFamily="var(--font-fraunces, serif)"
            fontSize="15"
            fontWeight="bold"
            fill="#1C241E"
            letterSpacing="-0.01em"
          >
            Secure. Private. Built to <tspan fill="#2E7D4E">protect</tspan>
          </text>
          <text
            x="540"
            y="96"
            textAnchor="middle"
            fontFamily="var(--font-sans, sans-serif)"
            fontSize="11"
            fill="#525E55"
          >
            what matters most.
          </text>
        </motion.g>

        {/* ======================================================== */}
        {/* 7. EMBLEM 4: HAND-DRAWN SHIELD (AT X=670)                */}
        {/* ======================================================== */}
        <g id="shield">
          <motion.path
            d="M 655 60 C 655 60, 670 54, 685 60 C 685 85, 670 102, 670 102 C 670 102, 655 85, 655 60 Z"
            stroke="#1C241E"
            strokeWidth="2"
            strokeLinejoin="round"
            style={{ pathLength: pathStroke }}
          />
          {/* Shield Internal Core Accent */}
          <motion.path
            d="M 662 67 C 662 67, 670 63, 678 67 C 678 82, 670 93, 670 93 C 670 93, 662 82, 662 67 Z"
            stroke="#2E7D4E"
            strokeWidth="1.2"
            style={{ pathLength: secondaryStroke }}
          />
          <motion.circle cx="670" cy="78" r="2.5" fill="#2E7D4E" style={{ opacity: detailsOpacity }} />
        </g>

        {/* ======================================================== */}
        {/* 8. EMBLEM 5: BULLSEYE TARGET & ARROW (AT X=840)          */}
        {/* ======================================================== */}
        <g id="target">
          <motion.circle
            cx="840"
            cy="78"
            r="22"
            stroke="#1C241E"
            strokeWidth="2"
            style={{ pathLength: pathStroke }}
          />
          <motion.circle
            cx="840"
            cy="78"
            r="15"
            stroke="#8CD49E"
            strokeWidth="1.5"
            style={{ pathLength: secondaryStroke }}
          />
          <motion.circle
            cx="840"
            cy="78"
            r="6"
            fill="#2E7D4E"
            stroke="#1C241E"
            strokeWidth="1.4"
            style={{ opacity: detailsOpacity }}
          />
          {/* Arrow Hitting Bullseye */}
          <motion.path
            d="M 875 42 L 844 74"
            stroke="#1C241E"
            strokeWidth="2"
            strokeLinecap="round"
            style={{ pathLength: secondaryStroke }}
          />
          {/* Arrow Fletchings */}
          <motion.path
            d="M 870 38 L 880 40 L 882 48"
            stroke="#1C241E"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ opacity: detailsOpacity }}
          />
        </g>

        {/* Floating Sparkles along the ribbon */}
        <motion.g style={{ opacity: detailsOpacity }}>
          <g transform="translate(320, 55)">
            <path d="M 0 -4 V 4 M -4 0 H 4" stroke="#2E7D4E" strokeWidth="1.2" strokeLinecap="round" />
          </g>
          <g transform="translate(730, 50)">
            <path d="M 0 -4 V 4 M -4 0 H 4" stroke="#8CD49E" strokeWidth="1.2" strokeLinecap="round" />
          </g>
          <g transform="translate(910, 60)">
            <path d="M 0 -4 V 4 M -4 0 H 4" stroke="#2E7D4E" strokeWidth="1.2" strokeLinecap="round" />
          </g>
        </motion.g>
      </svg>
    </div>
  );
}
