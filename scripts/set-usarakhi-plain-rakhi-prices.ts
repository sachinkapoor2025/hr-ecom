/**
 * Set eligible UsaRakhi single & combo rakhis to cost pricing ($3 / $5 / $7).
 * Skips Orange County, chocolates, dry fruit, and hampers.
 *
 *   ENVIRONMENT=prod npx tsx scripts/set-usarakhi-plain-rakhi-prices.ts
 *   DRY_RUN=1 ENVIRONMENT=prod npx tsx scripts/set-usarakhi-plain-rakhi-prices.ts
 */
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import {
  isUsarakhiPlainRakhiProduct,
  pickUsarakhiCostRakhiPriceUsd,
  productKeys,
} from "@hr-ecom/shared";

const ENV = process.env.ENVIRONMENT ?? "prod";
const TABLE = process.env.PRODUCTS_TABLE ?? `hr-ecom-products-${ENV}`;
const REGION = process.env.AWS_DEFAULT_REGION ?? process.env.AWS_REGION ?? "us-east-1";
const DRY_RUN = process.env.DRY_RUN === "1" || process.env.DRY_RUN === "true";
const IDEMPOTENCY_TAG = "usarakhi-cost-rakhi-2026-08-24";

type ProductRow = {
  slug?: string;
  name?: string;
  price?: number;
  compareAtPrice?: number;
  categorySlug?: string;
  additionalCategorySlugs?: string[];
  description?: string;
  tags?: string[];
  vendorSlug?: string;
  images?: string[];
  PK?: string;
  SK?: string;
};

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}

async function main() {
  const doc = DynamoDBDocumentClient.from(new DynamoDBClient({ region: REGION }));
  const ts = new Date().toISOString();
  console.log(`Table=${TABLE} DRY_RUN=${DRY_RUN} tiers=$3/$5/$7`);

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

  let updated = 0;
  let skippedIneligible = 0;
  let skippedAlready = 0;
  let skippedInvalid = 0;
  const tierCounts = { 3: 0, 5: 0, 7: 0 } as Record<3 | 5 | 7, number>;

  for (const p of items) {
    const slug = p.slug ?? "";
    if (!slug || typeof p.price !== "number" || !Number.isFinite(p.price) || p.price <= 0) {
      skippedInvalid += 1;
      continue;
    }

    if (!isUsarakhiPlainRakhiProduct(p)) {
      skippedIneligible += 1;
      continue;
    }

    const tags = Array.isArray(p.tags) ? p.tags : [];
    const nextPrice = pickUsarakhiCostRakhiPriceUsd(slug);
    tierCounts[nextPrice] += 1;

    if (p.price === nextPrice && tags.includes(IDEMPOTENCY_TAG)) {
      skippedAlready += 1;
      continue;
    }

    const nextCompare =
      typeof p.compareAtPrice === "number" && p.compareAtPrice > nextPrice
        ? roundMoney(p.compareAtPrice)
        : typeof p.price === "number" && p.price > nextPrice
          ? roundMoney(p.price)
          : roundMoney(nextPrice * 1.25);
    const nextTags = Array.from(new Set([...tags, IDEMPOTENCY_TAG]));

    console.log(
      `${DRY_RUN ? "WOULD SET" : "SET"} ${slug} $${p.price} → $${nextPrice}` +
        ` compare → $${nextCompare}`
    );

    if (!DRY_RUN) {
      await doc.send(
        new UpdateCommand({
          TableName: TABLE,
          Key: { PK: p.PK ?? productKeys.pk(slug), SK: p.SK ?? productKeys.sk() },
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
    updated += 1;
  }

  console.log(
    JSON.stringify(
      {
        updated,
        skippedIneligible,
        skippedAlready,
        skippedInvalid,
        tierCounts,
        scanned: items.length,
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
