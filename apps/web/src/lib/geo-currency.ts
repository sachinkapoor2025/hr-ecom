import { headers } from "next/headers";

/** ISO 3166-1 alpha-2 country from CDN / edge headers (CloudFront on Amplify). */
export async function detectViewerCountry(): Promise<string> {
  const h = await headers();
  const raw =
    h.get("cloudfront-viewer-country") ??
    h.get("CloudFront-Viewer-Country") ??
    h.get("x-country-code") ??
    h.get("cf-ipcountry");

  if (raw && /^[A-Za-z]{2}$/.test(raw)) return raw.toUpperCase();
  return "US";
}

/** Map visitor country to default storefront currency. */
export function defaultCurrencyForCountry(country: string): "USD" | "INR" {
  if (country === "IN") return "INR";
  return "USD";
}
