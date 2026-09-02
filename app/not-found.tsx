import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#000000] text-[#FAF8F5] p-6 text-center select-none">
      <span className="font-mono text-xs text-[#22C55E] tracking-[0.25em] uppercase mb-4">
        404 // NOT FOUND
      </span>
      <h1 className="font-sans font-black text-4xl sm:text-6xl tracking-tight mb-4">
        PAGE OUT OF FOCUS
      </h1>
      <p className="font-sans text-sm text-[#FAF8F5]/60 max-w-md mb-8">
        The requested coordinates do not correspond to an active folio or analysis module.
      </p>
      <Link
        href="/"
        className="px-6 py-3 rounded-full bg-[#000000] border border-[#22C55E]/30 text-[#22C55E] font-mono text-xs tracking-wider uppercase hover:bg-[#22C55E]/10 transition-colors"
      >
        RETURN TO PORTAL
      </Link>
    </div>
  );
}
