"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getOrCreateSessionId } from "@/lib/session";
import { api } from "@/lib/api";

const STORAGE_KEY = "usarakhi_exit_intent_shown";

export function ExitIntentPopup() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");

  useEffect(() => {
    if (pathname.startsWith("/admin") || pathname.startsWith("/checkout")) return;
    if (sessionStorage.getItem(STORAGE_KEY)) return;

    const onMouseLeave = (e: MouseEvent) => {
      if (e.clientY > 10) return;
      if (sessionStorage.getItem(STORAGE_KEY)) return;
      sessionStorage.setItem(STORAGE_KEY, "1");
      setOpen(true);
    };

    document.addEventListener("mouseleave", onMouseLeave);
    return () => document.removeEventListener("mouseleave", onMouseLeave);
  }, [pathname]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || status !== "idle") return;
    setStatus("sending");
    const sessionId = getOrCreateSessionId();
    try {
      await api("/leads", {
        method: "POST",
        sessionId,
        body: JSON.stringify({
          sessionId,
          email: email.trim(),
          page: pathname,
          source: "newsletter",
          metadata: { offer: "first_order_10_percent", trigger: "exit_intent" },
        }),
      });
    } catch {
      /* still show thank you — lead capture is best-effort */
    }
    setStatus("done");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50" role="dialog" aria-label="Special offer">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="absolute top-3 right-3 p-1 text-slate-400 hover:text-slate-700"
          aria-label="Close"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {status === "done" ? (
          <div className="text-center py-4">
            <p className="text-lg font-bold text-primary mb-2">Thank you!</p>
            <p className="text-sm text-slate-600">
              Check your inbox for your 10% first-order offer. Order soon — Raksha Bandhan is August 28, 2026.
            </p>
            <Link
              href="/products"
              onClick={() => setOpen(false)}
              className="inline-block mt-4 rounded-md bg-primary text-white font-semibold text-sm px-5 py-2.5"
            >
              Shop Rakhis
            </Link>
          </div>
        ) : (
          <>
            <p className="text-xs font-bold uppercase tracking-wide text-nav mb-1">Before you go</p>
            <h2 className="text-xl font-bold text-primary mb-2">Get 10% off your first Rakhi order</h2>
            <p className="text-sm text-slate-600 mb-4">
              Send love to your brother in the USA. Enter your email for a welcome discount code.
            </p>
            <form onSubmit={(e) => void submit(e)} className="space-y-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-nav"
              />
              <button
                type="submit"
                disabled={status === "sending"}
                className="w-full rounded-md bg-primary text-white font-bold text-sm py-3 hover:bg-primary/90 disabled:opacity-50"
              >
                {status === "sending" ? "Sending…" : "Get my 10% off"}
              </button>
            </form>
            <p className="text-[10px] text-slate-400 mt-3 text-center">
              Free USA shipping on selected orders · 5–7 day delivery
            </p>
          </>
        )}
      </div>
    </div>
  );
}
