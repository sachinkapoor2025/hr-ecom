"use client";

import { useMemo, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";

type StripePaymentFormProps = {
  clientSecret: string;
  returnUrl: string;
  amountLabel: string;
  onError: (message: string) => void;
  /** Called when the card is confirmed without a redirect (no 3-D Secure hop). */
  onComplete?: (paymentIntentId: string) => Promise<void>;
};

function StripePayButton({
  returnUrl,
  amountLabel,
  onError,
  onComplete,
}: {
  returnUrl: string;
  amountLabel: string;
  onError: (message: string) => void;
  onComplete?: (paymentIntentId: string) => Promise<void>;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);

  const handlePay = async () => {
    if (!stripe || !elements) return;
    setPaying(true);
    onError("");
    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: returnUrl },
        redirect: "if_required",
      });
      if (error) {
        onError(error.message ?? "Payment failed. Please try another card or pay with Razorpay.");
        return;
      }

      if (
        paymentIntent &&
        (paymentIntent.status === "succeeded" ||
          paymentIntent.status === "processing" ||
          paymentIntent.status === "requires_capture")
      ) {
        await onComplete?.(paymentIntent.id);
        return;
      }

      onError("Payment was not completed. Please try again or pay with Razorpay.");
    } catch (err) {
      onError(err instanceof Error ? err.message : "Payment failed. Please try again.");
    } finally {
      setPaying(false);
    }
  };

  return (
    <button
      type="button"
      onClick={() => void handlePay()}
      disabled={!stripe || !elements || paying}
      className="w-full py-3.5 rounded-lg bg-nav text-white font-bold hover:opacity-95 disabled:opacity-50 transition-opacity"
    >
      {paying ? "Processing…" : `Pay ${amountLabel} with Stripe`}
    </button>
  );
}

export function StripePaymentForm({
  clientSecret,
  returnUrl,
  amountLabel,
  onError,
  onComplete,
}: StripePaymentFormProps) {
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim();
  const stripePromise = useMemo(
    () => (publishableKey ? loadStripe(publishableKey) : null),
    [publishableKey]
  );

  if (!publishableKey || !stripePromise) {
    return (
      <p className="text-red-500 text-sm">
        Stripe is not configured. Please pay with Razorpay.
      </p>
    );
  }

  return (
    <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 space-y-4">
      <p className="text-sm font-semibold text-slate-800">Complete card payment</p>
      <Elements key={clientSecret} stripe={stripePromise} options={{ clientSecret }}>
        <PaymentElement options={{ layout: "tabs" }} />
        <div className="pt-4">
          <StripePayButton
            returnUrl={returnUrl}
            amountLabel={amountLabel}
            onError={onError}
            onComplete={onComplete}
          />
        </div>
      </Elements>
    </div>
  );
}
