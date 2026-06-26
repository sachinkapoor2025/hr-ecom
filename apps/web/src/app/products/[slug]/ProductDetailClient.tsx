"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AddToCartControl } from "@/components/AddToCartControl";
import { ProductImageGallery } from "@/components/ProductImageGallery";
import { WishlistButton } from "@/components/WishlistButton";
import { useSessionId, useDebouncedLeadCapture } from "@/lib/session";
import { trackProductView } from "@/lib/track";
import { useCurrency } from "@/lib/currency-context";
import { getDiscountPercent } from "@/lib/pricing";
import { LeadCaptureInput } from "@/components/LeadCaptureInput";
import { HomeProductCard } from "@/components/HomeProductCard";
import { useCart } from "@/lib/cart-context";
import type { Product } from "@hr-ecom/shared";

type Tab = "description" | "reviews";

function addBusinessDays(from: Date, days: number): Date {
  const date = new Date(from);
  let added = 0;
  while (added < days) {
    date.setDate(date.getDate() + 1);
    if (date.getDay() !== 0 && date.getDay() !== 6) added++;
  }
  return date;
}

function formatDeliveryDate(date: Date): string {
  return date.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

function estimatedDeliveryLabel(): string {
  const start = addBusinessDays(new Date(), 5);
  const end = addBusinessDays(new Date(), 7);
  return `${formatDeliveryDate(start)} – ${formatDeliveryDate(end)}`;
}

function shortDescription(description: string): string {
  const first = description.split(/(?<=\.)\s+/)[0]?.trim();
  return first && first.length < description.length ? first : description.slice(0, 140).trim();
}

function ShareButton({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* user cancelled or clipboard blocked */
    }
  };

  return (
    <button
      type="button"
      onClick={() => void share()}
      aria-label="Share product"
      title={copied ? "Link copied!" : "Share"}
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded border-2 border-nav bg-white text-nav hover:bg-blue-50 transition active:scale-95"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
        />
      </svg>
    </button>
  );
}

export function ProductDetailClient({
  product,
  relatedProducts = [],
}: {
  product: Product;
  relatedProducts?: Product[];
}) {
  const sessionId = useSessionId();
  const captureLead = useDebouncedLeadCapture(sessionId);
  const { cart, itemCount } = useCart();
  const { format } = useCurrency();
  const [name, setName] = useState("");
  const [tab, setTab] = useState<Tab>("description");
  const [productUrl, setProductUrl] = useState("");

  useEffect(() => {
    trackProductView(product.slug);
    setProductUrl(window.location.href);
  }, [product.slug]);

  const price = format(product.price, product.currency);
  const comparePrice =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? format(product.compareAtPrice, product.currency)
      : null;
  const discount = getDiscountPercent(product.price, product.compareAtPrice);
  const summary = shortDescription(product.description);
  const cartQuantity = cart?.items.find((i) => i.productSlug === product.slug)?.quantity ?? 0;
  const inCart = cartQuantity > 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 pb-12">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-10 items-start">
        <div>
          <ProductImageGallery images={product.images ?? []} alt={product.name} />
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-3 leading-tight">{product.name}</h1>

          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-4">
            {comparePrice && <span className="text-lg text-slate-400 line-through">{comparePrice}</span>}
            <span className="text-2xl sm:text-3xl font-bold text-primary">{price}</span>
            {discount !== null && (
              <span className="text-sm font-semibold text-green-600">{discount}% OFF</span>
            )}
          </div>

          <p className="text-slate-600 text-sm sm:text-base mb-4 leading-relaxed">{summary}</p>

          <div className="flex items-center gap-2 rounded-md bg-orange-50 border border-orange-100 px-3 py-2.5 mb-5 text-sm text-slate-700">
            <svg className="w-5 h-5 shrink-0 text-nav" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 17h8M8 17a2 2 0 11-4 0 2 2 0 014 0zm8 0a2 2 0 104 0m-4 0V9m0 0H5.5M12 9h6.5M12 9L9 5m3 4l3-4" />
            </svg>
            <span>
              <span className="font-semibold text-primary">Estimated Delivery:</span> {estimatedDeliveryLabel()}
            </span>
          </div>

          {inCart ? (
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <Link
                href="/cart"
                className="flex items-center gap-2 text-green-700 hover:text-green-800 shrink-0"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded bg-green-600 text-white">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3} aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span className="text-sm font-semibold whitespace-nowrap">
                  {itemCount} {itemCount === 1 ? "item" : "items"} in cart
                </span>
              </Link>

              <div className="flex-1 min-w-[11rem] max-w-[15rem]">
                <AddToCartControl
                  productSlug={product.slug}
                  disabled={product.inventory <= 0}
                  fullWidth
                  variant="detail"
                />
              </div>

              <div className="flex items-center gap-2 sm:ml-auto">
                <WishlistButton product={product} variant="toolbar" />
                {productUrl ? <ShareButton title={product.name} url={productUrl} /> : null}
              </div>
            </div>
          ) : (
            <div className="flex items-stretch gap-2 mb-3">
              <div className="flex-1 min-w-0">
                <AddToCartControl
                  productSlug={product.slug}
                  disabled={product.inventory <= 0}
                  fullWidth
                  variant="detail"
                />
              </div>
              <WishlistButton product={product} variant="toolbar" />
              {productUrl ? <ShareButton title={product.name} url={productUrl} /> : <div className="w-12 shrink-0" />}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled
              aria-label="Amazon Pay (coming soon)"
              className="flex h-11 items-center justify-center rounded-md bg-[#FFD814] text-[#111] font-semibold text-sm opacity-90 cursor-not-allowed"
            >
              <span className="lowercase">
                amazon <span className="font-bold">pay</span>
              </span>
            </button>
            <button
              type="button"
              disabled
              aria-label="Pay with Link (coming soon)"
              className="flex h-11 items-center justify-center gap-1.5 rounded-md bg-[#00D66F] text-white font-semibold text-sm opacity-90 cursor-not-allowed"
            >
              Pay with
              <span className="inline-flex items-center rounded bg-[#1a1f36] px-1.5 py-0.5 text-xs font-bold text-white">
                link
              </span>
            </button>
          </div>
        </div>
      </div>

      <section className="mt-10 pt-8 border-t border-slate-200">
        <div className="flex gap-6 border-b border-slate-200 mb-6">
          <button
            type="button"
            onClick={() => setTab("description")}
            className={`pb-3 text-sm font-semibold border-b-2 -mb-px transition ${
              tab === "description"
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-primary"
            }`}
          >
            Description
          </button>
          <button
            type="button"
            onClick={() => setTab("reviews")}
            className={`pb-3 text-sm font-semibold border-b-2 -mb-px transition ${
              tab === "reviews"
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-primary"
            }`}
          >
            Reviews (0)
          </button>
        </div>

        {tab === "description" ? (
          <div className="space-y-8">
            <article className="text-slate-700 leading-relaxed space-y-4 max-w-4xl">
              {product.description.split(/(?<=\.)\s+/).map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </article>

            {product.tags && product.tags.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase mb-3">Related searches</p>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <span key={tag} className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="max-w-md">
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

            {relatedProducts.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-primary mb-4">You might also like</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 items-stretch">
                  {relatedProducts.map((p) => (
                    <HomeProductCard key={p.slug} product={p} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-slate-500 text-sm">No reviews yet. Be the first to review this Rakhi after your order.</p>
        )}
      </section>
    </div>
  );
}
