import type { ReactNode } from "react";

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

export function paymentMethodsForCheckoutCurrency(
  checkoutCurrency: "USD" | "INR"
): PaymentMethod[] {
  void checkoutCurrency;
  return ["razorpay"];
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
  ];

  const allowed = new Set(paymentMethodsForCheckoutCurrency(checkoutCurrency));
  const options = allOptions.filter((o) => allowed.has(o.id));

  return (
    <div className="mb-6">
      <div className="grid grid-cols-1 gap-3">
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
