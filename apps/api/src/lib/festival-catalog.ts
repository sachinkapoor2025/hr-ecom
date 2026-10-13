/**
 * Festival 2026 hampers are the storefront fallback catalog
 * (scripts/data/festival-2026.json). Cart and product detail must resolve
 * the same slugs. Existing DynamoDB rows are never updated.
 *
 * The Lambda bundle inlines apps/api/src/data/festival-2026.json because
 * esbuild rewrites __dirname to the build machine path, so a file copied
 * next to the handler is not visible through __dirname alone.
 */
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { productKeys } from "@hr-ecom/shared";
import { docClient, PRODUCTS_TABLE, now } from "./db";
import catalogJson from "../data/festival-2026.json";

type FestivalProduct = {
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
  vendorSlug?: string;
  vendorCost?: number;
  seoTitle?: string;
  seoDescription?: string;
  published?: boolean;
  weightOz?: number;
  lengthIn?: number;
  widthIn?: number;
  heightIn?: number;
};

let bySlug: Map<string, FestivalProduct> | null = null;

function productsBySlug(data: { products?: FestivalProduct[] } | null | undefined): Map<string, FestivalProduct> {
  return new Map(
    (data?.products ?? []).filter((product) => product.slug).map((product) => [product.slug, product])
  );
}

/** Inlined by esbuild so add-to-cart works when the Lambda filesystem copy is missing. */
const importedBySlug = productsBySlug(catalogJson as { products?: FestivalProduct[] });

export function festivalCatalogPaths(): string[] {
  const lambdaRoot = process.env.LAMBDA_TASK_ROOT?.trim();
  return [
    ...(lambdaRoot ? [join(lambdaRoot, "festival-2026.json")] : []),
    join(process.cwd(), "festival-2026.json"),
    join(__dirname, "festival-2026.json"),
    join(process.cwd(), "scripts/data/festival-2026.json"),
    join(process.cwd(), "../scripts/data/festival-2026.json"),
    join(process.cwd(), "../../scripts/data/festival-2026.json"),
    join(process.cwd(), "../../../scripts/data/festival-2026.json"),
    join(process.cwd(), "apps/api/src/data/festival-2026.json"),
    join(process.cwd(), "../apps/api/src/data/festival-2026.json"),
  ];
}

function loadBySlug(): Map<string, FestivalProduct> {
  if (bySlug) return bySlug;
  const path = festivalCatalogPaths().find((candidate) => existsSync(candidate));
  if (path) {
    const data = JSON.parse(readFileSync(path, "utf8")) as { products?: FestivalProduct[] };
    const fromDisk = productsBySlug(data);
    if (fromDisk.size > 0) {
      bySlug = fromDisk;
      return bySlug;
    }
  }
  bySlug = importedBySlug;
  return bySlug;
}

export function getBundledFestivalProduct(slug: string): FestivalProduct | undefined {
  return loadBySlug().get(slug);
}

function isConditionalCheckFailed(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "name" in err &&
    (err as { name?: string }).name === "ConditionalCheckFailedException"
  );
}

/**
 * Return the stored product when it already exists.
 * Insert the bundled festival row only when the slug is missing.
 */
export async function ensureFestivalProductInDb(
  slug: string
): Promise<Record<string, unknown> | null> {
  const bundled = getBundledFestivalProduct(slug);
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
    inventory: bundled.inventory ?? 0,
    tags: bundled.tags ?? [],
    vendorSlug: bundled.vendorSlug,
    vendorCost: bundled.vendorCost,
    seoTitle: bundled.seoTitle,
    seoDescription: bundled.seoDescription,
    published: bundled.published !== false,
    weightOz: bundled.weightOz,
    lengthIn: bundled.lengthIn,
    widthIn: bundled.widthIn,
    heightIn: bundled.heightIn,
    PK: productKeys.pk(slug),
    SK: productKeys.sk(),
    GSI1PK: productKeys.gsi1pk(categorySlug),
    GSI1SK: productKeys.gsi1sk(slug),
    createdAt: ts,
    updatedAt: ts,
  };

  try {
    await docClient.send(
      new PutCommand({
        TableName: PRODUCTS_TABLE,
        Item: item,
        ConditionExpression: "attribute_not_exists(PK)",
      })
    );
  } catch (err) {
    if (!isConditionalCheckFailed(err)) throw err;
    const raced = await docClient.send(
      new GetCommand({
        TableName: PRODUCTS_TABLE,
        Key: key,
      })
    );
    return (raced.Item as Record<string, unknown> | undefined) ?? null;
  }

  return item;
}
