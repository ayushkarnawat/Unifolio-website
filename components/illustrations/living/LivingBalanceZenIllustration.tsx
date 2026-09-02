"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

export function LivingBalanceZenIllustration({
  className = "w-full max-w-[560px] h-[400px]",
}: {
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [mouseTilt, setMouseTilt] = useState(0);

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
        const relX = (e.clientX - rect.left) / rect.width;
        setMouseTilt((relX - 0.5) * 6); // -3 to +3 degrees tilt
      }}
      onMouseLeave={() => setMouseTilt(0)}
      className={`relative select-none flex items-center justify-center cursor-ew-resize ${className}`}
    >
      {/* Background Soft Mint Radiance */}
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
          {/* Zen Stone 1 (Bottom) Wash */}
          <path
            d="M 130 250 C 150 240, 190 240, 200 255 C 205 270, 175 285, 140 280 C 120 275, 115 260, 130 250 Z"
            fill="#EAF5ED"
            fillOpacity="0.8"
          />
          {/* Zen Stone 2 (Middle) Wash */}
          <path
            d="M 140 215 C 160 205, 195 208, 198 225 C 200 240, 170 250, 145 245 C 125 240, 125 225, 140 215 Z"
            fill="#8CD49E"
            fillOpacity="0.45"
          />
          {/* Zen Stone 3 (Top) Wash */}
          <path
            d="M 150 185 C 165 178, 185 180, 190 195 C 192 208, 172 215, 155 212 C 140 208, 140 195, 150 185 Z"
            fill="#EAF5ED"
            fillOpacity="0.9"
          />

          {/* Right Semicircular Bowl Wash */}
          <path
            d="M 330 250 C 330 295, 410 295, 410 250 Z"
            fill="#8CD49E"
            fillOpacity="0.4"
          />
          {/* Floating Sail Shape Wash */}
          <path
            d="M 345 235 L 395 235 L 370 190 Z"
            fill="#DCFCE7"
            fillOpacity="0.6"
          />
        </motion.g>

        {/* ======================================================== */}
        {/* 2. INCOMING CONTINUOUS GROUND & SEESAW FULCRUM           */}
        {/* ======================================================== */}
        {/* Incoming wavy ground line from left */}
        <motion.path
          d="M 30 275 C 65 270, 100 280, 130 275"
          stroke="#1C241E"
          strokeWidth="1.8"
          strokeLinecap="round"
          style={{ pathLength: pathStroke }}
        />

        {/* Triangular Fulcrum Stand */}
        <g id="fulcrum">
          <motion.path
            d="M 270 255 L 250 310 L 290 310 Z"
            fill="#FAF8F5"
            stroke="#1C241E"
            strokeWidth="2"
            strokeLinejoin="round"
            style={{ pathLength: pathStroke }}
          />
          {/* Fulcrum fine pencil hatching */}
          <motion.path
            d="M 260 305 L 265 295 M 270 305 L 275 295 M 280 305 L 285 295"
            stroke="#1C241E"
            strokeWidth="1.1"
            strokeOpacity="0.45"
            style={{ pathLength: secondaryStroke }}
          />
          {/* Fulcrum Pivot Dot */}
          <motion.circle
            cx="270"
            cy="255"
            r="4.5"
            fill="#2E7D4E"
            stroke="#1C241E"
            strokeWidth="1.4"
            style={{ opacity: detailsOpacity }}
          />
        </g>

        {/* Dashed Center Balance Alignment Circle (Inspiration 1 signature) */}
        <motion.circle
          cx="270"
          cy="255"
          r="48"
          stroke="#2E7D4E"
          strokeWidth="1.4"
          strokeDasharray="4 4"
          strokeOpacity="0.4"
          style={{ pathLength: secondaryStroke }}
        />

        {/* ======================================================== */}
        {/* 3. TILTING SEESAW BEAM & SCULPTURAL BALANCING BODIES     */}
        {/* ======================================================== */}
        <motion.g
          animate={{ rotate: mouseTilt }}
          transition={{ type: "spring", stiffness: 120, damping: 15 }}
          style={{ originX: "270px", originY: "255px" }}
        >
          {/* Main Balance Beam Line */}
          <motion.path
            d="M 120 270 L 420 235"
            stroke="#1C241E"
            strokeWidth="2.2"
            strokeLinecap="round"
            style={{ pathLength: pathStroke }}
          />

          {/* LEFT: STACKED ZEN BALANCING STONES */}
          <g id="zen-stones">
            {/* Stone 1 (Bottom) */}
            <motion.path
              d="M 130 250 C 150 240, 190 240, 200 255 C 205 270, 175 285, 140 280 C 120 275, 115 260, 130 250 Z"
              stroke="#1C241E"
              strokeWidth="1.8"
              strokeLinejoin="round"
              style={{ pathLength: secondaryStroke }}
            />
            {/* Side pencil hatching on stone 1 */}
            <motion.path
              d="M 132 260 L 142 270 M 138 266 L 148 274"
              stroke="#2E7D4E"
              strokeWidth="1.1"
              style={{ opacity: detailsOpacity }}
            />

            {/* Stone 2 (Middle) */}
            <motion.path
              d="M 140 215 C 160 205, 195 208, 198 225 C 200 240, 170 250, 145 245 C 125 240, 125 225, 140 215 Z"
              stroke="#1C241E"
              strokeWidth="1.8"
              strokeLinejoin="round"
              style={{ pathLength: secondaryStroke }}
            />
            {/* Side pencil hatching on stone 2 */}
            <motion.path
              d="M 144 225 L 152 235 M 148 230 L 156 240"
              stroke="#2E7D4E"
              strokeWidth="1.1"
              style={{ opacity: detailsOpacity }}
            />

            {/* Stone 3 (Top) */}
            <motion.path
              d="M 150 185 C 165 178, 185 180, 190 195 C 192 208, 172 215, 155 212 C 140 208, 140 195, 150 185 Z"
              stroke="#1C241E"
              strokeWidth="1.8"
              strokeLinejoin="round"
              style={{ pathLength: secondaryStroke }}
            />
          </g>

          {/* RIGHT: SEMICIRCULAR BOWL & FLOATING SAIL */}
          <g id="right-vessel">
            {/* Semicircular Bowl */}
            <motion.path
              d="M 330 250 L 410 250 C 410 295, 330 295, 330 250 Z"
              stroke="#1C241E"
              strokeWidth="1.8"
              strokeLinejoin="round"
              style={{ pathLength: secondaryStroke }}
            />
            {/* Horizontal texture lines inside bowl */}
            <motion.path
              d="M 338 260 L 402 260 M 345 272 L 395 272 M 355 284 L 385 284"
              stroke="#1C241E"
              strokeWidth="1.1"
              strokeOpacity="0.4"
              style={{ pathLength: secondaryStroke }}
            />

            {/* Floating Triangular Sail above bowl */}
            <motion.path
              d="M 345 235 L 395 235 L 370 190 Z"
              stroke="#1C241E"
              strokeWidth="1.8"
              strokeLinejoin="round"
              style={{ pathLength: secondaryStroke }}
            />
            <motion.path
              d="M 370 190 L 370 235"
              stroke="#2E7D4E"
              strokeWidth="1.4"
              style={{ pathLength: secondaryStroke }}
            />
          </g>
        </motion.g>

        {/* ======================================================== */}
        {/* 4. ASCENDING DYNAMIC TRAJECTORY CURVE (FROM FULCRUM)     */}
        {/* ======================================================== */}
        {/* Ascending smooth green curve leading to top right */}
        <motion.path
          d="M 270 255 C 310 240, 360 210, 410 160 C 440 125, 465 90, 490 60"
          stroke="#2E7D4E"
          strokeWidth="2.2"
          strokeLinecap="round"
          style={{ pathLength: pathStroke }}
        />

        {/* Milestone Dots along Ascending Curve */}
        <motion.g style={{ opacity: detailsOpacity }}>
          {/* Milestone 1 at 340, 220 */}
          <circle cx="340" cy="225" r="4.5" fill="#FAF8F5" stroke="#1C241E" strokeWidth="1.4" />
          <circle cx="340" cy="225" r="2" fill="#2E7D4E" />

          {/* Milestone 2 at 410, 160 */}
          <circle cx="410" cy="160" r="5" fill="#8CD49E" stroke="#1C241E" strokeWidth="1.4" />

          {/* Milestone 3 at peak (490, 60) */}
          <circle cx="490" cy="60" r="5.5" fill="#FAF8F5" stroke="#2E7D4E" strokeWidth="1.8" />
          <circle cx="490" cy="60" r="2.5" fill="#2E7D4E" />

          {/* Sparkles around peak */}
          <g transform="translate(505, 50)">
            <path d="M 0 -6 C 0 -1.8, 1.8 0, 6 0 C 1.8 0, 0 1.8, 0 6 C 0 1.8, -1.8 0, -6 0 C -1.8 0, 0 -1.8, 0 -6 Z" fill="#8CD49E" stroke="#1C241E" strokeWidth="1.1" strokeLinejoin="round" />
          </g>
          <g transform="translate(435, 105)">
            <path d="M 0 -5 C 0 -1.5, 1.5 0, 5 0 C 1.5 0, 0 1.5, 0 5 C 0 1.5, -1.5 0, -5 0 C -1.5 0, 0 -1.5, 0 -5 Z" fill="#FAF8F5" stroke="#1C241E" strokeWidth="1" strokeLinejoin="round" />
          </g>
        </motion.g>

        {/* ======================================================== */}
        {/* 5. HANDWRITTEN ANNOTATION & GREEN UNDERLINE              */}
        {/* ======================================================== */}
        <motion.g
          style={{ opacity: detailsOpacity }}
          className="pointer-events-none"
        >
          <g transform="translate(340, 320)">
            <text
              x="0"
              y="0"
              fontFamily="var(--font-caveat, cursive)"
              fontSize="20"
              fill="#1C241E"
              fontStyle="italic"
            >
              see the whole picture
            </text>
            {/* Green wavy underline */}
            <path
              d="M 2 8 Q 45 4, 90 7 T 145 6"
              stroke="#2E7D4E"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        </motion.g>
      </svg>
    </div>
  );
}
