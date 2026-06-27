export type DisplayCurrency = "USD" | "INR";

export function normalizeDisplayCurrency(value: string | undefined): DisplayCurrency {
  return value === "INR" ? "INR" : "USD";
}

/** Convert between USD and INR at the given live rate. */
export function convertCurrency(
  amount: number,
  from: DisplayCurrency,
  to: DisplayCurrency,
  rate: number
): number {
  if (!Number.isFinite(amount) || amount <= 0) return 0;
  if (!Number.isFinite(rate) || rate <= 0) return amount;
  if (from === to) return amount;

  if (from === "USD") {
    return Math.round(amount * rate);
  }

  return Math.round((amount / rate) * 100) / 100;
}

/** @deprecated Use convertCurrency — kept for any external imports. */
export function convertWithInrAnchor(
  amount: number,
  from: DisplayCurrency,
  to: DisplayCurrency,
  rate: number
): number {
  return convertCurrency(amount, from, to, rate);
}
