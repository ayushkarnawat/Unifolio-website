"use client";

import { forwardRef, useImperativeHandle, type MutableRefObject, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";
import { HeroApertureVisual } from "@/components/hero/HeroApertureVisual";
import { Button } from "@/components/ui/Button";
import { ArrowRight } from "lucide-react";
import type { SceneEngine } from "../hero-engine/useSceneEngine";

export interface HeroSceneRefs {
  heroVisualRef: MutableRefObject<HTMLDivElement | null>;
  heroIntroRef: MutableRefObject<HTMLDivElement | null>;
  stageRef?: MutableRefObject<HTMLDivElement | null>;
  heroScrollTrackRef?: MutableRefObject<HTMLDivElement | null>;
  headerRef?: MutableRefObject<HTMLDivElement | null>;
  headlineRef?: MutableRefObject<HTMLHeadingElement | null>;
  subheadRef?: MutableRefObject<HTMLParagraphElement | null>;
  ctaRef?: MutableRefObject<HTMLAnchorElement | null>;
  floorLineRef?: MutableRefObject<HTMLDivElement | null>;
  irisPortalRef?: MutableRefObject<HTMLDivElement | null>;
  portalRimRef?: MutableRefObject<HTMLDivElement | null>;
  portalRippleRef?: MutableRefObject<HTMLDivElement | null>;
  productWorldRef?: MutableRefObject<HTMLDivElement | null>;
  heroToProductTlRef?: MutableRefObject<gsap.core.Timeline | null>;
  cardsStageRef?: MutableRefObject<HTMLDivElement | null>;
  cardsClusterRef?: MutableRefObject<HTMLDivElement | null>;
  cardWrapperRefs?: MutableRefObject<(HTMLDivElement | null)[]>;
  cardFlipperRefs?: MutableRefObject<(HTMLDivElement | null)[]>;
  cardFrontRefs?: MutableRefObject<(HTMLDivElement | null)[]>;
  cardBackRefs?: MutableRefObject<(HTMLDivElement | null)[]>;
  cardDefaultRefs?: MutableRefObject<(HTMLDivElement | null)[]>;
  cardHoverRefs?: MutableRefObject<(HTMLDivElement | null)[]>;
  cardIllustrationRefs?: MutableRefObject<(HTMLDivElement | null)[]>;
  cardGradientBgRefs?: MutableRefObject<(HTMLDivElement | null)[]>;
  cardGlassOverlayRefs?: MutableRefObject<(HTMLDivElement | null)[]>;
  bentoTileContentRefs?: MutableRefObject<(HTMLDivElement | null)[]>;
  onHeroToProductCompletedRef?: MutableRefObject<(() => void) | null>;
  onProductToHeroCompletedRef?: MutableRefObject<(() => void) | null>;
}

export interface HeroSceneShared {
  dispatchActiveSection?: (section: string) => void;
  portalState?: { radius: number; x: number; y: number };
  applyPortalClip?: (r: number, x: number, y: number) => void;
}

export interface HeroSceneHandle {
  triggerProductToHero?: () => void;
  recreateHeroScrollTrigger?: () => gsap.core.Timeline;
}

interface HeroSceneProps {
  engine: SceneEngine;
  refs: HeroSceneRefs;
  shared?: MutableRefObject<HeroSceneShared>;
  productWorldBeforeHeader?: ReactNode;
  productWorldAfterFloorLine?: ReactNode;
}

export const HeroScene = forwardRef<HeroSceneHandle, HeroSceneProps>(function HeroScene(
  { engine, refs },
  forwardedRef
) {
  const { heroVisualRef, heroIntroRef } = refs;
  const { isAperturePaused } = engine;

  useImperativeHandle(
    forwardedRef,
    () => ({
      triggerProductToHero: () => {},
      recreateHeroScrollTrigger: () => gsap.timeline(),
    }),
    []
  );

  return (
    <div className="relative w-full h-screen min-h-screen bg-[#FAF8F5] select-none overflow-hidden flex flex-col justify-center">
      {/* LAYER 1 (z-10): MASTER HERO VISUAL (Aperture Video Ring) */}
      <div
        ref={heroVisualRef}
        className="absolute inset-0 w-full h-full z-10 flex items-center justify-center pointer-events-none will-change-transform"
        style={{
          transformOrigin: "62.87% 49.12%",
        }}
      >
        <HeroApertureVisual isPaused={isAperturePaused} />
      </div>

      {/* LAYER 1B (z-10): HERO HEADLINE & SUBTEXT */}
      <div
        ref={heroIntroRef}
        className="absolute inset-0 z-10 flex flex-col justify-center px-6 sm:px-10 lg:px-16 xl:px-20 pt-20 pb-8 max-w-7xl mx-auto w-full pointer-events-none will-change-transform"
      >
        <div className="flex-1 flex flex-col justify-center max-w-lg sm:max-w-xl lg:max-w-[490px] xl:max-w-[530px] -translate-x-6 sm:-translate-x-10 md:-translate-x-14 lg:-translate-x-20 xl:-translate-x-24 -translate-y-4 sm:-translate-y-6 lg:-translate-y-8 pointer-events-auto">
          <h1 className="font-sans font-black text-[26px] sm:text-[33px] md:text-[38px] lg:text-[42px] xl:text-[47px] text-neutral-950 tracking-[-0.035em] leading-[1.15] select-none flex flex-col gap-2.5 sm:gap-3 lg:gap-3.5">
            <span className="whitespace-nowrap">
              See everything you <span className="text-[#22C55E]" style={{ color: "#22C55E" }}>own.</span>
            </span>
            <span className="whitespace-nowrap">
              Understand what it <span className="text-[#22C55E]" style={{ color: "#22C55E" }}>means.</span>
            </span>
          </h1>
          <p className="mt-4 sm:mt-5 text-sm sm:text-base md:text-lg lg:text-[19px] text-[#5A685D] font-medium tracking-tight leading-relaxed select-none">
            Track. Understand. Act with confidence.
          </p>
          <div className="mt-7 sm:mt-8 flex items-center">
            <Button
              type="button"
              size="md"
              variant="primary"
              className="shadow-md shadow-emerald-500/15"
              onClick={() => {
                window.dispatchEvent(new CustomEvent("unifolio-open-waitlist"));
              }}
            >
              <span className="w-2 h-2 rounded-full bg-[#22C55E] shadow-[0_0_10px_#22C55E] group-hover:scale-125 transition-transform" />
              <span className="font-bold text-sm sm:text-base tracking-tight">Join the waitlist</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 text-neutral-600 stroke-[2.5]" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});
