"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { api } from "@/lib/api";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { useSessionId, useDebouncedLeadCapture } from "@/lib/session";
import { trackCheckoutStart, trackPurchase } from "@/lib/track";
import Script from "next/script";
import { LeadCaptureInput } from "@/components/LeadCaptureInput";
import { PaymentMethodPicker, type PaymentMethod } from "@/components/PaymentMethodPicker";
import type { Order } from "@hr-ecom/shared";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: (response: { error?: { description?: string } }) => void) => void;
    };
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, loading: cartLoading, refresh } = useCart();
  const { token } = useAuth();
  const sessionId = useSessionId();
  const captureLead = useDebouncedLeadCapture(sessionId);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("razorpay");
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

  const checkoutTracked = useRef(false);
  useEffect(() => {
    if (checkoutTracked.current || !cart?.items.length) return;
    checkoutTracked.current = true;
    const value = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    trackCheckoutStart(value);
  }, [cart]);

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

  const openRazorpayCheckout = async (order: Order, razorpayOrderId: string, razorpayKeyId?: string) => {
    const key = razorpayKeyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    if (!key || razorpayOrderId.includes("_dev_")) {
      trackPurchase(order.total, { orderId: order.orderId, provider: "razorpay_dev" });
      await refresh();
      router.push(`/orders/${order.orderId}?dev=1`);
      return;
    }

    if (typeof window.Razorpay === "undefined") {
      throw new Error("Razorpay checkout failed to load. Please refresh and try again.");
    }

    await new Promise<void>((resolve, reject) => {
      const rzp = new window.Razorpay({
        key,
        amount: Math.round(order.total * 100),
        currency: order.currency,
        name: "UsaRakhi",
        description: `Order ${order.orderId.slice(0, 8)}`,
        order_id: razorpayOrderId,
        prefill: {
          name: form.name,
          email: form.email,
          contact: form.phone || undefined,
        },
        theme: { color: "#183a68" },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            await api("/payments/razorpay/verify", {
              method: "POST",
              sessionId,
              token,
              body: JSON.stringify({
                orderId: order.orderId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });
            trackPurchase(order.total, { orderId: order.orderId, provider: "razorpay" });
            await refresh();
            resolve();
            router.push(`/orders/${order.orderId}`);
          } catch (verifyErr) {
            reject(verifyErr);
          }
        },
        modal: {
          ondismiss: () => reject(new Error("Payment cancelled")),
        },
      });

      rzp.on("payment.failed", (response) => {
        reject(new Error(response.error?.description ?? "Payment failed"));
      });

      rzp.open();
    });
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await api<{
        order: Order;
        clientSecret?: string;
        razorpayOrderId?: string;
        razorpayKeyId?: string;
      }>("/checkout", {
        method: "POST",
        sessionId,
        token,
        body: JSON.stringify({
          paymentMethod,
          shippingAddress: {
            ...form,
            country: form.country || "US",
          },
        }),
      });

      if (paymentMethod === "stripe") {
        const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
        if (stripeKey && data.clientSecret && !data.clientSecret.includes("_dev_")) {
          const stripe = await loadStripe(stripeKey);
          if (stripe) {
            const { error: stripeError } = await stripe.confirmPayment({
              clientSecret: data.clientSecret,
              confirmParams: { return_url: `${window.location.origin}/orders/${data.order.orderId}` },
            });
            if (stripeError) throw new Error(stripeError.message);
            return;
          }
        }
        trackPurchase(data.order.total, { orderId: data.order.orderId, provider: "stripe_dev" });
        await refresh();
        router.push(`/orders/${data.order.orderId}?dev=1`);
        return;
      }

      if (!data.razorpayOrderId) {
        throw new Error("Razorpay could not be started. Check payment configuration and try again.");
      }

      await openRazorpayCheckout(data.order, data.razorpayOrderId, data.razorpayKeyId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  if (cartLoading) {
    return <div className="max-w-lg mx-auto px-4 py-16 text-center text-slate-600">Loading cart...</div>;
  }

  if (!cart?.items.length) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <p className="text-slate-600">Your cart is empty.</p>
      </div>
    );
  }

  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const currency = cart.items[0]?.currency ?? "USD";

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-2">Checkout</h1>
        <p className="text-slate-600 mb-6">
          Total:{" "}
          <span className="font-bold text-nav">
            {new Intl.NumberFormat(undefined, { style: "currency", currency }).format(subtotal)}
          </span>
        </p>

        <p className="text-sm font-semibold text-slate-700 mb-3">Choose payment method</p>
        <PaymentMethodPicker value={paymentMethod} onChange={setPaymentMethod} />

        <form onSubmit={handleCheckout} className="space-y-4">
          <LeadCaptureInput
            label="Full name"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            required
          />
          <LeadCaptureInput
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            required
          />
          <LeadCaptureInput label="Phone" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
          <LeadCaptureInput
            label="Address"
            value={form.line1}
            onChange={(e) => update("line1", e.target.value)}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <LeadCaptureInput label="City" value={form.city} onChange={(e) => update("city", e.target.value)} required />
            <LeadCaptureInput
              label="State"
              value={form.state}
              onChange={(e) => update("state", e.target.value)}
              required
            />
          </div>
          <LeadCaptureInput
            label="Postal code"
            value={form.postalCode}
            onChange={(e) => update("postalCode", e.target.value)}
            required
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button type="submit" disabled={loading} className="w-full btn-cart py-3 text-base disabled:opacity-50">
            {loading ? "Processing..." : paymentMethod === "razorpay" ? "Pay with Razorpay" : "Pay with Stripe"}
          </button>
        </form>
      </div>
    </>
  );
}
