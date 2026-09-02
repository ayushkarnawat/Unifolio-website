"use client";

import { useRef, useState, useEffect } from "react";
import { useScroll, useSpring } from "framer-motion";
import { ContinuumHUD } from "@/components/continuum/ContinuumHUD";
import { PhaseFragmentation } from "@/components/continuum/PhaseFragmentation";
import { PhaseConnection } from "@/components/continuum/PhaseConnection";
import { PhaseClarity } from "@/components/continuum/PhaseClarity";

export function ContinuumExperience() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [phase, setPhase] = useState<"fragmentation" | "connection" | "clarity">("fragmentation");

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // High-precision smooth spring for fluid spatial transitions
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 85,
    damping: 22,
    restDelta: 0.0005,
  });

  useEffect(() => {
    return smoothProgress.on("change", (latest) => {
      setCurrentProgress(latest);

      if (latest < 0.32) {
        setPhase("fragmentation");
      } else if (latest < 0.72) {
        setPhase("connection");
      } else {
        setPhase("clarity");
      }
    });
  }, [smoothProgress]);

  const handleJumpToPhase = (target: number) => {
    if (!containerRef.current) return;
    const totalHeight = containerRef.current.scrollHeight - window.innerHeight;
    window.scrollTo({
      top: containerRef.current.offsetTop + target * totalHeight,
      behavior: "smooth",
    });
  };

  return (
    <div
      ref={containerRef}
      className="relative h-[380vh] sm:h-[420vh] bg-[#FAF8F5] select-none"
    >
      {/* Floating Micro-Telemetry HUD */}
      <ContinuumHUD
        progress={currentProgress}
        phase={phase}
        onJumpToPhase={handleJumpToPhase}
      />

      {/* Sticky Narrative Canvas Stage */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        {/* Phase 1: Entropic Fragmentation */}
        <PhaseFragmentation progress={smoothProgress} />

        {/* Phase 2: Gravitational Connection */}
        <PhaseConnection progress={smoothProgress} />

        {/* Phase 3: Monumental Clarity */}
        <PhaseClarity progress={smoothProgress} />
      </div>
    </div>
  );
}
