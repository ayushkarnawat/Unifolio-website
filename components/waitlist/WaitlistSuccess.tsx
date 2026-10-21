import { WAITLIST_NEXT_STEPS, WAITLIST_SUCCESS } from "@/lib/waitlistCopy";
import { CheckCircleIcon, CheckIcon, MailIcon } from "./WaitlistIcons";
import { WAITLIST_BUTTON_CLASS } from "./waitlistStyles";

/**
 * Shown in place of the form once the visitor has joined.
 * `compact` is the phone version (today's cream card with a white inner box).
 */
export function WaitlistSuccess({
  titleId,
  compact,
  onClose,
}: {
  titleId: string;
  compact: boolean;
  onClose: () => void;
}) {
  return (
    <div className={`flex flex-col items-center gap-2.5 text-center ${compact ? "pt-2" : "px-8 pb-[26px] pt-[30px]"}`}>
      <div className="waitlist-tick-pop flex h-[70px] w-[70px] items-center justify-center rounded-full border border-[#22C55E]/30 bg-[#EAF8EF] shadow-[0_10px_24px_-10px_rgba(34,197,94,0.55)]">
        <span className="flex h-[46px] w-[46px] items-center justify-center rounded-full bg-[#22C55E] text-white">
          <CheckIcon className="h-6 w-6" strokeWidth={2.6} />
        </span>
      </div>

      <h2
        id={titleId}
        className={`mt-1.5 font-heading font-extrabold tracking-[-0.03em] text-[#111613] ${
          compact ? "text-[28px] leading-tight" : "text-[27px] leading-[1.15]"
        }`}
      >
        {WAITLIST_SUCCESS.title}
      </h2>
      <p
        className={`max-w-[34ch] font-sans ${
          compact ? "text-base leading-relaxed text-neutral-600" : "text-[14.5px] leading-[1.55] text-[#5A685D]"
        }`}
      >
        {WAITLIST_SUCCESS.lead}
      </p>

      <div
        className={`mt-2 w-full rounded-2xl border border-[#111613]/[0.07] px-4 pb-1.5 pt-3.5 text-left ${
          compact ? "bg-white" : "bg-[#F7F9F7]"
        }`}
      >
        <h3 className="mb-1.5 flex items-center gap-2 font-heading text-[14.5px] font-extrabold text-[#111613]">
          <MailIcon className="h-[17px] w-[17px]" />
          {WAITLIST_SUCCESS.nextHeading}
        </h3>
        <ul>
          {WAITLIST_NEXT_STEPS.map(({ id, title, line }) => (
            <li key={id} className="flex gap-[11px] py-2">
              <CheckCircleIcon className="mt-px h-[19px] w-[19px] flex-none text-[#22C55E]" />
              <div>
                <b className="block font-sans text-[13.5px] font-bold text-[#111613]">{title}</b>
                <span className="block font-sans text-[12.5px] leading-[1.4] text-[#5A685D]">{line}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <button type="button" onClick={onClose} className={`${WAITLIST_BUTTON_CLASS} ${compact ? "mt-3.5" : "mt-2"}`}>
        {WAITLIST_SUCCESS.backHome}
      </button>
    </div>
  );
}
