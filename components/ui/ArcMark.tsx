"use client";

import Image from "next/image";

interface ArcMarkProps {
  className?: string;
  animated?: boolean;
  score?: number;
}

export function ArcMark({ className = "h-7 w-7" }: ArcMarkProps) {
  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      <Image
        src="/Logo/unifolio-ring-transparent.png"
        alt="Unifolio Ring"
        width={40}
        height={40}
        className="w-full h-full object-contain select-none pointer-events-none"
      />
    </div>
  );
}
