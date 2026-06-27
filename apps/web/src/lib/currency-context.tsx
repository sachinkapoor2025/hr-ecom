"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "hr_ecom_currency";
const RATE_CACHE_KEY = "hr_ecom_usd_inr_rate";
const DEFAULT_USD_INR = Number(process.env.NEXT_PUBLIC_USD_INR_RATE) || 84;

export type DisplayCurrency = "USD" | "INR";

interface CurrencyContextValue {
  displayCurrency: DisplayCurrency;
  setDisplayCurrency: (c: DisplayCurrency) => void;
  usdInrRate: number;
  rateLoading: boolean;
  convert: (amount: number, from: DisplayCurrency) => number;
  format: (amount: number, from: DisplayCurrency) => string;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

function roundForCurrency(amount: number, currency: DisplayCurrency): number {
  return currency === "INR" ? Math.round(amount) : Math.round(amount * 100) / 100;
}

function convertAmount(
  amount: number,
  from: DisplayCurrency,
  to: DisplayCurrency,
  rate: number
): number {
  if (from === to) return amount;
  if (from === "USD" && to === "INR") return amount * rate;
  return amount / rate;
}

async function fetchUsdInrRate(): Promise<number> {
  try {
    const res = await fetch("https://api.frankfurter.app/latest?from=USD&to=INR", {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("rate fetch failed");
    const data = (await res.json()) as { rates?: { INR?: number } };
    const rate = data.rates?.INR;
    if (!rate || rate <= 0) throw new Error("invalid rate");
    sessionStorage.setItem(RATE_CACHE_KEY, String(rate));
    return rate;
  } catch {
    const cached = sessionStorage.getItem(RATE_CACHE_KEY);
    if (cached) {
      const n = Number(cached);
      if (n > 0) return n;
    }
    return DEFAULT_USD_INR;
  }
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [displayCurrency, setDisplayCurrencyState] = useState<DisplayCurrency>("USD");
  const [usdInrRate, setUsdInrRate] = useState(DEFAULT_USD_INR);
  const [rateLoading, setRateLoading] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "USD" || saved === "INR") setDisplayCurrencyState(saved);
    setReady(true);

    void fetchUsdInrRate().then((rate) => {
      setUsdInrRate(rate);
      setRateLoading(false);
    });

    const interval = setInterval(() => {
      void fetchUsdInrRate().then(setUsdInrRate);
    }, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, displayCurrency);
  }, [displayCurrency, ready]);

  const setDisplayCurrency = useCallback((c: DisplayCurrency) => {
    setDisplayCurrencyState(c);
  }, []);

  const convert = useCallback(
    (amount: number, from: DisplayCurrency) =>
      roundForCurrency(convertAmount(amount, from, displayCurrency, usdInrRate), displayCurrency),
    [displayCurrency, usdInrRate]
  );

  const format = useCallback(
    (amount: number, from: DisplayCurrency) => {
      const value = convert(amount, from);
      return new Intl.NumberFormat(displayCurrency === "INR" ? "en-IN" : "en-US", {
        style: "currency",
        currency: displayCurrency,
        maximumFractionDigits: displayCurrency === "INR" ? 0 : 2,
      }).format(value);
    },
    [convert, displayCurrency]
  );

  const value = useMemo(
    () => ({ displayCurrency, setDisplayCurrency, usdInrRate, rateLoading, convert, format }),
    [displayCurrency, setDisplayCurrency, usdInrRate, rateLoading, convert, format]
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}
