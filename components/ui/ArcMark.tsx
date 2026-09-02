"use client";

import { motion } from "framer-motion";

interface ArcMarkProps {
  className?: string;
  animated?: boolean;
  score?: number; // 0 to 100
}

export function ArcMark({ className = "h-7 w-7", animated = false, score = 42 }: ArcMarkProps) {
  return (
    <svg viewBox="0 0 40 40" className={`overflow-visible ${className}`} aria-hidden="true" fill="none">
      {/* Hand-drawn outer track ring */}
      <path
        d="M20 5 C28.5 4.8 35 11.2 35 20 C35 28.5 28.5 35.2 20 35 C11.5 34.8 5 28.5 5 20 C4.8 11.5 11.2 5.2 20 5"
        stroke="#11181C"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeOpacity="0.15"
      />

      {/* Inner mint wash backdrop */}
      <circle cx="20" cy="20" r="11" fill="#DCFCE7" fillOpacity="0.65" />

      {/* Dynamic emerald stroke */}
      {animated ? (
        <motion.path
          d="M20 5 C28.5 4.8 35 11.2 35 20 C35 28.5 28.5 35.2 20 35 C11.5 34.8 5 28.5 5 20 C4.8 11.5 11.2 5.2 20 5"
          stroke="#22C55E"
          strokeWidth="2.8"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: score / 100 }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        />
      ) : (
        <path
          d="M20 5 C28 5 35 11 35 20"
          stroke="#22C55E"
          strokeWidth="2.8"
          strokeLinecap="round"
        />
      )}

      {/* Hand-drawn center point & orbital sparkle */}
      <circle cx="20" cy="20" r="3.2" fill="#11181C" />
      <circle cx="20" cy="20" r="1.4" fill="#22C55E" />
    </svg>
  );
}
