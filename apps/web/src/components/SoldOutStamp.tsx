"use client";

/** Classic round sold-out stamp over product imagery. */
export function SoldOutStamp({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 z-[12] flex items-center justify-center ${className}`}
      aria-hidden
    >
      <div className="absolute inset-0 bg-white/25" />
      <span
        className="relative -rotate-[18deg] flex h-[5.25rem] w-[5.25rem] sm:h-24 sm:w-24 items-center justify-center rounded-full border-[3px] border-rose-300/90 bg-rose-500/90 text-center text-[11px] sm:text-xs font-black uppercase tracking-[0.14em] text-white shadow-[0_6px_20px_rgba(244,63,94,0.45)] ring-4 ring-rose-100/70"
      >
        Sold
        <br />
        out
      </span>
    </div>
  );
}
