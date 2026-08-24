"use client";

import { useCallback, useEffect, useState } from "react";
import {
  defaultCheckoutShippingOption,
  isCheckoutShippingOptionId,
  type CheckoutShippingOptionId,
} from "@hr-ecom/shared";

const STORAGE_KEY = "hr_ecom_checkout_shipping_option";

function readStoredOption(): CheckoutShippingOptionId | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw && isCheckoutShippingOptionId(raw)) return raw;
  } catch {
    /* private mode / blocked storage */
  }
  return null;
}

function writeStoredOption(id: CheckoutShippingOptionId) {
  try {
    sessionStorage.setItem(STORAGE_KEY, id);
  } catch {
    /* ignore */
  }
}

/**
 * Cart + checkout share one shipping-speed choice (session).
 * Falls back to the catalog default when storage is empty or invalid.
 */
export function useCheckoutShippingOption(
  allowedIds: readonly CheckoutShippingOptionId[],
  cartItems?: Array<{ vendorSlug?: string | null }>
): [CheckoutShippingOptionId, (id: CheckoutShippingOptionId) => void] {
  const fallback = defaultCheckoutShippingOption(cartItems);
  const [option, setOptionState] = useState<CheckoutShippingOptionId>(fallback);

  useEffect(() => {
    const allowed = new Set(allowedIds);
    const stored = readStoredOption();
    const next =
      stored && allowed.has(stored) ? stored : allowed.has(option) ? option : fallback;
    if (next !== option) setOptionState(next);
    if (stored !== next) writeStoredOption(next);
    // Clamp when the allowed set changes (e.g. cart composition); do not depend on `option`
    // or this effect would loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- allowedIds + fallback only
  }, [allowedIds.join("|"), fallback]);

  const setOption = useCallback((id: CheckoutShippingOptionId) => {
    setOptionState(id);
    writeStoredOption(id);
  }, []);

  return [option, setOption];
}
