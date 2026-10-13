/**
 * Resolve a product for storefront/cart: DynamoDB first, then auto-create from
 * bundled catalogs when the row is missing. Existing rows are not overwritten.
 * Festival 2026 is last because those slugs are not in the older catalogs.
 */
import { ensureOrangeCountyProductInDb } from "./orange-county-catalog";
import { ensureUsarakhiCatalogProductInDb } from "./usarakhi-catalog";
import { ensureMiniRakhiComboInDb } from "./mini-rakhi-combos";
import { ensureFestivalProductInDb } from "./festival-catalog";

export async function ensureProductInDb(slug: string): Promise<Record<string, unknown> | null> {
  const fromOc = await ensureOrangeCountyProductInDb(slug);
  if (fromOc) return fromOc;
  const fromCombo = await ensureMiniRakhiComboInDb(slug);
  if (fromCombo) return fromCombo;
  const fromUsa = await ensureUsarakhiCatalogProductInDb(slug);
  if (fromUsa) return fromUsa;
  return ensureFestivalProductInDb(slug);
}
