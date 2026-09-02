"use client";

import { motion } from "framer-motion";

export function SketchFolderIllustration({
  className = "w-full max-w-[340px] h-[300px]",
}: {
  className?: string;
}) {
  return (
    <div className={`relative select-none flex items-center justify-center ${className}`}>
      <div className="absolute inset-0 bg-mint-wash rounded-full blur-xl opacity-60 pointer-events-none" />

      <svg
        viewBox="0 0 340 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible"
      >
        {/* Open Binder Folder Body (Screenshot 5 signature) */}
        <motion.g
          initial={{ rotate: -2, y: 10, opacity: 0 }}
          whileInView={{ rotate: 0, y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          whileHover={{ y: -4 }}
        >
          {/* Back Cover / Left flap */}
          <path
            d="M90 85 L155 60 L180 230 L95 245 Z"
            fill="#F4F7F5"
            stroke="#11181C"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {/* Right flap / Open Folder Pocket */}
          <path
            d="M155 60 L240 100 L210 265 L140 230 Z"
            fill="#FFFFFF"
            stroke="#11181C"
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {/* Folder Top Tabs */}
          <path
            d="M95 83 C105 80 115 90 120 110 L105 115 Z"
            fill="#DCFCE7"
            stroke="#11181C"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />

          {/* Inside Pocket Curve */}
          <path
            d="M152 145 C180 135 220 160 215 220 L160 220 Z"
            fill="#DCFCE7"
            fillOpacity="0.5"
            stroke="#11181C"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />

          {/* Pocket Badge Strip */}
          <rect x="168" y="180" width="36" height="8" rx="2" fill="#22C55E" stroke="#11181C" strokeWidth="1.4" />

          {/* Folder Hatching Texture */}
          <path d="M102 180 L115 175 M104 195 L118 190 M106 210 L120 205" stroke="#16A34A" strokeWidth="0.9" strokeOpacity="0.5" />
        </motion.g>

        {/* Hand slipping CAS Card into Folder (Screenshot 5 signature) */}
        <motion.g
          initial={{ y: -15, x: 10, opacity: 0 }}
          whileInView={{ y: 0, x: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.2 }}
          whileHover={{ y: 5 }}
          className="cursor-pointer"
        >
          {/* Card being inserted */}
          <g transform="rotate(-12 175 115)">
            <rect x="145" y="70" width="70" height="42" rx="4" fill="#FFFFFF" stroke="#11181C" strokeWidth="1.8" />
            {/* User photo placeholder */}
            <circle cx="160" cy="85" r="5.5" fill="#DCFCE7" stroke="#22C55E" strokeWidth="1.4" />
            {/* User details lines */}
            <path d="M172 82 H205 M172 88 H198 M172 94 H192" stroke="#11181C" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="160" cy="83" r="2" fill="#22C55E" />
          </g>

          {/* Hand drawing lines */}
          <path
            d="M210 50 C220 50 235 60 250 85 C240 92 225 88 215 85 C200 80 188 88 178 92"
            fill="#FFFFFF"
            stroke="#11181C"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Hand cuff lines */}
          <path d="M245 80 L255 75 M248 87 L258 82" stroke="#11181C" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M195 85 C202 78 208 72 218 70" stroke="#11181C" strokeWidth="1.4" strokeLinecap="round" />
        </motion.g>

        {/* Curving Connecting Arrow from Card to Pocket */}
        <motion.path
          d="M175 115 C135 115 130 180 180 170"
          stroke="#22C55E"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeDasharray="4 4"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, delay: 0.3 }}
        />

        {/* Sparkle Stars & Pencil Accents */}
        <g id="folder-sparkles">
          {/* Top Right Star */}
          <path d="M240 130 L243 120 L246 130 L256 133 L246 136 L243 146 L240 136 L230 133 Z" fill="#DCFCE7" stroke="#22C55E" strokeWidth="1.2" />
          {/* Top Left Sparkle */}
          <path d="M120 70 L122 64 L124 70 L130 72 L124 74 L122 80 L120 74 L114 72 Z" fill="#DCFCE7" stroke="#22C55E" strokeWidth="1.2" />
          {/* Bottom squiggles */}
          <path d="M105 260 C110 255 115 265 120 260" stroke="#11181C" strokeWidth="1.4" strokeLinecap="round" />
          <circle cx="128" cy="262" r="1.5" fill="#11181C" />
          <circle cx="242" cy="165" r="1.5" fill="#22C55E" />
        </g>
      </svg>
    </div>
  );
}
