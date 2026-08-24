/**
 * Restore UsaRakhi (non–Orange County) product inventory after the OOS pause.
 * Skips Orange County and FORCE_OUT_OF_STOCK_SLUGS. Removes usarakhi-oos tag.
 *
 *   ENVIRONMENT=prod npx tsx scripts/restore-usarakhi-inventory.ts
 *   DRY_RUN=1 ENVIRONMENT=prod npx tsx scripts/restore-usarakhi-inventory.ts
 *   INVENTORY=200 ENVIRONMENT=prod npx tsx scripts/restore-usarakhi-inventory.ts
 *
 * Requires AWS creds. Never commit keys.
 */
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import {
  DEFAULT_PRODUCT_INVENTORY,
  FORCE_OUT_OF_STOCK_SLUGS,
  VENDOR_ORANGE_COUNTY,
  productKeys,
} from "@hr-ecom/shared";

const ENV = process.env.ENVIRONMENT ?? "prod";
const TABLE = process.env.PRODUCTS_TABLE ?? `hr-ecom-products-${ENV}`;
const REGION = process.env.AWS_DEFAULT_REGION ?? process.env.AWS_REGION ?? "us-east-1";
const DRY_RUN = process.env.DRY_RUN === "1" || process.env.DRY_RUN === "true";
const TARGET_INVENTORY = Math.max(
  1,
  Number.parseInt(process.env.INVENTORY ?? String(DEFAULT_PRODUCT_INVENTORY), 10) ||
    DEFAULT_PRODUCT_INVENTORY
);
const OOS_TAG = "usarakhi-oos-2026-08-24";
const FORCE_OOS = new Set<string>(FORCE_OUT_OF_STOCK_SLUGS);

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
  console.log(
    `Table=${TABLE} DRY_RUN=${DRY_RUN} targetInventory=${TARGET_INVENTORY} (UsaRakhi restore; OC + force-OOS skipped)`
  );

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
  let skippedForceOos = 0;
  let skippedAlready = 0;
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
    if (FORCE_OOS.has(slug)) {
      skippedForceOos += 1;
      continue;
    }

    const tags = Array.isArray(p.tags) ? p.tags : [];
    const nextTags = tags.filter((t) => t !== OOS_TAG);
    const inventory = p.inventory ?? 0;
    const needsInventory = inventory < TARGET_INVENTORY;
    const needsTagCleanup = tags.includes(OOS_TAG);

    if (!needsInventory && !needsTagCleanup) {
      skippedAlready += 1;
      continue;
    }

    console.log(
      `${DRY_RUN ? "WOULD RESTORE" : "RESTORE"} ${slug} inventory ${inventory} → ${TARGET_INVENTORY}`
    );

    if (!DRY_RUN) {
      const key = { PK: p.PK ?? productKeys.pk(slug), SK: p.SK ?? productKeys.sk() };
      await doc.send(
        new UpdateCommand({
          TableName: TABLE,
          Key: key,
          UpdateExpression: "SET inventory = :inv, tags = :tags, updatedAt = :now",
          ExpressionAttributeValues: {
            ":inv": TARGET_INVENTORY,
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
        skippedForceOos,
        skippedAlready,
        skippedInvalid,
        scanned: items.length,
        targetInventory: TARGET_INVENTORY,
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
