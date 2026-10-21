"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { SUCCESS_AUTOCLOSE_MS, WAITLIST_FORM, WAITLIST_PANEL } from "@/lib/waitlistCopy";
import { WaitlistForm } from "./WaitlistForm";
import { WaitlistBenefits } from "./WaitlistBenefits";
import { WaitlistPortfolioSketch } from "./WaitlistPortfolioSketch";
import { WaitlistSuccess } from "./WaitlistSuccess";
import { CloseIcon } from "./WaitlistIcons";
import { WAITLIST_CLOSE_CLASS } from "./waitlistStyles";

/** Above this width the pop-up uses the two-panel layout; below it, today's phone card. */
const WIDE_QUERY = "(min-width: 640px)";
const TITLE_ID = "waitlist-title";
const SUCCESS_TITLE_ID = "waitlist-success-title";

function useIsWide() {
  const [wide, setWide] = useState(() =>
    typeof window === "undefined" ? true : window.matchMedia(WIDE_QUERY).matches
  );
  useEffect(() => {
    const mq = window.matchMedia(WIDE_QUERY);
    const sync = () => setWide(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return wide;
}

export function WaitlistModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const wide = useIsWide();
  const dialogRef = useRef<HTMLDivElement>(null);
  // The parent passes a new onClose on every render; keep the latest in a ref so
  // timers and listeners are not restarted by unrelated re-renders.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setIsSuccess(false);
      return;
    }
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCloseRef.current();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      previouslyFocused?.focus?.({ preventScroll: true });
    };
  }, [open]);

  // Move focus into the dialog when it opens and when the success card replaces the form.
  useEffect(() => {
    if (open && mounted) dialogRef.current?.focus({ preventScroll: true });
  }, [open, mounted, isSuccess]);

  // The success card closes itself after 5 seconds (cleared on any earlier close or unmount).
  useEffect(() => {
    if (!open || !isSuccess) return;
    const timer = window.setTimeout(() => onCloseRef.current(), SUCCESS_AUTOCLOSE_MS);
    return () => window.clearTimeout(timer);
  }, [open, isSuccess]);

  if (!open || !mounted) return null;

  const close = () => onCloseRef.current();
  const onBackdrop = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) close();
  };

  const closeButton = (
    <button type="button" onClick={close} aria-label={WAITLIST_FORM.close} className={WAITLIST_CLOSE_CLASS}>
      <CloseIcon className="h-4 w-4" />
    </button>
  );

  let card;
  if (!wide) {
    // Phone: today's cream card, with the benefits row and privacy line added.
    card = (
      <div className="relative w-full max-w-md rounded-3xl border border-black/[0.08] bg-paper p-6 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
        {closeButton}
        {isSuccess ? (
          <WaitlistSuccess titleId={SUCCESS_TITLE_ID} compact onClose={close} />
        ) : (
          <>
            <h2
              id={TITLE_ID}
              className="font-sans text-[28px] font-extrabold text-neutral-950 text-center tracking-[-0.03em] leading-tight"
            >
              {WAITLIST_FORM.title}
            </h2>
            <p className="mt-2.5 font-sans text-[length:clamp(12.5px,4vw,16px)] font-normal text-neutral-600 text-center leading-relaxed whitespace-nowrap mx-auto">
              {WAITLIST_FORM.compactSubtitle}
            </p>
            <div className="mt-6">
              <WaitlistForm variant="compact" onSuccess={() => setIsSuccess(true)} />
            </div>
            <WaitlistBenefits compact />
          </>
        )}
      </div>
    );
  } else if (isSuccess) {
    card = (
      <div className="relative w-full max-w-[470px] overflow-hidden rounded-[24px] bg-white shadow-[0_40px_90px_-30px_rgba(0,0,0,0.5)]">
        {closeButton}
        <WaitlistSuccess titleId={SUCCESS_TITLE_ID} compact={false} onClose={close} />
      </div>
    );
  } else {
    // Desktop and tablet: welcome panel on the left, form on the right.
    card = (
      <div className="relative grid w-full max-w-[700px] grid-cols-[minmax(0,1.04fr)_minmax(0,1fr)] overflow-hidden rounded-[24px] bg-white shadow-[0_40px_90px_-30px_rgba(0,0,0,0.5)] lg:max-w-[880px]">
        <div className="relative flex min-w-0 flex-col gap-3.5 overflow-hidden bg-[linear-gradient(165deg,#E4F7EB_0%,#F2FBF6_55%,#F8FDFA_100%)] px-6 pb-6 pt-7 lg:px-8 lg:pb-[30px] lg:pt-[34px]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-[130px] -right-[120px] h-[340px] w-[340px] rounded-full bg-[radial-gradient(closest-side,rgba(34,197,94,0.20),transparent)]"
          />
          <Image
            src="/Logo/unifolio-wordmark-hero-ring.png"
            alt={WAITLIST_PANEL.logoAlt}
            width={2041}
            height={463}
            className="relative block h-[27px] w-auto self-start"
          />
          <p className="relative text-balance font-heading text-[25px] font-extrabold leading-[1.12] tracking-[-0.035em] text-[#111613] lg:text-[33px]">
            {WAITLIST_PANEL.headlineLead}
            <span className="waitlist-underline text-[#22C55E]">{WAITLIST_PANEL.headlineEmphasis}</span>
          </p>
          <p className="relative max-w-[36ch] font-sans text-sm leading-normal text-[#3F4C43] lg:text-[15px]">
            {WAITLIST_PANEL.subtext}
          </p>
          <div className="relative mt-auto pt-2">
            <WaitlistPortfolioSketch />
          </div>
        </div>

        <div className="relative flex min-w-0 flex-col gap-3.5 bg-white px-6 pb-5 pt-[26px] lg:px-8 lg:pb-[22px] lg:pt-[30px]">
          {closeButton}
          <div>
            <h2
              id={TITLE_ID}
              className="pr-[30px] font-heading text-[24px] font-extrabold leading-[1.1] tracking-[-0.03em] text-[#111613] lg:text-[29px]"
            >
              {WAITLIST_FORM.title}
            </h2>
            <p className="mt-1.5 font-sans text-sm text-[#5A685D]">{WAITLIST_FORM.subtitle}</p>
          </div>
          <WaitlistForm variant="panel" onSuccess={() => setIsSuccess(true)} />
          <WaitlistBenefits />
        </div>
      </div>
    );
  }

  return createPortal(
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <div className="fixed inset-0 bg-[#111613]/40 backdrop-blur-sm" aria-hidden />
      <div className="relative flex min-h-full items-center justify-center p-4" onClick={onBackdrop}>
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={isSuccess ? SUCCESS_TITLE_ID : TITLE_ID}
          tabIndex={-1}
          className="waitlist-dialog-in flex w-full justify-center outline-none"
          onClick={onBackdrop}
        >
          {card}
        </div>
      </div>
    </div>,
    document.body
  );
}
