"use client";

export function CharacterIllustration({
  className = "w-72 h-72",
  variant = "full", // "full" | "peeking-top" | "peeking-bottom" | "side"
}: {
  className?: string;
  variant?: "full" | "peeking-top" | "peeking-bottom" | "side";
}) {
  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 400 400"
        className="w-full h-full overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Hair Bun with Red Hair Sticks */}
        <g id="hair-bun">
          <circle cx="200" cy="80" r="36" fill="#000000" />
          {/* Crossed Red Chopsticks */}
          <line x1="150" y1="95" x2="250" y2="65" stroke="#E11D48" strokeWidth="6" strokeLinecap="round" />
          <line x1="160" y1="65" x2="240" y2="95" stroke="#E11D48" strokeWidth="6" strokeLinecap="round" />
        </g>

        {/* Main Hair Silhouette */}
        <path
          d="M 100 240 C 100 120, 300 120, 300 240 C 300 320, 100 320, 100 240 Z"
          fill="#000000"
        />

        {/* Skin Tone Face */}
        <circle cx="200" cy="225" r="88" fill="#FED7AA" />

        {/* Hair Fringe Bangs */}
        <path
          d="M 120 190 C 160 160, 240 160, 280 190 C 260 170, 140 170, 120 190 Z"
          fill="#000000"
        />

        {/* Left Eyeglass & Eye */}
        <g id="left-eye">
          <circle cx="160" cy="210" r="30" fill="#FED7AA" stroke="#E11D48" strokeWidth="4" />
          <circle cx="160" cy="210" r="7" fill="#000000" />
          <circle cx="163" cy="208" r="2.5" fill="#FFFFFF" />
          {/* Eyebrow */}
          <path d="M 142 172 Q 160 164 178 172" stroke="#000000" strokeWidth="3.5" strokeLinecap="round" />
        </g>

        {/* Bridge of Glasses */}
        <path d="M 190 210 Q 200 206 210 210" stroke="#E11D48" strokeWidth="4" strokeLinecap="round" />

        {/* Right Eyeglass & Eye (The Zoom Aperture Target) */}
        <g id="right-eye">
          <circle cx="240" cy="210" r="30" fill="#FED7AA" stroke="#E11D48" strokeWidth="4" />
          <circle id="zoom-pupil" cx="240" cy="210" r="7" fill="#000000" />
          <circle cx="243" cy="208" r="2.5" fill="#FFFFFF" />
          {/* Eyebrow */}
          <path d="M 222 172 Q 240 164 258 172" stroke="#000000" strokeWidth="3.5" strokeLinecap="round" />
        </g>

        {/* Open O-Shaped Mouth */}
        <circle cx="200" cy="265" r="9" fill="#000000" />

        {/* Cute Cheek Blush */}
        <circle cx="140" cy="235" r="8" fill="#FB7185" fillOpacity="0.4" />
        <circle cx="260" cy="235" r="8" fill="#FB7185" fillOpacity="0.4" />
      </svg>
    </div>
  );
}
