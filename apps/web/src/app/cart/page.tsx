"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";

export default function CartPage() {
  const { cart, loading, removeItem } = useCart();

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
              <li key={item.productSlug} className="py-4 flex justify-between items-center">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold">
                    {new Intl.NumberFormat(undefined, {
                      style: "currency",
                      currency: item.currency,
                    }).format(item.price * item.quantity)}
                  </span>
                  <button
                    onClick={() => removeItem(item.productSlug)}
                    className="text-red-500 text-sm hover:underline"
                  >
                    Remove
                  </button>
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
