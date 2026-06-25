"use client";

import { useState } from "react";
import { AddToCartControl } from "@/components/AddToCartControl";
import { useSessionId, useDebouncedLeadCapture } from "@/lib/session";
import { LeadCaptureInput } from "@/components/LeadCaptureInput";
import type { Product } from "@hr-ecom/shared";

export function ProductDetailClient({ product }: { product: Product }) {
  const sessionId = useSessionId();
  const captureLead = useDebouncedLeadCapture(sessionId);
  const [name, setName] = useState("");

  const price = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: product.currency,
  }).format(product.price);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-10">
      <div className="aspect-square bg-slate-100 rounded-xl flex items-center justify-center">
        {product.images?.[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover rounded-xl" />
        ) : (
          <span className="text-slate-400">No image</span>
        )}
      </div>
      <div>
        <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
        <p className="text-2xl font-bold text-accent mb-6">{price}</p>
        <p className="text-slate-600 mb-8">{product.description}</p>

        <div className="mb-6 max-w-sm">
          <LeadCaptureInput
            label="Your name (helps us assist you)"
            placeholder="Start typing your name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            onDebouncedChange={(value) =>
              captureLead({ name: value, page: `/products/${product.slug}`, productSlug: product.slug, source: "product" })
            }
          />
        </div>

        <AddToCartControl
          productSlug={product.slug}
          disabled={product.inventory <= 0}
          fullWidth={false}
          className="inline-block"
        />
      </div>
    </div>
  );
}
