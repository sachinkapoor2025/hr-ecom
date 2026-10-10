/**
 * Reprice catalog:
 *   Orange County → vendorCost × 1.35 (35% markup), free shipping (code)
 *   UsaRakhi → $1.99 single / $2.50 set of 2 / $2.99 set of 3 / $4.99 chocolate
 *
 * Does not touch product images.
 *
 *   ENVIRONMENT=prod npx tsx scripts/apply-catalog-price-reset.ts --dry-run
 *   ENVIRONMENT=prod npx tsx scripts/apply-catalog-price-reset.ts --apply
 *
 * Requires AWS creds. Never commit keys.
 */
import { existsSync, readFileSync } from "fs";
import { join, resolve } from "path";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import {
  VENDOR_ORANGE_COUNTY,
  pricingFromVendorCost,
  productKeys,
  resolveUsarakhiCatalogPriceUsd,
} from "@hr-ecom/shared";

const ENV = process.env.ENVIRONMENT ?? "prod";
const TABLE = process.env.PRODUCTS_TABLE ?? `hr-ecom-products-${ENV}`;
const REGION = process.env.AWS_DEFAULT_REGION ?? process.env.AWS_REGION ?? "us-east-1";
const APPLY = process.argv.includes("--apply");
const IDEMPOTENCY_TAG = "price-reset-2026-08-28-oc135-usa-tiers";

type ProductRow = {
  slug?: string;
  name?: string;
  description?: string;
  price?: number;
  compareAtPrice?: number;
  currency?: string;
  categorySlug?: string;
  additionalCategorySlugs?: string[];
  tags?: string[];
  vendorSlug?: string;
  vendorCost?: number;
  images?: string[];
  PK?: string;
  SK?: string;
};

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}

function isOrangeCounty(p: ProductRow): boolean {
  if ((p.vendorSlug ?? "").trim() === VENDOR_ORANGE_COUNTY) return true;
  return (p.images ?? []).some((src) => src.includes("/uploads/orange-county/"));
}

/** Local catalog vendor costs (used when Dynamo rows are missing vendorCost). */
function loadCatalogVendorCosts(): Map<string, number> {
  const root = resolve(process.cwd());
  const files = [
    join(root, "scripts/data/orange-county-hampers.json"),
    join(root, "scripts/data/orange-county-single-rakhi-2026.json"),
    join(root, "apps/api/src/data/orange-county-hampers.json"),
  ];
  const costs = new Map<string, number>();
  for (const file of files) {
    if (!existsSync(file)) continue;
    const parsed = JSON.parse(readFileSync(file, "utf8")) as {
      products?: Array<{ slug?: string; vendorCost?: number }>;
    };
    for (const row of parsed.products ?? []) {
      const slug = row.slug?.trim();
      const cost = row.vendorCost;
      if (!slug || typeof cost !== "number" || cost <= 0) continue;
      if (!costs.has(slug)) costs.set(slug, cost);
    }
  }
  return costs;
}

function resolveOrangeCountyCost(
  p: ProductRow,
  catalogCosts: Map<string, number>
): { cost: number; source: "dynamo" | "catalog" | "inferred-2x" } | null {
  if (typeof p.vendorCost === "number" && p.vendorCost > 0) {
    return { cost: p.vendorCost, source: "dynamo" };
  }
  const fromCatalog = p.slug ? catalogCosts.get(p.slug) : undefined;
  if (typeof fromCatalog === "number" && fromCatalog > 0) {
    return { cost: fromCatalog, source: "catalog" };
  }
  // Previous OC sale markup was 2.0 — infer wholesale if that is all we have.
  if (typeof p.price === "number" && p.price > 0) {
    return { cost: roundMoney(p.price / 2), source: "inferred-2x" };
  }
  return null;
}

async function scanProducts(
  doc: DynamoDBDocumentClient
): Promise<ProductRow[]> {
  const items: ProductRow[] = [];
  let ExclusiveStartKey: Record<string, unknown> | undefined;
  do {
    const page = await doc.send(
      new ScanCommand({
        TableName: TABLE,
        ExclusiveStartKey,
      })
    );
    for (const item of page.Items ?? []) {
      if (item.SK === "META" && typeof item.slug === "string") {
        items.push(item as ProductRow);
      }
    }
    ExclusiveStartKey = page.LastEvaluatedKey as Record<string, unknown> | undefined;
  } while (ExclusiveStartKey);
  return items;
}

async function main() {
  if (!APPLY && !process.argv.includes("--dry-run")) {
    console.error("Pass --dry-run or --apply");
    process.exit(1);
  }

  const doc = DynamoDBDocumentClient.from(new DynamoDBClient({ region: REGION }), {
    marshallOptions: { removeUndefinedValues: true },
  });
  const ts = new Date().toISOString();
  console.log(`${APPLY ? "APPLY" : "DRY-RUN"} ${TABLE} (${REGION})`);

  const items = await scanProducts(doc);
  const catalogCosts = loadCatalogVendorCosts();
  const counts = {
    scanned: items.length,
    ocUpdated: 0,
    ocSkippedNoCost: 0,
    ocCostFromCatalog: 0,
    ocCostInferred: 0,
    usaUpdated: 0,
    usaSkipped: 0,
    unchanged: 0,
    invalid: 0,
  };
  const usaTiers: Record<string, number> = {};

  for (const p of items) {
    const slug = p.slug ?? "";
    if (!slug) {
      counts.invalid += 1;
      continue;
    }

    const tags = Array.from(new Set([...(Array.isArray(p.tags) ? p.tags : []), IDEMPOTENCY_TAG]));
    let nextPrice: number | null = null;
    let nextCompare: number | null = null;
    let nextVendorCost: number | undefined;
    let kind = "";

    if (isOrangeCounty(p)) {
      const resolved = resolveOrangeCountyCost(p, catalogCosts);
      if (!resolved) {
        counts.ocSkippedNoCost += 1;
        console.log(`SKIP OC (no vendorCost) ${slug} price=$${p.price}`);
        continue;
      }
      if (resolved.source === "catalog") counts.ocCostFromCatalog += 1;
      if (resolved.source === "inferred-2x") counts.ocCostInferred += 1;
      const priced = pricingFromVendorCost(resolved.cost, "USD");
      nextPrice = priced.price;
      nextCompare = Math.max(priced.compareAtPrice, p.compareAtPrice ?? 0, p.price ?? 0);
      if (resolved.source !== "dynamo") nextVendorCost = priced.vendorCost;
      kind = "oc";
    } else {
      nextPrice = resolveUsarakhiCatalogPriceUsd(p);
      if (nextPrice == null) {
        counts.usaSkipped += 1;
        continue;
      }
      nextCompare =
        typeof p.compareAtPrice === "number" && p.compareAtPrice > nextPrice
          ? roundMoney(p.compareAtPrice)
          : typeof p.price === "number" && p.price > nextPrice
            ? roundMoney(p.price)
            : roundMoney(nextPrice * 1.5);
      kind = "usa";
      usaTiers[String(nextPrice)] = (usaTiers[String(nextPrice)] ?? 0) + 1;
    }

    if (
      p.price === nextPrice &&
      (p.compareAtPrice == null || p.compareAtPrice === nextCompare) &&
      (p.tags ?? []).includes(IDEMPOTENCY_TAG)
    ) {
      counts.unchanged += 1;
      continue;
    }

    console.log(
      `${APPLY ? "SET" : "WOULD SET"} ${kind} ${slug} $${p.price} → $${nextPrice} compare $${p.compareAtPrice} → $${nextCompare}`
    );

    if (APPLY) {
      const values: Record<string, unknown> = {
        ":p": nextPrice,
        ":c": nextCompare,
        ":tags": tags,
        ":now": ts,
      };
      let expr = "SET price = :p, compareAtPrice = :c, #tags = :tags, updatedAt = :now";
      if (typeof nextVendorCost === "number") {
        expr += ", vendorCost = :vc";
        values[":vc"] = nextVendorCost;
      }
      await doc.send(
        new UpdateCommand({
          TableName: TABLE,
          Key: { PK: p.PK ?? productKeys.pk(slug), SK: p.SK ?? productKeys.sk() },
          UpdateExpression: expr,
          ExpressionAttributeNames: { "#tags": "tags" },
          ExpressionAttributeValues: values,
        })
      );
    }

    if (kind === "oc") counts.ocUpdated += 1;
    else counts.usaUpdated += 1;
  }

  console.log(JSON.stringify({ ...counts, usaTiers }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
