/**
 * List non–Orange County products missing price-bump-2026-08-22-plus3.
 * ENVIRONMENT=prod npx tsx scripts/audit-missed-price-bump.ts
 */
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { VENDOR_ORANGE_COUNTY } from "@hr-ecom/shared";

const ENV = process.env.ENVIRONMENT ?? "prod";
const TABLE = process.env.PRODUCTS_TABLE ?? `hr-ecom-products-${ENV}`;
const REGION = process.env.AWS_DEFAULT_REGION ?? process.env.AWS_REGION ?? "us-east-1";
const TAG = "price-bump-2026-08-22-plus3";

type ProductRow = {
  slug?: string;
  name?: string;
  price?: number | string;
  vendorSlug?: string;
  categorySlug?: string;
  tags?: string[];
};

function isOrangeCounty(p: ProductRow): boolean {
  return (p.vendorSlug ?? "").trim() === VENDOR_ORANGE_COUNTY;
}

function asPrice(p: ProductRow): number | null {
  if (typeof p.price === "number" && Number.isFinite(p.price)) return p.price;
  if (typeof p.price === "string" && p.price.trim() !== "") {
    const n = Number(p.price);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

async function main() {
  const doc = DynamoDBDocumentClient.from(new DynamoDBClient({ region: REGION }));
  const items: ProductRow[] = [];
  let ExclusiveStartKey: Record<string, unknown> | undefined;
  do {
    const result = await doc.send(
      new ScanCommand({ TableName: TABLE, ExclusiveStartKey })
    );
    for (const item of result.Items ?? []) {
      if (item.SK === "META" && typeof item.slug === "string") {
        items.push(item as ProductRow);
      }
    }
    ExclusiveStartKey = result.LastEvaluatedKey as Record<string, unknown> | undefined;
  } while (ExclusiveStartKey);

  const missed: { slug: string; name?: string; price: number; priceRaw: unknown }[] = [];
  let bumped = 0;
  let oc = 0;
  let invalid = 0;

  for (const p of items) {
    if (isOrangeCounty(p)) {
      oc += 1;
      continue;
    }
    const price = asPrice(p);
    if (price == null || price <= 0) {
      invalid += 1;
      continue;
    }
    const tags = Array.isArray(p.tags) ? p.tags : [];
    if (tags.includes(TAG)) {
      bumped += 1;
      continue;
    }
    missed.push({
      slug: p.slug!,
      name: p.name,
      price,
      priceRaw: p.price,
    });
  }

  missed.sort((a, b) => a.slug.localeCompare(b.slug));
  console.log(
    JSON.stringify({ table: TABLE, bumped, oc, invalid, missedCount: missed.length, missed }, null, 2)
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
