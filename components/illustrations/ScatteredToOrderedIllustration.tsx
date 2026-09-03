"use client";

import { motion } from "framer-motion";

export function ScatteredToOrderedIllustration({
  className = "w-full max-w-[320px] h-[280px]",
}: {
  className?: string;
}) {
  return (
    <div className={`relative select-none flex items-center justify-center ${className}`}>
      {/* Background mint glow */}
      <div className="absolute inset-0 bg-mint-wash rounded-full blur-xl opacity-60 pointer-events-none" />

      <svg
        viewBox="0 0 320 280"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible"
      >
        {/* Upward Growth Curved Arrows with Green Wash */}
        <motion.g
          initial={{ y: 8, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {/* Main big upward arrow */}
          <path
            d="M175 120 C190 70 215 50 240 35 M225 32 L245 33 L242 55"
            stroke="#22C55E"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Arrow mint fill shadow */}
          <path
            d="M178 122 C192 74 216 54 240 37"
            stroke="#DCFCE7"
            strokeWidth="6"
            strokeLinecap="round"
          />

          {/* Second upward arrow */}
          <path
            d="M150 110 C160 85 178 70 190 60 M180 58 L192 59 L190 72"
            stroke="#22C55E"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Third small upward arrow */}
          <path
            d="M230 130 C240 110 252 100 262 92 M254 91 L264 91 L263 101"
            stroke="#22C55E"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </motion.g>

        {/* Hand-Drawn Sprouting Leaf */}
        <motion.g
          whileHover={{ rotate: 8, scale: 1.05 }}
          className="cursor-pointer"
        >
          <path
            d="M125 105 C110 95 120 75 140 70 C155 85 145 110 125 105 Z"
            fill="#DCFCE7"
            stroke="#11181C"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          {/* Leaf vein */}
          <path d="M128 102 C135 92 142 84 148 76" stroke="#22C55E" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M136 94 C132 90 129 88 126 88" stroke="#22C55E" strokeWidth="1" strokeLinecap="round" />
          <path d="M141 87 C145 84 148 83 151 83" stroke="#22C55E" strokeWidth="1" strokeLinecap="round" />
        </motion.g>

        {/* Interlocking Ring / Token */}
        <motion.g whileHover={{ y: -3 }}>
          <circle cx="105" cy="140" r="14" fill="#F0FDF4" stroke="#11181C" strokeWidth="1.8" />
          <circle cx="105" cy="140" r="7" fill="#DCFCE7" stroke="#22C55E" strokeWidth="1.4" />
          {/* Hatching on ring */}
          <path d="M96 138L99 143M99 135L102 140" stroke="#11181C" strokeWidth="0.8" strokeOpacity="0.4" />
        </motion.g>

        {/* Hand-Drawn Geometric Blocks / Crystals with Hatching (Screenshot 6 signature) */}
        {/* Top Cube */}
        <motion.g whileHover={{ y: -4 }}>
          {/* Top Face */}
          <path d="M170 120 L195 105 L220 120 L195 135 Z" fill="#DCFCE7" stroke="#11181C" strokeWidth="1.8" strokeLinejoin="round" />
          {/* Left Face */}
          <path d="M170 120 L170 148 L195 163 L195 135 Z" fill="#FFFFFF" stroke="#11181C" strokeWidth="1.8" strokeLinejoin="round" />
          {/* Right Face */}
          <path d="M195 135 L195 163 L220 148 L220 120 Z" fill="#F0FDF4" stroke="#11181C" strokeWidth="1.8" strokeLinejoin="round" />
          {/* Hatching Lines on Left Face */}
          <path d="M174 128 L191 143 M174 136 L191 151 M174 144 L187 155" stroke="#22C55E" strokeWidth="0.9" strokeOpacity="0.6" />
        </motion.g>

        {/* --- TILE 2: Deep Dark Base with Sage Hatching --- */}
        <g id="scatter-tile-2">
          <path d="M100 170 L125 160 L140 175 L115 185 Z" fill="#DCFCE7" stroke="#11181C" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M100 170 L100 185 L115 200 L115 185 Z" fill="#11181C" stroke="#11181C" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M115 185 L115 200 L140 190 L140 175 Z" fill="#1E293B" stroke="#11181C" strokeWidth="1.8" strokeLinejoin="round" />
          {/* Subtle Sage cross-hatch */}
          <path d="M138 165 L152 178 M137 175 L151 188 M136 185 L148 198 M135 195 L144 207 M135 205 L142 214" stroke="#22C55E" strokeWidth="1" strokeOpacity="0.7" />
        </g>

        {/* --- TILE 3: Right Anchor Accent --- */}
        <g id="scatter-tile-3">
          <path d="M220 180 L250 160 L270 175 L240 195 Z" fill="#11181C" stroke="#11181C" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M220 180 L220 195 L240 210 L240 195 Z" fill="#1E293B" stroke="#11181C" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M240 195 L240 210 L270 190 L270 175 Z" fill="#0F172A" stroke="#11181C" strokeWidth="1.8" strokeLinejoin="round" />
          {/* Top subtle grid pattern */}
          <path d="M205 165 L240 145 M205 175 L242 155 M205 185 L245 165 M205 195 L248 175 M205 205 L250 185" stroke="#22C55E" strokeWidth="1.1" strokeOpacity="0.75" />
          <path d="M160 178 L180 173 M162 188 L182 183 M164 198 L182 193" stroke="#11181C" strokeWidth="0.8" strokeOpacity="0.3" />
        </g>

        {/* Right Tall Geometric Pillar */}
        <motion.g whileHover={{ y: -4, scale: 1.02 }}>
          <path
            d="M195 160 L245 130 L255 210 L195 220 Z"
            fill="#FFFFFF"
            stroke="#11181C"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {/* Internal diagonal */}
          <path d="M200 162 L200 215" stroke="#11181C" strokeWidth="1.6" />
          {/* Cross hatching */}
          <path d="M205 165 L240 145 M205 175 L242 155 M205 185 L245 165 M205 195 L248 175 M205 205 L250 185" stroke="#22C55E" strokeWidth="1.1" strokeOpacity="0.75" />
        </motion.g>

        {/* Floating Sparks / Stardust */}
        <g id="sparks">
          <circle cx="168" cy="78" r="1.5" fill="#11181C" />
          <circle cx="218" cy="85" r="1.5" fill="#11181C" />
          <circle cx="108" cy="115" r="1.5" fill="#22C55E" />
          <circle cx="275" cy="145" r="2" fill="#22C55E" />
        </g>
      </svg>
    </div>
  );
}
