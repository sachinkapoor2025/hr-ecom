import type { Metadata } from "next";
import Link from "next/link";
import { api } from "@/lib/api";
import { HomeProductCard } from "@/components/HomeProductCard";
import { ProductGrid } from "@/components/ProductGrid";
import type { ProductSort } from "@/components/ProductSortBar";
import { SearchTracker } from "@/components/SearchTracker";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { pageMetadata } from "@/lib/seo";
import { loadProducts, loadProductsByCategory } from "@/lib/product-loader";
import type { Product, Category } from "@hr-ecom/shared";
import { categoryHref } from "@/lib/category-urls";
import { homeCategoryOrder } from "@/lib/site";

/** Match PDP: no ISR HTML with stale product prices. */
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface Props {
  searchParams: Promise<{ search?: string; category?: string; sort?: string }>;
}

const SORT_VALUES: ProductSort[] = ["featured", "price-asc", "price-desc", "name-asc", "name-desc"];

function resolveSort(raw?: string): ProductSort {
  return SORT_VALUES.includes(raw as ProductSort) ? (raw as ProductSort) : "featured";
}

const CATEGORY_SEO: Record<string, { title: string; description: string }> = {
  "single-rakhi": {
    title: "Single Rakhi USA — Send to Brother Online",
    description: "Shop single rakhis with roli chawal. Send Rakhi to USA — traditional, Om, pearl & designer styles. 5–7 day delivery.",
  },
  "2-set-rakhi": {
    title: "2 Set Rakhi USA — Two-Piece Rakhi Sets",
    description: "Shop 2-piece rakhi sets for brothers in the USA. Designer multi-rakhi packs with fast domestic delivery.",
  },
  "3-set-rakhi": {
    title: "3 Set Rakhi USA — Three-Piece Rakhi Sets",
    description: "Shop 3-piece rakhi sets for multiple brothers in the USA. Designer packs with fast domestic delivery.",
  },
  "4-set-rakhi": {
    title: "4 Set Rakhi USA — Four-Piece Rakhi Sets",
    description: "Shop 4-piece rakhi sets for larger families in the USA. Designer packs with fast domestic delivery.",
  },
  "5-set-rakhi": {
    title: "5 Set Rakhi USA — Five-Piece Rakhi Sets",
    description: "Shop 5-piece rakhi sets mixed from popular designer singles. Fast domestic USA delivery.",
  },
  "rakhi-combo": {
    title: "Rakhi Combo USA — Rakhi with Chocolates",
    description: "Rakhi combo sets with Ferrero Rocher, Lindt & Hershey's. Send Rakhi combo to USA with free shipping on selected orders.",
  },
  "kids-rakhi": {
    title: "Kids Rakhi USA — Cartoon & Fun Designs",
    description: "Cute kids rakhis for little brothers in USA. Soft, colorful, child-friendly designs with fast US delivery.",
  },
  "bhaiya-bhabhi-rakhi": {
    title: "Bhaiya Bhabhi Rakhi USA — Matching Sets",
    description: "Elegant Bhaiya Bhabhi Rakhi sets with Lumba for sister-in-law. Send to USA for Raksha Bandhan.",
  },
  "lumba-rakhi": {
    title: "Lumba Rakhi USA — Bracelet Rakhi for Bhabhi",
    description: "Beautiful Lumba rakhis for Bhabhi. Send Lumba Rakhi to USA with premium packaging and fast delivery.",
  },
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  if (params.search) {
    return pageMetadata({
      title: `Search: ${params.search} — Festive gifts USA`,
      description: `Search results for "${params.search}" — Diwali and Bhai Dooj gifts with USA delivery from UsaRakhi.`,
      path: `/products?search=${encodeURIComponent(params.search)}`,
    });
  }
  if (params.category && CATEGORY_SEO[params.category]) {
    const seo = CATEGORY_SEO[params.category];
    return pageMetadata({
      title: seo.title,
      description: seo.description,
      path: `/products?category=${params.category}`,
    });
  }
  return pageMetadata({
    title: "Indian Gifts to USA | Diwali & Bhai Dooj Gifts",
    description:
      "Explore gifts at UsaRakhi, including Indian sweets, chocolates, dry fruit combos and festive hampers. Find Diwali and Bhai Dooj gifts for loved ones in the USA.",
    path: "/products",
    absoluteTitle: true,
  });
}

const FESTIVAL_CATEGORY_NAMES: Record<(typeof homeCategoryOrder)[number], string> = {
  "bhai-dooj": "Bhai Dooj Combo",
  diwali: "Diwali Combo",
  "sweet-combos": "Sweet Combos",
  "dry-fruit-combos": "Dry Fruit Combos",
  "chocolate-combos": "Chocolate Combos",
  "pooja-sets": "Pooja Sets",
};

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams;
  const search = params.search;
  const category = params.category;
  const sort = resolveSort(params.sort);
  const showGrouped = !search && !category;

  let products: Product[] = [];
  let categories: Category[] = [];

  try {
    const [liveProducts, categoriesData] = await Promise.all([
      search || category ? loadProducts({ search, category }) : Promise.resolve([]),
      api<{ categories: Category[] }>("/categories", { revalidate: false }),
    ]);
    products = liveProducts;
    categories = categoriesData.categories ?? [];
  } catch {
    products = [];
    categories = [];
  }

  const categoryMap = new Map(categories.map((c) => [c.slug, c]));
  const productsByCategory = showGrouped
    ? await Promise.all(
        homeCategoryOrder.map(async (slug) => ({
          slug,
          name: categoryMap.get(slug)?.name ?? FESTIVAL_CATEGORY_NAMES[slug],
          products: await loadProductsByCategory(slug),
        }))
      )
    : [];
  const shopCategories = homeCategoryOrder.map((slug) => ({
    slug,
    name: categoryMap.get(slug)?.name ?? FESTIVAL_CATEGORY_NAMES[slug],
  }));
  const visibleCount = showGrouped
    ? productsByCategory.reduce((count, section) => count + section.products.length, 0)
    : products.length;

  const h1 = search
    ? `Search: ${search}`
    : category
      ? categories.find((c) => c.slug === category)?.name ??
        FESTIVAL_CATEGORY_NAMES[category as (typeof homeCategoryOrder)[number]] ??
        category.replace(/-/g, " ")
      : "Shop festive gifts";

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {search ? <SearchTracker query={search} resultCount={products.length} /> : null}
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          ...(category ? [{ label: h1 }] : [{ label: "Shop" }]),
        ]}
      />
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-primary">{h1}</h1>
      </div>
      {!search && !category && (
        <p className="text-slate-600 mb-8 max-w-2xl">
          Diwali and Bhai Dooj gift hampers — sweets, dry fruits, chocolates, and pooja sets, shipped within
          the United States.
        </p>
      )}

      {!search && (
        <div className="flex flex-wrap gap-2 mb-8">
          <Link
            href="/products"
            className={`px-3 py-1 rounded-full text-sm border ${!category ? "bg-nav text-white border-nav" : "border-slate-300 hover:border-nav"}`}
          >
            All
          </Link>
          {shopCategories.map((c) => (
            <Link
              key={c.slug}
              href={categoryHref(c.slug)}
              className={`px-3 py-1 rounded-full text-sm border ${category === c.slug ? "bg-nav text-white border-nav" : "border-slate-300 hover:border-nav"}`}
            >
              {c.name}
            </Link>
          ))}
        </div>
      )}

      {visibleCount === 0 ? (
        <p className="text-slate-600">No products found. Try another category or search term.</p>
      ) : showGrouped ? (
        <div className="space-y-10">
          {productsByCategory.map((section) =>
            section.products.length > 0 ? (
              <section key={section.slug}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-primary capitalize">{section.name}</h2>
                  <Link href={categoryHref(section.slug)} className="text-nav font-semibold text-sm hover:underline">
                    View All →
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 items-stretch">
                  {section.products.map((p) => (
                    <HomeProductCard key={p.slug} product={p} />
                  ))}
                </div>
              </section>
            ) : null
          )}
        </div>
      ) : (
        <ProductGrid products={products} sort={sort} />
      )}

      {showGrouped ? (
        <section className="mt-12 pt-10 border-t border-slate-200 max-w-3xl text-slate-700 leading-relaxed">
          <h2 className="text-xl font-bold text-primary mb-3">How to choose a Diwali or Bhai Dooj hamper</h2>
          <p className="mb-4">
            This shop lists ready-to-gift hampers for two festivals. Bhai Dooj combos are boxes for a brother:
            individual listings pair kaju katli, nuts, chocolates, kumkum, or a pooja set. Diwali combos pair pooja
            items — a thali, toran, rangoli, or Shubh Labh — with sweets or dry fruits. The name on each card is the
            contents of that box, not a menu you assemble yourself.
          </p>
          <p className="mb-4">
            Sweet, dry fruit, chocolate, and pooja groups collect the same hampers by what is inside, so one box can
            appear in more than one group. Open the product page for the included list. Weights and piece counts are
            only what that listing states. These hampers ship inside the United States. Orange County products on
            this shop include free shipping, and standard delivery is 5 business days.
          </p>
          <h3 className="text-lg font-semibold text-primary mb-2">A practical way to compare boxes</h3>
          <ul className="list-disc pl-5 space-y-2 mb-4">
            <li>Start with Bhai Dooj or Diwali if you already know the occasion.</li>
            <li>Use a food or pooja filter when the occasion is set and the contents are not.</li>
            <li>Mixed carts with other vendors follow the rules on the shipping page.</li>
          </ul>
          <p className="text-sm">
            <Link href={categoryHref("bhai-dooj")} className="text-nav font-semibold hover:underline">
              Bhai Dooj combos
            </Link>
            {" · "}
            <Link href={categoryHref("diwali")} className="text-nav font-semibold hover:underline">
              Diwali combos
            </Link>
            {" · "}
            <Link href={categoryHref("sweet-combos")} className="text-nav font-semibold hover:underline">
              Sweet combos
            </Link>
            {" · "}
            <Link href="/shipping" className="text-nav font-semibold hover:underline">
              Shipping
            </Link>
            {" · "}
            <Link href="/faq" className="text-nav font-semibold hover:underline">
              FAQ
            </Link>
          </p>
        </section>
      ) : null}
    </div>
  );
}
