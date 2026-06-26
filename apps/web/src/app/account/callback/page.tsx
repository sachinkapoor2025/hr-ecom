"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { exchangeOAuthCode, consumeOAuthRedirect } from "@/lib/cognito-oauth";
import { formatAuthError } from "@/lib/cognito";

function OAuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { completeOAuthSignIn, logout } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    const oauthError = searchParams.get("error_description") ?? searchParams.get("error");
    if (oauthError) {
      setError(oauthError);
      return;
    }

    const code = searchParams.get("code");
    if (!code) {
      setError("Missing sign-in code. Please try again.");
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const authUser = await exchangeOAuthCode(code);
        if (cancelled) return;

        const redirect = consumeOAuthRedirect();
        completeOAuthSignIn(authUser);

        if (redirect.startsWith("/admin") && !authUser.isAdmin) {
          logout();
          setError("Admin access required. Your account must be in the Cognito admin group.");
          return;
        }

        router.replace(redirect);
      } catch (err) {
        if (!cancelled) setError(formatAuthError(err));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [searchParams, completeOAuthSignIn, logout, router]);

  if (error) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Sign-in failed</h1>
        <p className="text-red-500 text-sm mb-6">{error}</p>
        <Link href="/account" className="text-nav underline hover:text-primary">
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <p className="text-slate-600">Completing sign-in...</p>
    </div>
  );
}

export default function AccountCallbackPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center">Loading...</div>}>
      <OAuthCallback />
    </Suspense>
  );
}
