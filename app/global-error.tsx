"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isChunkError =
    error?.name === "ChunkLoadError" ||
    error?.message?.includes("Loading chunk") ||
    error?.message?.includes("Failed to fetch dynamically imported module");

  useEffect(() => {
    // If a chunk failed to load (typically after a new deployment),
    // automatically reload once to fetch the latest HTML and asset chunks.
    if (isChunkError && typeof window !== "undefined") {
      const reloadKey = "unifolio_chunk_reload_ts";
      const lastReload = sessionStorage.getItem(reloadKey);
      const now = Date.now();

      // Guard against infinite reload loops (max once per 15s)
      if (!lastReload || now - parseInt(lastReload, 10) > 15000) {
        sessionStorage.setItem(reloadKey, now.toString());
        window.location.reload();
      }
    }
  }, [isChunkError]);

  const handleRefresh = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    } else {
      reset();
    }
  };

  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col items-center justify-center bg-[#000000] text-[#FAF8F5] p-6 text-center">
        <div className="max-w-md space-y-4">
          <h2 className="font-sans font-bold text-2xl uppercase tracking-tight">Application Error</h2>
          <p className="font-mono text-xs text-[#8E9B91]">{error?.message || "A critical error occurred."}</p>
          <button
            onClick={handleRefresh}
            className="mt-4 px-6 py-2 rounded-full bg-[#22C55E] text-black font-mono text-xs font-bold uppercase tracking-widest hover:bg-[#22C55E]/90 transition-colors cursor-pointer"
          >
            Refresh Application
          </button>
        </div>
      </body>
    </html>
  );
}
