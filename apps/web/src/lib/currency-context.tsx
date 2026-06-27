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
import {
  convertCurrency,
  normalizeDisplayCurrency,
  type DisplayCurrency,
} from "@hr-ecom/shared";

const STORAGE_KEY = "hr_ecom_currency";
const RATE_CACHE_KEY = "hr_ecom_usd_inr_rate_v2";
const RATE_CACHE_TIME_KEY = "hr_ecom_usd_inr_rate_at";
const DEFAULT_USD_INR = Number(process.env.NEXT_PUBLIC_USD_INR_RATE) || 94;
const RATE_MAX_AGE_MS = 15 * 60 * 1000;

export type { DisplayCurrency };

interface CurrencyContextValue {
  displayCurrency: DisplayCurrency;
  setDisplayCurrency: (c: DisplayCurrency) => void;
  usdInrRate: number;
  rateLoading: boolean;
  convert: (amount: number, from: DisplayCurrency | string) => number;
  format: (amount: number, from: DisplayCurrency | string) => string;
  formatDisplay: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

function roundForCurrency(amount: number, currency: DisplayCurrency): number {
  return currency === "INR" ? Math.round(amount) : Math.round(amount * 100) / 100;
}

function readCachedRate(): number | null {
  if (typeof sessionStorage === "undefined") return null;
  const cached = sessionStorage.getItem(RATE_CACHE_KEY);
  const cachedAt = sessionStorage.getItem(RATE_CACHE_TIME_KEY);
  if (!cached || !cachedAt) return null;
  const age = Date.now() - Number(cachedAt);
  if (!Number.isFinite(age) || age > RATE_MAX_AGE_MS) return null;
  const n = Number(cached);
  return n > 0 ? n : null;
}

function writeCachedRate(rate: number) {
  sessionStorage.setItem(RATE_CACHE_KEY, String(rate));
  sessionStorage.setItem(RATE_CACHE_TIME_KEY, String(Date.now()));
}

async function fetchUsdInrRate(force = false): Promise<number> {
  if (!force) {
    const cached = readCachedRate();
    if (cached) return cached;
  }

  try {
    const res = await fetch("/api/exchange-rate", { cache: "no-store" });
    if (!res.ok) throw new Error("rate fetch failed");
    const data = (await res.json()) as { rate?: number };
    const rate = data.rate;
    if (!rate || rate <= 0) throw new Error("invalid rate");
    writeCachedRate(rate);
    return rate;
  } catch {
    const stale = sessionStorage.getItem(RATE_CACHE_KEY);
    if (stale) {
      const n = Number(stale);
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

  const refreshRate = useCallback(async (force = false) => {
    const rate = await fetchUsdInrRate(force);
    setUsdInrRate(rate);
    setRateLoading(false);
    return rate;
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "USD" || saved === "INR") setDisplayCurrencyState(saved);
    setReady(true);
    void refreshRate();

    const interval = setInterval(() => {
      void refreshRate(true);
    }, RATE_MAX_AGE_MS);

    return () => clearInterval(interval);
  }, [refreshRate]);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, displayCurrency);
  }, [displayCurrency, ready]);

  const setDisplayCurrency = useCallback(
    (c: DisplayCurrency) => {
      setDisplayCurrencyState(c);
      void refreshRate(true);
    },
    [refreshRate]
  );

  const convert = useCallback(
    (amount: number, from: DisplayCurrency | string) =>
      roundForCurrency(
        convertCurrency(amount, normalizeDisplayCurrency(from), displayCurrency, usdInrRate),
        displayCurrency
      ),
    [displayCurrency, usdInrRate]
  );

  const format = useCallback(
    (amount: number, from: DisplayCurrency | string) => {
      const value = convert(amount, from);
      return new Intl.NumberFormat(displayCurrency === "INR" ? "en-IN" : "en-US", {
        style: "currency",
        currency: displayCurrency,
        maximumFractionDigits: displayCurrency === "INR" ? 0 : 2,
      }).format(value);
    },
    [convert, displayCurrency]
  );

  const formatDisplay = useCallback(
    (amount: number) =>
      new Intl.NumberFormat(displayCurrency === "INR" ? "en-IN" : "en-US", {
        style: "currency",
        currency: displayCurrency,
        maximumFractionDigits: displayCurrency === "INR" ? 0 : 2,
      }).format(amount),
    [displayCurrency]
  );

  const value = useMemo(
    () => ({
      displayCurrency,
      setDisplayCurrency,
      usdInrRate,
      rateLoading,
      convert,
      format,
      formatDisplay,
    }),
    [displayCurrency, setDisplayCurrency, usdInrRate, rateLoading, convert, format, formatDisplay]
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}
