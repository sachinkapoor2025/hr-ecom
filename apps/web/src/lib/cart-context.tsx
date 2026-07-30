"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { api } from "./api";
import { getOrCreateSessionId, useSessionId } from "./session";
import { useAuth } from "./auth-context";
import { trackCartAdd, trackCartRemove } from "./track";
import { cartAddonSignature, type Cart } from "@hr-ecom/shared";

interface CartContextValue {
  cart: Cart | null;
  loading: boolean;
  sessionReady: boolean;
  refresh: () => Promise<void>;
  addItem: (
    productSlug: string,
    quantity?: number,
    contact?: { name?: string; email?: string; phone?: string },
    addons?: string[]
  ) => Promise<void>;
  updateItem: (lineId: string, quantity: number) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
  itemCount: number;
  /** Quantity for a product line matching the given add-on ids (sorted signature). */
  quantityFor: (productSlug: string, addonIds?: string[]) => number;
  /** lineId for product + addon signature, if present. */
  lineIdFor: (productSlug: string, addonIds?: string[]) => string | undefined;
}

const CartContext = createContext<CartContextValue | null>(null);

function normalizeCart(raw: Cart & { PK?: string; SK?: string }): Cart {
  return {
    items: raw.items ?? [],
    updatedAt: raw.updatedAt ?? new Date().toISOString(),
  };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const sessionId = useSessionId();
  const { token } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const sessionReady = Boolean(sessionId);

  const resolveSessionId = useCallback(() => sessionId || getOrCreateSessionId(), [sessionId]);

  const refresh = useCallback(async () => {
    const sid = resolveSessionId();
    if (!sid) return;
    setLoading(true);
    try {
      const data = await api<{ cart: Cart }>("/cart", { sessionId: sid, token });
      setCart(normalizeCart(data.cart));
    } catch {
      setCart({ items: [], updatedAt: new Date().toISOString() });
    } finally {
      setLoading(false);
    }
  }, [resolveSessionId, token]);

  useEffect(() => {
    if (sessionId) refresh();
  }, [sessionId, refresh]);

  const addItem = async (
    productSlug: string,
    quantity = 1,
    contact?: { name?: string; email?: string; phone?: string },
    addons?: string[]
  ) => {
    const sid = resolveSessionId();
    if (!sid) throw new Error("Session not ready — please try again");

    const data = await api<{ cart: Cart }>("/cart/items", {
      method: "POST",
      sessionId: sid,
      token,
      body: JSON.stringify({
        productSlug,
        quantity,
        ...(contact?.name ? { name: contact.name } : {}),
        ...(contact?.email ? { email: contact.email } : {}),
        ...(contact?.phone ? { phone: contact.phone } : {}),
        ...(addons?.length ? { addons } : {}),
      }),
    });
    setCart(normalizeCart(data.cart));
    const sig = cartAddonSignature((addons ?? []).map((id) => ({ id })));
    const added = data.cart.items.find(
      (i) => i.productSlug === productSlug && cartAddonSignature(i.addons) === sig
    );
    trackCartAdd(
      productSlug,
      added ? (added.price + (added.addons?.reduce((s, a) => s + a.price * a.quantity, 0) ?? 0)) * added.quantity : undefined,
      contact
    );
  };

  const removeItem = async (lineId: string) => {
    const sid = resolveSessionId();
    if (!sid) return;

    const data = await api<{ cart: Cart }>(`/cart/items/${encodeURIComponent(lineId)}`, {
      method: "DELETE",
      sessionId: sid,
      token,
    });
    setCart(normalizeCart(data.cart));
    trackCartRemove(lineId);
  };

  const updateItem = async (lineId: string, quantity: number) => {
    const sid = resolveSessionId();
    if (!sid) throw new Error("Session not ready — please try again");

    const data = await api<{ cart: Cart }>(`/cart/items/${encodeURIComponent(lineId)}`, {
      method: "PUT",
      sessionId: sid,
      token,
      body: JSON.stringify({ quantity }),
    });
    setCart(normalizeCart(data.cart));
  };

  const quantityFor = (productSlug: string, addonIds?: string[]) => {
    const sig = cartAddonSignature((addonIds ?? []).map((id) => ({ id })));
    return (
      cart?.items.find(
        (i) => i.productSlug === productSlug && cartAddonSignature(i.addons) === sig
      )?.quantity ?? 0
    );
  };

  const lineIdFor = (productSlug: string, addonIds?: string[]) => {
    const sig = cartAddonSignature((addonIds ?? []).map((id) => ({ id })));
    const item = cart?.items.find(
      (i) => i.productSlug === productSlug && cartAddonSignature(i.addons) === sig
    );
    return item?.lineId ?? (sig === "" ? item?.productSlug : undefined);
  };

  const itemCount = cart?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        sessionReady,
        refresh,
        addItem,
        updateItem,
        removeItem,
        itemCount,
        quantityFor,
        lineIdFor,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
