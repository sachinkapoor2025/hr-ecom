"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { api } from "./api";
import { useSessionId } from "./session";
import { useAuth } from "./auth-context";
import type { Cart } from "@hr-ecom/shared";

interface CartContextValue {
  cart: Cart | null;
  loading: boolean;
  refresh: () => Promise<void>;
  addItem: (productSlug: string, quantity?: number) => Promise<void>;
  removeItem: (productSlug: string) => Promise<void>;
  itemCount: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const sessionId = useSessionId();
  const { token } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!sessionId) return;
    setLoading(true);
    try {
      const data = await api<{ cart: Cart }>("/cart", { sessionId, token });
      setCart(data.cart);
    } catch {
      setCart({ items: [], updatedAt: new Date().toISOString() });
    } finally {
      setLoading(false);
    }
  }, [sessionId, token]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addItem = async (productSlug: string, quantity = 1) => {
    const data = await api<{ cart: Cart }>("/cart/items", {
      method: "POST",
      sessionId,
      token,
      body: JSON.stringify({ productSlug, quantity }),
    });
    setCart(data.cart);
  };

  const removeItem = async (productSlug: string) => {
    const data = await api<{ cart: Cart }>(`/cart/items/${productSlug}`, {
      method: "DELETE",
      sessionId,
      token,
    });
    setCart(data.cart);
  };

  const itemCount = cart?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0;

  return (
    <CartContext.Provider value={{ cart, loading, refresh, addItem, removeItem, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
