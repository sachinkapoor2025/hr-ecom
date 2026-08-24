/**
 * Mark all UsaRakhi (non–Orange County) products out of stock in DynamoDB.
 *
 *   ENVIRONMENT=prod npx tsx scripts/oos-all-usarakhi-products.ts
 *   DRY_RUN=1 ENVIRONMENT=prod npx tsx scripts/oos-all-usarakhi-products.ts
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
const IDEMPOTENCY_TAG = "usarakhi-oos-2026-08-24";

type ProductRow = {
  slug?: string;
  inventory?: number;
  vendorSlug?: string;
  tags?: string[];
  images?: string[];
  PK?: string;
  SK?: string;
};

function isOrangeCounty(p: ProductRow): boolean {
  if ((p.vendorSlug ?? "").trim() === VENDOR_ORANGE_COUNTY) return true;
  return (p.images ?? []).some((src) => src.includes("/uploads/orange-county/"));
}

async function main() {
  const doc = DynamoDBDocumentClient.from(new DynamoDBClient({ region: REGION }));
  const ts = new Date().toISOString();
  console.log(`Table=${TABLE} DRY_RUN=${DRY_RUN} (UsaRakhi → inventory 0; OC skipped)`);

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
  let skippedOc = 0;
  let skippedAlready = 0;
  let skippedZero = 0;
  let skippedInvalid = 0;

  for (const p of items) {
    const slug = p.slug ?? "";
    if (!slug) {
      skippedInvalid += 1;
      continue;
    }
    if (isOrangeCounty(p)) {
      skippedOc += 1;
      continue;
    }
    const tags = Array.isArray(p.tags) ? p.tags : [];
    if (tags.includes(IDEMPOTENCY_TAG) && (p.inventory ?? 0) <= 0) {
      skippedAlready += 1;
      continue;
    }
    if ((p.inventory ?? 0) <= 0 && tags.includes(IDEMPOTENCY_TAG)) {
      skippedZero += 1;
      continue;
    }

    const nextTags = Array.from(new Set([...tags, IDEMPOTENCY_TAG]));
    console.log(
      `${DRY_RUN ? "WOULD OOS" : "OOS"} ${slug} inventory ${p.inventory ?? "?"} → 0`
    );

    if (!DRY_RUN) {
      const key = { PK: p.PK ?? productKeys.pk(slug), SK: p.SK ?? productKeys.sk() };
      await doc.send(
        new UpdateCommand({
          TableName: TABLE,
          Key: key,
          UpdateExpression: "SET inventory = :zero, tags = :tags, updatedAt = :now",
          ExpressionAttributeValues: {
            ":zero": 0,
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
        skippedOc,
        skippedAlready,
        skippedZero,
        skippedInvalid,
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
