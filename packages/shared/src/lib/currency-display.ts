export type DisplayCurrency = "USD" | "INR";

/** Round INR up to nearest x99 price point (e.g. 1428 → 1499). */
export function roundInrCharm(inr: number): number {
  if (inr <= 0) return 0;
  return Math.ceil((inr + 1) / 100) * 100 - 1;
}

/** Normalize any stored price to a consistent INR anchor using the live USD/INR rate. */
export function amountToInrAnchor(amount: number, from: DisplayCurrency, rate: number): number {
  const raw = from === "INR" ? amount : amount * rate;
  return roundInrCharm(raw);
}

/** Convert INR anchor to display currency at the current rate. */
export function inrAnchorToDisplay(inr: number, to: DisplayCurrency, rate: number): number {
  if (to === "INR") return inr;
  return Math.round((inr / rate) * 100) / 100;
}

export function convertWithInrAnchor(
  amount: number,
  from: DisplayCurrency,
  to: DisplayCurrency,
  rate: number
): number {
  const inr = amountToInrAnchor(amount, from, rate);
  return inrAnchorToDisplay(inr, to, rate);
}
