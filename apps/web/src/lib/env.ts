/** Production API — fallback when Amplify build env vars are missing */
export const PROD_API_URL = "https://foqu2ap4qi.execute-api.us-east-1.amazonaws.com/prod";

/** Ensure execute-api URLs include the stage (e.g. /prod). */
export function normalizeApiUrl(url: string): string {
  const trimmed = url.replace(/\/$/, "");
  if (trimmed.includes(".execute-api.") && !/\/(dev|staging|prod)$/.test(trimmed)) {
    return `${trimmed}/prod`;
  }
  return trimmed;
}

function readEnv(name: string, fallback: string): string {
  const value = process.env[name]?.trim();
  return value ? value : fallback;
}

export function getApiUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (fromEnv) return normalizeApiUrl(fromEnv);
  // Amplify SSR/build often missing env — use prod API when not local dev
  if (process.env.NODE_ENV === "production") return PROD_API_URL;
  return "http://localhost:3001";
}

export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  // Before custom domain is bound in Amplify, canonical URLs still target production domain.
  // Set NEXT_PUBLIC_SITE_URL=https://www.usarakhi.com when the domain is live.
  if (process.env.NODE_ENV === "production") return "https://www.usarakhi.com";
  return "http://localhost:3000";
}

export const siteUrl = getSiteUrl();
export const apiUrl = getApiUrl();
