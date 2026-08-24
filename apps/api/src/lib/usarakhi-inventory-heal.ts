import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import {
  DEFAULT_PRODUCT_INVENTORY,
  USARAKHI_STOREFRONT_PAUSED,
  VENDOR_ORANGE_COUNTY,
  isForceOutOfStockSlug,
  productKeys,
  type Product,
} from "@hr-ecom/shared";
import { docClient, PRODUCTS_TABLE, now } from "./db";

/** Tag added by scripts/oos-all-usarakhi-products.ts during the peak-season pause. */
export const USARAKHI_OOS_PAUSE_TAG = "usarakhi-oos-2026-08-24";

function isOrangeCounty(product: Pick<Product, "vendorSlug" | "images">): boolean {
  if ((product.vendorSlug ?? "").trim() === VENDOR_ORANGE_COUNTY) return true;
  return (product.images ?? []).some((src) => src.includes("/uploads/orange-county/"));
}

/** True for UsaRakhi SKUs zeroed by the bulk OOS script (tagged), not admin manual OOS. */
export function shouldHealUsarakhiInventory(
  product: Pick<Product, "slug" | "tags" | "vendorSlug" | "images">
): boolean {
  if (USARAKHI_STOREFRONT_PAUSED) return false;
  const slug = product.slug?.trim();
  if (!slug || isOrangeCounty(product) || isForceOutOfStockSlug(slug)) return false;
  return (product.tags ?? []).includes(USARAKHI_OOS_PAUSE_TAG);
}

export async function healUsarakhiInventoryIfNeeded(product: Product): Promise<Product> {
  if (!shouldHealUsarakhiInventory(product)) return product;

  const nextTags = (product.tags ?? []).filter((t) => t !== USARAKHI_OOS_PAUSE_TAG);
  const ts = now();

  await docClient.send(
    new UpdateCommand({
      TableName: PRODUCTS_TABLE,
      Key: { PK: productKeys.pk(product.slug), SK: productKeys.sk() },
      UpdateExpression: "SET inventory = :inv, tags = :tags, updatedAt = :now",
      ExpressionAttributeValues: {
        ":inv": DEFAULT_PRODUCT_INVENTORY,
        ":tags": nextTags,
        ":now": ts,
      },
    })
  );

  return { ...product, inventory: DEFAULT_PRODUCT_INVENTORY, tags: nextTags, updatedAt: ts };
}

let bulkHealInFlight: Promise<void> | null = null;

/** Restore all paused UsaRakhi SKUs in one pass (idempotent after tags are cleared). */
export async function healAllPausedUsarakhiProducts(products: Product[]): Promise<Product[]> {
  if (USARAKHI_STOREFRONT_PAUSED) return products;

  const toHeal = products.filter(shouldHealUsarakhiInventory);
  if (toHeal.length === 0) return products;

  if (!bulkHealInFlight) {
    bulkHealInFlight = (async () => {
      for (let i = 0; i < toHeal.length; i += 25) {
        const chunk = toHeal.slice(i, i + 25);
        await Promise.all(chunk.map((product) => healUsarakhiInventoryIfNeeded(product)));
      }
      console.log(`Restored inventory for ${toHeal.length} UsaRakhi products after OOS pause`);
    })().finally(() => {
      bulkHealInFlight = null;
    });
  }

  await bulkHealInFlight;

  const healedSlugs = new Set(toHeal.map((p) => p.slug));
  return products.map((product) =>
    healedSlugs.has(product.slug)
      ? {
          ...product,
          inventory: DEFAULT_PRODUCT_INVENTORY,
          tags: (product.tags ?? []).filter((t) => t !== USARAKHI_OOS_PAUSE_TAG),
        }
      : product
  );
}
