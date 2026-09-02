"use client";

import { useRef, useState, useEffect } from "react";
import { useScroll, useSpring } from "framer-motion";
import { TelemetryHUD } from "@/components/experience/TelemetryHUD";
import { Scene1Dispersion } from "@/components/experience/Scene1Dispersion";
import { Scene2OpticalReticle } from "@/components/experience/Scene2OpticalReticle";
import { Scene3KineticTopography } from "@/components/experience/Scene3KineticTopography";
import { Scene4PolyphonicNexus } from "@/components/experience/Scene4PolyphonicNexus";
import { Scene5ZeroSingularity } from "@/components/experience/Scene5ZeroSingularity";

export function SpatialExperienceStage() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // High-precision smooth physics spring for seamless spatial transitions
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 24,
    restDelta: 0.0005,
  });

  // Track progress and active chapter
  useEffect(() => {
    return smoothProgress.on("change", (latest) => {
      setCurrentProgress(latest);

      if (latest < 0.2) {
        setActiveChapterIndex(0);
      } else if (latest < 0.42) {
        setActiveChapterIndex(1);
      } else if (latest < 0.64) {
        setActiveChapterIndex(2);
      } else if (latest < 0.82) {
        setActiveChapterIndex(3);
      } else {
        setActiveChapterIndex(4);
      }
    });
  }, [smoothProgress]);

  // Navigate to a specific chapter via scroll
  const handleNavigateChapter = (index: number) => {
    if (!containerRef.current) return;
    const targetProgress = [0.05, 0.28, 0.5, 0.72, 0.92][index] || 0;
    const totalHeight = containerRef.current.scrollHeight - window.innerHeight;
    window.scrollTo({
      top: containerRef.current.offsetTop + targetProgress * totalHeight,
      behavior: "smooth",
    });
  };

  return (
    <div
      ref={containerRef}
      className="relative h-[550vh] sm:h-[600vh] bg-[#FAF8F5] select-none"
    >
      {/* Floating Spatial Navigation HUD */}
      <TelemetryHUD
        currentProgress={currentProgress}
        activeChapterIndex={activeChapterIndex}
        onNavigateChapter={handleNavigateChapter}
      />

      {/* Sticky Spatial Viewport Stage */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        {/* ======================================================== */}
        {/* SCENE 1: THE OVERTURE OF DISPERSION (ACT 01)             */}
        {/* ======================================================== */}
        <Scene1Dispersion progress={smoothProgress} />

        {/* ======================================================== */}
        {/* SCENE 2: THE OPTICAL RETICLE (ACT 02)                    */}
        {/* ======================================================== */}
        <Scene2OpticalReticle progress={smoothProgress} />

        {/* ======================================================== */}
        {/* SCENE 3: THE KINETIC TOPOGRAPHY (ACT 03)                 */}
        {/* ======================================================== */}
        <Scene3KineticTopography progress={smoothProgress} />

        {/* ======================================================== */}
        {/* SCENE 4: THE POLYPHONIC NEXUS (ACT 04)                   */}
        {/* ======================================================== */}
        <Scene4PolyphonicNexus progress={smoothProgress} />

        {/* ======================================================== */}
        {/* SCENE 5: THE ZERO-TOLL SINGULARITY (ACT 05)              */}
        {/* ======================================================== */}
        <Scene5ZeroSingularity progress={smoothProgress} />
      </div>
    </div>
  );
}
