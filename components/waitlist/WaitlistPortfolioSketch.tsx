"use client";

import { useId, type CSSProperties, type ReactNode } from "react";
import { WAITLIST_PANEL } from "@/lib/waitlistCopy";

const INK = "#111613";
const GREEN = "#22C55E";
const DEEP = "#15803D";

const hand: CSSProperties = { fontFamily: "var(--font-caveat), cursive", fontWeight: 700 };
const figure: CSSProperties = { fontFamily: "var(--font-manrope), sans-serif", fontWeight: 800 };

/**
 * Hand-drawn portfolio cards for the pop-up's welcome panel: total value,
 * asset allocation (the logo ring as the donut) and portfolio return, with a
 * rough-edge filter and the hero's dashed green orbits.
 */
export function WaitlistPortfolioSketch() {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const rough = `wl-rough-${uid}`;
  const blur = `wl-shadow-${uid}`;

  const card = (x: number, y: number, w: number, h: number, rotate: number, children: ReactNode) => (
    <g transform={`rotate(${rotate} ${x + w / 2} ${y + h / 2})`}>
      <g filter={`url(#${rough})`}>
        <rect x={x + 2.5} y={y + 3.5} width={w} height={h} rx={9} fill="none" stroke={INK} strokeOpacity={0.22} strokeWidth={1} />
        <rect x={x} y={y} width={w} height={h} rx={9} fill="#fff" stroke={INK} strokeWidth={1.5} />
      </g>
      {children}
    </g>
  );

  const sparkline = (line: string, area: string) => (
    <>
      <path d={area} fill={GREEN} opacity={0.18} />
      <g filter={`url(#${rough})`}>
        <path d={line} fill="none" stroke={GREEN} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </>
  );

  return (
    <svg
      viewBox="0 0 420 250"
      width="100%"
      role="img"
      aria-label={WAITLIST_PANEL.visualLabel}
      className="block overflow-visible"
    >
      <defs>
        <filter id={rough} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves={2} seed={4} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={2.6} />
        </filter>
        <filter id={blur} x="-20%" y="-20%" width="140%" height="150%">
          <feGaussianBlur stdDeviation={5} />
        </filter>
      </defs>

      {/* floor shadow and scribbles */}
      <ellipse cx={215} cy={236} rx={170} ry={9} fill={INK} opacity={0.1} filter={`url(#${blur})`} />
      <g stroke={INK} strokeOpacity={0.16} strokeWidth={1} strokeLinecap="round" filter={`url(#${rough})`}>
        <path d="M60 238h110M110 244h150M250 240h100" />
      </g>

      {/* dots, as in the hero (the dashed orbit lines were removed) */}
      <g fill={GREEN}>
        <circle cx={38} cy={96} r={3} />
        <circle cx={318} cy={22} r={3} />
        <circle cx={400} cy={128} r={2.6} />
        <circle cx={352} cy={222} r={3} />
      </g>
      <circle cx={14} cy={176} r={5} fill={INK} opacity={0.7} />

      {/* card 1: total portfolio value */}
      {card(
        8,
        22,
        190,
        100,
        -3,
        <>
          <text x={24} y={52} fontSize={16} fill={INK} style={hand}>
            Total portfolio value
          </text>
          <text x={24} y={82} fontSize={26} letterSpacing={-0.8} fill={INK} style={figure}>
            ₹2.13 Cr
          </text>
          <text x={24} y={102} fontSize={15} fill={DEEP} style={hand}>
            +0.6% today
          </text>
          {sparkline("M104 104l20-8 18 5 20-16 20 6 14-14", "M104 104l20-8 18 5 20-16 20 6 14-14V112H104z")}
        </>
      )}

      {/* card 2: asset allocation with the logo ring */}
      {card(
        228,
        10,
        176,
        124,
        2.5,
        <>
          <text x={244} y={40} fontSize={16} fill={INK} style={hand}>
            Asset allocation
          </text>
          <g transform="translate(290 88)">
            <g filter={`url(#${rough})`}>
              <circle r={27} fill="none" stroke={INK} strokeWidth={13} strokeDasharray="118 52" strokeDashoffset={-6} transform="rotate(-20)" />
              <circle r={29.5} fill="none" stroke={GREEN} strokeWidth={16} strokeDasharray="40 130" transform="rotate(-84)" />
            </g>
          </g>
          <g fontSize={14} fill={INK} style={hand}>
            <circle cx={338} cy={68} r={3.4} fill={GREEN} />
            <text x={346} y={73}>
              Funds
            </text>
            <circle cx={338} cy={88} r={3.4} fill={INK} />
            <text x={346} y={93}>
              Stocks
            </text>
            <circle cx={338} cy={108} r={3.4} fill="#F59E0B" />
            <text x={346} y={113}>
              Gold
            </text>
          </g>
        </>
      )}

      {/* card 3: your portfolio */}
      {card(
        52,
        136,
        190,
        92,
        1.5,
        <>
          <text x={68} y={164} fontSize={16} fill={INK} style={hand}>
            Your portfolio
          </text>
          <text x={68} y={196} fontSize={27} letterSpacing={-0.8} fill={DEEP} style={figure}>
            +18.6%
          </text>
          {sparkline("M150 204l18-6 16 3 18-13 18 5 16-12", "M150 204l18-6 16 3 18-13 18 5 16-12V214H150z")}
        </>
      )}
    </svg>
  );
}
