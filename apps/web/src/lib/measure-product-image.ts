import { productImageVariantUrl, type SizedProductImage } from "@hr-ecom/shared";

/**
 * Probe the tiny thumb variant for dimensions. If it is missing (pre-backfill),
 * keep the original URL so the gallery never goes blank.
 */
export function measureProductImageUrl(url: string): Promise<SizedProductImage> {
  const thumb = productImageVariantUrl(url, "thumb");
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ url, width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve({ url, width: 1200, height: 1200 });
    img.src = thumb;
  });
}
