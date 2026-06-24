"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { isDevAuthEnabled, isCognitoConfigured } from "@/lib/cognito";

function AccountForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/";
  const { user, login, register, logout, isAdmin } = useAuth();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      if (mode === "login") {
        const authUser = await login(email, password);
        if (redirect.startsWith("/admin") && !authUser.isAdmin) {
          setError("Admin access required. Use an admin email in dev mode (e.g. admin@shop.com).");
          logout();
          return;
        }
        router.push(redirect);
      } else {
        await register(email, password, name);
        setMessage("Account created! Check your email to verify, then log in.");
        setMode("login");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-4">My Account</h1>
        <p className="text-slate-600 mb-2">Signed in as <strong>{user.email}</strong></p>
        {isAdmin && (
          <p className="text-sm text-green-600 mb-4">Admin access enabled</p>
        )}
        <div className="flex gap-4 mt-6">
          {isAdmin && (
            <button
              type="button"
              onClick={() => router.push("/admin")}
              className="bg-accent text-white px-6 py-2 rounded-lg"
            >
              Admin Portal
            </button>
          )}
          <button
            type="button"
            onClick={() => { logout(); router.push("/"); }}
            className="border border-slate-300 px-6 py-2 rounded-lg hover:bg-slate-50"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-2">
        {mode === "login" ? "Login" : "Create Account"}
      </h1>

      {isDevAuthEnabled() && (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6">
          Dev mode: use any email. Include <code>admin</code> in email for admin access
          (e.g. <strong>admin@shop.com</strong>).
        </p>
      )}

      {isCognitoConfigured() && (
        <p className="text-slate-600 text-sm mb-6">
          Secure login via AWS Cognito. Admin users must be in the Cognito <code>admin</code> group.
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "register" && (
          <input
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2"
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-slate-300 rounded-lg px-3 py-2"
          required
        />
        <input
          type="password"
          placeholder="Password (min 8 chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-slate-300 rounded-lg px-3 py-2"
          minLength={8}
          required
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {message && <p className="text-green-600 text-sm">{message}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-accent text-white py-3 rounded-lg font-semibold disabled:opacity-50"
        >
          {loading ? "Please wait..." : mode === "login" ? "Login" : "Register"}
        </button>
      </form>

      <button
        type="button"
        onClick={() => setMode(mode === "login" ? "register" : "login")}
        className="mt-4 text-sm text-accent underline"
      >
        {mode === "login" ? "Need an account? Register" : "Already have an account? Login"}
      </button>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center">Loading...</div>}>
      <AccountForm />
    </Suspense>
  );
}
