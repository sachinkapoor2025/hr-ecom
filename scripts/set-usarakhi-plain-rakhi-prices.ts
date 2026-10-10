/**
 * Retired. The $3 / $5 / $7 cost job overwrites live $1.99-tier catalog prices.
 *
 *   ENVIRONMENT=prod npx tsx scripts/apply-catalog-price-reset.ts --dry-run
 *   ENVIRONMENT=prod npx tsx scripts/apply-catalog-price-reset.ts --apply
 */
console.error(
  "scripts/set-usarakhi-plain-rakhi-prices.ts is retired ($3/$5/$7). Use scripts/apply-catalog-price-reset.ts instead."
);
process.exit(1);
