/**
 * Import the Orange County Karwa Chauth / Diwali / Bhai Dooj 2026 sheet.
 *
 * The workbook in this drop only contains Bhai Dooj (19) and Diwali (6).
 * There are no Karwa Chauth rows.
 *
 * - List price = vendor TP × 2. Sale price is 15% off that list. vendorCost stays the sheet TP.
 * - vendorCost stores the vendor TP for admin profit
 * - inventory = 500
 * - Earlier Rakhi products (UsaRakhi + Orange County) are set to inventory 0
 *   and tagged so the shop hides them and deploys do not restock them
 *
 *   ENVIRONMENT=prod UPLOAD_BUCKET=... CLOUDFRONT_DOMAIN=... \
 *     npx tsx scripts/import-festival-2026.ts
 *
 *   DRY_RUN=1 npx tsx scripts/import-festival-2026.ts
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from "fs";
import { extname, join, resolve } from "path";
import * as XLSX from "xlsx";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand, ScanCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import {
  ORANGE_COUNTY_PRODUCT_INVENTORY,
  VENDOR_ORANGE_COUNTY,
  categoryKeys,
  metaDescription,
  productKeys,
  roundMoney,
  resolveProductImagesForUpsert,
} from "@hr-ecom/shared";

const ENV = process.env.ENVIRONMENT ?? "prod";
const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE ?? `hr-ecom-products-${ENV}`;
const BUCKET = process.env.UPLOAD_BUCKET;
const CDN = process.env.CLOUDFRONT_DOMAIN?.replace(/^https?:\/\//, "").replace(/\/$/, "");
const DRY_RUN = process.env.DRY_RUN === "1" || process.env.DRY_RUN === "true";
const SKIP_S3 = process.env.SKIP_S3 === "1" || process.env.SKIP_S3 === "true";
const ROOT = resolve(process.cwd());
const EXCEL = join(ROOT, "TF USA  Karwachauth-Diwali-Bhaidooj 2026  Catalouge .xlsx");
const IMG_DIR = join(ROOT, "kdt");
const CATALOG_OUT = join(ROOT, "scripts/data/festival-2026.json");
const REGION = process.env.AWS_REGION ?? process.env.AWS_DEFAULT_REGION ?? "us-east-1";
const OLD_OOS_TAG = "usarakhi-oos-2026-08-24";
const RAKHI_SEASON_PAUSED_TAG = "rakhi-season-paused-2026-10";

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

const KEEP_CATEGORIES = new Set([
  "bhai-dooj",
  "diwali",
  "sweet-combos",
  "dry-fruit-combos",
  "chocolate-combos",
  "pooja-sets",
]);

const EXTRA_CATEGORY: Record<string, string> = {
  sweets: "sweet-combos",
  "dry-fruits": "dry-fruit-combos",
  chocolates: "chocolate-combos",
  pooja: "pooja-sets",
};

/** List price is double the vendor cost. Sale price is 15% off that list. */
function festivalPrices(vendorCost: number): { vendorCost: number; price: number; compareAtPrice: number } {
  const compareAtPrice = roundMoney(vendorCost * 2, "USD");
  const price = roundMoney(compareAtPrice * 0.85, "USD");
  return { vendorCost: roundMoney(vendorCost, "USD"), price, compareAtPrice };
}

type NamedProduct = { name: string; categorySlug: "bhai-dooj" | "diwali" };

/** Stable storefront names. Excel SKU TFUSBD260_1 is the photo set TFUSBD2601. */
const NAMES: Record<string, NamedProduct> = {
  TFUSBD2601: { name: "Bhai Dooj Kaju Katli & Kumkum Gift Box", categorySlug: "bhai-dooj" },
  TFUSBD2602: { name: "Bhai Dooj Almonds & Pistachios Gift Box", categorySlug: "bhai-dooj" },
  TFUSBD2603: { name: "Bhai Dooj Kaju Katli & Ferrero Rocher Box", categorySlug: "bhai-dooj" },
  TFUSBD2604: { name: "Bhai Dooj Kaju Katli, Almonds & Kumkum Hamper", categorySlug: "bhai-dooj" },
  TFUSBD2605: { name: "Bhai Dooj Kaju Katli & Cashew Gift Box", categorySlug: "bhai-dooj" },
  TFUSBD2606: { name: "Bhai Dooj Mixed Dry Fruits Gift Box (266 g)", categorySlug: "bhai-dooj" },
  TFUSBD2607: { name: "Bhai Dooj Mixed Dry Fruits Gift Box (131 g)", categorySlug: "bhai-dooj" },
  TFUSBD2608: { name: "Bhai Dooj Ferrero, Almonds & Kumkum Box", categorySlug: "bhai-dooj" },
  TFUSBD2609: { name: "Bhai Dooj Pistachio Gift Box", categorySlug: "bhai-dooj" },
  TFUSBD2610: { name: "Bhai Dooj Puja Thali & Pistachio Set", categorySlug: "bhai-dooj" },
  TFUSBD2611: { name: "Bhai Dooj Skittles Chocolate Gift", categorySlug: "bhai-dooj" },
  TFUSBD2612: { name: "Bhai Dooj Skittles & Mixed Nuts Box", categorySlug: "bhai-dooj" },
  TFUSBD2613: { name: "Bhai Dooj M&M's & Ferrero Rocher Box", categorySlug: "bhai-dooj" },
  TFUSBD2614: { name: "Bhai Dooj M&M's Chocolate Gift", categorySlug: "bhai-dooj" },
  TFUSBD2615: { name: "Bhai Dooj Pooja Set with Kaju Katli & Cashews", categorySlug: "bhai-dooj" },
  TFUSBD2616: { name: "Bhai Dooj Pooja Set with Besan Laddoo", categorySlug: "bhai-dooj" },
  TFUSBD2617: { name: "Bhai Dooj M&M's & Markers Kids Gift", categorySlug: "bhai-dooj" },
  TFUSBD2618: { name: "Bhai Dooj Mixed Nuts Gift Box", categorySlug: "bhai-dooj" },
  TFUSBD2619: { name: "Bhai Dooj M&M's & Skittles Gift Box", categorySlug: "bhai-dooj" },
  TFUSDW2620: { name: "Diwali Toran, Rangoli & Besan Laddoo Hamper", categorySlug: "diwali" },
  TFUSDW2621: { name: "Diwali Metal Pooja Set & Besan Laddoo Hamper", categorySlug: "diwali" },
  TFUSDW2622: { name: "Diwali Metal Pooja Set with Kaju Katli", categorySlug: "diwali" },
  TFUSDW2623: { name: "Diwali Shubh Labh, Rangoli & Dry Fruit Set", categorySlug: "diwali" },
  TFUSDW2624: { name: "Diwali Pooja Set with Ferrero & Almonds", categorySlug: "diwali" },
  TFUSDW2625: { name: "Diwali Metal Pooja Set with Kaju Katli & Pistachios", categorySlug: "diwali" },
};

function nowIso() {
  return new Date().toISOString();
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function canonicalSku(raw: string): string {
  const sku = raw.trim().toUpperCase().replace(/\s+/g, "");
  if (sku === "TFUSBD260_1") return "TFUSBD2601";
  return sku;
}

function cleanLine(raw: string): string {
  const line = raw
    .replace(/\s+/g, " ")
    .replace(/Pistachois/gi, "Pistachios")
    .replace(/Bhaidooj/gi, "Bhai Dooj")
    .replace(/Bhaidoj/gi, "Bhai Dooj")
    .replace(/\bkumkum\b/gi, "Kumkum")
    .replace(/\b(\d+)\s*gms?\b/gi, "$1 g")
    .replace(/\s+/g, " ")
    .trim();
  if (!line) return "";
  return line.charAt(0).toUpperCase() + line.slice(1);
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function occasionLabel(categorySlug: string): string {
  return categorySlug === "diwali" ? "Diwali" : "Bhai Dooj";
}

function buildDescription(name: string, categorySlug: string, items: string[], sku: string): string {
  const festival = occasionLabel(categorySlug);
  const list = items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  return [
    `<p><strong>${escapeHtml(name)}</strong> is a ready-to-gift <strong>${festival}</strong> hamper for delivery across the United States. Family overseas can send this box to a US address — it ships domestically, so it does not wait on international customs.</p>`,
    `<p><strong>What's included:</strong></p>`,
    `<ul>${list}</ul>`,
    `<p>Everything above is packed together. Weights and piece counts are as listed.</p>`,
    `<p>SKU: ${escapeHtml(sku)}</p>`,
  ].join("\n");
}

function contentTags(items: string[], categorySlug: string): string[] {
  const blob = items.join(" ").toLowerCase();
  const tags = ["festival-2026", "gift-hamper", "usa-delivery", categorySlug, "orange-county"];
  if (/kaju|laddoo|ladoo|laddo|mithai|sweet/.test(blob)) tags.push("sweets");
  if (/ferrero|chocolate|skittles|m&m/.test(blob)) tags.push("chocolates");
  if (/almond|pistachio|cashew|dry fruit|mixed nut/.test(blob)) tags.push("dry-fruits");
  if (/pooja|puja|thali|toran|rangoli|kumkum|shubh/.test(blob)) tags.push("pooja");
  return tags;
}

function imageSortKey(file: string): number {
  const match = file.match(/_(\d+)\.[^.]+$/);
  return match ? Number(match[1]) : 0;
}

function imagesForSku(sku: string): string[] {
  if (!existsSync(IMG_DIR)) return [];
  return readdirSync(IMG_DIR)
    .filter((file) => {
      const stem = file.replace(/\.[^.]+$/, "");
      const base = stem.includes("_") ? stem.slice(0, stem.lastIndexOf("_")) : stem;
      return base.toUpperCase() === sku;
    })
    .sort((a, b) => imageSortKey(a) - imageSortKey(b) || a.localeCompare(b));
}

type SheetProduct = {
  sku: string;
  vendorCost: number;
  items: string[];
  name: string;
  slug: string;
  categorySlug: "bhai-dooj" | "diwali";
};

function loadSheet(): SheetProduct[] {
  if (!existsSync(EXCEL)) throw new Error(`Catalog not found: ${EXCEL}`);
  const wb = XLSX.readFile(EXCEL);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
  const products: SheetProduct[] = [];
  for (const row of rows) {
    const entries = Object.entries(row).map(([key, value]) => [key.trim().toLowerCase(), value] as const);
    const skuRaw = String(entries.find(([key]) => key.startsWith("sku"))?.[1] ?? "").trim();
    if (!skuRaw) continue;
    const sku = canonicalSku(skuRaw);
    const tp = Number(entries.find(([key]) => key === "tp")?.[1]);
    if (!Number.isFinite(tp) || tp <= 0) throw new Error(`Missing vendor price for ${sku}`);
    const items = entries
      .filter(([key]) => key.startsWith("product details"))
      .map(([, value]) => cleanLine(String(value ?? "")))
      .filter(Boolean);
    const uniqueItems = [...new Set(items)];
    const named = NAMES[sku];
    const categorySlug = named?.categorySlug ?? (sku.includes("DW") ? "diwali" : "bhai-dooj");
    const name = named?.name ?? `${occasionLabel(categorySlug)} Gift ${sku}`;
    products.push({
      sku,
      vendorCost: tp,
      items: uniqueItems,
      name,
      slug: slugify(name),
      categorySlug,
    });
  }
  return products;
}

async function ensureS3(s3: S3Client, localPath: string, key: string): Promise<string> {
  if (!CDN) throw new Error("CLOUDFRONT_DOMAIN required");
  const url = `https://${CDN}/${key}`;
  if (DRY_RUN) {
    console.log(`  [dry-run] upload ${key}`);
    return url;
  }
  if (!BUCKET) throw new Error("UPLOAD_BUCKET required");
  try {
    await s3.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
    return url;
  } catch {
    /* upload */
  }
  const ext = extname(localPath).toLowerCase();
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: readFileSync(localPath),
      ContentType: MIME[ext] ?? "application/octet-stream",
      CacheControl: "public, max-age=31536000, immutable",
    })
  );
  console.log(`  ↑ ${key}`);
  return url;
}

async function main() {
  const rows = loadSheet();
  const missingImages = rows.filter((row) => imagesForSku(row.sku).length === 0);
  if (missingImages.length) {
    throw new Error(`No images for ${missingImages.map((row) => row.sku).join(", ")}`);
  }
  console.log(`Festival catalog: ${rows.length} products`);
  console.log(`Table=${PRODUCTS_TABLE} DRY_RUN=${DRY_RUN} SKIP_S3=${SKIP_S3}`);

  if (!DRY_RUN && !SKIP_S3 && (!BUCKET || !CDN)) {
    throw new Error("Set UPLOAD_BUCKET and CLOUDFRONT_DOMAIN (or DRY_RUN=1 / SKIP_S3=1)");
  }

  const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({ region: REGION }), {
    marshallOptions: { removeUndefinedValues: true },
  });
  const s3 = new S3Client({ region: REGION });
  const ts = nowIso();
  const keepSlugs = new Set<string>();
  const catalogProducts = [];

  const categories = [
    {
      name: "Bhai Dooj Combo",
      slug: "bhai-dooj",
      description:
        "Bhai Dooj gift hampers for USA delivery — sweets, dry fruits, chocolates, kumkum, and greeting cards shipped domestically.",
      seoTitle: "Bhai Dooj Gifts USA | Sweet & Dry Fruit Hampers",
      seoDescription: metaDescription(
        "Shop Bhai Dooj gift boxes for USA delivery. Kaju katli, dry fruits, chocolates, and puja sets shipped within the United States."
      ),
      sortOrder: 1,
    },
    {
      name: "Diwali Combo",
      slug: "diwali",
      description:
        "Diwali gift hampers for USA delivery — pooja sets, toran, rangoli, sweets, and dry fruits shipped domestically.",
      seoTitle: "Diwali Gifts USA | Pooja Sets & Festive Hampers",
      seoDescription: metaDescription(
        "Shop Diwali hampers for USA delivery. Metal pooja sets, toran, rangoli, besan laddoo, and dry fruits shipped within the United States."
      ),
      sortOrder: 2,
    },
    {
      name: "Sweet Combos",
      slug: "sweet-combos",
      description:
        "Festive sweet combos for USA delivery — kaju katli, besan laddoo, and mithai gift boxes shipped domestically.",
      seoTitle: "Sweet Combos USA | Festive Mithai Gift Boxes",
      seoDescription: metaDescription(
        "Shop sweet gift combos for USA delivery. Kaju katli and besan laddoo hampers shipped within the United States."
      ),
      sortOrder: 3,
    },
    {
      name: "Dry Fruit Combos",
      slug: "dry-fruit-combos",
      description:
        "Dry fruit gift combos for USA delivery — almonds, pistachios, cashews, and mixed nuts shipped domestically.",
      seoTitle: "Dry Fruit Combos USA | Festive Nut Gift Boxes",
      seoDescription: metaDescription(
        "Shop dry fruit gift combos for USA delivery. Almonds, pistachios, and cashews shipped within the United States."
      ),
      sortOrder: 4,
    },
    {
      name: "Chocolate Combos",
      slug: "chocolate-combos",
      description:
        "Chocolate gift combos for USA delivery — Ferrero Rocher, M&M's, and Skittles boxes shipped domestically.",
      seoTitle: "Chocolate Combos USA | Festive Chocolate Gift Boxes",
      seoDescription: metaDescription(
        "Shop chocolate gift combos for USA delivery. Ferrero Rocher, M&M's, and Skittles boxes shipped within the United States."
      ),
      sortOrder: 5,
    },
    {
      name: "Pooja Sets",
      slug: "pooja-sets",
      description:
        "Pooja gift sets for USA delivery — thali, toran, rangoli, kumkum, and metal pooja boxes shipped domestically.",
      seoTitle: "Pooja Sets USA | Festive Pooja Gift Hampers",
      seoDescription: metaDescription(
        "Shop pooja gift sets for USA delivery. Thali, toran, rangoli, and metal pooja boxes shipped within the United States."
      ),
      sortOrder: 6,
    },
  ];

  for (const category of categories) {
    const item = {
      ...category,
      published: true,
      PK: categoryKeys.pk(category.slug),
      SK: categoryKeys.sk(),
      GSI1PK: categoryKeys.gsi1pk(),
      GSI1SK: categoryKeys.gsi1sk(category.sortOrder, category.slug),
      createdAt: ts,
      updatedAt: ts,
    };
    if (DRY_RUN) console.log("[dry-run] category", category.slug);
    else {
      const existing = await ddb.send(
        new GetCommand({
          TableName: PRODUCTS_TABLE,
          Key: { PK: categoryKeys.pk(category.slug), SK: categoryKeys.sk() },
        })
      );
      if (existing.Item?.createdAt) item.createdAt = existing.Item.createdAt as string;
      await ddb.send(new PutCommand({ TableName: PRODUCTS_TABLE, Item: item }));
      console.log("✓ category", category.slug);
    }
  }

  for (const row of rows) {
    const priced = festivalPrices(row.vendorCost);
    const tags = contentTags(row.items, row.categorySlug);
    const additionalCategorySlugs = tags
      .map((tag) => EXTRA_CATEGORY[tag])
      .filter((slug): slug is string => Boolean(slug));
    const files = imagesForSku(row.sku);
    const imageUrls: string[] = [];
    for (const file of files) {
      const key = `uploads/orange-county/${row.sku}/${file}`;
      if (SKIP_S3) {
        imageUrls.push(CDN ? `https://${CDN}/${key}` : `/${key}`);
        continue;
      }
      imageUrls.push(await ensureS3(s3, join(IMG_DIR, file), key));
    }

    const description = buildDescription(row.name, row.categorySlug, row.items, row.sku);
    const seoDescription = metaDescription(
      `${row.name} for USA delivery. Includes ${row.items.slice(0, 3).join(", ")}. Ships domestically within the United States.`
    );
    const heavy = row.categorySlug === "diwali";
    const item = {
      name: row.name,
      slug: row.slug,
      description,
      price: priced.price,
      compareAtPrice: priced.compareAtPrice,
      currency: "USD" as const,
      categorySlug: row.categorySlug,
      images: imageUrls,
      sku: row.sku,
      inventory: ORANGE_COUNTY_PRODUCT_INVENTORY,
      tags,
      ...(additionalCategorySlugs.length > 0 ? { additionalCategorySlugs } : {}),
      vendorSlug: VENDOR_ORANGE_COUNTY,
      vendorCost: priced.vendorCost,
      seoTitle: `${row.name} | USA Delivery`,
      seoDescription,
      published: true,
      weightOz: heavy ? 48 : 32,
      lengthIn: heavy ? 12 : 10,
      widthIn: heavy ? 10 : 8,
      heightIn: heavy ? 4 : 4,
      PK: productKeys.pk(row.slug),
      SK: productKeys.sk(),
      GSI1PK: productKeys.gsi1pk(row.categorySlug),
      GSI1SK: productKeys.gsi1sk(row.slug),
      createdAt: ts,
      updatedAt: ts,
    };
    keepSlugs.add(row.slug);
    catalogProducts.push(item);
    console.log(
      `• ${row.sku} cost=$${priced.vendorCost} sale=$${priced.price} list=$${priced.compareAtPrice} images=${imageUrls.length} ${row.slug}`
    );

    if (DRY_RUN) continue;

    const existing = await ddb.send(
      new GetCommand({
        TableName: PRODUCTS_TABLE,
        Key: { PK: productKeys.pk(row.slug), SK: productKeys.sk() },
      })
    );
    if (existing.Item) {
      item.createdAt = (existing.Item.createdAt as string) ?? ts;
      if (existing.Item.unitsSold != null) {
        (item as { unitsSold?: number }).unitsSold = existing.Item.unitsSold as number;
      }
      const merged = resolveProductImagesForUpsert(imageUrls, existing.Item.images as string[] | undefined);
      item.images = merged.images;
    }
    await ddb.send(new PutCommand({ TableName: PRODUCTS_TABLE, Item: item }));
  }

  writeFileSync(
    CATALOG_OUT,
    JSON.stringify({ generatedAt: ts, products: catalogProducts }, null, 2)
  );
  console.log(`Wrote ${CATALOG_OUT}`);

  await pausePreviousCatalog(ddb, keepSlugs, ts);
}

async function pausePreviousCatalog(
  ddb: DynamoDBDocumentClient,
  keepSlugs: Set<string>,
  ts: string
) {
  const items: Record<string, unknown>[] = [];
  let ExclusiveStartKey: Record<string, unknown> | undefined;
  do {
    const result = await ddb.send(
      new ScanCommand({ TableName: PRODUCTS_TABLE, ExclusiveStartKey })
    );
    items.push(...((result.Items ?? []) as Record<string, unknown>[]));
    ExclusiveStartKey = result.LastEvaluatedKey as Record<string, unknown> | undefined;
  } while (ExclusiveStartKey);

  let pausedProducts = 0;
  let unpublishedCategories = 0;
  for (const item of items) {
    const pk = String(item.PK ?? "");
    const sk = String(item.SK ?? "");
    if (sk !== "META") continue;
    const slug = typeof item.slug === "string" ? item.slug : "";

    if (pk.startsWith("CATEGORY#")) {
      if (!slug || KEEP_CATEGORIES.has(slug) || item.published === false) continue;
      console.log(`${DRY_RUN ? "WOULD UNPUBLISH CATEGORY" : "UNPUBLISH CATEGORY"} ${slug}`);
      if (!DRY_RUN) {
        await ddb.send(
          new UpdateCommand({
            TableName: PRODUCTS_TABLE,
            Key: { PK: pk, SK: sk },
            UpdateExpression: "SET published = :pub, updatedAt = :now",
            ExpressionAttributeValues: { ":pub": false, ":now": ts },
          })
        );
      }
      unpublishedCategories += 1;
      continue;
    }

    if (!pk.startsWith("PRODUCT#") || !slug || keepSlugs.has(slug)) continue;
    const tags = Array.isArray(item.tags) ? (item.tags as string[]) : [];
    const already =
      Number(item.inventory ?? 0) === 0 && tags.includes(RAKHI_SEASON_PAUSED_TAG);
    if (already) continue;
    const nextTags = Array.from(
      new Set([...tags.filter((tag) => tag !== OLD_OOS_TAG), RAKHI_SEASON_PAUSED_TAG])
    );
    console.log(
      `${DRY_RUN ? "WOULD PAUSE" : "PAUSE"} ${slug} inventory ${item.inventory ?? "?"} → 0`
    );
    if (!DRY_RUN) {
      await ddb.send(
        new UpdateCommand({
          TableName: PRODUCTS_TABLE,
          Key: { PK: pk, SK: sk },
          UpdateExpression: "SET inventory = :zero, tags = :tags, updatedAt = :now",
          ExpressionAttributeValues: {
            ":zero": 0,
            ":tags": nextTags,
            ":now": ts,
          },
        })
      );
    }
    pausedProducts += 1;
  }

  console.log(
    JSON.stringify(
      { pausedProducts, unpublishedCategories, kept: keepSlugs.size, dryRun: DRY_RUN },
      null,
      2
    )
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
