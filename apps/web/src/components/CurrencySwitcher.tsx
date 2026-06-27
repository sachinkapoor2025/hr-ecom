"use client";

import { usePathname } from "next/navigation";
import { useCurrency, type DisplayCurrency } from "@/lib/currency-context";

function CurrencyButton({
  label,
  active,
  onClick,
  activeClass,
}: {
  label: DisplayCurrency;
  active: boolean;
  onClick: () => void;
  activeClass: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={`Show prices in ${label}`}
      className={`w-11 sm:w-12 py-3 sm:py-3.5 text-[11px] sm:text-xs font-bold tracking-wide text-white transition-colors ${
        active ? activeClass : "bg-slate-800/90 hover:bg-slate-800"
      }`}
    >
      {label}
    </button>
  );
}

export function CurrencySwitcher() {
  const pathname = usePathname();
  const { displayCurrency, setDisplayCurrency, usdInrRate, rateLoading } = useCurrency();

  if (pathname.startsWith("/admin")) return null;

  return (
    <div
      className="fixed right-0 top-1/2 -translate-y-1/2 z-40 flex flex-col shadow-lg"
      role="group"
      aria-label="Currency switcher"
    >
      <CurrencyButton
        label="USD"
        active={displayCurrency === "USD"}
        onClick={() => setDisplayCurrency("USD")}
        activeClass="bg-primary"
      />
      <CurrencyButton
        label="INR"
        active={displayCurrency === "INR"}
        onClick={() => setDisplayCurrency("INR")}
        activeClass="bg-[#f88379]"
      />
      <p
        className="w-11 sm:w-12 bg-slate-900/95 text-[9px] text-center text-white/80 py-1 leading-tight"
        title="Live USD to INR exchange rate"
      >
        {rateLoading ? "…" : `1$=${Math.round(usdInrRate)}₹`}
      </p>
    </div>
  );
}
