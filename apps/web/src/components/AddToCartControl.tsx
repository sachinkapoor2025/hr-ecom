"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/cart-context";

function TrashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 11v6M14 11v6" />
    </svg>
  );
}

interface AddToCartControlProps {
  productSlug: string;
  disabled?: boolean;
  className?: string;
  fullWidth?: boolean;
}

export function AddToCartControl({ productSlug, disabled, className = "", fullWidth = true }: AddToCartControlProps) {
  const { cart, sessionReady, addItem, updateItem, removeItem } = useCart();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const quantity = cart?.items.find((i) => i.productSlug === productSlug)?.quantity ?? 0;
  const inCart = quantity > 0;

  const run = async (fn: () => Promise<void>) => {
    setError("");
    setBusy(true);
    try {
      await fn();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const stop = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  if (!inCart) {
    return (
      <div className={className}>
        {error && <p className="text-xs text-red-600 mb-1">{error}</p>}
        <button
          type="button"
          onClick={(e) => {
            stop(e);
            void run(() => addItem(productSlug));
          }}
          disabled={disabled || busy || !sessionReady}
          className={`btn-cart ${fullWidth ? "w-full" : ""} text-sm`}
        >
          {disabled ? "Out of Stock" : busy ? "Adding..." : "Add to cart"}
        </button>
      </div>
    );
  }

  return (
    <div className={className} onClick={stop}>
      {error && <p className="text-xs text-red-600 mb-1">{error}</p>}
      <div
        className={`flex items-center rounded-full bg-nav text-white font-semibold text-sm px-4 py-2.5 ${fullWidth ? "w-full" : ""}`}
      >
        <button
          type="button"
          aria-label="Decrease quantity"
          disabled={busy}
          onClick={(e) => {
            stop(e);
            void run(() => (quantity <= 1 ? removeItem(productSlug) : updateItem(productSlug, quantity - 1)));
          }}
          className="px-2 hover:opacity-80 disabled:opacity-50"
        >
          −
        </button>
        <span className="min-w-[1.5rem] text-center">{quantity}</span>
        <button
          type="button"
          aria-label="Increase quantity"
          disabled={busy || disabled}
          onClick={(e) => {
            stop(e);
            void run(() => addItem(productSlug, 1));
          }}
          className="px-2 hover:opacity-80 disabled:opacity-50"
        >
          +
        </button>
        <button
          type="button"
          aria-label="Remove from cart"
          disabled={busy}
          onClick={(e) => {
            stop(e);
            void run(() => removeItem(productSlug));
          }}
          className="ml-auto pl-3 hover:opacity-80 disabled:opacity-50"
        >
          <TrashIcon />
        </button>
      </div>
      <Link
        href="/cart"
        onClick={stop}
        className="block text-center text-nav text-sm font-semibold mt-2 hover:underline"
      >
        View Cart
      </Link>
    </div>
  );
}
