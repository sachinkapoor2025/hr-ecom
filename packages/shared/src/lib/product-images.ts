/** Normalize image URLs for deduplication (path-only, case-insensitive). */
export function normalizeProductImageKey(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "";
  try {
    const parsed = new URL(trimmed);
    return decodeURIComponent(parsed.pathname).toLowerCase();
  } catch {
    return trimmed.toLowerCase();
  }
}

/** Admin portal uploads are stored under S3/CloudFront `products/<uuid>.<ext>`. */
export function isAdminUploadedProductImage(url: string): boolean {
  return /\/products\//i.test(url);
}

/**
 * Merge catalog/import images with existing DB images.
 * Import order first, then preserve admin uploads and any extra images already stored.
 */
export function mergeProductImages(imported: string[], existing: string[] = []): string[] {
  const seen = new Set<string>();
  const merged: string[] = [];

  const add = (url: string) => {
    const key = normalizeProductImageKey(url);
    if (!key || seen.has(key)) return;
    seen.add(key);
    merged.push(url.trim());
  };

  for (const url of imported) add(url);
  for (const url of existing) add(url);

  return merged;
}
