"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";

// "/Landing Page Illustration.png" is 1536x1024. The ring's true center,
// measured directly from the pixel data (bounding box of its bright-green
// arc, cross-checked against a full brightness-threshold pass), sits at
// this fraction of the raw image — independent of viewport, aspect ratio,
// or any positioning applied to the <Image> element around it.
const ILLUSTRATION_ASPECT = 1536 / 1024;
const RING_X_FRAC = 0.532;
const RING_Y_FRAC = 0.37;

// The base illustration's own CSS object-position (kept in sync with the
// "60.5% 47.8%" used on the <Image> elements below).
const ILLUSTRATION_OBJ_POS_X = 0.605;
const ILLUSTRATION_OBJ_POS_Y = 0.478;

// Given the actual rendered box of the (already translateX-shifted)
// illustration wrapper, replicate the browser's own object-fit:contain
// math to find exactly where the ring lands on screen, then express that
// as a percentage of heroEl's own (untransformed) box — i.e. a valid
// transform-origin / left-top anchor for anything inside heroEl. Doing the
// real object-contain math against a live measurement (rather than
// hand-tuning a single static percentage) is what makes this correct at
// every viewport instead of one specific aspect ratio it happened to be
// eyeballed against.
function computeRingAnchorPercent(wrapperEl: HTMLElement, heroEl: HTMLElement) {
  const wrapperRect = wrapperEl.getBoundingClientRect();
  const heroRect = heroEl.getBoundingClientRect();

  const containerAspect = wrapperRect.width / wrapperRect.height;
  let renderedWidth: number;
  let renderedHeight: number;
  if (containerAspect > ILLUSTRATION_ASPECT) {
    renderedHeight = wrapperRect.height;
    renderedWidth = renderedHeight * ILLUSTRATION_ASPECT;
  } else {
    renderedWidth = wrapperRect.width;
    renderedHeight = renderedWidth / ILLUSTRATION_ASPECT;
  }

  const renderedLeft =
    wrapperRect.left + (wrapperRect.width - renderedWidth) * ILLUSTRATION_OBJ_POS_X;
  const renderedTop =
    wrapperRect.top + (wrapperRect.height - renderedHeight) * ILLUSTRATION_OBJ_POS_Y;

  const ringX = renderedLeft + RING_X_FRAC * renderedWidth;
  const ringY = renderedTop + RING_Y_FRAC * renderedHeight;

  return {
    xPercent: ((ringX - heroRect.left) / heroRect.width) * 100,
    yPercent: ((ringY - heroRect.top) / heroRect.height) * 100,
  };
}

export function BlueprintHero() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const heroVisualRef = useRef<HTMLDivElement | null>(null);
  const heroIntroRef = useRef<HTMLDivElement | null>(null);
  const heroGlowRef = useRef<HTMLDivElement | null>(null);
  const lasersRef = useRef<HTMLDivElement | null>(null);
  const cardsWrapRef = useRef<HTMLDivElement | null>(null);
  const textWrapRef = useRef<HTMLDivElement | null>(null);
  const illustrationWrapperRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion() || !containerRef.current || !stageRef.current) return;

      // Anchor heroVisualRef's transform-origin (and the glow's position)
      // to the ring's real, measured screen position — recomputed on
      // resize since object-contain's letterboxing axis flips between
      // portrait and landscape viewports, so no single static percentage
      // could ever stay correct across breakpoints. Runs before the scale
      // tween below is ever created, and again on every resize up until
      // the entrance actually plays.
      const updateRingAnchor = () => {
        if (!illustrationWrapperRef.current || !heroVisualRef.current) return;
        const { xPercent, yPercent } = computeRingAnchorPercent(
          illustrationWrapperRef.current,
          heroVisualRef.current
        );
        heroVisualRef.current.style.transformOrigin = `${xPercent}% ${yPercent}%`;
        if (heroGlowRef.current) {
          heroGlowRef.current.style.left = `calc(${xPercent}% - 210px)`;
          heroGlowRef.current.style.top = `calc(${yPercent}% - 210px)`;
        }
      };
      updateRingAnchor();
      window.addEventListener("resize", updateRingAnchor);

      const cardEls = gsap.utils.toArray<HTMLElement>(".portfolio-card");

      // Initial hardware-accelerated transforms
      gsap.set(cardEls, {
        transformOrigin: "center center",
        force3D: true,
        opacity: 0,
      });

      // Declared up here — not down by masterTl where they're conceptually
      // used — because the visibility ScrollTrigger below (and the ambient
      // pause/resume it drives) can fire its onEnter callback synchronously
      // during this same setup pass if the hero is already in view on load.
      // Declaring these later in a `let`/`const` further down the function
      // put them in the temporal dead zone for that synchronous call,
      // throwing "Cannot access before initialization". shuffleLoopTl is
      // created empty here and populated with its actual tweens further
      // below once cardEls/stepX are ready — GSAP timelines can have
      // content appended any time after creation.
      let isSequenceRunning = false;
      let hasSequenceCompleted = false;
      const shuffleLoopTl = gsap.timeline({ paused: true, repeat: -1 });

      // =========================================================================
      // SUBTLE ILLUSTRATION WAVE MOTION
      //
      // The illustration is a single flattened raster image — the ring and
      // the wave/particle field are baked into the same pixels, so there is
      // no way to literally animate "only the waves" via transforms on one
      // <Image>. Instead the image is rendered twice in the JSX below,
      // stacked exactly on top of itself at the identical position/size:
      // the base copy is completely untouched by any of this, guaranteeing
      // the ring and the illustration's baseline appearance are never
      // altered. This second, animated copy carries a very subtle SVG
      // turbulence/displacement filter and is CSS-masked so it's only ever
      // visible over the lower wave region, fading to fully transparent
      // well before it reaches the ring — so the ring always shows through
      // as the untouched original pixels from the base copy underneath,
      // and only the wave region ever shows any motion.
      //
      // Same throttled-update technique already used for the old hero
      // photo's wave filter: sampling at ~20fps instead of 60fps is
      // imperceptible for motion this slow, and cuts the (comparatively
      // expensive) filter recompute cost by ~2/3.
      // =========================================================================
      const illuTurbEl = document.getElementById("illustrationWaveTurbulence");
      const illuDispEl = document.getElementById("illustrationWaveDisplacement");
      // The wave-motion overlay carries a live SVG filter (feTurbulence +
      // feDisplacementMap) — unlike CSS blur, this kind of procedural filter
      // is CPU-rasterized, not GPU-composited, and browsers generally have
      // to re-rasterize it whenever the filtered element's effective size
      // changes. It lives inside heroVisualRef, which the entrance scales
      // 1 -> 8.5 over 1.4s: measured frame timings showed the worst stalls
      // of the whole entrance landing in exactly that window. The overlay is
      // masked to a sliver of the frame and heroVisualRef is fading to
      // opacity:0 anyway, so hiding it (on top of already pausing its
      // animation below) for that one window costs nothing visible.
      const illuOverlayEl = document.getElementById("illustrationWaveOverlay");

      // All the illustration's ambient motion (turbulence filter + shimmer
      // dots) is paused/resumed together at the same three points: scrolled
      // out of view, for the whole entrance sequence, and on reset. Kept as
      // one array so those call sites don't need to know how many tweens
      // are actually involved.
      const illustrationAmbientTweens: gsap.core.Tween[] = [];

      let illuWaveTween: gsap.core.Tween | null = null;
      if (illuTurbEl && illuDispEl) {
        const illuWaveState = { phase: 0 };
        let illuFrameSkip = 0;

        illuWaveTween = gsap.to(illuWaveState, {
          phase: Math.PI * 2,
          duration: 26, // long, slow, seamless cycle
          repeat: -1,
          ease: "none",
          onUpdate: () => {
            illuFrameSkip = (illuFrameSkip + 1) % 3;
            if (illuFrameSkip !== 0) return;

            const p = illuWaveState.phase;
            const fx = 0.008 + 0.003 * Math.sin(p);
            const fy = 0.012 + 0.004 * Math.cos(p * 1.618033);
            const scale = 3 + 1.5 * Math.sin(p * 0.7);

            illuTurbEl.setAttribute("baseFrequency", `${fx.toFixed(5)} ${fy.toFixed(5)}`);
            illuDispEl.setAttribute("scale", scale.toFixed(2));
          },
        });
        illustrationAmbientTweens.push(illuWaveTween);
      }

      // Gentle drifting/shimmering on a handful of overlay points across the
      // wave field — additive glints layered on top of the untouched base
      // image, not a modification of it. Opacity/scale only (GPU-compositor
      // properties), long breathing cycles, independent phases per dot so
      // they never all pulse in lockstep.
      const shimmerEls = gsap.utils.toArray<HTMLElement>(".illustration-shimmer");
      shimmerEls.forEach((el, i) => {
        illustrationAmbientTweens.push(
          gsap.to(el, {
            opacity: 0.85,
            scale: 1.35,
            duration: 4.5 + i * 0.8,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: i * 1.1,
          })
        );
      });

      // Only pay for any of this while the illustration is actually on
      // screen and not already fading out — paused whenever scrolled out
      // of view, and also paused for the whole entrance sequence below
      // (heroVisualRef, which all of this lives inside, is already fading
      // toward opacity:0 for that entire window anyway, so nothing is lost
      // by not animating it then, and it means this ambient motion can
      // never compete with the cards' entrance for frame budget).
      // shuffleLoopTl and hasSequenceCompleted are declared further below in
      // this same setup function, but these callbacks only ever run later
      // (on an actual scroll-triggered visibility crossing) — by then both
      // are long since assigned, same as every other closure in this file
      // that reaches forward to state declared after it.
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top bottom",
        end: "bottom top",
        onEnter: () => {
          illustrationAmbientTweens.forEach((t) => t.play());
          if (hasSequenceCompleted) shuffleLoopTl.play();
        },
        onEnterBack: () => {
          illustrationAmbientTweens.forEach((t) => t.play());
          if (hasSequenceCompleted) shuffleLoopTl.play();
        },
        onLeave: () => {
          illustrationAmbientTweens.forEach((t) => t.pause());
          shuffleLoopTl.pause();
        },
        onLeaveBack: () => {
          illustrationAmbientTweens.forEach((t) => t.pause());
          shuffleLoopTl.pause();
        },
      });

      // =========================================================================
      // DETERMINISTIC VIEWPORT FRAMING
      //
      // The hero stage is not ScrollTrigger-pinned — it's a normal in-flow
      // block, and the entrance sequence relies on native scrollY staying at
      // (or very near) the top for the cards' final docked position — which
      // is fixed relative to their container, not the viewport — to land
      // inside the visible frame. Nothing previously guaranteed that: the
      // browser can restore a prior scroll position on refresh/re-entry
      // ("incorrect scroll restoration"), and the wheel/touch preventDefault
      // guards don't catch every input (keyboard, scrollbar drag, momentum
      // already in flight before the lock engages). Any of those leaves
      // native scroll wherever it happens to be while the cards animate to a
      // document-fixed position, cropping the top of the stack exactly as
      // reported. Fixed by: disabling the browser's own scroll restoration,
      // snapping to the top before the sequence can trigger, and hard-locking
      // scroll (not just wheel/touch) for the sequence's entire duration so
      // nothing can nudge the frame mid-animation.
      // =========================================================================
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }
      if (window.scrollY !== 0) {
        window.scrollTo(0, 0);
      }

      const wrapWidth = cardsWrapRef.current?.clientWidth || 640;
      const stepX = Math.min(68, wrapWidth * 0.125);

      // =========================================================================
      // CONTINUOUS CARD SHUFFLE STEP
      //
      // The current front card (slot 0) lifts clear, arcs over, and settles
      // in behind the deck at the back (slot 5) — never disappearing —
      // while the other five slide forward one slot each. Slot N maps to
      // x = N*stepX, scale = 1-N*0.045 (the existing docked-fan geometry)
      // and z-index = 30-N*4 (matching each card's static resting z-index
      // set in JSX), so DOM paint order always agrees with visual position.
      //
      // z-index is re-synced for all six cards in ONE batched .set(), timed
      // to the instant the shuffled card's lift finishes: at that moment it
      // is elevated and off to the side, and the other five are still
      // mid-slide toward their new slots — nothing overlaps anything else,
      // which is the only instant a z-index change is truly invisible. Do
      // it anywhere else (e.g. once the card has already arced into its
      // tightly-packed final position) and the correction would visibly pop.
      //
      // Reusable across both the one-time reveal (masterTl) and the
      // indefinite loop (shuffleLoopTl) — same motion, either place.
      // =========================================================================
      const slotX = (slot: number) => slot * stepX;
      const slotScale = (slot: number) => 1 - slot * 0.045;
      const slotZ = (slot: number) => 30 - slot * 4;

      const shuffleStepFor = (tl: gsap.core.Timeline, frontIndex: number) => {
        const LIFT = 0.32;
        const ARC = 0.78;
        const frontCard = cardEls[frontIndex];

        // The front card lifts and peels up first — clear of every other
        // card, nothing to overlap yet.
        tl.to(frontCard, {
          y: -56,
          scale: 0.9,
          rotationZ: -4,
          duration: LIFT,
          ease: "power2.out",
        });

        // Every other card starts sliding into its new (one-closer-to-
        // front) slot at that same instant, at a longer, gentler pace so
        // the whole step reads as one continuous, unhurried motion.
        cardEls.forEach((card, i) => {
          if (i === frontIndex) return;
          const newSlot = (i - frontIndex - 1 + 6) % 6;
          tl.to(
            card,
            {
              x: slotX(newSlot),
              scale: slotScale(newSlot),
              duration: LIFT + ARC,
              ease: "power2.inOut",
            },
            "<"
          );
        });

        // Batched z-index re-sync — see the block comment above.
        tl.set(
          cardEls,
          {
            zIndex: (i: number) =>
              slotZ(i === frontIndex ? 5 : (i - frontIndex - 1 + 6) % 6),
          },
          `<+=${LIFT}`
        );

        // The shuffled card arcs the rest of the way over and down into
        // its new back slot.
        tl.to(
          frontCard,
          {
            x: slotX(5),
            y: 0,
            scale: slotScale(5),
            rotationZ: 0,
            duration: ARC,
            ease: "power2.inOut",
          },
          "<"
        );
      };

      const lockScroll = () => {
        window.scrollTo(0, 0);
        document.documentElement.style.overflow = "hidden";
        document.body.style.overflow = "hidden";
        // The page has nothing to scroll while overflow is hidden, so the
        // global normalizeScroll() proxy (lib/gsap.ts) has no real work to
        // do here — but it still runs its own rAF loop every frame. Free up
        // that main-thread budget for exactly the window the 6-card
        // materialize+spin timeline is busiest, then restore it the instant
        // scroll is unlocked again.
        ScrollTrigger.normalizeScroll(false);
      };
      const unlockScroll = () => {
        document.documentElement.style.overflow = "";
        document.body.style.overflow = "";
        if (!prefersReducedMotion()) {
          ScrollTrigger.normalizeScroll(true);
        }
      };

      // Master time-based GSAP timeline
      const masterTl = gsap.timeline({
        paused: true,
        onStart: () => {
          isSequenceRunning = true;
          illustrationAmbientTweens.forEach((t) => t.pause());
          if (illuOverlayEl) illuOverlayEl.style.opacity = "0";
          // Disable all six cards' backdrop-filter, box-shadow, and their
          // inner image's drop-shadow in one batch, up front. A DevTools
          // trace with the GPU track expanded showed it pegged at 100% busy
          // (main thread comparatively idle) for the whole spin+travel
          // window — the six cards' static multi-layer box-shadow +
          // drop-shadow, rasterized every frame while all six are
          // simultaneously transformed, is real GPU compositing cost that
          // backdrop-filter suppression alone didn't touch. Restored the
          // same way backdrop-filter already is — see the batched restore
          // call below.
          cardEls.forEach((card) => {
            card.style.backdropFilter = "none";
            card.style.boxShadow = "none";
            const img = card.querySelector("img");
            if (img) img.style.filter = "none";
          });
        },
        onComplete: () => {
          isSequenceRunning = false;
          hasSequenceCompleted = true;
          // Release scroll the instant the cards are docked — no settle
          // window, no delay. Scroll was pinned at exactly 0 for the whole
          // locked duration (overflow:hidden has no scrollable area to
          // drift from), so there's nothing to "land" or clean up; the
          // moment the deck is stacked, bidirectional document scrolling
          // is immediately enabled.
          unlockScroll();
          illustrationAmbientTweens.forEach((t) => t.play());
          if (illuOverlayEl) illuOverlayEl.style.opacity = "";
          // Hand off into the indefinite deck-shuffle loop — it only ever
          // touches the cards' own transform/opacity/zIndex, never scroll,
          // overflow, or any event listener, so it can never block or
          // delay navigation away from this section at any point in its
          // cycle.
          shuffleLoopTl.play(0);
        },
      });

      // 0. HERO INTRO TYPOGRAPHY FADEOUT (0.8s)
      masterTl.to(
        heroIntroRef.current,
        {
          opacity: 0,
          y: -25,
          duration: 0.8,
          ease: "power2.inOut",
        },
        0
      );

      // 1. HERO APERTURE EXPANSION & CENTRAL VOID DISSOLVE (1.4s)
      masterTl.fromTo(
        heroVisualRef.current,
        { scale: 1, opacity: 1 },
        { scale: 8.5, opacity: 0, ease: "power2.inOut", duration: 1.4 },
        0
      );

      masterTl.fromTo(
        heroGlowRef.current,
        { opacity: 0, scale: 1 },
        {
          keyframes: [
            { opacity: 1, scale: 1.4, duration: 0.6, ease: "sine.out" },
            { opacity: 0, scale: 2.2, duration: 0.8, ease: "power1.out" },
          ],
        },
        0
      );

      masterTl.fromTo(
        lasersRef.current,
        { x: 260, opacity: 0 },
        { x: -140, opacity: 1, duration: 1.6, ease: "sine.inOut" },
        0.2
      );

      // Same finding as the cards' materialize tween and the ring/glow/laser
      // will-change gap: this tween runs 0.4s -> 1.6s, squarely overlapping
      // the cards' entire materialize+spin window (0.5s -> 4.0s) — the exact
      // "a few seconds during the entrance" the lag was reported in. It was
      // animating filter:blur() together with opacity/y/scale on the entire
      // headline block, forcing a full repaint of a large element on every
      // frame for that whole 1.2s, at the busiest possible moment. Dropped
      // the blur (opacity/y/scale alone are GPU-compositor-only and can't
      // contend with the cards' rotation for paint time), matching the same
      // fix already applied to the cards.
      masterTl.fromTo(
        textWrapRef.current,
        { opacity: 0, y: 35, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1.0, duration: 1.2, ease: "power2.out" },
        0.4
      );

      // 2. ALL 6 CARDS: MATERIALIZE, THEN A CLEARLY VISIBLE 360° ROTATION WHILE
      //    TRAVELING TO THE DOCKED POSITION.
      //
      // ROOT-CAUSE FIX: the previous version animated opacity/scale/blur and
      // rotationZ/x/y together in ONE fromTo() sharing a single power2.out
      // ease. With power2.out, ~75% of the motion completes in the first 50%
      // of the duration — so most of the 360° sweep happened while the card
      // was still tiny, near-transparent and blurred (opacity/scale/blur used
      // that exact same eased curve), and by the time it was actually visible
      // only a residual ~15-20° of rotation remained. The rotation was really
      // happening in the timeline's numbers, just hidden inside the invisible
      // part of the tween.
      //
      // Fix: two tweens per card on this SAME master timeline, each owning a
      // disjoint set of properties (no property is ever touched by both, so
      // there is exactly one source of truth for each): a short "materialize"
      // tween brings opacity/scale/blur to their final values quickly, and a
      // separate, much longer "spin + travel" tween independently owns
      // rotationZ/x/y with a gentle, close-to-linear ease so the card is
      // fully visible (opaque, full size, sharp) for the great majority of
      // its rotation — not just the last few degrees of it.
      //
      // SECOND ROOT CAUSE (why the fix above alone still wasn't visible):
      // with only a 220x150 start radius, six 240-295px-wide cards still
      // spatially overlapped heavily at their starting points, and with only
      // a 0.1s stagger between them (vs a 1.6s duration) they were all at
      // nearly the exact same rotational phase at every instant. Combined
      // with a *static* z-index stack (card 0 always on top), the frontmost
      // card visually covered the other five for almost the entire sequence
      // — only one card's motion was ever actually visible, which reads as
      // "I can't see it happen" even though five more were rotating right
      // behind it. Fixed by spreading the starting positions further apart,
      // widening the stagger so cards are visibly out of phase with each
      // other rather than moving in lockstep, and lengthening the duration
      // substantially so there is no ambiguity about the motion being slow
      // enough to track.
      cardEls.forEach((card, i) => {
        const angle = i * ((2 * Math.PI) / 6);
        const startX = Math.cos(angle) * 300;
        const startY = Math.sin(angle) * 200;
        const targetX = i * stepX;
        const targetScale = 1 - i * 0.045;
        const cardStart = 0.5 + (5 - i) * 0.22; // widely staggered wave, back to front

        // Materialize: opacity/scale ONLY — fast, so the card is clearly
        // visible well before its rotation is anywhere near finished.
        // (No filter/blur here: animating blur forces a repaint of the
        // card's rasterized content on every frame it's active, and it was
        // overlapping the first ~0.5s of this card's rotation+travel tween
        // below — exactly the moment a clean, jump-free handoff matters
        // most. Opacity/scale alone are GPU-compositor-only and don't
        // repaint, so they can never contend with the rotation for paint
        // time.)
        //
        // FURTHER FINDING (same "compare against the rest of the site"
        // method used for will-change-transform): backdrop-blur-2xl also
        // appears on BlueprintContact's form panel and BlueprintNav's bar,
        // but never on anything continuously transformed by GSAP frame by
        // frame — those are static or only CSS-transitioned on a discrete
        // state change. These 6 cards are the only place on the whole site
        // pairing backdrop-filter with a per-frame rotation + long-distance
        // translation: backdrop-filter must re-sample and re-blur whatever
        // is compositing behind the element's current bounds on every
        // single frame those bounds change, for 6 overlapping cards at
        // once — one of the most expensive paint operations a browser can
        // do, and a real, distinct contributor to jitter beyond the
        // will-change gap. Suppressed only for the exact window the card is
        // actually moving (materialize start -> spin+travel end) and
        // restored once all six cards have settled — a single batched write
        // (below, after this loop) rather than each card restoring
        // individually in its own onComplete here. A real DevTools trace
        // showed a frozen-frame stretch landing exactly across the ~1.1s
        // where the six staggered per-card restores used to fire — same
        // style-recalc-thrashing problem as the disable side (see masterTl's
        // onStart), just on the other end of the toggle. The resting
        // "frosted glass" look is unaffected; the last couple of cards to
        // settle just pick theirs up ~0-1s later than before, while they're
        // already sitting still.
        masterTl.fromTo(
          card,
          { opacity: 0, scale: 0.35 },
          {
            opacity: 1,
            scale: targetScale,
            duration: 0.5,
            ease: "power2.out",
            force3D: true,
          },
          cardStart
        );

        // Spin + travel: rotationZ/x/y ONLY — slow and close to linear so a
        // human can clearly watch the full 360° sweep while the card moves
        // through physical space into its docked slot.
        masterTl.fromTo(
          card,
          { x: startX, y: startY, rotationZ: -360 },
          {
            x: targetX,
            y: 0,
            rotationZ: 0,
            duration: 2.4,
            ease: "power1.inOut",
            force3D: true,
          },
          cardStart
        );
      });

      // Batched restore for all six cards at once, timed to when the last
      // (latest-starting) card finishes its spin+travel — mirrors the
      // batched disable in masterTl's onStart above.
      const lastCardSettleTime = 0.5 + 5 * 0.22 + 2.4;
      masterTl.call(
        () => {
          cardEls.forEach((card) => {
            card.style.backdropFilter = "";
            card.style.boxShadow = "";
            const img = card.querySelector("img");
            if (img) img.style.filter = "";
          });
        },
        [],
        lastCardSettleTime
      );

      // =========================================================================
      // 3. CONTINUOUS DECK-SHUFFLE LOOP (INDEPENDENT OF SCROLL)
      //
      // masterTl handles ONLY the initial hero aperture zoom, headline reveal,
      // and the 6 cards materializing + spinning into their docked stacked state.
      // As soon as the cards dock (lastCardSettleTime), masterTl completes,
      // releasing all scroll locks, removing event listeners, and handing off
      // directly to this independent shuffle loop.
      //
      // This loop runs independently on GSAP's ticker without any scroll locks,
      // preventDefault handlers, or pinning. The user can freely scroll away
      // at any moment (whether stationary, midway through a shuffle arc, or
      // starting a new cycle). The loop is paused/resumed by the visibility
      // ScrollTrigger when the section enters or leaves the viewport.
      //
      // Starting from the docked stack (Card 0 in front slot 0):
      // Cycle: Card 0 -> Card 1 -> Card 2 -> Card 3 -> Card 4 -> Card 5 -> (repeats)
      // =========================================================================
      shuffleLoopTl.to({}, { duration: 1.2 }); // Initial reading dwell for Card 0 (Scattered)
      [0, 1, 2, 3, 4, 5].forEach((frontIndex, step) => {
        shuffleStepFor(shuffleLoopTl, frontIndex);
        shuffleLoopTl.to({}, { duration: step === 5 ? 1.4 : 1.0 }); // Reading dwell after each shuffle
      });

      // =========================================================================
      // SCROLL INTERACTION & STATE RESET HANDLERS
      // =========================================================================
      const triggerAutoplay = () => {
        if (!hasSequenceCompleted && !isSequenceRunning) {
          // Snap to a known, exact viewport position and hard-lock scroll
          // (beyond just wheel/touch preventDefault) before a single frame
          // of the sequence plays, so the composition is framed identically
          // every single time, regardless of where scroll happened to be
          // when the trigger fired.
          lockScroll();
          masterTl.play();
        }
      };

      const returnToHero = () => {
        if (isSequenceRunning || !hasSequenceCompleted) return;
        if (window.scrollY > 15) return;

        isSequenceRunning = true;
        shuffleLoopTl.pause();
        illustrationAmbientTweens.forEach((t) => t.pause());

        lockScroll();

        const returnTl = gsap.timeline({
          onComplete: () => {
            isSequenceRunning = false;
            hasSequenceCompleted = false;
            unlockScroll();
            illustrationAmbientTweens.forEach((t) => t.play());
            if (illuOverlayEl) illuOverlayEl.style.opacity = "";
            masterTl.pause(0);
            shuffleLoopTl.pause(0);
            gsap.set(heroIntroRef.current, { opacity: 1, y: 0, clearProps: "all" });
            gsap.set(heroVisualRef.current, { scale: 1, opacity: 1, clearProps: "all" });
            gsap.set(heroGlowRef.current, { scale: 1, opacity: 0 });
            gsap.set(lasersRef.current, { x: 260, opacity: 0 });
            gsap.set(textWrapRef.current, { opacity: 0, y: 35, scale: 0.98, filter: "blur(0px)" });
            gsap.set(cardEls, {
              x: 0,
              y: 0,
              rotationZ: 0,
              scale: 1,
              opacity: 0,
              zIndex: (i: number) => slotZ(i),
            });
            cardEls.forEach((card) => {
              card.style.backdropFilter = "";
              card.style.boxShadow = "";
              const img = card.querySelector("img");
              if (img) img.style.filter = "";
            });
          },
        });

        // Dissolve cards and stage 2 text out cleanly
        returnTl.to(
          cardEls,
          {
            opacity: 0,
            y: 20,
            scale: 0.9,
            duration: 0.5,
            stagger: 0.03,
            ease: "power2.in",
          },
          0
        );

        returnTl.to(
          textWrapRef.current,
          {
            opacity: 0,
            y: 20,
            duration: 0.4,
            ease: "power2.in",
          },
          0
        );

        returnTl.to(
          lasersRef.current,
          {
            opacity: 0,
            duration: 0.4,
          },
          0
        );

        // Bring back hero visual & aperture ring
        returnTl.fromTo(
          heroVisualRef.current,
          { scale: 2.5, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.7, ease: "power2.out" },
          0.15
        );

        // Bring back hero intro text ("SEE WHAT YOU ACTUALLY OWN")
        returnTl.fromTo(
          heroIntroRef.current,
          { opacity: 0, y: -20 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
          0.25
        );
      };

      const resetHeroState = () => {
        masterTl.pause(0);
        shuffleLoopTl.pause(0);
        isSequenceRunning = false;
        hasSequenceCompleted = false;
        unlockScroll();
        illustrationAmbientTweens.forEach((t) => t.play());
        if (illuOverlayEl) illuOverlayEl.style.opacity = "";
        gsap.set(heroIntroRef.current, { opacity: 1, y: 0, clearProps: "all" });
        gsap.set(heroVisualRef.current, { scale: 1, opacity: 1, clearProps: "all" });
        gsap.set(heroGlowRef.current, { scale: 1, opacity: 0 });
        gsap.set(lasersRef.current, { x: 260, opacity: 0 });
        gsap.set(textWrapRef.current, { opacity: 0, y: 35, scale: 0.98, filter: "blur(0px)" });
        gsap.set(cardEls, {
          x: 0,
          y: 0,
          rotationZ: 0,
          scale: 1,
          opacity: 0,
          // z-index is now driven by the shuffle's current rotation state —
          // restore each card's original identity-order z-index (matching
          // its static JSX value) so a reset mid-shuffle doesn't leave a
          // stale, rotated stacking order behind.
          zIndex: (i: number) => slotZ(i),
        });
        // If reset happens mid-rotation, a card's backdrop-filter/box-shadow/
        // drop-shadow suppression (see the entrance tweens above) may not
        // have reached its batched restore yet — clear the inline overrides
        // on all cards so none are left permanently missing their resting
        // "frosted glass with shadow" look.
        cardEls.forEach((card) => {
          card.style.backdropFilter = "";
          card.style.boxShadow = "";
          const img = card.querySelector("img");
          if (img) img.style.filter = "";
        });
      };

      const handleWheel = (e: WheelEvent) => {
        if (isSequenceRunning) {
          e.preventDefault();
          return;
        }
        if (window.scrollY < 80 && e.deltaY > 0 && !hasSequenceCompleted) {
          e.preventDefault();
          triggerAutoplay();
        } else if (window.scrollY <= 15 && e.deltaY < 0 && hasSequenceCompleted) {
          e.preventDefault();
          returnToHero();
        }
      };

      let touchStartY = 0;
      const handleTouchStart = (e: TouchEvent) => {
        touchStartY = e.touches[0].clientY;
      };

      const handleTouchMove = (e: TouchEvent) => {
        if (isSequenceRunning) {
          e.preventDefault();
          return;
        }
        const touchCurrentY = e.touches[0].clientY;
        const deltaY = touchStartY - touchCurrentY;

        if (window.scrollY < 80 && deltaY > 20 && !hasSequenceCompleted) {
          e.preventDefault();
          triggerAutoplay();
        } else if (window.scrollY <= 15 && deltaY < -20 && hasSequenceCompleted) {
          e.preventDefault();
          returnToHero();
        }
      };

      // Handle keyboard navigation bidirectionally
      const DOWN_KEYS = new Set(["ArrowDown", "PageDown", " ", "End"]);
      const UP_KEYS = new Set(["ArrowUp", "PageUp", "Home"]);
      const SCROLL_KEYS = new Set(["ArrowDown", "PageDown", " ", "End", "ArrowUp", "PageUp", "Home"]);
      const isTypingTarget = (el: Element | null) =>
        !!el &&
        (el.tagName === "INPUT" ||
          el.tagName === "TEXTAREA" ||
          el.tagName === "SELECT" ||
          el.tagName === "BUTTON" ||
          (el as HTMLElement).isContentEditable);
      const handleKeydown = (e: KeyboardEvent) => {
        if (isTypingTarget(document.activeElement)) return;
        if (isSequenceRunning) {
          if (SCROLL_KEYS.has(e.key)) e.preventDefault();
          return;
        }
        if (window.scrollY < 80 && DOWN_KEYS.has(e.key) && !hasSequenceCompleted) {
          e.preventDefault();
          triggerAutoplay();
        } else if (window.scrollY <= 15 && UP_KEYS.has(e.key) && hasSequenceCompleted) {
          e.preventDefault();
          returnToHero();
        }
      };

      // Custom Event listener for Home navigation from any component
      window.addEventListener("unifolio-reset-hero", resetHeroState);

      window.addEventListener("wheel", handleWheel, { passive: false });
      window.addEventListener("touchstart", handleTouchStart, { passive: true });
      window.addEventListener("touchmove", handleTouchMove, { passive: false });
      window.addEventListener("keydown", handleKeydown, { passive: false });

      // Fallback trigger when scrolling down from hero
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top+=10 top",
        onEnter: () => {
          triggerAutoplay();
        },
      });

      // Cleanup on unmount
      return () => {
        window.removeEventListener("unifolio-reset-hero", resetHeroState);
        window.removeEventListener("wheel", handleWheel);
        window.removeEventListener("touchstart", handleTouchStart);
        window.removeEventListener("touchmove", handleTouchMove);
        window.removeEventListener("keydown", handleKeydown);
        window.removeEventListener("resize", updateRingAnchor);
      };
    },
    { scope: containerRef }
  );

  return (
    <section
      id="hero"
      ref={containerRef}
      className="relative w-full bg-[#000000] select-none min-h-screen"
    >
      {/* Anchor for Section 2 Nav Link */}
      <div id="statement" className="absolute top-[35%] pointer-events-none" />

      {/* Single Pinned Master Stage */}
      <div
        ref={stageRef}
        // justify-center (not justify-between): the stage's only in-flow
        // children are this spacer and the Main Stage Arena below (everything
        // else — hero intro, hero visual, laser stream — is absolute and out
        // of flow). justify-between pushes the first/last flex item to
        // opposite ends, which combined with the Arena's own my-auto (an
        // auto-margin flex item absorbing free space for itself) produced an
        // ambiguous, top-biased result instead of true vertical centering.
        // justify-center centers the flex children as a group — the correct,
        // unambiguous way to vertically center this content in the viewport.
        className="relative h-screen w-full overflow-hidden bg-[#000000] flex flex-col justify-center p-6 sm:p-10 lg:p-16"
      >
        {/* Landing State Hero Intro Content */}
        <div
          ref={heroIntroRef}
          className="absolute inset-0 z-20 flex flex-col justify-between px-6 sm:px-10 lg:px-16 pt-20 pb-8 max-w-7xl mx-auto w-full pointer-events-none"
        >
          {/* Main Headline aligned naturally with the central axis of the aperture illustration, offset left and upwards */}
          <div className="flex-1 flex flex-col justify-center max-w-lg -translate-x-6 sm:-translate-x-10 lg:-translate-x-14 -translate-y-4 sm:-translate-y-6 lg:-translate-y-8">
            <h1 className="font-sans font-black text-4xl sm:text-5xl md:text-6xl lg:text-[62px] xl:text-[70px] text-white tracking-[-0.03em] uppercase leading-[0.92]">
              SEE WHAT <br />
              YOU ACTUALLY <br />
              OWN.
            </h1>
          </div>

          {/* Bottom Left: Scroll to Enter Indicator */}
          <div className="flex flex-col items-start gap-2.5 font-mono text-[10px] sm:text-[11px] tracking-[0.25em] text-[#8E9B91] uppercase pb-2">
            <span>SCROLL TO ENTER</span>
            <div className="w-[1px] h-7 bg-gradient-to-b from-[#8E9B91]/50 to-transparent ml-2" />
          </div>
        </div>
        {/* Master Hero Visual Layer (Zooms and dissolves into the aperture void) */}
        <div
          ref={heroVisualRef}
          className="absolute inset-0 w-full h-full z-10 flex items-center justify-center pointer-events-none will-change-transform"
          // Fallback only — computeRingAnchorPercent() overwrites this with
          // the ring's actual measured position on mount (and on resize),
          // so the scale-1-to-8.5 zoom below expands from the ring's true
          // visual center at every viewport instead of one static guess.
          style={{ transformOrigin: "53.2% 37%" }}
        >
          {/* Landing Page Illustration — single combined replacement for the
              previous ring logo + procedural wave/particle visual. A plain
              full-bleed, non-cropping <Image>, so it inherits heroVisualRef's
              existing scale/opacity aperture-expansion tween exactly as the
              wave+ring composition did before it.
              Horizontal position: shifted right via translateX on this
              wrapper (not object-position) so the illustration clears the
              headline column regardless of viewport aspect ratio.
              object-position alone can't guarantee this — object-contain
              only has horizontal room to shift within if the container is
              wider than the image's own aspect ratio produces at that
              height, which isn't reliably true across breakpoints. A
              translateX moves the whole rendered box unconditionally,
              exactly like a pure horizontal position change. Also,
              heroVisualRef is what GSAP's own scale/opacity tween writes to
              — this wrapper is a separate, GSAP-untouched child, so the
              translateX can never conflict with the existing animation. */}
          <div
            ref={illustrationWrapperRef}
            className="pointer-events-none absolute inset-0 w-full h-full"
            style={{ transform: "translate(9%, 3.5%)" }}
          >
            <Image
              src="/Landing Page Illustration.png"
              alt="Unifolio"
              fill
              priority
              className="object-contain pointer-events-none select-none"
              style={{ objectPosition: "60.5% 47.8%" }}
            />
          </div>

          {/* Animated wave-motion overlay — an exact second copy of the same
              illustration, positioned identically (same translateX, same
              object-contain/object-position) so it overlaps the base copy
              pixel-for-pixel. A subtle SVG turbulence/displacement filter is
              applied, and mask-image restricts where it's visible to the
              lower ~40% of the frame (the wave/particle field), fading to
              fully transparent well above that — so the ring and everything
              above it always show the untouched base copy underneath, and
              only the wave region ever displays the animated version. */}
          <div
            id="illustrationWaveOverlay"
            className="pointer-events-none absolute inset-0 w-full h-full"
            style={{
              transform: "translate(9%, 3.5%)",
              filter: "url(#illustrationWaveFlowFilter)",
              WebkitMaskImage:
                "linear-gradient(to bottom, transparent 0%, transparent 38%, black 62%, black 100%)",
              maskImage:
                "linear-gradient(to bottom, transparent 0%, transparent 38%, black 62%, black 100%)",
            }}
          >
            <Image
              src="/Landing Page Illustration.png"
              alt=""
              aria-hidden="true"
              fill
              className="object-contain pointer-events-none select-none"
              style={{ objectPosition: "60.5% 47.8%" }}
            />
          </div>

          {/* Filter definition for the wave-motion overlay above — hidden,
              zero-size, purely a definition target for the url(#...) filter. */}
          <svg className="pointer-events-none absolute w-0 h-0" aria-hidden="true">
            <defs>
              <filter
                id="illustrationWaveFlowFilter"
                x="-10%"
                y="-10%"
                width="120%"
                height="120%"
              >
                <feTurbulence
                  id="illustrationWaveTurbulence"
                  type="fractalNoise"
                  baseFrequency="0.008 0.012"
                  numOctaves="2"
                  result="noise"
                  seed="11"
                />
                <feDisplacementMap
                  id="illustrationWaveDisplacement"
                  in="SourceGraphic"
                  in2="noise"
                  scale="3"
                  xChannelSelector="R"
                  yChannelSelector="G"
                />
              </filter>
            </defs>
          </svg>

          {/* A handful of soft glints drifting/shimmering over the wave
              field's connection points — purely additive, layered on top of
              the untouched base image, never modifying it. Approximate
              positions read off the illustration's own particle-dense lower
              region; kept inside the same translateX group so they track
              the illustration's position exactly. */}
          <div
            className="pointer-events-none absolute inset-0 w-full h-full"
            style={{ transform: "translate(9%, 3.5%)" }}
          >
            {[
              { left: "38%", top: "58%" },
              { left: "52%", top: "68%" },
              { left: "64%", top: "56%" },
              { left: "46%", top: "76%" },
              { left: "70%", top: "70%" },
            ].map((pos, i) => (
              <div
                key={i}
                className="illustration-shimmer pointer-events-none absolute w-1.5 h-1.5 rounded-full bg-[#4ADE80] opacity-0 will-change-transform"
                style={{
                  left: pos.left,
                  top: pos.top,
                  boxShadow: "0 0 6px 1px rgba(74,222,128,0.55)",
                }}
              />
            ))}
          </div>

          {/* Dynamic Luminous Green Flare Bloom Centered Over the Aperture.
              Fallback position only — updateRingAnchor() overwrites left/top
              with the ring's actual measured center on mount and on resize. */}
          <div
            ref={heroGlowRef}
            className="pointer-events-none absolute w-[420px] h-[420px] rounded-full bg-gradient-to-tr from-[#22C55E]/0 via-[#22C55E]/30 to-[#22C55E]/50 blur-3xl opacity-0 z-20 will-change-transform"
            style={{ left: "calc(53.2% - 210px)", top: "calc(37% - 210px)" }}
          />
        </div>

        {/* Ambient Laser Stream (Revealed during orbital card phase) */}
        <div
          ref={lasersRef}
          className="pointer-events-none absolute inset-0 overflow-hidden flex flex-col justify-center gap-12 opacity-0 z-0 will-change-transform"
        >
          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#22C55E]/35 to-transparent translate-x-12" />
          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#22C55E]/40 to-transparent -translate-x-24" />
          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#22C55E]/30 to-transparent translate-x-36" />
          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#22C55E]/35 to-transparent -translate-x-16" />
        </div>

        {/* Main Stage Arena: Left Text + Right Layered Stepped Glass Cards */}
        <div className="relative z-20 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full max-w-7xl mx-auto">
          {/* Left Column: Monumental Headline */}
          <div
            ref={textWrapRef}
            className="lg:col-span-5 xl:col-span-5 space-y-4 opacity-0 will-change-transform"
          >
            {/* Impactful Condensed Headline (Matching Hero Typography) */}
            <h2 className="font-sans font-black text-4xl sm:text-5xl md:text-6xl lg:text-[54px] xl:text-[62px] text-[#FAF8F5] tracking-[-0.04em] uppercase leading-[0.92]">
              SEE THE WHOLE. <br />
              EVERY ASSET. <br />
              ONE VIEW.
            </h2>
          </div>

          {/* Right Column: 6 Abstract Financial Intelligence Motion Graphics Cards */}
          <div
            ref={cardsWrapRef}
            className="group/stack lg:col-span-7 xl:col-span-7 relative h-[360px] sm:h-[400px] md:h-[440px] flex items-center justify-start lg:justify-center overflow-visible will-change-transform"
          >
            <div className="relative w-full h-full flex items-center justify-start">

              {/* Card 0: 01 — Scattered (First scroll peel: Sphere on pedestal) */}
              <div
                key="glass-card-0"
                className="portfolio-card group/card absolute left-0 w-[240px] sm:w-[270px] md:w-[295px] h-[335px] sm:h-[375px] md:h-[405px] rounded-3xl select-none origin-center overflow-hidden will-change-transform bg-[#0A0D0B]/95 border border-[#22C55E]/55 shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_35px_rgba(34,197,94,0.18),0_0_0_1px_rgba(34,197,94,0.14),inset_0_1px_1px_0_rgba(34,197,94,0.4)] backdrop-blur-2xl flex flex-col justify-between items-center p-6 sm:p-7 cursor-pointer transition-[border-color,box-shadow] duration-300 ease-out hover:border-[#22C55E]/80 hover:shadow-[0_28px_60px_rgba(0,0,0,0.95),0_0_35px_rgba(34,197,94,0.28)] hover:z-40"
                style={{ zIndex: 30 }}
              >
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.08] via-transparent to-transparent" />

                {/* Header Centered */}
                <div className="w-full flex justify-center">
                  <h3 className="font-sans font-bold text-sm sm:text-base text-white tracking-wide uppercase leading-snug text-center">
                    SCATTERED <br />
                    <span className="text-[#8E9B91] font-medium text-xs sm:text-[13px] tracking-normal capitalize">Fragmented Information</span>
                  </h3>
                </div>

                {/* 3D Visual Illustration */}
                <div className="my-auto py-1 flex items-center justify-center relative w-full h-[150px] sm:h-[170px] md:h-[190px]">
                  <div className="relative w-full h-full max-w-[210px] sm:max-w-[230px] max-h-[170px]">
                    <Image
                      src="/cards/card-1.png"
                      alt="Create your account visual"
                      fill
                      className="object-contain object-center select-none pointer-events-none drop-shadow-[0_10px_25px_rgba(0,0,0,0.65)]"
                      sizes="(max-width: 768px) 230px, 260px"
                      priority
                    />
                  </div>
                </div>
              </div>

              {/* Card 1: 02 — Collected (Second scroll peel: Curved glass & pill connector) */}
              <div
                key="glass-card-1"
                className="portfolio-card group/card absolute left-0 w-[240px] sm:w-[270px] md:w-[295px] h-[335px] sm:h-[375px] md:h-[405px] rounded-3xl select-none origin-center overflow-hidden will-change-transform bg-[#0A0C0B]/90 border border-white/[0.22] shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.05),inset_0_1px_1px_0_rgba(255,255,255,0.22)] backdrop-blur-2xl flex flex-col justify-between items-center p-6 sm:p-7 cursor-pointer transition-[border-color,box-shadow] duration-300 ease-out hover:border-[#22C55E]/80 hover:shadow-[0_28px_60px_rgba(0,0,0,0.95),0_0_35px_rgba(34,197,94,0.28)] hover:z-40"
                style={{ zIndex: 26 }}
              >
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.06] via-transparent to-transparent" />

                {/* Header Centered */}
                <div className="w-full flex justify-center">
                  <h3 className="font-sans font-bold text-sm sm:text-base text-white tracking-wide uppercase leading-snug text-center">
                    COLLECTED <br />
                    <span className="text-[#8E9B91] font-medium text-xs sm:text-[13px] tracking-normal capitalize">Inward Convergence</span>
                  </h3>
                </div>

                {/* 3D Visual Illustration */}
                <div className="my-auto py-1 flex items-center justify-center relative w-full h-[150px] sm:h-[170px] md:h-[190px]">
                  <div className="relative w-full h-full max-w-[210px] sm:max-w-[230px] max-h-[170px]">
                    <Image
                      src="/cards/card-2.png"
                      alt="Tell us about yourself visual"
                      fill
                      className="object-contain object-center select-none pointer-events-none drop-shadow-[0_10px_25px_rgba(0,0,0,0.65)]"
                      sizes="(max-width: 768px) 230px, 260px"
                      priority
                    />
                  </div>
                </div>
              </div>

              {/* Card 2: 03 — Organized (Third scroll peel: CAS folder & tray) */}
              <div
                key="glass-card-2"
                className="portfolio-card group/card absolute left-0 w-[240px] sm:w-[270px] md:w-[295px] h-[335px] sm:h-[375px] md:h-[405px] rounded-3xl select-none origin-center overflow-hidden will-change-transform bg-[#0A0C0B]/90 border border-white/[0.22] shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.05),inset_0_1px_1px_0_rgba(255,255,255,0.22)] backdrop-blur-2xl flex flex-col justify-between items-center p-6 sm:p-7 cursor-pointer transition-[border-color,box-shadow] duration-300 ease-out hover:border-[#22C55E]/80 hover:shadow-[0_28px_60px_rgba(0,0,0,0.95),0_0_35px_rgba(34,197,94,0.28)] hover:z-40"
                style={{ zIndex: 22 }}
              >
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.06] via-transparent to-transparent" />

                {/* Header Centered */}
                <div className="w-full flex justify-center">
                  <h3 className="font-sans font-bold text-sm sm:text-base text-white tracking-wide uppercase leading-snug text-center">
                    ORGANIZED <br />
                    <span className="text-[#8E9B91] font-medium text-xs sm:text-[13px] tracking-normal capitalize">Structured Strata</span>
                  </h3>
                </div>

                {/* 3D Visual Illustration */}
                <div className="my-auto py-1 flex items-center justify-center relative w-full h-[150px] sm:h-[170px] md:h-[190px]">
                  <div className="relative w-full h-full max-w-[210px] sm:max-w-[230px] max-h-[170px]">
                    <Image
                      src="/cards/card-3.png"
                      alt="Upload your CAS visual"
                      fill
                      className="object-contain object-center select-none pointer-events-none drop-shadow-[0_10px_25px_rgba(0,0,0,0.65)]"
                      sizes="(max-width: 768px) 230px, 260px"
                      priority
                    />
                  </div>
                </div>
              </div>

              {/* Card 3: 04 — Revealed (Fourth scroll peel: Data tiles passing through glass gate) */}
              <div
                key="glass-card-3"
                className="portfolio-card group/card absolute left-0 w-[240px] sm:w-[270px] md:w-[295px] h-[335px] sm:h-[375px] md:h-[405px] rounded-3xl select-none origin-center overflow-hidden will-change-transform bg-[#0A0C0B]/90 border border-white/[0.22] shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.05),inset_0_1px_1px_0_rgba(255,255,255,0.22)] backdrop-blur-2xl flex flex-col justify-between items-center p-6 sm:p-7 cursor-pointer transition-[border-color,box-shadow] duration-300 ease-out hover:border-[#22C55E]/80 hover:shadow-[0_28px_60px_rgba(0,0,0,0.95),0_0_35px_rgba(34,197,94,0.28)] hover:z-40"
                style={{ zIndex: 18 }}
              >
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.06] via-transparent to-transparent" />

                {/* Header Centered */}
                <div className="w-full flex justify-center">
                  <h3 className="font-sans font-bold text-sm sm:text-base text-white tracking-wide uppercase leading-snug text-center">
                    REVEALED <br />
                    <span className="text-[#8E9B91] font-medium text-xs sm:text-[13px] tracking-normal capitalize">Hidden Insights</span>
                  </h3>
                </div>

                {/* 3D Visual Illustration */}
                <div className="my-auto py-1 flex items-center justify-center relative w-full h-[150px] sm:h-[170px] md:h-[190px]">
                  <div className="relative w-full h-full max-w-[210px] sm:max-w-[230px] max-h-[170px]">
                    <Image
                      src="/cards/card-4.png"
                      alt="We organise your data visual"
                      fill
                      className="object-contain object-center select-none pointer-events-none drop-shadow-[0_10px_25px_rgba(0,0,0,0.65)]"
                      sizes="(max-width: 768px) 230px, 260px"
                      priority
                    />
                  </div>
                </div>
              </div>

              {/* Card 4: 05 — Connected (Fifth scroll peel: Golden fibers converging into torus) */}
              <div
                key="glass-card-4"
                className="portfolio-card group/card absolute left-0 w-[240px] sm:w-[270px] md:w-[295px] h-[335px] sm:h-[375px] md:h-[405px] rounded-3xl select-none origin-center overflow-hidden will-change-transform bg-[#0A0C0B]/90 border border-white/[0.22] shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.05),inset_0_1px_1px_0_rgba(255,255,255,0.22)] backdrop-blur-2xl flex flex-col justify-between items-center p-6 sm:p-7 cursor-pointer transition-[border-color,box-shadow] duration-300 ease-out hover:border-[#22C55E]/80 hover:shadow-[0_28px_60px_rgba(0,0,0,0.95),0_0_35px_rgba(34,197,94,0.28)] hover:z-40"
                style={{ zIndex: 14 }}
              >
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.06] via-transparent to-transparent" />

                {/* Header Centered */}
                <div className="w-full flex justify-center">
                  <h3 className="font-sans font-bold text-sm sm:text-base text-white tracking-wide uppercase leading-snug text-center">
                    CONNECTED <br />
                    <span className="text-[#8E9B91] font-medium text-xs sm:text-[13px] tracking-normal capitalize">Synaptic Network</span>
                  </h3>
                </div>

                {/* 3D Visual Illustration */}
                <div className="my-auto py-1 flex items-center justify-center relative w-full h-[150px] sm:h-[170px] md:h-[190px]">
                  <div className="relative w-full h-full max-w-[210px] sm:max-w-[230px] max-h-[170px]">
                    <Image
                      src="/cards/card-5.png"
                      alt="Everything connects visual"
                      fill
                      className="object-contain object-center select-none pointer-events-none drop-shadow-[0_10px_25px_rgba(0,0,0,0.65)]"
                      sizes="(max-width: 768px) 230px, 260px"
                      priority
                    />
                  </div>
                </div>
              </div>

              {/* Card 5: 06 — Clear (Sixth final state: Compass ring & marble sectors) */}
              <div
                key="glass-card-5"
                className="portfolio-card group/card absolute left-0 w-[240px] sm:w-[270px] md:w-[295px] h-[335px] sm:h-[375px] md:h-[405px] rounded-3xl select-none origin-center overflow-hidden will-change-transform bg-[#0A0C0B]/90 border border-white/[0.22] shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.05),inset_0_1px_1px_0_rgba(255,255,255,0.22)] backdrop-blur-2xl flex flex-col justify-between items-center p-6 sm:p-7 cursor-pointer transition-[border-color,box-shadow] duration-300 ease-out hover:border-[#22C55E]/80 hover:shadow-[0_28px_60px_rgba(0,0,0,0.95),0_0_35px_rgba(34,197,94,0.28)] hover:z-40"
                style={{ zIndex: 10 }}
              >
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.06] via-transparent to-transparent" />

                {/* Header Centered */}
                <div className="w-full flex justify-center">
                  <h3 className="font-sans font-bold text-sm sm:text-base text-white tracking-wide uppercase leading-snug text-center">
                    CLEAR <br />
                    <span className="text-[#8E9B91] font-medium text-xs sm:text-[13px] tracking-normal capitalize">Unified Clarity</span>
                  </h3>
                </div>

                {/* 3D Visual Illustration */}
                <div className="my-auto py-1 flex items-center justify-center relative w-full h-[150px] sm:h-[170px] md:h-[190px]">
                  <div className="relative w-full h-full max-w-[210px] sm:max-w-[230px] max-h-[170px]">
                    <Image
                      src="/cards/card-6.png"
                      alt="See your complete portfolio visual"
                      fill
                      className="object-contain object-center select-none pointer-events-none drop-shadow-[0_10px_25px_rgba(0,0,0,0.65)]"
                      sizes="(max-width: 768px) 230px, 260px"
                      priority
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Seamless Bottom Section Blend Handoff into Horizontal Narrative */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#000000] via-[#000000]/70 to-transparent z-30" />
      </div>
    </section>
  );
}
