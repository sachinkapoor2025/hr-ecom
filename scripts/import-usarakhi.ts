/**
 * Import categories + products from usarakhi.com (WooCommerce Store API)
 * into DynamoDB. Also writes scripts/data/usarakhi-catalog.json for local seed.
 *
 * Usage:
 *   npm run import:usarakhi -- --fetch-only           # refresh catalog JSON
 *   ENVIRONMENT=prod npm run import:usarakhi          # import to AWS (prod tables)
 */
import { writeFileSync, mkdirSync, readFileSync, existsSync } from "fs";
import { join } from "path";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { productKeys, categoryKeys, configKeys, defaultPaymentConfig } from "@hr-ecom/shared";

const CATALOG_PATH = join(process.cwd(), "scripts/data/usarakhi-catalog.json");
const WC_BASE = "https://usarakhi.com/wp-json/wc/store/v1";

const MAIN_CATEGORY_SLUGS = new Set([
  "rakhi-combo",
  "single-rakhi",
  "bhaiya-bhabhi-rakhi",
  "kids-rakhi",
  "lumba-rakhi",
]);

/** Fetch more specific categories first so duplicates keep the best assignment. */
const CATEGORY_FETCH_ORDER = [
  "single-rakhi",
  "kids-rakhi",
  "bhaiya-bhabhi-rakhi",
  "lumba-rakhi",
  "rakhi-combo",
] as const;

interface WcCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  count: number;
}

interface WcProduct {
  id: number;
  name: string;
  slug: string;
  sku: string;
  description: string;
  on_sale: boolean;
  prices: {
    price: string;
    regular_price: string;
    sale_price: string;
    currency_code: string;
    currency_minor_unit: number;
  };
  images: { src: string; alt: string }[];
  categories: { name: string; slug: string }[];
  tags: { name: string }[];
}

interface CatalogCategory {
  name: string;
  slug: string;
  description: string;
  sortOrder: number;
}

interface CatalogProduct {
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  currency: "USD" | "INR";
  categorySlug: string;
  images: string[];
  sku?: string;
  inventory: number;
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&#038;/g, "&")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function decodeEntities(text: string): string {
  return text
    .replace(/&#038;/g, "&")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#8217;/g, "'")
    .replace(/&#8211;/g, "–");
}

function toPrice(raw: string, minorUnit: number): number {
  return Number(raw) / Math.pow(10, minorUnit);
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed ${url}: ${res.status}`);
  return res.json() as Promise<T>;
}

function toCatalogProduct(p: WcProduct, fallbackCategorySlug: string): CatalogProduct {
  const minor = p.prices.currency_minor_unit ?? 2;
  const price = toPrice(p.prices.price, minor);
  const regular = toPrice(p.prices.regular_price, minor);
  const explicitCat = p.categories.find((c) => MAIN_CATEGORY_SLUGS.has(c.slug));
  const plainDesc = stripHtml(p.description);

  return {
    name: decodeEntities(p.name),
    slug: p.slug,
    description: plainDesc,
    price,
    compareAtPrice: p.on_sale && regular > price ? regular : undefined,
    currency: p.prices.currency_code === "INR" ? "INR" : "USD",
    categorySlug: explicitCat?.slug ?? fallbackCategorySlug,
    images: p.images.map((img) => img.src).filter(Boolean),
    sku: p.sku || undefined,
    inventory: 100,
    tags: p.tags.map((t) => t.name),
    seoTitle: decodeEntities(p.name),
    seoDescription: plainDesc.slice(0, 160),
  };
}

async function fetchCatalog(): Promise<{ categories: CatalogCategory[]; products: CatalogProduct[] }> {
  const wcCategories = await fetchJson<WcCategory[]>(`${WC_BASE}/products/categories?per_page=100`);
  const categories: CatalogCategory[] = wcCategories
    .filter((c) => MAIN_CATEGORY_SLUGS.has(c.slug) && c.count > 0)
    .map((c, i) => ({
      name: decodeEntities(c.name),
      slug: c.slug,
      description: stripHtml(c.description || ""),
      sortOrder: i + 1,
    }));

  const activeSlugs = new Set(categories.map((c) => c.slug));
  const productMap = new Map<string, CatalogProduct>();

  for (const catSlug of CATEGORY_FETCH_ORDER) {
    if (!activeSlugs.has(catSlug)) continue;

    for (let page = 1; page <= 5; page++) {
      const batch = await fetchJson<WcProduct[]>(
        `${WC_BASE}/products?category=${catSlug}&per_page=100&page=${page}`
      );
      if (batch.length === 0) break;

      for (const p of batch) {
        if (productMap.has(p.slug)) continue;
        productMap.set(p.slug, toCatalogProduct(p, catSlug));
      }
    }
  }

  return { categories, products: Array.from(productMap.values()) };
}

function getDocClient() {
  const endpoint = process.env.DYNAMODB_ENDPOINT;
  const client = new DynamoDBClient({
    region: process.env.AWS_REGION ?? "us-east-1",
    ...(endpoint
      ? { endpoint, credentials: { accessKeyId: "local", secretAccessKey: "local" } }
      : {}),
  });
  return DynamoDBDocumentClient.from(client);
}

async function importToDb(catalog: { categories: CatalogCategory[]; products: CatalogProduct[] }) {
  const ENV = process.env.ENVIRONMENT ?? "dev";
  const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE ?? `hr-ecom-products-${ENV}`;
  const CONFIG_TABLE = process.env.CONFIG_TABLE ?? `hr-ecom-config-${ENV}`;
  const docClient = getDocClient();
  const timestamp = new Date().toISOString();

  for (const cat of catalog.categories) {
    await docClient.send(
      new PutCommand({
        TableName: PRODUCTS_TABLE,
        Item: {
          ...cat,
          published: true,
          PK: categoryKeys.pk(cat.slug),
          SK: categoryKeys.sk(),
          createdAt: timestamp,
          updatedAt: timestamp,
        },
      })
    );
  }

  for (const p of catalog.products) {
    await docClient.send(
      new PutCommand({
        TableName: PRODUCTS_TABLE,
        Item: {
          ...p,
          published: true,
          PK: productKeys.pk(p.slug),
          SK: productKeys.sk(),
          GSI1PK: productKeys.gsi1pk(p.categorySlug),
          GSI1SK: productKeys.gsi1sk(p.slug),
          createdAt: timestamp,
          updatedAt: timestamp,
        },
      })
    );
  }

  await docClient.send(
    new PutCommand({
      TableName: CONFIG_TABLE,
      Item: {
        PK: configKeys.payments.pk,
        SK: configKeys.payments.sk,
        ...defaultPaymentConfig,
        updatedAt: timestamp,
      },
    })
  );

  console.log(`Imported ${catalog.categories.length} categories, ${catalog.products.length} products → ${PRODUCTS_TABLE}`);
}

async function main() {
  const fetchOnly = process.argv.includes("--fetch-only");
  const refresh = process.argv.includes("--refresh");

  let catalog: Awaited<ReturnType<typeof fetchCatalog>>;

  if (!refresh && existsSync(CATALOG_PATH)) {
    catalog = JSON.parse(readFileSync(CATALOG_PATH, "utf-8"));
    console.log(`Using cached catalog: ${catalog.products.length} products`);
  } else {
    console.log("Fetching catalog from usarakhi.com...");
    catalog = await fetchCatalog();
    mkdirSync(join(process.cwd(), "scripts/data"), { recursive: true });
    writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 2));
    console.log(`Saved ${CATALOG_PATH} (${catalog.products.length} products)`);
  }

  if (!fetchOnly) {
    await importToDb(catalog);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
