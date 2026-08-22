import type { ReactNode } from "react";
import { STRIPE_PAYMENTS_ENABLED } from "@hr-ecom/shared";

export type PaymentMethod = "stripe" | "razorpay";

function RazorpayIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" aria-hidden>
      <rect width="24" height="24" rx="5" fill="#072654" />
      <path
        fill="#3395FF"
        d="M6.2 16.5V7.5h2.1l2.4 5.8 2.4-5.8h2.1v9h-1.8v-6.1l-2.2 5.3h-1.2l-2.2-5.3v6.1H6.2z"
      />
    </svg>
  );
}

function StripeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" aria-hidden>
      <rect width="24" height="24" rx="5" fill="#635BFF" />
      <path
        fill="#fff"
        d="M10.2 9.8c0-.7.6-1 1.5-1 1.3 0 2.9.4 4.2 1.1V7.4c-1.4-.5-2.8-.8-4.2-.8-3.4 0-5.7 1.8-5.7 4.8 0 4.7 6.5 3.9 6.5 5.9 0 .8-.7 1.1-1.7 1.1-1.5 0-3.4-.6-4.9-1.4v2.9c1.7.7 3.3 1 4.9 1 3.5 0 5.9-1.7 5.9-4.9 0-5.1-6.6-4.1-6.6-6.1z"
      />
    </svg>
  );
}

export function paymentMethodsForCheckoutCurrency(
  checkoutCurrency: "USD" | "INR"
): PaymentMethod[] {
  const methods: PaymentMethod[] = ["razorpay"];
  if (checkoutCurrency === "USD" && STRIPE_PAYMENTS_ENABLED) methods.push("stripe");
  return methods;
}

export function PaymentMethodPicker({
  value,
  onChange,
  checkoutCurrency = "USD",
}: {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
  checkoutCurrency?: "USD" | "INR";
}) {
  const allOptions: { id: PaymentMethod; label: string; icon: ReactNode }[] = [
    { id: "razorpay", label: "Pay with Razorpay", icon: <RazorpayIcon /> },
    { id: "stripe", label: "Pay with Stripe", icon: <StripeIcon /> },
  ];

  const allowed = new Set(paymentMethodsForCheckoutCurrency(checkoutCurrency));
  const options = allOptions.filter((o) => allowed.has(o.id));

  if (options.length === 1) {
    return (
      <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 flex items-center gap-3">
        {options[0]!.icon}
        <div>
          <p className="font-semibold text-slate-900 text-sm">{options[0]!.label}</p>
          <p className="text-xs text-slate-600">Secure checkout via Razorpay</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <p className="text-xs text-slate-600 mb-3">
        Razorpay is selected by default. You can switch to Stripe if you prefer card checkout.
      </p>
      {!STRIPE_PAYMENTS_ENABLED ? (
        <p className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 mb-3">
          Stripe card payments are temporarily on hold. Please continue with Razorpay.
        </p>
      ) : null}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((option) => {
          const selected = value === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              className={`flex items-center gap-3 rounded-xl border-2 px-4 py-4 text-left transition-all ${
                selected
                  ? "border-nav bg-blue-50 shadow-sm ring-1 ring-nav/20"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
              }`}
              aria-pressed={selected}
            >
              {option.icon}
              <span className="font-semibold text-slate-900 text-sm">{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
