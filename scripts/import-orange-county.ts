/**
 * Import Orange County Rakhi Hampers from the vendor Excel + local image folder.
 *
 * Pricing (vendor Excel = cost):
 *   compareAtPrice = cost × 1.80  (80% markup / "was" price)
 *   price          = cost × 1.40  (sale price — ~40% over cost)
 *
 * Images → S3 under uploads/orange-county/<sku>/...
 * Products tagged vendorSlug=orange-county, category=rakhi-hampers
 *
 * Usage:
 *   ENVIRONMENT=prod \
 *   UPLOAD_BUCKET=hr-ecom-upload-prod-xxxxx \
 *   CLOUDFRONT_DOMAIN=dxxxx.cloudfront.net \
 *   npm run import:orange-county
 *
 * Dry run (no writes):
 *   DRY_RUN=1 npm run import:orange-county
 *
 * Local API only (skip S3, use file:// or leave images empty until upload):
 *   SKIP_S3=1 ENVIRONMENT=local npm run import:orange-county
 */
import { readdirSync, readFileSync, existsSync } from "fs";
import { join, extname, basename, resolve } from "path";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { S3Client, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import * as XLSX from "xlsx";
import {
  VENDOR_ORANGE_COUNTY,
  ORANGE_COUNTY_CATEGORY_SLUG,
  categoryKeys,
  productKeys,
  pricingFromVendorCost,
  metaDescription,
  DEFAULT_PRODUCT_INVENTORY,
} from "@hr-ecom/shared";
import { buildHamperHtmlDescription, buildHamperSeoDescription } from "./lib/hamper-description";

const ENV = process.env.ENVIRONMENT ?? "prod";
const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE ?? `hr-ecom-products-${ENV}`;
const BUCKET = process.env.UPLOAD_BUCKET;
const CDN = process.env.CLOUDFRONT_DOMAIN?.replace(/^https?:\/\//, "").replace(/\/$/, "");
const DRY_RUN = process.env.DRY_RUN === "1" || process.env.DRY_RUN === "true";
const SKIP_S3 = process.env.SKIP_S3 === "1" || process.env.SKIP_S3 === "true";

const CATALOG_DIR = resolve(
  process.env.ORANGE_COUNTY_CATALOG_DIR ??
    join(process.cwd(), "USA Rakhi Images Catalouge  2026i")
);
const EXCEL_NAME = "USA Rakhi Catalouge sheet  2026.xlsx";

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function nowIso() {
  return new Date().toISOString();
}

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Match TFUSRH2026-3.jpg / TFUSRH2026-3a.jpg but not TFUSRH2026-31.jpg */
function imagesForSku(sku: string, files: string[]): string[] {
  const base = sku.toLowerCase();
  const suffixRe = new RegExp(`^${escapeRe(base)}[a-z]$`, "i");
  return files
    .filter((f) => {
      const stem = f.replace(/\.[^.]+$/, "").toLowerCase().replace(/[`']/g, "");
      if (stem === base) return true;
      // letter suffix only (a, b, c…) — not digit continuation (e.g. -31)
      return suffixRe.test(stem);
    })
    .sort((a, b) => {
      const sa = a.replace(/\.[^.]+$/, "").toLowerCase().replace(/[`']/g, "");
      const sb = b.replace(/\.[^.]+$/, "").toLowerCase().replace(/[`']/g, "");
      if (sa === base) return -1;
      if (sb === base) return 1;
      return sa.localeCompare(sb);
    });
}

function parseExcel(path: string) {
  const wb = XLSX.readFile(path);
  const sheet = wb.Sheets[wb.SheetNames[0]!];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
  const products: {
    sno: number;
    sku: string;
    name: string;
    description: string;
    vendorCost: number;
  }[] = [];

  for (const r of rows) {
    const sku = String(r.__EMPTY_2 ?? "").trim();
    const name = String(r.__EMPTY_3 ?? "").trim();
    if (!sku || !name || sku.toLowerCase() === "sku code") continue;
    const vendorCost = Number(r.__EMPTY_5);
    if (!Number.isFinite(vendorCost) || vendorCost <= 0) {
      console.warn(`Skip ${sku}: invalid price`, r.__EMPTY_5);
      continue;
    }
    products.push({
      sno: Number(r.__EMPTY) || products.length + 1,
      sku,
      name,
      description: String(r.__EMPTY_4 ?? "").trim(),
      vendorCost,
    });
  }
  return products;
}

function seoFor(
  name: string,
  salePrice: number,
  rawInclusions: string
): { seoTitle: string; seoDescription: string } {
  return {
    seoTitle: `Send ${name} to USA | Free Shipping | Rakhi Hamper`,
    seoDescription: metaDescription(buildHamperSeoDescription(name, rawInclusions, salePrice)),
  };
}

async function ensureS3Image(
  s3: S3Client,
  localPath: string,
  key: string,
  cache: Map<string, string>
): Promise<string | null> {
  if (cache.has(key)) return cache.get(key)!;

  if (DRY_RUN) {
    const url = CDN ? `https://${CDN}/${key}` : `https://cdn.example/${key}`;
    console.log(`  [dry-run] would upload ${key}`);
    cache.set(key, url);
    return url;
  }

  if (!BUCKET || !CDN) throw new Error("UPLOAD_BUCKET and CLOUDFRONT_DOMAIN required");

  const url = `https://${CDN}/${key}`;
  try {
    await s3.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
    cache.set(key, url);
    return url;
  } catch {
    /* upload */
  }

  const ext = extname(localPath).toLowerCase();
  const body = readFileSync(localPath);
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: body,
      ContentType: MIME[ext] ?? "application/octet-stream",
      CacheControl: "public, max-age=31536000, immutable",
    })
  );
  cache.set(key, url);
  console.log(`  ↑ ${key}`);
  return url;
}

async function main() {
  const excelPath = join(CATALOG_DIR, EXCEL_NAME);
  if (!existsSync(excelPath)) {
    throw new Error(`Excel not found: ${excelPath}`);
  }
  if (!existsSync(CATALOG_DIR)) {
    throw new Error(`Catalog dir not found: ${CATALOG_DIR}`);
  }

  const imageFiles = readdirSync(CATALOG_DIR).filter((f) => /\.(jpe?g|png|webp)$/i.test(f));
  const rows = parseExcel(excelPath);
  console.log(`Orange County import: ${rows.length} products, ${imageFiles.length} images in folder`);
  console.log(`Table=${PRODUCTS_TABLE} DRY_RUN=${DRY_RUN} SKIP_S3=${SKIP_S3}`);

  if (!SKIP_S3 && (!BUCKET || !CDN) && !DRY_RUN) {
    throw new Error("Set UPLOAD_BUCKET and CLOUDFRONT_DOMAIN (or SKIP_S3=1 / DRY_RUN=1)");
  }

  const ddb = DynamoDBDocumentClient.from(
    new DynamoDBClient({ region: process.env.AWS_REGION ?? "us-east-1" }),
    { marshallOptions: { removeUndefinedValues: true } }
  );
  const s3 = new S3Client({ region: process.env.AWS_REGION ?? "us-east-1" });
  const uploadCache = new Map<string, string>();
  const ts = nowIso();

  // Category
  const categorySlug = ORANGE_COUNTY_CATEGORY_SLUG;
  const categoryItem = {
    name: "Rakhi Hamper",
    slug: categorySlug,
    description:
      "Premium Rakhi gift hampers for USA delivery — festive boxes with designer rakhis, sweets, dry fruits, and chocolates.",
    seoTitle: "Send Rakhi Hamper to USA | Gift Boxes | UsaRakhi",
    seoDescription: metaDescription(
      "Shop Rakhi hamper gift boxes for USA delivery. Combos with rakhi, kaju katli, dry fruits, and Ferrero. Fast domestic shipping across America."
    ),
    published: true,
    sortOrder: 15,
    PK: categoryKeys.pk(categorySlug),
    SK: categoryKeys.sk(),
    GSI1PK: categoryKeys.gsi1pk(),
    GSI1SK: categoryKeys.gsi1sk(15, categorySlug),
    createdAt: ts,
    updatedAt: ts,
  };

  if (DRY_RUN) {
    console.log("[dry-run] category", categoryItem.slug);
  } else {
    await ddb.send(new PutCommand({ TableName: PRODUCTS_TABLE, Item: categoryItem }));
    console.log("✓ category", categorySlug);
  }

  let imported = 0;
  for (const row of rows) {
    const pricing = pricingFromVendorCost(row.vendorCost, "USD");
    // Public URL = product name only (SKU stays on the product record, not in the path).
    const slug = slugify(row.name);
    const localImages = imagesForSku(row.sku, imageFiles);
    const imageUrls: string[] = [];

    if (!SKIP_S3) {
      for (const file of localImages) {
        const safeName = basename(file).replace(/[`']/g, "").replace(/\s+/g, "-");
        const key = `uploads/orange-county/${row.sku}/${safeName}`;
        const url = await ensureS3Image(s3, join(CATALOG_DIR, file), key, uploadCache);
        if (url) imageUrls.push(url);
      }
    }

    const { seoTitle, seoDescription } = seoFor(row.name, pricing.price, row.description);
    const description = buildHamperHtmlDescription(row.name, row.description, row.sku);

    const item = {
      name: row.name,
      slug,
      description,
      price: pricing.price,
      compareAtPrice: pricing.compareAtPrice,
      currency: "USD" as const,
      categorySlug,
      images: imageUrls,
      sku: row.sku,
      inventory: DEFAULT_PRODUCT_INVENTORY,
      // Public SEO tags only — vendor identity stays on vendorSlug (backend / order API).
      tags: [
        "rakhi-hamper",
        "gift-hamper",
        "raksha-bandhan",
        "dry-fruits",
        "send-rakhi-to-usa",
      ],
      vendorSlug: VENDOR_ORANGE_COUNTY,
      vendorCost: pricing.vendorCost,
      seoTitle,
      seoDescription,
      published: true,
      weightOz: 32,
      lengthIn: 10,
      widthIn: 8,
      heightIn: 4,
      PK: productKeys.pk(slug),
      SK: productKeys.sk(),
      GSI1PK: productKeys.gsi1pk(categorySlug),
      GSI1SK: productKeys.gsi1sk(slug),
      createdAt: ts,
      updatedAt: ts,
    };

    console.log(
      `• ${row.sku} → $${pricing.price} (was $${pricing.compareAtPrice}, cost $${pricing.vendorCost}) images=${imageUrls.length}/${localImages.length}`
    );

    if (DRY_RUN) continue;

    // Preserve inventory / unitsSold if product already exists
    const existing = await ddb.send(
      new GetCommand({
        TableName: PRODUCTS_TABLE,
        Key: { PK: productKeys.pk(slug), SK: productKeys.sk() },
      })
    );
    if (existing.Item) {
      item.inventory = (existing.Item.inventory as number) ?? item.inventory;
      item.createdAt = (existing.Item.createdAt as string) ?? ts;
      if (existing.Item.unitsSold != null) {
        (item as { unitsSold?: number }).unitsSold = existing.Item.unitsSold as number;
      }
      // Keep admin-added images if import found none
      if (!imageUrls.length && Array.isArray(existing.Item.images)) {
        item.images = existing.Item.images as string[];
      }
    }

    await ddb.send(new PutCommand({ TableName: PRODUCTS_TABLE, Item: item }));

    // Remove legacy name-sku URL records if they still exist in DynamoDB.
    const legacySlug = slugify(`${row.name}-${row.sku}`);
    if (legacySlug !== slug) {
      await ddb.send(
        new DeleteCommand({
          TableName: PRODUCTS_TABLE,
          Key: { PK: productKeys.pk(legacySlug), SK: productKeys.sk() },
        })
      );
    }

    imported += 1;
  }

  console.log(`Done. Imported/updated ${imported}/${rows.length} Orange County hampers.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
