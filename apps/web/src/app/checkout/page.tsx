"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { api } from "@/lib/api";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { useSessionId, useDebouncedLeadCapture } from "@/lib/session";
import Script from "next/script";
import { LeadCaptureInput } from "@/components/LeadCaptureInput";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, refresh } = useCart();
  const { token } = useAuth();
  const sessionId = useSessionId();
  const captureLead = useDebouncedLeadCapture(sessionId);
  const [region, setRegion] = useState<"US" | "IN">("US");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    line1: "",
    city: "",
    state: "",
    postalCode: "",
    country: "US",
  });

  const update = (field: string, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (field === "name" || field === "email" || field === "phone") {
      captureLead({
        [field]: value,
        page: "/checkout",
        source: "checkout",
      });
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const country = region === "IN" ? "IN" : "US";
      const data = await api<{
        order: { orderId: string };
        clientSecret?: string;
        razorpayOrderId?: string;
        razorpayKeyId?: string;
      }>("/checkout", {
        method: "POST",
        sessionId,
        token,
        body: JSON.stringify({
          paymentRegion: region,
          shippingAddress: {
            ...form,
            country,
          },
        }),
      });

      if (region === "US" && data.clientSecret) {
        const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
        if (stripeKey && !data.clientSecret.includes("_dev_")) {
          const stripe = await loadStripe(stripeKey);
          if (stripe) {
            const { error: stripeError } = await stripe.confirmPayment({
              clientSecret: data.clientSecret,
              confirmParams: { return_url: `${window.location.origin}/orders/${data.order.orderId}` },
            });
            if (stripeError) throw new Error(stripeError.message);
          }
        } else {
          router.push(`/orders/${data.order.orderId}?dev=1`);
        }
      } else if (region === "IN" && data.razorpayOrderId) {
        if (typeof window.Razorpay === "undefined" || data.razorpayOrderId.includes("_dev_")) {
          router.push(`/orders/${data.order.orderId}?dev=1`);
        } else {
          const rzp = new window.Razorpay({
            key: data.razorpayKeyId,
            amount: (cart?.items.reduce((s, i) => s + i.price * i.quantity, 0) ?? 0) * 100,
            currency: "INR",
            order_id: data.razorpayOrderId,
            handler: () => router.push(`/orders/${data.order.orderId}`),
          });
          rzp.open();
        }
      }

      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  if (!cart?.items.length) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <p className="text-slate-600">Your cart is empty.</p>
      </div>
    );
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="mb-6 flex gap-4">
        <button
          type="button"
          onClick={() => setRegion("US")}
          className={`px-4 py-2 rounded-lg border ${region === "US" ? "border-accent bg-blue-50" : "border-slate-200"}`}
        >
          Pay with Stripe (USA)
        </button>
        <button
          type="button"
          onClick={() => setRegion("IN")}
          className={`px-4 py-2 rounded-lg border ${region === "IN" ? "border-accent bg-blue-50" : "border-slate-200"}`}
        >
          Pay with Razorpay (India)
        </button>
      </div>

      <form onSubmit={handleCheckout} className="space-y-4">
        <LeadCaptureInput label="Full name" value={form.name} onChange={(e) => update("name", e.target.value)} required />
        <LeadCaptureInput label="Email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} required />
        <LeadCaptureInput label="Phone" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
        <LeadCaptureInput label="Address" value={form.line1} onChange={(e) => update("line1", e.target.value)} required />
        <div className="grid grid-cols-2 gap-4">
          <LeadCaptureInput label="City" value={form.city} onChange={(e) => update("city", e.target.value)} required />
          <LeadCaptureInput label="State" value={form.state} onChange={(e) => update("state", e.target.value)} required />
        </div>
        <LeadCaptureInput label="Postal code" value={form.postalCode} onChange={(e) => update("postalCode", e.target.value)} required />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-cart py-3 text-base disabled:opacity-50"
        >
          {loading ? "Processing..." : "Place Order & Pay"}
        </button>
      </form>
    </div>
    </>
  );
}
