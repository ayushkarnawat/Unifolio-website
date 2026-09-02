"use client";

import { motion } from "framer-motion";

export function WindingJourneyIllustration({
  className = "w-full max-w-[320px] h-[320px]",
}: {
  className?: string;
}) {
  return (
    <div className={`relative select-none flex items-center justify-center ${className}`}>
      <div className="absolute inset-0 bg-mint-wash rounded-full blur-xl opacity-60 pointer-events-none" />

      <svg
        viewBox="0 0 320 340"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible"
      >
        {/* Top Target Bullseye with Flag (Screenshot 7 signature) */}
        <motion.g
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="cursor-pointer"
        >
          {/* Outer ring */}
          <circle cx="190" cy="55" r="22" stroke="#11181C" strokeWidth="2" fill="#F0FDF4" />
          <circle cx="190" cy="55" r="14" stroke="#22C55E" strokeWidth="2" fill="#DCFCE7" />
          <circle cx="190" cy="55" r="6" stroke="#11181C" strokeWidth="1.8" fill="#11181C" />
          {/* Target crosshairs */}
          <line x1="165" y1="55" x2="215" y2="55" stroke="#11181C" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="190" y1="30" x2="190" y2="80" stroke="#11181C" strokeWidth="1.5" strokeLinecap="round" />
          {/* Flagpole and Flag */}
          <path d="M190 32 V12 M190 12 L205 18 L190 24 Z" stroke="#11181C" strokeWidth="1.6" fill="#22C55E" strokeLinejoin="round" />
        </motion.g>

        {/* Winding Road / Path (Animated Stroke) */}
        <motion.g>
          {/* Path left boundary */}
          <motion.path
            d="M90 310 C140 280 180 280 200 240 C220 200 130 190 140 140 C150 90 180 80 190 75"
            stroke="#11181C"
            strokeWidth="2.2"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.4, ease: "easeInOut" }}
          />
          {/* Path right boundary */}
          <motion.path
            d="M130 325 C180 295 215 290 230 250 C245 210 165 200 170 150 C175 105 195 85 205 77"
            stroke="#11181C"
            strokeWidth="2.2"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.4, ease: "easeInOut" }}
          />

          {/* Road Hatching / Stepping stones along the path */}
          <path d="M102 308 L122 318 M125 295 L148 307 M158 278 L184 290 M182 258 L206 268" stroke="#16A34A" strokeWidth="1.2" strokeOpacity="0.7" />
          <path d="M185 230 L205 235 M160 202 L180 208 M145 175 L165 178 M146 148 L166 150 M158 120 L175 120" stroke="#16A34A" strokeWidth="1.2" strokeOpacity="0.7" />
        </motion.g>

        {/* Illustrated Elements along the journey */}
        {/* Little House on the Hill */}
        <motion.g whileHover={{ y: -2 }}>
          {/* Roof */}
          <path d="M210 215 L225 198 L240 215 Z" fill="#DCFCE7" stroke="#11181C" strokeWidth="1.8" strokeLinejoin="round" />
          {/* Base */}
          <rect x="214" y="215" width="22" height="18" fill="#FFFFFF" stroke="#11181C" strokeWidth="1.8" />
          {/* Door */}
          <rect x="221" y="223" width="8" height="10" fill="#22C55E" stroke="#11181C" strokeWidth="1.4" />
          {/* Roof Hatching */}
          <path d="M216 211 L220 206 M222 211 L226 206 M228 211 L232 206" stroke="#16A34A" strokeWidth="1" strokeOpacity="0.6" />
        </motion.g>

        {/* Sprouting Tree 1 (Bottom Left) */}
        <motion.g whileHover={{ rotate: 5, scale: 1.05 }} className="cursor-pointer">
          <path d="M80 305 V265" stroke="#11181C" strokeWidth="2" strokeLinecap="round" />
          {/* Leaves */}
          <path d="M80 280 C65 275 65 255 80 255 C95 255 95 275 80 280 Z" fill="#DCFCE7" stroke="#11181C" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M80 265 C70 260 70 245 80 245 C90 245 90 260 80 265 Z" fill="#BBF7D0" stroke="#11181C" strokeWidth="1.6" strokeLinejoin="round" />
          {/* Vein */}
          <path d="M80 280 V255" stroke="#22C55E" strokeWidth="1.2" />
        </motion.g>

        {/* Sprouting Tree 2 (Mid Path) */}
        <motion.g whileHover={{ rotate: -5, scale: 1.05 }} className="cursor-pointer">
          <path d="M120 210 V185" stroke="#11181C" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M120 195 C110 190 110 178 120 178 C130 178 130 190 120 195 Z" fill="#DCFCE7" stroke="#11181C" strokeWidth="1.6" strokeLinejoin="round" />
        </motion.g>

        {/* Milestone Token Pin */}
        <motion.g whileHover={{ y: -3 }}>
          <path d="M152 110 L157 95 L162 110 L157 118 Z" fill="#DCFCE7" stroke="#22C55E" strokeWidth="1.6" strokeLinejoin="round" />
        </motion.g>

        {/* Milestone Coin / Leaf at Top Right */}
        <motion.g whileHover={{ y: -2 }}>
          <circle cx="150" cy="78" r="8" fill="#DCFCE7" stroke="#11181C" strokeWidth="1.5" />
          <path d="M150 72 V84 M145 78 H155" stroke="#22C55E" strokeWidth="1.4" strokeLinecap="round" />
        </motion.g>

        {/* Floating sparkles */}
        <g id="sparkles-road">
          <circle cx="115" cy="150" r="1.5" fill="#22C55E" />
          <circle cx="255" cy="180" r="2" fill="#22C55E" />
          <circle cx="215" cy="130" r="1.5" fill="#11181C" />
        </g>
      </svg>
    </div>
  );
}
