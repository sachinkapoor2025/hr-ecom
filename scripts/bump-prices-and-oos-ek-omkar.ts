/**
 * Prod maintenance:
 * 1) Force Ek Omkar family inventory to 0
 * 2) +$3.00 on every non–Orange County product price (and compareAt when present)
 *
 *   ENVIRONMENT=prod npx tsx scripts/bump-prices-and-oos-ek-omkar.ts
 *   DRY_RUN=1 ENVIRONMENT=prod npx tsx scripts/bump-prices-and-oos-ek-omkar.ts
 *
 * Requires AWS creds for the UsaRakhi account (env / profile). Never commit keys.
 */
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  UpdateCommand,
  GetCommand,
} from "@aws-sdk/lib-dynamodb";
import {
  FORCE_OUT_OF_STOCK_SLUGS,
  VENDOR_ORANGE_COUNTY,
  ORANGE_COUNTY_CATEGORY_SLUG,
  productKeys,
} from "@hr-ecom/shared";

const ENV = process.env.ENVIRONMENT ?? "prod";
const TABLE = process.env.PRODUCTS_TABLE ?? `hr-ecom-products-${ENV}`;
const REGION = process.env.AWS_DEFAULT_REGION ?? process.env.AWS_REGION ?? "us-east-1";
const DRY_RUN = process.env.DRY_RUN === "1" || process.env.DRY_RUN === "true";
const PRICE_BUMP_USD = 3;
const IDEMPOTENCY_TAG = "price-bump-2026-08-22-plus3";

type ProductRow = {
  slug?: string;
  name?: string;
  price?: number;
  compareAtPrice?: number;
  inventory?: number;
  vendorSlug?: string;
  categorySlug?: string;
  tags?: string[];
  PK?: string;
  SK?: string;
};

function isOrangeCounty(p: ProductRow): boolean {
  const vendor = (p.vendorSlug ?? "").trim();
  if (vendor === VENDOR_ORANGE_COUNTY) return true;
  if ((p.categorySlug ?? "").trim() === ORANGE_COUNTY_CATEGORY_SLUG) return true;
  return false;
}

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}

async function scanAll(
  doc: DynamoDBDocumentClient
): Promise<ProductRow[]> {
  const items: ProductRow[] = [];
  let ExclusiveStartKey: Record<string, unknown> | undefined;
  do {
    const result = await doc.send(
      new ScanCommand({
        TableName: TABLE,
        ExclusiveStartKey,
      })
    );
    for (const item of result.Items ?? []) {
      if (item.SK === "META" && typeof item.slug === "string") {
        items.push(item as ProductRow);
      }
    }
    ExclusiveStartKey = result.LastEvaluatedKey as Record<string, unknown> | undefined;
  } while (ExclusiveStartKey);
  return items;
}

async function main() {
  const doc = DynamoDBDocumentClient.from(new DynamoDBClient({ region: REGION }));
  const ts = new Date().toISOString();
  console.log(`Table=${TABLE} region=${REGION} DRY_RUN=${DRY_RUN} bump=+$${PRICE_BUMP_USD}`);

  // --- Ek Omkar OOS ---
  let oosUpdated = 0;
  let oosMissing = 0;
  for (const slug of FORCE_OUT_OF_STOCK_SLUGS) {
    const key = { PK: productKeys.pk(slug), SK: productKeys.sk() };
    const existing = await doc.send(new GetCommand({ TableName: TABLE, Key: key }));
    if (!existing.Item) {
      console.warn(`OOS MISSING ${slug}`);
      oosMissing += 1;
      continue;
    }
    console.log(
      `${DRY_RUN ? "WOULD OOS" : "OOS"} ${slug} inventory ${existing.Item.inventory} → 0`
    );
    if (!DRY_RUN) {
      await doc.send(
        new UpdateCommand({
          TableName: TABLE,
          Key: key,
          UpdateExpression: "SET inventory = :zero, updatedAt = :now",
          ExpressionAttributeValues: { ":zero": 0, ":now": ts },
        })
      );
    }
    oosUpdated += 1;
  }

  // --- Price bump ---
  const products = await scanAll(doc);
  console.log(`Scanned ${products.length} products`);

  let bumped = 0;
  let skippedOc = 0;
  let skippedAlready = 0;
  let skippedInvalid = 0;

  for (const p of products) {
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

    const nextPrice = roundMoney(p.price + PRICE_BUMP_USD);
    const nextCompare =
      typeof p.compareAtPrice === "number" && p.compareAtPrice > 0
        ? roundMoney(p.compareAtPrice + PRICE_BUMP_USD)
        : undefined;
    const nextTags = Array.from(new Set([...tags, IDEMPOTENCY_TAG]));

    console.log(
      `${DRY_RUN ? "WOULD BUMP" : "BUMP"} ${slug} $${p.price} → $${nextPrice}` +
        (nextCompare != null ? ` compare $${p.compareAtPrice} → $${nextCompare}` : "")
    );

    if (!DRY_RUN) {
      const key = { PK: p.PK ?? productKeys.pk(slug), SK: p.SK ?? productKeys.sk() };
      if (nextCompare != null) {
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
      } else {
        await doc.send(
          new UpdateCommand({
            TableName: TABLE,
            Key: key,
            UpdateExpression: "SET price = :p, tags = :tags, updatedAt = :now",
            ExpressionAttributeValues: {
              ":p": nextPrice,
              ":tags": nextTags,
              ":now": ts,
            },
          })
        );
      }
    }
    bumped += 1;
  }

  console.log(
    JSON.stringify(
      {
        oosUpdated,
        oosMissing,
        bumped,
        skippedOc,
        skippedAlready,
        skippedInvalid,
      },
      null,
      2
    )
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
