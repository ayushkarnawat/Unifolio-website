"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col items-center justify-center bg-[#000000] text-[#FAF8F5] p-6 text-center">
        <div className="max-w-md space-y-4">
          <h2 className="font-sans font-bold text-2xl uppercase tracking-tight">Application Error</h2>
          <p className="font-mono text-xs text-[#8E9B91]">{error?.message || "A critical error occurred."}</p>
          <button
            onClick={() => reset()}
            className="mt-4 px-6 py-2 rounded-full bg-[#22C55E] text-black font-mono text-xs font-bold uppercase tracking-widest hover:bg-[#22C55E]/90 transition-colors"
          >
            Refresh Application
          </button>
        </div>
      </body>
    </html>
  );
}
