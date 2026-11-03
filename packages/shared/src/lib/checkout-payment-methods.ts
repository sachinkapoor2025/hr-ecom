import { STRIPE_PAYMENTS_ENABLED } from "../constants";

export type CheckoutPaymentMethod = "stripe" | "razorpay";

/**
 * Checkout gateways by shop currency.
 * Razorpay stays available for USD and INR. Stripe is an extra USD card option.
 * Stripe is never the only method while Razorpay checkout is enabled.
 */
export function paymentMethodsForCheckoutCurrency(
  checkoutCurrency: "USD" | "INR"
): CheckoutPaymentMethod[] {
  const methods: CheckoutPaymentMethod[] = ["razorpay"];
  if (checkoutCurrency === "USD" && STRIPE_PAYMENTS_ENABLED) {
    methods.push("stripe");
  }
  return methods;
}
