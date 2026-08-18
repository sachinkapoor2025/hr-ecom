/**
 * Raise rakhi catalog prices by tier and rewrite Lindt pack copy to 3-instead-of-5.
 *
 *   ENVIRONMENT=prod npx tsx scripts/apply-rakhi-price-and-lindt-copy.ts --dry-run
 *   ENVIRONMENT=prod npx tsx scripts/apply-rakhi-price-and-lindt-copy.ts --apply
 *
 * Does not touch product images.
 */
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { metaDescription, productKeys, roundForCurrency, type ShopCurrency } from "@hr-ecom/shared";

const ENV = process.env.ENVIRONMENT ?? "prod";
const TABLE = process.env.PRODUCTS_TABLE ?? `hr-ecom-products-${ENV}`;
const REGION = process.env.AWS_DEFAULT_REGION ?? process.env.AWS_REGION ?? "us-east-1";
const APPLY = process.argv.includes("--apply");
const LINDT_PHRASE = "Includes 3 Lindt Chocolates instead of 5.";

const doc = DynamoDBDocumentClient.from(new DynamoDBClient({ region: REGION }), {
  marshallOptions: { removeUndefinedValues: true },
});

type ProductRow = {
  PK?: string;
  SK?: string;
  slug?: string;
  name?: string;
  description?: string;
  seoDescription?: string;
  price?: number;
  compareAtPrice?: number;
  currency?: ShopCurrency;
  categorySlug?: string;
  additionalCategorySlugs?: string[];
  tags?: string[];
  vendorSlug?: string;
};

function isRakhiProduct(p: ProductRow): boolean {
  if ((p.vendorSlug ?? "").trim() === "orange-county") return true;
  const extra = (p.additionalCategorySlugs ?? []).join(" ");
  const tags = (p.tags ?? []).join(" ");
  const blob = [p.categorySlug, extra, p.name, p.slug, tags].join(" ").toLowerCase();
  return blob.includes("rakhi");
}

function hasLindt(text: string): boolean {
  return /lindt|lindor/i.test(text);
}

function priceIncreasePercent(price: number): number {
  if (price < 23) return 15;
  if (price <= 45) return 10;
  return 5;
}

function bumpMoney(amount: number, currency: ShopCurrency, percent: number): number {
  return roundForCurrency(amount * (1 + percent / 100), currency);
}

function rewriteLindtCopy(text: string): string {
  if (!text) return text;
  return text
    .replace(
      /\bIncludes\s+5\s+Lind(?:or|t(?:\s+Lindor)?)\s+chocolates?/gi,
      "Includes 3 Lindt Chocolates instead of 5"
    )
    .replace(/\b5\s+Lind(?:or|t(?:\s+Lindor)?)\s+chocolates?/gi, "3 Lindt Chocolates instead of 5")
    .replace(/\b5\s*-?\s*pcs?\s+(?:of\s+)?Lind(?:or|t(?:\s+Lindor)?)/gi, "3 pcs Lindt")
    .replace(/\bLind(?:or|t)\s+chocolates?\s*\(\s*5\s*pcs?\s*\)/gi, "Lindt chocolates (3 pcs)");
}

function ensureLindtDetails(description: string): string {
  let next = rewriteLindtCopy(description).trim();
  if (!/3 Lindt Chocolates instead of 5/i.test(next)) {
    next = next
      ? /[.!?]$/.test(next)
        ? `${next} ${LINDT_PHRASE}`
        : `${next}. ${LINDT_PHRASE}`
      : LINDT_PHRASE;
  }
  return next;
}

async function scanProducts(): Promise<ProductRow[]> {
  const items: ProductRow[] = [];
  let ExclusiveStartKey: Record<string, unknown> | undefined;
  do {
    const page = await doc.send(
      new ScanCommand({
        TableName: TABLE,
        FilterExpression: "begins_with(PK, :prefix) AND SK = :sk",
        ExpressionAttributeValues: { ":prefix": "PRODUCT#", ":sk": "META" },
        ExclusiveStartKey,
      })
    );
    items.push(...((page.Items ?? []) as ProductRow[]));
    ExclusiveStartKey = page.LastEvaluatedKey as Record<string, unknown> | undefined;
  } while (ExclusiveStartKey);
  return items;
}

async function main() {
  if (!APPLY && !process.argv.includes("--dry-run")) {
    console.error("Pass --dry-run or --apply");
    process.exit(1);
  }

  console.log(`${APPLY ? "APPLY" : "DRY-RUN"} ${TABLE} (${REGION})`);
  const products = await scanProducts();
  console.log(`Scanned ${products.length} product rows`);

  const now = new Date().toISOString();
  let priceUpdates = 0;
  let lindtUpdates = 0;
  let skipped = 0;

  for (const product of products) {
    const slug = product.slug ?? product.PK?.replace(/^PRODUCT#/, "");
    if (!slug) {
      skipped += 1;
      continue;
    }

    const currency: ShopCurrency = product.currency === "INR" ? "INR" : "USD";
    const names: Record<string, string> = { "#updatedAt": "updatedAt" };
    const values: Record<string, unknown> = { ":now": now };
    const sets = ["#updatedAt = :now"];
    const logParts: string[] = [];

    if (isRakhiProduct(product) && Number.isFinite(product.price) && (product.price ?? 0) > 0) {
      const oldPrice = product.price as number;
      const percent = priceIncreasePercent(oldPrice);
      const newPrice = bumpMoney(oldPrice, currency, percent);
      if (newPrice !== oldPrice) {
        names["#price"] = "price";
        values[":price"] = newPrice;
        sets.push("#price = :price");
        logParts.push(`price ${oldPrice} → ${newPrice} (+${percent}%)`);
        priceUpdates += 1;

        if (Number.isFinite(product.compareAtPrice) && (product.compareAtPrice ?? 0) > 0) {
          const oldCompare = product.compareAtPrice as number;
          const newCompare = Math.max(bumpMoney(oldCompare, currency, percent), newPrice);
          names["#compareAtPrice"] = "compareAtPrice";
          values[":compare"] = newCompare;
          sets.push("#compareAtPrice = :compare");
          logParts.push(`compareAt ${oldCompare} → ${newCompare}`);
        }
      }
    }

    const blob = `${product.name ?? ""} ${product.description ?? ""} ${product.seoDescription ?? ""}`;
    if (hasLindt(blob)) {
      const nextDescription = ensureLindtDetails(product.description ?? "");
      const finalSeo = metaDescription(nextDescription);

      if (nextDescription !== (product.description ?? "")) {
        names["#description"] = "description";
        values[":description"] = nextDescription;
        sets.push("#description = :description");
        logParts.push("lindt description");
        lindtUpdates += 1;
      }
      if (finalSeo && finalSeo !== (product.seoDescription ?? "")) {
        names["#seoDescription"] = "seoDescription";
        values[":seo"] = finalSeo;
        sets.push("#seoDescription = :seo");
        if (!logParts.includes("lindt description")) {
          logParts.push("lindt seo");
          lindtUpdates += 1;
        }
      }
    }

    if (logParts.length) {
      console.log(`${slug}: ${logParts.join("; ")}`);
    }

    if (!APPLY || sets.length <= 1) continue;

    await doc.send(
      new UpdateCommand({
        TableName: TABLE,
        Key: { PK: productKeys.pk(slug), SK: productKeys.sk() },
        UpdateExpression: `SET ${sets.join(", ")}`,
        ExpressionAttributeNames: names,
        ExpressionAttributeValues: values,
      })
    );
  }

  console.log(
    `Done. priceUpdates=${priceUpdates} lindtUpdates=${lindtUpdates} skipped=${skipped} apply=${APPLY}`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
