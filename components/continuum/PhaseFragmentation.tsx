"use client";

import { useState } from "react";
import { motion, MotionValue, useTransform } from "framer-motion";

function FragmentItem({
  fragment,
  idx,
  collapse,
  mouseOffset,
}: {
  fragment: {
    id: string;
    text: string;
    pos: Record<string, string | undefined>;
    drift: { x: number; y: number; rot: number };
    tag: string;
  };
  idx: number;
  collapse: MotionValue<number>;
  mouseOffset: { x: number; y: number };
}) {
  const x = useTransform(collapse, [0, 1], [fragment.drift.x + mouseOffset.x * (idx * 20), 0]);
  const y = useTransform(collapse, [0, 1], [fragment.drift.y + mouseOffset.y * (idx * 20), 0]);
  const rotate = useTransform(collapse, [0, 1], [fragment.drift.rot, 0]);
  const opacity = useTransform(collapse, [0, 0.7, 1], [0.85, 1, 0.3]);

  return (
    <motion.div
      style={{
        ...fragment.pos,
        position: "absolute",
        x,
        y,
        rotate,
        opacity,
      }}
      className="pointer-events-none flex flex-col items-start gap-1"
    >
      <span className="font-mono text-[9px] uppercase tracking-wider text-[#8E9B91]">
        {fragment.tag}
      </span>
      <span className="font-serif italic text-lg sm:text-2xl text-[#1C241E] border-b border-[#1C241E]/15 pb-0.5">
        {fragment.text}
      </span>
    </motion.div>
  );
}

export function PhaseFragmentation({
  progress, // 0.0 to 0.40 (Phase 1)
}: {
  progress: MotionValue<number>;
}) {
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  // Dispersal / convergence transform (0 = full fragmentation, 1 = collapsing into connection)
  const collapse = useTransform(progress, [0.0, 0.28], [0, 1]);
  const opacity = useTransform(progress, [0.0, 0.26, 0.35], [1, 1, 0]);
  const scale = useTransform(progress, [0.0, 0.28, 0.35], [1, 0.95, 0.75]);
  const blur = useTransform(progress, [0.26, 0.35], ["blur(0px)", "blur(8px)"]);

  // Asymmetrical fragmented thought coordinates
  const fragments = [
    {
      id: "frag-1",
      text: "Seventeen folios adrift.",
      pos: { top: "14%", left: "8%" },
      drift: { x: -80, y: -40, rot: -8 },
      tag: "CAMS · KFINTECH",
    },
    {
      id: "frag-2",
      text: "Four broker apps.",
      pos: { top: "28%", right: "12%" },
      drift: { x: 90, y: -60, rot: 12 },
      tag: "DISJOINTED LOGINS",
    },
    {
      id: "frag-3",
      text: "Hidden 1.5% distributor drag.",
      pos: { top: "54%", left: "10%" },
      drift: { x: -110, y: 50, rot: -6 },
      tag: "COMPOUNDING CUTS",
    },
    {
      id: "frag-4",
      text: "Unclaimed dividends. Duplicate stocks.",
      pos: { top: "68%", right: "8%" },
      drift: { x: 120, y: 70, rot: 9 },
      tag: "PORTFOLIO OVERLAP",
    },
    {
      id: "frag-5",
      text: "Unresolved truth.",
      pos: { bottom: "16%", left: "32%" },
      drift: { x: 0, y: 80, rot: -4 },
      tag: "WHERE DOES IT STAND?",
    },
  ];

  return (
    <motion.div
      style={{
        opacity,
        scale,
        filter: blur,
      }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMouseOffset({
          x: (e.clientX - rect.left) / rect.width - 0.5,
          y: (e.clientY - rect.top) / rect.height - 0.5,
        });
      }}
      className="absolute inset-0 flex flex-col justify-between select-none overflow-hidden p-8 sm:p-16"
    >
      {/* Background Dissonant Vectors & Unconnected Hairlines */}
      <svg
        viewBox="0 0 1200 800"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-30 overflow-visible"
        fill="none"
      >
        {/* Jagged, Interrupted Restless Strokes */}
        <motion.path
          d="M 120 180 L 280 240 M 340 260 L 460 210 M 700 160 L 850 280 M 920 340 L 1050 300"
          stroke="#1C241E"
          strokeWidth="1.2"
          strokeDasharray="4 6"
        />
        <motion.path
          d="M 180 520 L 320 480 M 480 620 L 640 560 M 780 490 L 960 580"
          stroke="#2E7D4E"
          strokeWidth="1"
          strokeDasharray="6 8"
        />

        {/* Scattered Coordinate Ticks */}
        <circle cx="280" cy="240" r="3" fill="#1C241E" opacity="0.4" />
        <circle cx="850" cy="280" r="3.5" fill="#2E7D4E" opacity="0.5" />
        <circle cx="480" cy="620" r="2.5" fill="#1C241E" opacity="0.4" />
      </svg>

      {/* Monumental Asymmetric Tension Header (Raw & Deconstructed) */}
      <div className="relative z-10 max-w-2xl pt-8">
        <span className="font-mono text-xs uppercase tracking-widest text-[#8E9B91] block mb-3">
          [ 01 · ENTROPIC DISPERSION ]
        </span>

        <h1 className="font-serif text-5xl sm:text-7xl lg:text-[5.8rem] font-normal tracking-tight text-[#1C241E] leading-[0.98]">
          Fractured <br />
          <span className="italic text-[#2E7D4E] font-light">pieces</span> <br />
          of wealth.
        </h1>
      </div>

      {/* Dispersed Thought Fragments Adrift Across the Canvas */}
      {fragments.map((f, idx) => (
        <FragmentItem
          key={f.id}
          fragment={f}
          idx={idx}
          collapse={collapse}
          mouseOffset={mouseOffset}
        />
      ))}

      {/* Bottom Minimalist Scroll Motive */}
      <div className="relative z-10 flex items-center justify-between font-mono text-xs text-[#8E9B91] pt-6 border-t border-[#1C241E]/10">
        <span>SEPARATION OF PARTS</span>
        <span className="animate-pulse text-[#1C241E] font-medium">
          SCROLL TO INITIATE GRAVITATIONAL ALIGNMENT ↓
        </span>
      </div>
    </motion.div>
  );
}
