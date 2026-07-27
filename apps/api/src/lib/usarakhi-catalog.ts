/**
 * Bundled UsaRakhi catalog — auto-creates DynamoDB products when the storefront
 * lists catalog fallback items that were never imported (or were deleted).
 *
 * Same pattern as orange-county-catalog.ts for hampers.
 */
import { PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { productKeys, DEFAULT_PRODUCT_INVENTORY } from "@hr-ecom/shared";
import { docClient, PRODUCTS_TABLE, now } from "./db";
import catalogJson from "../data/usarakhi-catalog.json";

type CatalogProduct = {
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  currency: "USD" | "INR";
  categorySlug: string;
  additionalCategorySlugs?: string[];
  images: string[];
  sku?: string;
  inventory?: number;
  tags?: string[];
  seoTitle?: string;
  seoDescription?: string;
  published?: boolean;
};

const products = (catalogJson as { products: CatalogProduct[] }).products ?? [];
const bySlug = new Map(products.map((p) => [p.slug, p]));

export function getBundledUsarakhiProduct(slug: string): CatalogProduct | undefined {
  return bySlug.get(slug);
}

/**
 * If the slug exists in the bundled catalog but not in DynamoDB, create it.
 * Does not overwrite existing products (prices/inventory stay admin-controlled).
 */
export async function ensureUsarakhiCatalogProductInDb(
  slug: string
): Promise<Record<string, unknown> | null> {
  const bundled = bySlug.get(slug);
  if (!bundled) return null;

  const key = { PK: productKeys.pk(slug), SK: productKeys.sk() };
  const existing = await docClient.send(
    new GetCommand({
      TableName: PRODUCTS_TABLE,
      Key: key,
    })
  );
  if (existing.Item) return existing.Item as Record<string, unknown>;

  const ts = now();
  const categorySlug = bundled.categorySlug;
  const item = {
    name: bundled.name,
    slug: bundled.slug,
    description: bundled.description,
    price: bundled.price,
    compareAtPrice: bundled.compareAtPrice,
    currency: bundled.currency ?? "USD",
    categorySlug,
    additionalCategorySlugs: bundled.additionalCategorySlugs,
    images: bundled.images ?? [],
    sku: bundled.sku,
    inventory: bundled.inventory ?? DEFAULT_PRODUCT_INVENTORY,
    tags: bundled.tags ?? [],
    seoTitle: bundled.seoTitle,
    seoDescription: bundled.seoDescription,
    published: bundled.published !== false,
    PK: productKeys.pk(slug),
    SK: productKeys.sk(),
    GSI1PK: productKeys.gsi1pk(categorySlug),
    GSI1SK: productKeys.gsi1sk(slug),
    createdAt: ts,
    updatedAt: ts,
  };

  await docClient.send(new PutCommand({ TableName: PRODUCTS_TABLE, Item: item }));
  console.log(`upserted usarakhi catalog product ${slug}`);
  return item;
}
