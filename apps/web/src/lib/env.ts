/** Production API — fallback when Amplify build env vars are missing */
export const PROD_API_URL = "https://foqu2ap4qi.execute-api.us-east-1.amazonaws.com/prod";

function readEnv(name: string, fallback: string): string {
  const value = process.env[name]?.trim();
  return value ? value : fallback;
}

export function getApiUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  // Amplify SSR/build often missing env — use prod API when not local dev
  if (process.env.NODE_ENV === "production") return PROD_API_URL;
  return "http://localhost:3001";
}

export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  if (process.env.NODE_ENV === "production") return "https://main.d1vlvm5li37k6g.amplifyapp.com";
  return "http://localhost:3000";
}

export const siteUrl = getSiteUrl();
export const apiUrl = getApiUrl();
