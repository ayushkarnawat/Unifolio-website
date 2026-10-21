"use client";

import { forwardRef, useImperativeHandle, type MutableRefObject, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";
import { HeroStoryboardVisual } from "@/components/hero/HeroStoryboardVisual";
import { HeroHighlights } from "@/components/hero/HeroHighlights";
import { HERO_HEADLINE, HERO_LINE } from "@/lib/heroHighlights";
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
    <div className="relative w-full h-screen min-h-screen max-sm:h-auto max-sm:min-h-0 max-sm:items-center max-sm:justify-start max-sm:pt-[104px] max-sm:pb-[26px] bg-[#FAF8F5] select-none overflow-hidden flex flex-col justify-center">
      {/* Phone (< 640px): the text wrappers below become `display: contents`, so the headline, line, button, this
          sketch and the highlight block are flex items of this column and are reordered with `order`:
          headline, line, button, sketch (a 300px normal-flow box), highlight block. Tablet and desktop are unchanged. */}
      {/* LAYER 1 (z-10): MASTER HERO VISUAL (Aperture Video Ring) */}
      <div
        ref={heroVisualRef}
        className="absolute inset-0 w-full h-full z-10 flex items-center justify-center pointer-events-none will-change-transform max-sm:relative max-sm:inset-auto max-sm:order-3 max-sm:h-[300px] max-sm:shrink-0 max-sm:-mt-[26px] max-sm:-mb-[34px]"
        style={{
          transformOrigin: "62.87% 49.12%",
        }}
      >
        <HeroStoryboardVisual isPaused={isAperturePaused} />
      </div>

      {/* LAYER 1B (z-10): HERO HEADLINE & SUBTEXT */}
      <div
        ref={heroIntroRef}
        className="absolute inset-0 max-sm:contents z-10 flex flex-col justify-end lg:justify-center items-center lg:items-start px-6 sm:px-10 lg:px-16 xl:px-20 pt-20 pb-10 sm:pb-14 lg:pb-8 max-w-7xl mx-auto w-full pointer-events-none will-change-transform"
      >
        <div className="flex-initial lg:flex-1 flex flex-col justify-center items-center lg:items-start text-center lg:text-left max-w-lg sm:max-w-xl lg:max-w-[490px] xl:max-w-[530px] translate-x-0 lg:-translate-x-20 xl:-translate-x-24 translate-y-0 sm:-translate-y-1 lg:-translate-y-6 pointer-events-auto max-sm:contents">
          <h1 className="font-sans font-black text-[25px] max-sm:text-[length:clamp(25px,7.2vw,32px)] sm:text-[33px] md:text-[38px] lg:text-[42px] xl:text-[47px] text-neutral-950 tracking-[-0.035em] leading-[1.15] select-none flex flex-col items-center lg:items-start gap-2 sm:gap-3 lg:gap-3.5 max-sm:order-1 max-sm:px-5 max-sm:text-center">
            <span className="whitespace-nowrap">{HERO_HEADLINE[0]}</span>
            <span className="whitespace-nowrap text-[#22C55E]" style={{ color: "#22C55E" }}>
              {HERO_HEADLINE[1]}
            </span>
          </h1>
          <p className="mt-3.5 sm:mt-5 max-w-[34ch] lg:max-w-[30ch] text-base sm:text-lg md:text-xl lg:text-[21px] text-[#26332B] font-extrabold tracking-[-0.015em] leading-[1.35] select-none text-center lg:text-left max-sm:order-2 max-sm:relative max-sm:z-20 max-sm:mt-2.5 max-sm:px-6 max-sm:max-w-none">
            {HERO_LINE}
          </p>
          <div className="mt-6 sm:mt-8 flex items-center justify-center lg:justify-start w-full max-sm:order-4 max-sm:mt-2 max-sm:relative max-sm:z-20">
            <Button
              type="button"
              size="md"
              variant="green"
              className="shadow-lg shadow-emerald-500/25"
              onClick={() => {
                window.dispatchEvent(new CustomEvent("unifolio-open-waitlist"));
              }}
            >
              <span className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_white] group-hover:scale-125 transition-transform" />
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-white">Join the waitlist</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 text-white stroke-[2.8]" />
            </Button>
          </div>
          {/* The highlight stays in the layout (so the headline, sub line and CTA sit where they did), and is only moved down visually from lg up, so the new parts sit lower while the text does not move. Phone: centred about 6px below the sketch (-22px here + the block's own 28px top margin) */}
          <div className="w-full lg:w-[calc(100%+96px)] lg:max-w-none lg:translate-y-16 max-sm:order-5 max-sm:mt-[10px] max-sm:px-5 max-sm:flex max-sm:justify-center max-sm:relative max-sm:z-20">
            <HeroHighlights isPaused={isAperturePaused} />
          </div>
        </div>
      </div>
    </div>
  );
});
