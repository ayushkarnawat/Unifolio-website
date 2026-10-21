import { WAITLIST_BENEFITS, WAITLIST_FORM } from "@/lib/waitlistCopy";
import { BellIcon, BoltIcon, ChartIcon, LockIcon } from "./WaitlistIcons";

const ICONS = { early: BoltIcon, updates: BellIcon, insights: ChartIcon, wealth: ChartIcon } as const;

/** The three benefits row and the privacy line, shown under the submit button. */
export function WaitlistBenefits({ compact = false }: { compact?: boolean }) {
  return (
    <>
      <ul className={`grid grid-cols-3 gap-2 text-center ${compact ? "mt-5" : "pt-1.5"}`}>
        {WAITLIST_BENEFITS.map(({ id, title, line }) => {
          const Icon = ICONS[id];
          return (
            <li key={id} className="flex flex-col items-center gap-[3px]">
              <Icon className="mb-0.5 h-[19px] w-[19px] text-[#22C55E]" />
              <b className="font-sans text-[12.5px] font-bold leading-[1.2] text-[#111613]">{title}</b>
              <span className="font-sans text-[11px] leading-[1.35] text-[#5A685D] lg:text-[11.5px]">{line}</span>
            </li>
          );
        })}
      </ul>
      <p
        className={`flex items-center justify-center gap-[7px] border-t border-[#111613]/[0.08] pt-3 font-sans text-xs text-[#5A685D] ${
          compact ? "mt-3.5" : ""
        }`}
      >
        <LockIcon className="h-[13px] w-[13px] flex-none" />
        {WAITLIST_FORM.privacy}
      </p>
    </>
  );
}
