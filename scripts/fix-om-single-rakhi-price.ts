/**
 * One-off: fix om-single-rakhi missed +$3 bump (was mis-tagged rakhi-hampers).
 * ENVIRONMENT=prod npx tsx scripts/fix-om-single-rakhi-price.ts
 */
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { productKeys } from "@hr-ecom/shared";

const ENV = process.env.ENVIRONMENT ?? "prod";
const TABLE = process.env.PRODUCTS_TABLE ?? `hr-ecom-products-${ENV}`;
const REGION = process.env.AWS_DEFAULT_REGION ?? process.env.AWS_REGION ?? "us-east-1";
const TAG = "price-bump-2026-08-22-plus3";
const SLUG = "om-single-rakhi";

async function main() {
  const doc = DynamoDBDocumentClient.from(new DynamoDBClient({ region: REGION }));
  const key = { PK: productKeys.pk(SLUG), SK: productKeys.sk() };
  const existing = await doc.send(new GetCommand({ TableName: TABLE, Key: key }));
  if (!existing.Item) {
    console.error(`Missing ${SLUG}`);
    process.exit(1);
  }
  const p = existing.Item;
  const tags = Array.isArray(p.tags) ? p.tags : [];
  if (tags.includes(TAG)) {
    console.log("Already bumped", { price: p.price, categorySlug: p.categorySlug });
    return;
  }
  const nextPrice = Math.round((Number(p.price) + 3) * 100) / 100;
  const nextCompare =
    typeof p.compareAtPrice === "number" && p.compareAtPrice > 0
      ? Math.round((p.compareAtPrice + 3) * 100) / 100
      : undefined;
  const nextTags = Array.from(new Set([...tags, TAG]));
  const ts = new Date().toISOString();
  console.log("Updating", {
    from: { price: p.price, compareAtPrice: p.compareAtPrice, categorySlug: p.categorySlug },
    to: { price: nextPrice, compareAtPrice: nextCompare, categorySlug: "single-rakhi" },
  });
  await doc.send(
    new UpdateCommand({
      TableName: TABLE,
      Key: key,
      UpdateExpression:
        nextCompare != null
          ? "SET price = :p, compareAtPrice = :c, categorySlug = :cat, tags = :tags, updatedAt = :now"
          : "SET price = :p, categorySlug = :cat, tags = :tags, updatedAt = :now",
      ExpressionAttributeValues: {
        ":p": nextPrice,
        ...(nextCompare != null ? { ":c": nextCompare } : {}),
        ":cat": "single-rakhi",
        ":tags": nextTags,
        ":now": ts,
      },
    })
  );
  const after = await doc.send(new GetCommand({ TableName: TABLE, Key: key }));
  console.log("Done", {
    price: after.Item?.price,
    compareAtPrice: after.Item?.compareAtPrice,
    categorySlug: after.Item?.categorySlug,
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
