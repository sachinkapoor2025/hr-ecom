"use client";

import { getSiteUrl } from "./env";
import { authUserFromIdToken, type AuthUser } from "./cognito";

const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
const cognitoDomain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN?.trim();
const cognitoRegion = process.env.NEXT_PUBLIC_COGNITO_REGION?.trim() || "us-east-1";

const PKCE_VERIFIER_KEY = "hr_ecom_oauth_pkce";
const OAUTH_REDIRECT_KEY = "hr_ecom_oauth_redirect";

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function generateCodeVerifier(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return base64UrlEncode(bytes);
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return base64UrlEncode(new Uint8Array(digest));
}

export function getOAuthRedirectUri(): string {
  return `${getSiteUrl()}/account/callback`;
}

export function isGoogleSignInConfigured(): boolean {
  return !!(clientId && cognitoDomain);
}

export async function startGoogleSignIn(redirectAfter = "/account"): Promise<void> {
  if (!clientId || !cognitoDomain) {
    throw new Error("Google sign-in is not configured. Set Cognito domain and client ID.");
  }

  const verifier = generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier);
  sessionStorage.setItem(PKCE_VERIFIER_KEY, verifier);
  sessionStorage.setItem(OAUTH_REDIRECT_KEY, redirectAfter);

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    scope: "openid email profile",
    redirect_uri: getOAuthRedirectUri(),
    identity_provider: "Google",
    code_challenge_method: "S256",
    code_challenge: challenge,
  });

  window.location.href = `https://${cognitoDomain}/oauth2/authorize?${params}`;
}

export async function exchangeOAuthCode(code: string): Promise<AuthUser> {
  if (!clientId || !cognitoDomain) {
    throw new Error("Google sign-in is not configured.");
  }

  const verifier = sessionStorage.getItem(PKCE_VERIFIER_KEY);
  if (!verifier) {
    throw new Error("Sign-in session expired. Please try again.");
  }

  const tokenUrl = `https://${cognitoDomain}/oauth2/token`;
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: clientId,
    code,
    redirect_uri: getOAuthRedirectUri(),
    code_verifier: verifier,
  });

  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  sessionStorage.removeItem(PKCE_VERIFIER_KEY);

  if (!res.ok) {
    const err = (await res.json().catch(() => null)) as { error_description?: string } | null;
    throw new Error(err?.error_description ?? "Could not complete Google sign-in.");
  }

  const data = (await res.json()) as { id_token?: string };
  if (!data.id_token) {
    throw new Error("No sign-in token received.");
  }

  return authUserFromIdToken(data.id_token);
}

export function consumeOAuthRedirect(): string {
  const redirect = sessionStorage.getItem(OAUTH_REDIRECT_KEY) ?? "/account";
  sessionStorage.removeItem(OAUTH_REDIRECT_KEY);
  return redirect;
}

export { cognitoRegion };
