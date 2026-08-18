/**
 * Resolve a product for storefront/cart: DynamoDB first, then auto-create from
 * bundled catalogs (Orange County hampers, UsaRakhi catalog) when missing.
 */
import { ensureOrangeCountyProductInDb } from "./orange-county-catalog";
import { ensureUsarakhiCatalogProductInDb } from "./usarakhi-catalog";
import { ensureMiniRakhiComboInDb } from "./mini-rakhi-combos";

export async function ensureProductInDb(slug: string): Promise<Record<string, unknown> | null> {
  const fromOc = await ensureOrangeCountyProductInDb(slug);
  if (fromOc) return fromOc;
  const fromCombo = await ensureMiniRakhiComboInDb(slug);
  if (fromCombo) return fromCombo;
  return ensureUsarakhiCatalogProductInDb(slug);
}
