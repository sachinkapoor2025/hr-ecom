import Link from "next/link";
import { navItems } from "@/lib/site";
import type { Product } from "@hr-ecom/shared";

function splitParagraphs(text: string): string[] {
  const parts = text
    .split(/\n\s*\n|\r\n\r\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length > 1) return parts;
  return text
    .split(/(?<=\.)\s+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function categoryLabel(slug: string): string {
  const match = navItems.find((item) => "category" in item && item.category === slug);
  if (match) return match.label;
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function ProductDescriptionSection({ product }: { product: Product }) {
  const paragraphs = splitParagraphs(product.description);
  const label = categoryLabel(product.categorySlug);

  return (
    <section className="mt-10 pt-8 border-t border-slate-200">
      <h2 className="text-xl sm:text-2xl font-bold text-primary mb-4">{product.name}</h2>
      <div className="text-slate-700 max-w-3xl space-y-4 leading-relaxed">
        {paragraphs.map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>
      <p className="mt-5 text-sm text-slate-500">
        Category:{" "}
        <Link href={`/categories/${product.categorySlug}`} className="text-nav font-medium hover:underline">
          {label}
        </Link>
      </p>
    </section>
  );
}
