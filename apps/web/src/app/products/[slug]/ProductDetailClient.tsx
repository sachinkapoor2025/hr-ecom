"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AddToCartControl } from "@/components/AddToCartControl";
import { ProductImageGallery } from "@/components/ProductImageGallery";
import { WishlistButton } from "@/components/WishlistButton";
import { useSessionId, useDebouncedLeadCapture } from "@/lib/session";
import { trackProductView } from "@/lib/track";
import { useCurrency } from "@/lib/currency-context";
import { LeadCaptureInput } from "@/components/LeadCaptureInput";
import type { Product } from "@hr-ecom/shared";

export function ProductDetailClient({ product }: { product: Product }) {
  const sessionId = useSessionId();
  const captureLead = useDebouncedLeadCapture(sessionId);
  const { format } = useCurrency();
  const [name, setName] = useState("");

  useEffect(() => {
    trackProductView(product.slug);
  }, [product.slug]);

  const price = format(product.price, product.currency);

  const comparePrice =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? format(product.compareAtPrice, product.currency)
      : null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 pb-12">
      <div className="grid md:grid-cols-2 gap-10">
        <div className="relative">
          <WishlistButton product={product} className="top-3 right-3 z-10" />
          <ProductImageGallery images={product.images ?? []} alt={product.name} />
        </div>
        <div>
          <p className="text-sm text-nav font-medium mb-2 capitalize">
            <Link href={`/categories/${product.categorySlug}`} className="hover:underline">
              {product.categorySlug.replace(/-/g, " ")}
            </Link>
          </p>
          <h1 className="text-3xl font-bold mb-3">{product.name}</h1>
          <div className="flex items-baseline gap-3 mb-6">
            <p className="text-2xl font-bold text-accent">{price}</p>
            {comparePrice && <p className="text-lg text-slate-400 line-through">{comparePrice}</p>}
          </div>

          <article className="text-slate-700 mb-6 leading-relaxed space-y-3">
            {product.description.split(/(?<=\.)\s+/).map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </article>

          {product.tags && product.tags.length > 0 && (
            <div className="mb-6">
              <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Related searches</p>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span key={tag} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <p className="text-sm text-slate-500 mb-6">
            ✓ Delivered to all 50 US states in 5–7 days &nbsp;·&nbsp; ✓ Roli chawal included on most rakhis
          </p>

          <div className="mb-6 max-w-sm">
            <LeadCaptureInput
              label="Your name (helps us assist you)"
              placeholder="Start typing your name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              onDebouncedChange={(value) =>
                captureLead({
                  name: value,
                  page: `/products/${product.slug}`,
                  productSlug: product.slug,
                  source: "product",
                })
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
    </div>
  );
}
