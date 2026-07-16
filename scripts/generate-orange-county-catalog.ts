/**
 * Build scripts/data/orange-county-hampers.json from the vendor Excel.
 * Optionally copy images into apps/web/public/uploads/orange-county/ for storefront fallback.
 *
 *   npx tsx scripts/generate-orange-county-catalog.ts
 *   COPY_IMAGES=1 npx tsx scripts/generate-orange-county-catalog.ts
 */
import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } from "fs";
import { join, extname, basename, resolve } from "path";
import * as XLSX from "xlsx";
import {
  ORANGE_COUNTY_CATEGORY_SLUG,
  pricingFromVendorCost,
  metaDescription,
  DEFAULT_PRODUCT_INVENTORY,
} from "@hr-ecom/shared";
import { buildHamperHtmlDescription, buildHamperSeoDescription } from "./lib/hamper-description";

const ROOT = resolve(process.cwd());
const CATALOG_DIR = resolve(
  process.env.ORANGE_COUNTY_CATALOG_DIR ?? join(ROOT, "USA Rakhi Images Catalouge  2026i")
);
const EXCEL_NAME = "USA Rakhi Catalouge sheet  2026.xlsx";
const OUT = join(ROOT, "scripts/data/orange-county-hampers.json");
const PUBLIC_IMG = join(ROOT, "apps/web/public/uploads/orange-county");
const COPY_IMAGES = process.env.COPY_IMAGES === "1" || process.env.COPY_IMAGES === "true";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function imagesForSku(sku: string, files: string[]): string[] {
  const base = sku.toLowerCase();
  const suffixRe = new RegExp(`^${escapeRe(base)}[a-z]$`, "i");
  return files
    .filter((f) => {
      const stem = f.replace(/\.[^.]+$/, "").toLowerCase().replace(/[`']/g, "");
      if (stem === base) return true;
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
  const products: { sku: string; name: string; description: string; vendorCost: number }[] = [];
  for (const r of rows) {
    const sku = String(r.__EMPTY_2 ?? "").trim();
    const name = String(r.__EMPTY_3 ?? "").trim();
    if (!sku || !name || sku.toLowerCase() === "sku code") continue;
    const vendorCost = Number(r.__EMPTY_5);
    if (!Number.isFinite(vendorCost) || vendorCost <= 0) continue;
    products.push({
      sku,
      name,
      description: String(r.__EMPTY_4 ?? "").trim(),
      vendorCost,
    });
  }
  return products;
}

const excelPath = join(CATALOG_DIR, EXCEL_NAME);
if (!existsSync(excelPath)) throw new Error(`Excel not found: ${excelPath}`);

const imageFiles = readdirSync(CATALOG_DIR).filter((f) => /\.(jpe?g|png|webp)$/i.test(f));
const rows = parseExcel(excelPath);
const ts = new Date().toISOString();
const categorySlug = ORANGE_COUNTY_CATEGORY_SLUG;

if (COPY_IMAGES) mkdirSync(PUBLIC_IMG, { recursive: true });

const products = rows.map((row) => {
  const pricing = pricingFromVendorCost(row.vendorCost, "USD");
  // Public URL = product name only (SKU stays on the product record, not in the path).
  const slug = slugify(row.name);
  const localImages = imagesForSku(row.sku, imageFiles);
  const imageUrls: string[] = [];

  for (const file of localImages) {
    const safeName = basename(file).replace(/[`']/g, "").replace(/\s+/g, "-");
    const publicPath = `/uploads/orange-county/${row.sku}/${safeName}`;
    if (COPY_IMAGES) {
      const destDir = join(PUBLIC_IMG, row.sku);
      mkdirSync(destDir, { recursive: true });
      copyFileSync(join(CATALOG_DIR, file), join(destDir, safeName));
    }
    imageUrls.push(publicPath);
  }

  return {
    name: row.name,
    slug,
    description: buildHamperHtmlDescription(row.name, row.description, row.sku),
    price: pricing.price,
    compareAtPrice: pricing.compareAtPrice,
    currency: "USD",
    categorySlug,
    images: imageUrls,
    sku: row.sku,
    inventory: DEFAULT_PRODUCT_INVENTORY,
    tags: ["rakhi-hamper", "gift-hamper", "raksha-bandhan", "dry-fruits", "send-rakhi-to-usa"],
    seoTitle: `Send ${row.name} to USA | Free Shipping | Rakhi Hamper`,
    seoDescription: metaDescription(buildHamperSeoDescription(row.name, row.description, pricing.price)),
    published: true,
    createdAt: ts,
    updatedAt: ts,
  };
});

mkdirSync(join(ROOT, "scripts/data"), { recursive: true });
writeFileSync(OUT, JSON.stringify({ products }, null, 2));
console.log(`Wrote ${products.length} hampers → ${OUT}`);
if (COPY_IMAGES) console.log(`Copied images → ${PUBLIC_IMG}`);
else console.log("Skipped image copy (set COPY_IMAGES=1 to copy into public/)");
