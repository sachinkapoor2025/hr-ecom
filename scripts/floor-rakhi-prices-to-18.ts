/**
 * Floor UsaRakhi product prices at $18 (Orange County skipped).
 *
 *   ENVIRONMENT=prod npx tsx scripts/floor-rakhi-prices-to-18.ts
 *   DRY_RUN=1 ENVIRONMENT=prod npx tsx scripts/floor-rakhi-prices-to-18.ts
 *
 * Requires AWS creds. Never commit keys.
 */
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { VENDOR_ORANGE_COUNTY, productKeys } from "@hr-ecom/shared";

const ENV = process.env.ENVIRONMENT ?? "prod";
const TABLE = process.env.PRODUCTS_TABLE ?? `hr-ecom-products-${ENV}`;
const REGION = process.env.AWS_DEFAULT_REGION ?? process.env.AWS_REGION ?? "us-east-1";
const DRY_RUN = process.env.DRY_RUN === "1" || process.env.DRY_RUN === "true";
const MIN_PRICE_USD = 18;
const IDEMPOTENCY_TAG = "price-floor-2026-08-24-min18";

type ProductRow = {
  slug?: string;
  name?: string;
  price?: number;
  compareAtPrice?: number;
  vendorSlug?: string;
  tags?: string[];
  PK?: string;
  SK?: string;
};

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}

function isOrangeCounty(p: ProductRow): boolean {
  return (p.vendorSlug ?? "").trim() === VENDOR_ORANGE_COUNTY;
}

async function main() {
  const doc = DynamoDBDocumentClient.from(new DynamoDBClient({ region: REGION }));
  const ts = new Date().toISOString();
  console.log(`Table=${TABLE} DRY_RUN=${DRY_RUN} min=$${MIN_PRICE_USD}`);

  const items: ProductRow[] = [];
  let ExclusiveStartKey: Record<string, unknown> | undefined;
  do {
    const result = await doc.send(new ScanCommand({ TableName: TABLE, ExclusiveStartKey }));
    for (const item of result.Items ?? []) {
      if (item.SK === "META" && typeof item.slug === "string") {
        items.push(item as ProductRow);
      }
    }
    ExclusiveStartKey = result.LastEvaluatedKey as Record<string, unknown> | undefined;
  } while (ExclusiveStartKey);

  let floored = 0;
  let skippedOc = 0;
  let skippedOk = 0;
  let skippedAlready = 0;
  let skippedInvalid = 0;

  for (const p of items) {
    const slug = p.slug ?? "";
    if (!slug || typeof p.price !== "number" || !Number.isFinite(p.price) || p.price <= 0) {
      skippedInvalid += 1;
      continue;
    }
    if (isOrangeCounty(p)) {
      skippedOc += 1;
      continue;
    }
    const tags = Array.isArray(p.tags) ? p.tags : [];
    if (tags.includes(IDEMPOTENCY_TAG)) {
      skippedAlready += 1;
      continue;
    }
    if (p.price >= MIN_PRICE_USD) {
      skippedOk += 1;
      continue;
    }

    const nextPrice = MIN_PRICE_USD;
    const nextCompare =
      typeof p.compareAtPrice === "number" && p.compareAtPrice > 0
        ? roundMoney(Math.max(p.compareAtPrice, nextPrice))
        : roundMoney(nextPrice * 1.25);
    const nextTags = Array.from(new Set([...tags, IDEMPOTENCY_TAG]));

    console.log(
      `${DRY_RUN ? "WOULD FLOOR" : "FLOOR"} ${slug} $${p.price} → $${nextPrice}` +
        (nextCompare != null ? ` compare → $${nextCompare}` : "")
    );

    if (!DRY_RUN) {
      const key = { PK: p.PK ?? productKeys.pk(slug), SK: p.SK ?? productKeys.sk() };
      await doc.send(
        new UpdateCommand({
          TableName: TABLE,
          Key: key,
          UpdateExpression:
            "SET price = :p, compareAtPrice = :c, tags = :tags, updatedAt = :now",
          ExpressionAttributeValues: {
            ":p": nextPrice,
            ":c": nextCompare,
            ":tags": nextTags,
            ":now": ts,
          },
        })
      );
    }
    floored += 1;
  }

  console.log(
    JSON.stringify(
      { floored, skippedOk, skippedOc, skippedAlready, skippedInvalid, scanned: items.length },
      null,
      2
    )
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
