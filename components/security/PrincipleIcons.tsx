/**
 * The four principle icons for the Security section: the original icons from the scroll-based
 * section (living eyes, green padlock, star shield, India map outline), animated with CSS
 * (keyframes: app/globals.css, "sec-ic-*"). Approved design: Docs/reference/security-section-prototype.html.
 */
import type { ReactNode } from "react";
import type { SecurityIconId } from "@/lib/securityCopy";

const INDIA_PATH =
  "M 59.2 13.0 C 61.8 12.9 65.5 12.6 68.7 14.1 C 71.9 15.6 75.5 21.1 78.3 22.0 C 81.0 23.0 82.9 20.3 85.2 19.9 C 87.4 19.6 89.6 19.5 91.5 19.9 C 93.5 20.4 97.2 20.5 96.8 22.6 C 96.5 24.6 90.6 30.1 89.4 32.1 C 88.2 34.2 89.0 33.8 89.4 34.8 C 89.7 35.7 91.2 36.9 91.5 38.0 C 91.8 39.0 92.1 40.1 91.0 41.1 C 89.8 42.2 83.3 42.1 84.6 44.3 C 85.9 46.5 96.5 52.4 98.9 54.4 C 101.4 56.3 99.8 54.7 99.5 56.0 C 99.1 57.2 95.5 59.8 96.8 61.8 C 98.1 63.9 103.3 66.4 107.4 68.2 C 111.6 69.9 117.7 71.6 121.7 72.4 C 125.8 73.2 129.5 73.3 131.8 73.0 C 134.1 72.6 134.5 72.0 135.5 70.3 C 136.6 68.6 137.2 64.5 138.2 62.9 C 139.2 61.3 139.0 59.6 141.4 60.8 C 143.8 61.9 149.9 68.2 152.5 69.8 C 155.1 71.4 155.2 70.8 156.7 70.3 C 158.3 69.8 159.7 69.2 162.0 66.6 C 164.4 63.9 168.9 56.8 171.1 54.4 C 173.3 52.0 173.8 52.6 175.3 52.3 C 176.8 51.9 178.7 51.9 180.1 52.3 C 181.5 52.6 182.6 52.9 183.8 54.4 C 185.0 55.9 187.1 59.3 187.5 61.3 C 187.9 63.2 187.6 64.8 186.4 66.1 C 185.3 67.3 182.1 67.7 180.6 68.7 C 179.1 69.8 178.8 69.7 177.4 72.4 C 176.1 75.2 173.5 80.8 172.7 85.2 C 171.8 89.5 173.7 96.6 172.1 98.4 C 170.5 100.3 165.3 97.4 163.1 96.3 C 160.9 95.1 159.6 93.1 158.9 91.5 C 158.2 89.9 158.1 88.3 158.9 86.7 C 159.7 85.2 162.8 83.2 163.6 82.0 C 164.4 80.7 165.5 79.4 163.6 79.3 C 161.8 79.2 155.9 79.9 152.5 81.4 C 149.1 82.9 144.6 86.5 143.0 88.3 C 141.3 90.2 141.5 90.1 142.4 92.6 C 143.4 95.1 149.0 101.2 148.8 103.2 C 148.6 105.1 143.3 103.7 141.4 104.2 C 139.4 104.8 139.5 103.5 137.1 106.4 C 134.7 109.2 130.0 117.4 127.0 121.2 C 124.1 125.0 123.1 126.6 119.6 129.2 C 116.2 131.7 109.4 134.6 106.4 136.6 C 103.4 138.5 102.7 139.2 101.6 140.8 C 100.4 142.5 99.9 143.2 99.5 146.7 C 99.0 150.1 99.6 156.8 98.9 161.5 C 98.2 166.2 96.5 171.4 95.2 174.8 C 94.0 178.1 93.3 179.6 91.5 181.7 C 89.7 183.7 86.4 186.3 84.6 187.0 C 82.9 187.7 82.5 187.3 80.9 185.9 C 79.3 184.5 78.3 184.1 75.1 178.5 C 71.9 172.8 65.3 159.5 61.8 152.0 C 58.4 144.5 56.1 139.7 54.4 133.4 C 52.7 127.1 52.4 117.7 51.7 114.3 C 51.1 111.0 52.9 111.8 50.7 113.3 C 48.5 114.7 41.5 121.2 38.5 122.8 C 35.5 124.4 34.2 123.1 32.7 122.8 C 31.1 122.5 30.8 122.6 28.9 121.2 C 27.1 119.8 21.2 116.0 21.5 114.3 C 21.9 112.6 28.9 112.2 31.1 111.1 C 33.3 110.1 33.7 109.3 34.8 108.0 C 35.8 106.6 39.1 104.2 37.4 103.2 C 35.7 102.2 27.5 102.7 24.7 102.1 C 21.9 101.6 22.5 101.9 20.5 100.0 C 18.4 98.1 13.6 92.9 12.5 91.0 C 11.4 89.0 12.6 89.1 13.6 88.3 C 14.5 87.5 14.7 86.9 18.3 86.2 C 22.0 85.5 32.2 84.7 35.3 84.1 C 38.4 83.5 37.1 84.1 36.9 82.5 C 36.7 80.9 34.5 76.8 34.2 74.5 C 34.0 72.3 34.7 70.6 35.3 69.2 C 35.9 67.9 37.1 67.0 38.0 66.6 C 38.8 66.1 39.3 66.1 40.6 66.6 C 41.9 67.1 41.5 73.8 45.9 69.8 C 50.3 65.8 63.9 47.9 67.1 42.7 C 70.4 37.6 67.1 40.5 65.5 39.0 C 63.9 37.5 58.5 35.9 57.6 33.7 C 56.6 31.5 60.8 28.2 59.7 25.8 C 58.6 23.3 52.4 20.6 51.2 18.9 C 50.1 17.1 51.5 16.1 52.8 15.2 C 54.1 14.2 56.5 13.2 59.2 13.0 Z";
const SHIELD_PATH =
  "M 26 13 L 74 13 C 78 13 83 17 85 22 C 86.5 25 86 48 86 52 C 86 68 70 82 50 89 C 30 82 14 68 14 52 C 14 48 13.5 25 15 22 C 17 17 22 13 26 13 Z";

function Eyes() {
  return (
    <div className="flex h-full w-full items-center justify-center gap-[3px]">
      {[0, 1].map((i) => (
        <span
          key={i}
          className="relative flex aspect-square w-[48%] items-center justify-center overflow-hidden rounded-full border border-[rgba(17,22,19,0.18)] bg-white shadow-[0_2px_5px_rgba(17,22,19,0.18)]"
        >
          <i className="sec-ic-pupil relative block h-1/2 w-1/2 rounded-full bg-[#020603] shadow-[0_0_0_2px_rgba(34,197,94,0.95)]">
            <b className="absolute left-[18%] top-[12%] block h-1/4 w-1/4 rounded-full bg-white" />
          </i>
          <i className="sec-ic-lid absolute inset-0 rounded-full bg-[#06180e]" />
        </span>
      ))}
    </div>
  );
}

function Lock() {
  return (
    <svg viewBox="0 0 44 48" fill="none" className="sec-ic-lock block h-full w-full overflow-visible">
      <path
        className="sec-ic-shackle"
        d="M 13 21 V 13 C 13 7.5 17 3.5 22 3.5 C 27 3.5 31 7.5 31 13 V 21"
        stroke="#18181B"
        strokeWidth="4.8"
        strokeLinecap="round"
      />
      <rect x="6" y="18" width="32" height="26" rx="7.5" fill="#22C55E" />
      <circle cx="22" cy="28" r="2.8" fill="#18181B" />
      <path d="M 20.6 28.5 L 19.8 36 L 24.2 36 L 23.4 28.5 Z" fill="#18181B" />
    </svg>
  );
}

function Shield() {
  return (
    <svg viewBox="0 0 100 100" fill="none" className="sec-ic-shield block h-full w-full overflow-visible">
      <path d={SHIELD_PATH} fill="rgba(34,197,94,0.12)" stroke="#22C55E" strokeWidth="3.2" strokeLinejoin="round" />
      <circle cx="50" cy="49" r="16" fill="rgba(34,197,94,0.16)" stroke="#22C55E" strokeWidth="2.4" />
      <path
        d="M 50.0 39.0 L 52.8 45.4 L 59.8 45.8 L 54.3 50.2 L 56.1 57.0 L 50.0 53.2 L 43.9 57.0 L 45.7 50.2 L 40.2 45.8 L 47.2 45.4 Z"
        fill="#22C55E"
      />
    </svg>
  );
}

function IndiaMap() {
  return (
    <svg viewBox="0 0 200 200" fill="none" className="sec-ic-map block h-full w-full overflow-visible">
      <path
        className="sec-ic-map-path"
        d={INDIA_PATH}
        pathLength={100}
        stroke="#22C55E"
        strokeWidth="3"
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="rgba(34,197,94,0.14)"
      />
    </svg>
  );
}

const ICONS: Record<SecurityIconId, () => ReactNode> = {
  eye: Eyes,
  lock: Lock,
  sell: Shield,
  india: IndiaMap,
};

export function PrincipleGlyph({ id }: { id: SecurityIconId }) {
  const Icon = ICONS[id];
  return <Icon />;
}
