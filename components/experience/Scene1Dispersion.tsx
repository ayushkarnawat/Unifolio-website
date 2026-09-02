"use client";

import { useState } from "react";
import { motion, MotionValue, useTransform } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

function ShardItem({
  shard,
  idx,
  assembly,
  mousePos,
}: {
  shard: {
    id: number;
    text: string;
    start: { x: number; y: number; rot: number };
    end: { x: number; y: number; rot: number };
  };
  idx: number;
  assembly: MotionValue<number>;
  mousePos: { x: number; y: number };
}) {
  const x = useTransform(assembly, [0, 1], [shard.start.x + mousePos.x * 30, shard.end.x]);
  const y = useTransform(assembly, [0, 1], [shard.start.y + mousePos.y * 30, shard.end.y]);
  const rotate = useTransform(assembly, [0, 1], [shard.start.rot, shard.end.rot]);
  const opacity = useTransform(assembly, [0, 0.4, 1], [0.3, 0.8, 1]);
  const dotScale = useTransform(assembly, [0.6, 1], [0, 1]);

  return (
    <motion.span
      style={{
        display: "inline-block",
        x,
        y,
        rotate,
        opacity,
      }}
      className="relative transition-transform duration-75"
    >
      {shard.text}
      {/* Highlight Dot on the 'I' */}
      {idx === 2 && (
        <motion.span
          style={{
            scale: dotScale,
          }}
          className="absolute -top-2 left-1/2 -translate-x-1/2 h-3 w-3 rounded-full bg-[#2E7D4E]"
        />
      )}
    </motion.span>
  );
}

export function Scene1Dispersion({
  progress, // 0.0 to 0.25 (active in Act 1)
}: {
  progress: MotionValue<number>;
}) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Map 0 -> 0.18 progress into assembly factor (0 = dispersed, 1 = fully assembled)
  const assembly = useTransform(progress, [0.0, 0.14], [0, 1]);
  const opacity = useTransform(progress, [0.0, 0.16, 0.22], [1, 1, 0]);
  const scale = useTransform(progress, [0.0, 0.18, 0.22], [1, 1.05, 3.5]); // Zoom in to transition to Scene 2
  const blur = useTransform(progress, [0.16, 0.22], ["blur(0px)", "blur(12px)"]);

  // Dispersed shards data
  const shards = [
    { id: 1, text: "U", start: { x: -280, y: -140, rot: -45 }, end: { x: 0, y: 0, rot: 0 } },
    { id: 2, text: "N", start: { x: -160, y: 160, rot: 35 }, end: { x: 0, y: 0, rot: 0 } },
    { id: 3, text: "I", start: { x: -60, y: -190, rot: -60 }, end: { x: 0, y: 0, rot: 0 } },
    { id: 4, text: "F", start: { x: 80, y: 180, rot: 50 }, end: { x: 0, y: 0, rot: 0 } },
    { id: 5, text: "O", start: { x: 190, y: -160, rot: -30 }, end: { x: 0, y: 0, rot: 0 } },
    { id: 6, text: "L", start: { x: 270, y: 140, rot: 40 }, end: { x: 0, y: 0, rot: 0 } },
    { id: 7, text: "I", start: { x: 340, y: -110, rot: -55 }, end: { x: 0, y: 0, rot: 0 } },
    { id: 8, text: "O", start: { x: 420, y: 150, rot: 65 }, end: { x: 0, y: 0, rot: 0 } },
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
        setMousePos({
          x: (e.clientX - rect.left) / rect.width - 0.5,
          y: (e.clientY - rect.top) / rect.height - 0.5,
        });
      }}
      className="absolute inset-0 flex flex-col items-center justify-center select-none overflow-hidden px-6"
    >
      {/* Background Soft Radiance Field */}
      <div className="absolute inset-0 bg-radial from-[#8CD49E]/15 via-transparent to-transparent pointer-events-none" />

      {/* Ephemeral Background Geometric Vector Lines (Gravity Field) */}
      <svg
        viewBox="0 0 1000 600"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-25 overflow-visible"
        fill="none"
      >
        <circle cx="500" cy="300" r="220" stroke="#1C241E" strokeWidth="1" strokeDasharray="4 6" />
        <circle cx="500" cy="300" r="360" stroke="#2E7D4E" strokeWidth="1" strokeDasharray="6 8" />
        <line x1="100" y1="300" x2="900" y2="300" stroke="#1C241E" strokeWidth="0.8" strokeDasharray="3 5" />
        <line x1="500" y1="50" x2="500" y2="550" stroke="#1C241E" strokeWidth="0.8" strokeDasharray="3 5" />
      </svg>

      {/* Top Editorial Eyebrow Statement */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="text-center mb-8 max-w-xl"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-[#1C241E]/15 bg-[#FAF8F5] px-4 py-1.5 font-mono text-xs uppercase tracking-widest text-[#2E7D4E]">
          <Sparkles className="h-3.5 w-3.5" />
          <span>ACT 01 · THE DISPERSION OVERTURE</span>
        </div>
        <p className="mt-4 font-sans text-sm sm:text-base text-[#525E55] leading-relaxed">
          Every investment account begins scattered in chaos. Scroll to witness the force of consolidation.
        </p>
      </motion.div>

      {/* Monumental Assembling Typographic Sculpture */}
      <div className="relative flex items-center justify-center my-4">
        <div className="flex items-center tracking-[-0.04em] font-serif font-black text-6xl sm:text-8xl md:text-9xl lg:text-[11rem] text-[#1C241E] leading-none select-none">
          {shards.map((s, idx) => (
            <ShardItem
              key={s.id}
              shard={s}
              idx={idx}
              assembly={assembly}
              mousePos={mousePos}
            />
          ))}
        </div>

        {/* Razor-Sharp Hand-Drawn Calligraphic Hairline (Slices through when assembled) */}
        <svg
          viewBox="0 0 800 100"
          className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 h-16 w-full overflow-visible"
          fill="none"
        >
          <motion.path
            d="M 20 50 Q 200 40, 400 52 T 780 48"
            stroke="#2E7D4E"
            strokeWidth="2.5"
            strokeLinecap="round"
            style={{
              pathLength: useTransform(assembly, [0.4, 1], [0, 1]),
              opacity: useTransform(assembly, [0.4, 0.7], [0, 1]),
            }}
          />
        </svg>
      </div>

      {/* Floating Floating Micro-Telemetry Annotations */}
      <motion.div
        style={{
          opacity: useTransform(assembly, [0.7, 1], [0, 1]),
          y: useTransform(assembly, [0.7, 1], [15, 0]),
        }}
        className="mt-8 flex flex-col sm:flex-row items-center gap-6 text-center"
      >
        <div className="flex items-center gap-3">
          <Link
            href="/get-started"
            className="inline-flex items-center gap-2 rounded-full bg-[#1C241E] px-7 py-3 font-sans text-xs font-semibold text-white shadow-md hover:bg-[#2E7D4E] transition-all"
          >
            <span>Enter the Experience</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-[#525E55]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#2E7D4E] animate-ping" />
          <span>SCROLL TO PLUNGE INTO THE MACRO LENS ↓</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
