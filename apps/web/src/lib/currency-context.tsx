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
<<<<<<< HEAD

const STORAGE_KEY = "hr_ecom_currency";
const RATE_CACHE_KEY = "hr_ecom_usd_inr_rate";
const DEFAULT_USD_INR = Number(process.env.NEXT_PUBLIC_USD_INR_RATE) || 84;
=======
import {
  DEFAULT_USD_INR_RATE,
  fetchLiveUsdInrRate,
  convertCurrency,
  normalizeDisplayCurrency,
  type DisplayCurrency,
} from "@hr-ecom/shared";
import { getApiUrl } from "./env";
>>>>>>> c38cbde4055a2df9b5ecf4423d6ae04e38b95748

export type DisplayCurrency = "USD" | "INR";

const STORAGE_KEY = "hr_ecom_currency";
const RATE_CACHE_KEY = "hr_ecom_usd_inr_rate";
const RATE_CACHE_AT_KEY = "hr_ecom_usd_inr_rate_at";
const RATE_CACHE_TTL_MS = 30 * 60 * 1000;
const ENV_FALLBACK = Number(process.env.NEXT_PUBLIC_USD_INR_RATE) || DEFAULT_USD_INR_RATE;

interface CurrencyContextValue {
  displayCurrency: DisplayCurrency;
  setDisplayCurrency: (c: DisplayCurrency) => void;
  usdInrRate: number;
  rateLoading: boolean;
<<<<<<< HEAD
  convert: (amount: number, from: DisplayCurrency) => number;
  format: (amount: number, from: DisplayCurrency) => string;
=======
  rateSource: string;
  convert: (amount: number, from: DisplayCurrency | string) => number;
  format: (amount: number, from: DisplayCurrency | string) => string;
>>>>>>> c38cbde4055a2df9b5ecf4423d6ae04e38b95748
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

<<<<<<< HEAD
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
=======
function readCachedRate(): number | null {
  if (typeof window === "undefined") return null;
  const cachedAt = sessionStorage.getItem(RATE_CACHE_AT_KEY);
  const cached = sessionStorage.getItem(RATE_CACHE_KEY);
  if (!cached || !cachedAt) return null;
  if (Date.now() - Number(cachedAt) > RATE_CACHE_TTL_MS) return null;
  const n = Number(cached);
  return n > 0 ? n : null;
}

function storeCachedRate(rate: number) {
  sessionStorage.setItem(RATE_CACHE_KEY, String(rate));
  sessionStorage.setItem(RATE_CACHE_AT_KEY, String(Date.now()));
}

async function fetchUsdInrRate(): Promise<{ rate: number; source: string }> {
  try {
    const res = await fetch(`${getApiUrl()}/config/usd-inr-rate`, { cache: "no-store" });
    if (!res.ok) throw new Error("api rate failed");
    const data = (await res.json()) as { rate?: number; source?: string };
    if (!data.rate || data.rate <= 0) throw new Error("invalid api rate");
    storeCachedRate(data.rate);
    return { rate: data.rate, source: data.source ?? "api" };
  } catch {
    /* fall through */
  }

  try {
    const live = await fetchLiveUsdInrRate();
    if (live) {
      storeCachedRate(live.rate);
      return { rate: live.rate, source: live.source };
>>>>>>> c38cbde4055a2df9b5ecf4423d6ae04e38b95748
    }
  } catch {
    /* fall through */
  }

  const cached = readCachedRate();
  if (cached) return { rate: cached, source: "session-cache" };

  return { rate: ENV_FALLBACK, source: "fallback" };
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [displayCurrency, setDisplayCurrencyState] = useState<DisplayCurrency>("USD");
  const [usdInrRate, setUsdInrRate] = useState(ENV_FALLBACK);
  const [rateSource, setRateSource] = useState("loading");
  const [rateLoading, setRateLoading] = useState(true);
  const [ready, setReady] = useState(false);

<<<<<<< HEAD
=======
  const refreshRate = useCallback(async () => {
    const { rate, source } = await fetchUsdInrRate();
    setUsdInrRate(rate);
    setRateSource(source);
    setRateLoading(false);
  }, []);

>>>>>>> c38cbde4055a2df9b5ecf4423d6ae04e38b95748
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "USD" || saved === "INR") setDisplayCurrencyState(saved);
    setReady(true);

    void fetchUsdInrRate().then((rate) => {
      setUsdInrRate(rate);
      setRateLoading(false);
    });

    const interval = setInterval(() => {
<<<<<<< HEAD
      void fetchUsdInrRate().then(setUsdInrRate);
    }, 60 * 60 * 1000);
=======
      void refreshRate();
    }, RATE_CACHE_TTL_MS);
>>>>>>> c38cbde4055a2df9b5ecf4423d6ae04e38b95748

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
<<<<<<< HEAD
    (amount: number, from: DisplayCurrency) =>
      roundForCurrency(convertAmount(amount, from, displayCurrency, usdInrRate), displayCurrency),
=======
    (amount: number, from: DisplayCurrency | string) =>
      convertCurrency(
        amount,
        normalizeDisplayCurrency(typeof from === "string" ? from : from),
        displayCurrency,
        usdInrRate
      ),
>>>>>>> c38cbde4055a2df9b5ecf4423d6ae04e38b95748
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
<<<<<<< HEAD
    () => ({ displayCurrency, setDisplayCurrency, usdInrRate, rateLoading, convert, format }),
    [displayCurrency, setDisplayCurrency, usdInrRate, rateLoading, convert, format]
=======
    () => ({ displayCurrency, setDisplayCurrency, usdInrRate, rateLoading, rateSource, convert, format }),
    [displayCurrency, setDisplayCurrency, usdInrRate, rateLoading, rateSource, convert, format]
>>>>>>> c38cbde4055a2df9b5ecf4423d6ae04e38b95748
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}
