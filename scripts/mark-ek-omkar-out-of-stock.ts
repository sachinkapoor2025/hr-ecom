/**
 * Mark Ek Omkar (and combos that include it) out of stock in DynamoDB.
 *
 *   ENVIRONMENT=prod AWS_PROFILE=usarakhi npx tsx scripts/mark-ek-omkar-out-of-stock.ts
 *   DRY_RUN=1 ENVIRONMENT=prod npx tsx scripts/mark-ek-omkar-out-of-stock.ts
 */
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { FORCE_OUT_OF_STOCK_SLUGS, productKeys } from "@hr-ecom/shared";

const ENV = process.env.ENVIRONMENT ?? "prod";
const TABLE = process.env.PRODUCTS_TABLE ?? `hr-ecom-products-${ENV}`;
const REGION = process.env.AWS_DEFAULT_REGION ?? process.env.AWS_REGION ?? "us-east-1";
const DRY_RUN = process.env.DRY_RUN === "1" || process.env.DRY_RUN === "true";

async function main() {
  const doc = DynamoDBDocumentClient.from(new DynamoDBClient({ region: REGION }));
  const ts = new Date().toISOString();
  console.log(`Table=${TABLE} region=${REGION} DRY_RUN=${DRY_RUN}`);
  console.log(`Slugs (${FORCE_OUT_OF_STOCK_SLUGS.length}):`);
  for (const slug of FORCE_OUT_OF_STOCK_SLUGS) console.log(`  - ${slug}`);

  let updated = 0;
  let missing = 0;
  for (const slug of FORCE_OUT_OF_STOCK_SLUGS) {
    const key = { PK: productKeys.pk(slug), SK: productKeys.sk() };
    const existing = await doc.send(new GetCommand({ TableName: TABLE, Key: key }));
    if (!existing.Item) {
      console.warn(`MISSING ${slug}`);
      missing += 1;
      continue;
    }
    const prevInv = existing.Item.inventory;
    console.log(`${DRY_RUN ? "WOULD UPDATE" : "UPDATE"} ${slug} inventory ${prevInv} → 0`);
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
    updated += 1;
  }
  console.log(`Done. updated=${updated} missing=${missing}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
