import Link from "next/link";
import { productExploreLinks } from "@/lib/contextual-links";

/**
 * Contextual links for a product page: related collections and one delivery city.
 */
export function ExploreMoreSection({
  productSlug,
  categorySlug,
}: {
  productSlug: string;
  categorySlug?: string | null;
}) {
  const links = productExploreLinks(productSlug, categorySlug);

  return (
    <nav className="mt-10 pt-8 border-t border-slate-200" aria-labelledby="explore-more-heading">
      <h2 id="explore-more-heading" className="text-lg sm:text-xl font-bold text-primary mb-2">
        Explore More
      </h2>
      <p className="text-sm text-slate-600 mb-4 max-w-3xl">
        Browse Diwali gifts and Bhai Dooj gifts by city — festive gift combos, sweets, chocolates, and dry fruit
        hampers for USA delivery.
      </p>
      <ul className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-6">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-sm text-nav hover:underline underline-offset-2">
              {link.phrase}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
