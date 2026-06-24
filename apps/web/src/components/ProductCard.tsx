import Link from "next/link";
import type { Product } from "@hr-ecom/shared";

export function ProductCard({ product }: { product: Product }) {
  const price = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: product.currency,
  }).format(product.price);

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow bg-white"
    >
      <div className="aspect-square bg-slate-100 flex items-center justify-center text-slate-400">
        {product.images?.[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <span>No image</span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-slate-900 group-hover:text-accent">{product.name}</h3>
        <p className="text-accent font-bold mt-1">{price}</p>
      </div>
    </Link>
  );
}
