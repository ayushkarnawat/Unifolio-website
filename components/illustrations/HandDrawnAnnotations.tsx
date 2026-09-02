"use client";

import { motion } from "framer-motion";

// Hand-drawn wavy underline (e.g. under key text like Screenshot 2)
export function HandDrawnUnderline({
  className = "w-full h-3",
  color = "#22C55E",
}: {
  className?: string;
  color?: string;
}) {
  return (
    <svg
      viewBox="0 0 160 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`overflow-visible ${className}`}
      preserveAspectRatio="none"
    >
      <motion.path
        d="M2 11C28 15 54 8 82 12C110 16 134 7 158 11"
        stroke={color}
        strokeWidth="3.2"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
      <motion.path
        d="M8 15C36 17 62 13 90 16C118 19 138 13 152 15"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeOpacity="0.6"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, delay: 0.15, ease: "easeOut" }}
      />
    </svg>
  );
}

// Hand-drawn organic circle loop around words
export function HandDrawnCircle({
  children,
  className = "",
  color = "#22C55E",
}: {
  children: React.ReactNode;
  className?: string;
  color?: string;
}) {
  return (
    <span className={`relative inline-block ${className}`}>
      {children}
      <svg
        viewBox="0 0 180 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="pointer-events-none absolute -inset-x-3 -inset-y-2.5 h-[calc(100%+20px)] w-[calc(100%+24px)] overflow-visible"
        preserveAspectRatio="none"
      >
        <motion.path
          d="M12 32C10 14 38 6 92 6C148 6 172 16 170 34C168 50 134 56 84 56C32 56 6 48 8 28C10 12 44 4 104 4"
          stroke={color}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, ease: "easeInOut" }}
        />
      </svg>
    </span>
  );
}

// Hand-drawn sketch arrow
export function HandDrawnArrow({
  className = "w-12 h-12 text-accent",
  direction = "right",
}: {
  className?: string;
  direction?: "right" | "down" | "curve-right";
}) {
  return (
    <svg
      viewBox="0 0 60 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`overflow-visible ${className}`}
    >
      {direction === "right" && (
        <motion.path
          d="M6 20C22 18 36 21 52 20M42 12C46 16 49 18 53 20C48 23 44 26 40 30"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        />
      )}
      {direction === "curve-right" && (
        <motion.path
          d="M6 8C14 26 32 34 50 26M40 18C46 22 49 24 52 26C48 29 42 34 38 38"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        />
      )}
      {direction === "down" && (
        <motion.path
          d="M30 6C29 18 31 28 30 46M22 36C26 40 29 44 30 48C33 44 36 39 40 35"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        />
      )}
    </svg>
  );
}

// Hand-drawn 4-point sparkle star (as in Screenshot 2, 3, 5)
export function HandDrawnSparkle({
  className = "w-6 h-6",
  color = "#22C55E",
}: {
  className?: string;
  color?: string;
}) {
  return (
    <motion.svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      initial={{ scale: 0, rotate: -20 }}
      whileInView={{ scale: 1, rotate: 0 }}
      viewport={{ once: true }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
    >
      <path
        d="M16 2C16 9 19 12 26 16C19 20 16 23 16 30C16 23 13 20 6 16C13 12 16 9 16 2Z"
        fill={color}
        fillOpacity="0.15"
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </motion.svg>
  );
}

// Hand-drawn bubble droplet with green wash (as in Screenshot 1 & 2)
export function HandDrawnDroplet({
  size = 28,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Soft watercolor mint fill */}
      <circle cx="20" cy="20" r="15" fill="#DCFCE7" fillOpacity="0.75" />
      {/* Subtle highlight inner crescent */}
      <path
        d="M13 14C15 11 20 10 24 12"
        stroke="#FFFFFF"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {/* Hand-drawn ink outline */}
      <path
        d="M20 5C28.2 5 35 11.8 35 20C35 28.2 28.2 35 20 35C11.8 35 5 28.2 5 20C5 11.8 11.8 5 20 5Z"
        stroke="#11181C"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeDasharray="95"
        strokeDashoffset="0"
      />
    </svg>
  );
}

// Custom hand-drawn badge icons matching Screenshots 6 & 7
export type BadgeIconType =
  | "gauge"
  | "bank"
  | "rings"
  | "sprout"
  | "server"
  | "lens"
  | "umbrella"
  | "scale"
  | "envelope"
  | "phone"
  | "folder";

export function HandDrawnBadgeIcon({
  type,
  className = "w-12 h-12",
}: {
  type: BadgeIconType;
  className?: string;
}) {
  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-2xl bg-mint-50 border border-mint-200/80 p-2.5 transition-all group-hover:scale-105 group-hover:bg-mint-100 ${className}`}
    >
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full overflow-visible"
      >
        {type === "gauge" && (
          <>
            <path
              d="M10 26A13 13 0 1 1 30 26"
              stroke="#11181C"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path d="M20 20L27 13" stroke="#22C55E" strokeWidth="2.4" strokeLinecap="round" />
            <circle cx="20" cy="20" r="2.5" fill="#11181C" />
            <path d="M14 16L12 14M20 10V8M26 16L28 14" stroke="#11181C" strokeWidth="1.5" strokeLinecap="round" />
          </>
        )}
        {type === "bank" && (
          <>
            <path d="M7 15L20 7L33 15H7Z" stroke="#11181C" strokeWidth="2" strokeLinejoin="round" fill="#DCFCE7" />
            <path d="M12 15V27M17 15V27M23 15V27M28 15V27" stroke="#11181C" strokeWidth="2" strokeLinecap="round" />
            <path d="M6 27H34M5 31H35" stroke="#11181C" strokeWidth="2" strokeLinecap="round" />
            <path d="M20 18V24" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" />
          </>
        )}
        {type === "rings" && (
          <>
            <circle cx="16" cy="20" r="9" stroke="#11181C" strokeWidth="2" fill="#DCFCE7" fillOpacity="0.4" />
            <circle cx="24" cy="20" r="9" stroke="#22C55E" strokeWidth="2" fill="#DCFCE7" fillOpacity="0.4" />
            <circle cx="20" cy="20" r="2" fill="#11181C" />
          </>
        )}
        {type === "sprout" && (
          <>
            <path d="M11 22H29L26 33H14L11 22Z" stroke="#11181C" strokeWidth="2" strokeLinejoin="round" fill="#F0FDF4" />
            <path d="M20 22V13" stroke="#11181C" strokeWidth="2" strokeLinecap="round" />
            <path d="M20 13C16 11 15 6 20 6C25 6 24 11 20 13Z" stroke="#22C55E" strokeWidth="2" fill="#DCFCE7" strokeLinejoin="round" />
            <path d="M20 17C24 15 26 12 25 9" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" />
            <circle cx="16" cy="27" r="1" fill="#11181C" />
            <circle cx="24" cy="27" r="1" fill="#11181C" />
          </>
        )}
        {type === "server" && (
          <>
            <rect x="8" y="8" width="24" height="7" rx="3" stroke="#11181C" strokeWidth="2" fill="#DCFCE7" />
            <rect x="8" y="17" width="24" height="7" rx="3" stroke="#11181C" strokeWidth="2" fill="#F0FDF4" />
            <rect x="8" y="26" width="24" height="7" rx="3" stroke="#11181C" strokeWidth="2" fill="#DCFCE7" />
            <circle cx="13" cy="11.5" r="1.2" fill="#22C55E" />
            <circle cx="13" cy="20.5" r="1.2" fill="#22C55E" />
            <circle cx="13" cy="29.5" r="1.2" fill="#22C55E" />
            <path d="M18 11.5H26M18 20.5H26M18 29.5H26" stroke="#11181C" strokeWidth="1.6" strokeLinecap="round" />
          </>
        )}
        {type === "lens" && (
          <>
            <circle cx="18" cy="17" r="10" stroke="#11181C" strokeWidth="2" fill="#DCFCE7" fillOpacity="0.5" />
            <path d="M25 25L33 33" stroke="#11181C" strokeWidth="2.5" strokeLinecap="round" />
            {/* Diamond inside lens */}
            <path d="M18 11L22 17L18 23L14 17L18 11Z" stroke="#22C55E" strokeWidth="1.8" fill="#FFFFFF" strokeLinejoin="round" />
          </>
        )}
        {type === "umbrella" && (
          <>
            <path d="M7 21C7 13.8 12.8 8 20 8C27.2 8 33 13.8 33 21C30 20 28 20 25 21C22 20 20 20 17 21C14 20 12 20 7 21Z" stroke="#11181C" strokeWidth="2" fill="#DCFCE7" strokeLinejoin="round" />
            <path d="M20 8V28C20 30.5 18 32 16 31" stroke="#11181C" strokeWidth="2" strokeLinecap="round" />
            <circle cx="13" cy="26" r="2" fill="#22C55E" />
            <circle cx="27" cy="26" r="2" fill="#22C55E" />
          </>
        )}
        {type === "scale" && (
          <>
            <path d="M20 8V31M12 31H28" stroke="#11181C" strokeWidth="2" strokeLinecap="round" />
            <path d="M9 13L31 13" stroke="#11181C" strokeWidth="2" strokeLinecap="round" />
            <path d="M9 13L5 22H13L9 13Z" stroke="#11181C" strokeWidth="1.8" fill="#DCFCE7" strokeLinejoin="round" />
            <path d="M31 13L27 20H35L31 13Z" stroke="#11181C" strokeWidth="1.8" fill="#DCFCE7" strokeLinejoin="round" />
          </>
        )}
        {type === "envelope" && (
          <>
            <rect x="7" y="11" width="26" height="18" rx="3" stroke="#11181C" strokeWidth="2" fill="#FFFFFF" />
            <path d="M7 13L20 22L33 13" stroke="#11181C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="20" cy="20" r="3" fill="#22C55E" />
          </>
        )}
        {type === "phone" && (
          <>
            <rect x="11" y="6" width="18" height="28" rx="4" stroke="#11181C" strokeWidth="2" fill="#FFFFFF" />
            <path d="M17 9H23" stroke="#11181C" strokeWidth="2" strokeLinecap="round" />
            <circle cx="20" cy="29" r="1.5" fill="#22C55E" />
          </>
        )}
        {type === "folder" && (
          <>
            <path d="M6 12C6 10.3 7.3 9 9 9H16L19 12H31C32.7 12 34 13.3 34 15V27C34 28.7 32.7 30 31 30H9C7.3 30 6 28.7 6 27V12Z" stroke="#11181C" strokeWidth="2" fill="#DCFCE7" fillOpacity="0.6" strokeLinejoin="round" />
            <path d="M12 21H28M12 25H22" stroke="#22C55E" strokeWidth="1.8" strokeLinecap="round" />
          </>
        )}
      </svg>
    </div>
  );
}
