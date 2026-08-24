"use client";

/** Large diagonal sold-out stamp over product imagery. */
export function SoldOutStamp({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 z-[12] flex items-center justify-center ${className}`}
      aria-hidden
    >
      <div className="absolute inset-0 bg-slate-900/35" />
      <span
        className="relative -rotate-12 rounded-md border-4 border-white/90 bg-slate-900/85 px-3 py-1.5 text-center text-sm font-black uppercase tracking-[0.12em] text-white shadow-lg sm:px-4 sm:py-2 sm:text-base"
      >
        Sold out
      </span>
    </div>
  );
}
