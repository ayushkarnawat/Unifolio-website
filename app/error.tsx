"use client";

import { useEffect } from "react";

export default function Error({
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
    // eslint-disable-next-line no-console
    console.error(error);

    // If a chunk failed to load, automatically reload once to fetch the latest assets
    if (isChunkError && typeof window !== "undefined") {
      const reloadKey = "unifolio_chunk_reload_ts";
      const lastReload = sessionStorage.getItem(reloadKey);
      const now = Date.now();

      if (!lastReload || now - parseInt(lastReload, 10) > 15000) {
        sessionStorage.setItem(reloadKey, now.toString());
        window.location.reload();
      }
    }
  }, [error, isChunkError]);

  const handleRetry = () => {
    if (isChunkError && typeof window !== "undefined") {
      window.location.reload();
    } else {
      reset();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#000000] text-[#FAF8F5] p-6 text-center">
      <div className="max-w-md space-y-4">
        <h2 className="font-sans font-bold text-2xl uppercase tracking-tight">Something went wrong</h2>
        <p className="font-mono text-xs text-[#8E9B91]">{error?.message || "An unexpected error occurred."}</p>
        <button
          onClick={handleRetry}
          className="mt-4 px-6 py-2 rounded-full bg-[#22C55E] text-black font-mono text-xs font-bold uppercase tracking-widest hover:bg-[#22C55E]/90 transition-colors cursor-pointer"
        >
          {isChunkError ? "Refresh Page" : "Try Again"}
        </button>
      </div>
    </div>
  );
}
