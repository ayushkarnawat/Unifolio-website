"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export function HeroBloomIllustration({
  className = "w-full max-w-[480px] h-[520px]",
}: {
  className?: string;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`relative select-none flex items-center justify-center ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background mint watercolor wash */}
      <div className="absolute inset-0 bg-mint-wash rounded-full blur-2xl opacity-70 pointer-events-none" />

      {/* Floating Bubbles / Droplets with Organic Motion */}
      <motion.div
        animate={{ y: [-4, 6, -4], x: [0, 4, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-10 left-8 z-10"
      >
        <svg width="34" height="34" viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="20" r="16" fill="#DCFCE7" fillOpacity="0.8" />
          <path d="M12 14C15 11 19 10 24 12" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="20" cy="20" r="16" stroke="#11181C" strokeWidth="1.6" />
        </svg>
      </motion.div>

      <motion.div
        animate={{ y: [6, -8, 6], x: [-2, 3, -2] }}
        transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-44 left-4 z-10"
      >
        <svg width="42" height="42" viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="20" r="16" fill="#DCFCE7" fillOpacity="0.85" />
          <path d="M13 13C16 10 21 10 25 12" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="20" cy="20" r="16" stroke="#11181C" strokeWidth="1.6" />
        </svg>
      </motion.div>

      <motion.div
        animate={{ y: [-5, 7, -5] }}
        transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-36 right-6 z-10"
      >
        <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="20" r="15" fill="#BBF7D0" fillOpacity="0.9" />
          <circle cx="20" cy="20" r="15" stroke="#11181C" strokeWidth="1.6" />
        </svg>
      </motion.div>

      <motion.div
        animate={{ y: [4, -6, 4] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-28 right-10 z-10"
      >
        <svg width="22" height="22" viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="20" r="14" fill="#DCFCE7" />
          <circle cx="20" cy="20" r="14" stroke="#11181C" strokeWidth="1.5" />
        </svg>
      </motion.div>

      {/* Main Hand-Drawn SVG System */}
      <motion.svg
        viewBox="0 0 500 580"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible drop-shadow-sm"
        animate={{
          rotate: isHovered ? 0.8 : 0,
          scale: isHovered ? 1.02 : 1,
        }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      >
        {/* Core Funnel / Vortex Petals (Background Layer) */}
        <g id="funnel-base">
          {/* Funnel outer petals */}
          <path
            d="M210 370C160 360 170 450 250 460C330 470 360 380 300 370C250 360 230 370 210 370Z"
            fill="#DCFCE7"
            fillOpacity="0.85"
            stroke="#11181C"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M225 380C190 395 210 440 255 442C300 444 320 400 280 385C255 375 240 375 225 380Z"
            fill="#BBF7D0"
            stroke="#11181C"
            strokeWidth="1.5"
          />
          {/* Subtle hatchings */}
          <path d="M230 420L240 435M245 423L255 438M260 422L270 435" stroke="#11181C" strokeWidth="0.9" strokeOpacity="0.4" />
        </g>

        {/* PETAL 1: Left Bar Graph Card */}
        <motion.g
          id="petal-bar-graph"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.1 }}
          whileHover={{ y: -6, rotate: -2 }}
        >
          {/* Stem / Ribbon */}
          <path
            d="M235 380 C210 320 185 270 175 190 C170 150 255 140 260 190 C265 240 265 310 255 380 Z"
            fill="#FFFFFF"
            stroke="#11181C"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          {/* Mint wash inside ribbon header */}
          <path
            d="M176 185 C172 152 253 142 259 185 Z"
            fill="#DCFCE7"
            fillOpacity="0.6"
          />
          {/* Bar Chart Graphics */}
          {/* Bar 1 */}
          <rect x="195" y="152" width="10" height="22" rx="2" fill="#22C55E" stroke="#11181C" strokeWidth="1.5" />
          {/* Bar 2 */}
          <rect x="210" y="140" width="10" height="34" rx="2" fill="#16A34A" stroke="#11181C" strokeWidth="1.5" />
          {/* Bar 3 */}
          <rect x="225" y="158" width="10" height="16" rx="2" fill="#86EFAC" stroke="#11181C" strokeWidth="1.5" />
          {/* Text lines */}
          <line x1="242" y1="148" x2="268" y2="148" stroke="#11181C" strokeWidth="1.6" strokeLinecap="round" />
          <line x1="242" y1="156" x2="264" y2="156" stroke="#11181C" strokeWidth="1.6" strokeLinecap="round" />
          <line x1="242" y1="164" x2="258" y2="164" stroke="#11181C" strokeWidth="1.6" strokeLinecap="round" />
          {/* Fine shading lines */}
          <path d="M190 230C205 238 235 240 250 232" stroke="#22C55E" strokeWidth="1" strokeOpacity="0.4" />
          <path d="M195 250C210 258 238 260 248 252" stroke="#22C55E" strokeWidth="1" strokeOpacity="0.4" />
        </motion.g>

        {/* PETAL 2: Center Top Pie Chart Card */}
        <motion.g
          id="petal-pie-chart"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.2 }}
          whileHover={{ y: -8, scale: 1.03 }}
        >
          {/* Stem */}
          <path
            d="M260 380 C270 290 280 210 285 110 C290 55 385 55 385 115 C385 180 345 280 280 380 Z"
            fill="#FFFFFF"
            stroke="#11181C"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          {/* Mint Wash */}
          <path
            d="M286 112 C289 60 383 60 384 114 Z"
            fill="#DCFCE7"
            fillOpacity="0.5"
          />
          {/* Hand-Drawn Pie Chart */}
          <circle cx="330" cy="92" r="22" fill="#F0FDF4" stroke="#11181C" strokeWidth="1.6" />
          {/* Slice 1 (Emerald) */}
          <path d="M330 92 L330 70 A22 22 0 0 1 350 82 Z" fill="#22C55E" stroke="#11181C" strokeWidth="1.4" />
          {/* Slice 2 (Mint) */}
          <path d="M330 92 L350 82 A22 22 0 0 1 344 108 Z" fill="#86EFAC" stroke="#11181C" strokeWidth="1.4" />
          {/* Metric lines */}
          <line x1="360" y1="84" x2="384" y2="84" stroke="#11181C" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="360" y1="92" x2="380" y2="92" stroke="#11181C" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="360" y1="100" x2="374" y2="100" stroke="#11181C" strokeWidth="1.8" strokeLinecap="round" />
          {/* Shading */}
          <path d="M305 170C320 180 345 180 360 172" stroke="#22C55E" strokeWidth="1.2" strokeOpacity="0.4" />
          <path d="M300 200C315 210 338 210 350 202" stroke="#22C55E" strokeWidth="1.2" strokeOpacity="0.4" />
        </motion.g>

        {/* PETAL 3: Far Right Donut Gauge Card */}
        <motion.g
          id="petal-donut-gauge"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.3 }}
          whileHover={{ y: -5, rotate: 2 }}
        >
          {/* Stem */}
          <path
            d="M285 390 C340 340 390 270 415 170 C425 120 495 140 480 195 C460 260 380 350 295 400 Z"
            fill="#FFFFFF"
            stroke="#11181C"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          {/* Donut Gauge */}
          <circle cx="452" cy="158" r="18" fill="#F0FDF4" stroke="#11181C" strokeWidth="1.6" />
          <circle cx="452" cy="158" r="9" fill="#22C55E" stroke="#11181C" strokeWidth="1.4" />
          <circle cx="452" cy="158" r="4" fill="#FFFFFF" />
          <line x1="440" y1="188" x2="466" y2="188" stroke="#11181C" strokeWidth="1.6" strokeLinecap="round" />
          <line x1="444" y1="196" x2="462" y2="196" stroke="#11181C" strokeWidth="1.6" strokeLinecap="round" />
          {/* Hatching */}
          <path d="M375 260C395 270 415 270 435 260" stroke="#22C55E" strokeWidth="1.2" strokeOpacity="0.4" />
        </motion.g>

        {/* PETAL 4: Left Mutual Fund Folio Receipt Card */}
        <motion.g
          id="petal-folio-card"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.25 }}
          whileHover={{ y: -4, rotate: -3 }}
        >
          <path
            d="M225 390 C180 340 140 310 165 240 C175 210 245 225 240 265 C235 315 240 355 245 400 Z"
            fill="#FFFFFF"
            stroke="#11181C"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          {/* Folio Dots & Lines */}
          <circle cx="185" cy="250" r="2.5" fill="#22C55E" />
          <line x1="193" y1="250" x2="225" y2="250" stroke="#11181C" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="192" cy="262" r="2.5" fill="#22C55E" />
          <line x1="200" y1="262" x2="230" y2="262" stroke="#11181C" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="199" cy="274" r="2.5" fill="#22C55E" />
          <line x1="207" y1="274" x2="235" y2="274" stroke="#11181C" strokeWidth="1.5" strokeLinecap="round" />
        </motion.g>

        {/* FRONT SCROLL: Flowing Forward Ribbon (Screenshot 1 signature) */}
        <motion.g
          id="front-flowing-scroll"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          whileHover={{ y: 4 }}
        >
          {/* Scroll ribbon body */}
          <path
            d="M260 410 C295 440 395 470 380 540 C370 580 320 575 285 540 C270 515 260 480 250 435 Z"
            fill="#FFFFFF"
            stroke="#11181C"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          {/* Ribbon mint inner wash */}
          <path
            d="M285 540 C320 575 370 580 380 540 C382 530 365 520 330 520 C295 520 280 535 285 540 Z"
            fill="#DCFCE7"
            stroke="#11181C"
            strokeWidth="1.5"
          />
          {/* Wavy signature line */}
          <path
            d="M295 475 C305 465 315 480 325 470 C335 460 345 475 355 468"
            stroke="#11181C"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <line x1="305" y1="495" x2="355" y2="495" stroke="#11181C" strokeWidth="1.6" strokeLinecap="round" />
          <line x1="315" y1="510" x2="360" y2="510" stroke="#11181C" strokeWidth="1.6" strokeLinecap="round" />
        </motion.g>

        {/* Pencil Hatching Texture Accents */}
        <g id="pencil-hatching">
          <path d="M260 360L268 375M266 358L274 373M272 357L280 372" stroke="#16A34A" strokeWidth="1" strokeOpacity="0.5" />
          <path d="M215 365L222 378M220 363L227 376" stroke="#16A34A" strokeWidth="1" strokeOpacity="0.5" />
        </g>
      </motion.svg>
    </div>
  );
}
