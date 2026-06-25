"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { isDevAuthEnabled, isCognitoConfigured } from "@/lib/cognito";
import { api } from "@/lib/api";
import { useSessionId } from "@/lib/session";
import type { Order } from "@hr-ecom/shared";

function AccountForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/";
  const { user, login, register, logout, isAdmin, token } = useAuth();
  const sessionId = useSessionId();

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || !token || !sessionId) return;

    const loadOrders = async () => {
      setOrdersLoading(true);
      try {
        const data = await api<{ orders: Order[] }>("/orders", { sessionId, token });
        setOrders(
          [...data.orders].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        );
      } catch {
        setOrders([]);
      } finally {
        setOrdersLoading(false);
      }
    };

    void loadOrders();
  }, [user, token, sessionId]);

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

        <section className="mt-10">
          <h2 className="text-xl font-bold mb-4">Order History</h2>
          {ordersLoading ? (
            <p className="text-slate-500 text-sm">Loading orders...</p>
          ) : orders.length === 0 ? (
            <p className="text-slate-500 text-sm">No orders yet.</p>
          ) : (
            <ul className="space-y-3">
              {orders.map((order) => (
                <li key={order.orderId} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-mono text-xs text-slate-500">{order.orderId}</p>
                      <p className="text-sm text-slate-600">
                        {new Date(order.createdAt).toLocaleDateString()} ·{" "}
                        <span className="capitalize">{order.status.replace(/_/g, " ")}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-nav">
                        {new Intl.NumberFormat(undefined, { style: "currency", currency: order.currency }).format(
                          order.total
                        )}
                      </p>
                      <Link href={`/orders/${order.orderId}`} className="text-sm text-nav hover:underline">
                        View details
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
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
