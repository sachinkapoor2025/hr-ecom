"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/cart-context";

function CartQuantityControls({ productSlug, quantity }: { productSlug: string; quantity: number }) {
  const { addItem, updateItem, removeItem } = useCart();
  const [busy, setBusy] = useState(false);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    try {
      await fn();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center rounded-full border border-slate-200 text-sm font-semibold">
      <button
        type="button"
        disabled={busy}
        aria-label="Decrease quantity"
        onClick={() => void run(() => (quantity <= 1 ? removeItem(productSlug) : updateItem(productSlug, quantity - 1)))}
        className="px-3 py-1.5 hover:bg-slate-50 disabled:opacity-50"
      >
        −
      </button>
      <span className="min-w-[2rem] text-center">{quantity}</span>
      <button
        type="button"
        disabled={busy}
        aria-label="Increase quantity"
        onClick={() => void run(() => addItem(productSlug, 1))}
        className="px-3 py-1.5 hover:bg-slate-50 disabled:opacity-50"
      >
        +
      </button>
      <button
        type="button"
        disabled={busy}
        aria-label="Remove item"
        onClick={() => void run(() => removeItem(productSlug))}
        className="px-3 py-1.5 text-red-500 hover:bg-red-50 disabled:opacity-50 border-l border-slate-200"
      >
        ×
      </button>
    </div>
  );
}

export default function CartPage() {
  const { cart, loading } = useCart();

  if (loading) return <div className="p-10 text-center">Loading cart...</div>;

  const items = cart?.items ?? [];
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const currency = items[0]?.currency ?? "USD";

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-600 mb-4">Your cart is empty.</p>
          <Link href="/products" className="text-nav underline">
            Continue shopping
          </Link>
        </div>
      ) : (
        <>
          <ul className="divide-y divide-slate-200 mb-8">
            {items.map((item) => (
              <li key={item.productSlug} className="py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-slate-500 mt-1">
                    {new Intl.NumberFormat(undefined, {
                      style: "currency",
                      currency: item.currency,
                    }).format(item.price)}{" "}
                    each
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <CartQuantityControls productSlug={item.productSlug} quantity={item.quantity} />
                  <span className="font-semibold min-w-[5rem] text-right">
                    {new Intl.NumberFormat(undefined, {
                      style: "currency",
                      currency: item.currency,
                    }).format(item.price * item.quantity)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
          <div className="flex justify-between items-center border-t pt-4">
            <span className="text-lg font-bold">Total</span>
            <span className="text-xl font-bold text-nav">
              {new Intl.NumberFormat(undefined, { style: "currency", currency }).format(total)}
            </span>
          </div>
          <Link href="/checkout" className="mt-6 block text-center btn-cart py-3 text-base">
            Proceed to Checkout
          </Link>
        </>
      )}
    </div>
  );
}
