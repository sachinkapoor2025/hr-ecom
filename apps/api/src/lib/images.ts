import { resolveProductImageUrl, resolveProductImageUrls } from "@hr-ecom/shared";

export function withResolvedProductImages<T extends { images?: string[] }>(item: T): T {
  if (!item.images?.length) return item;
  return { ...item, images: resolveProductImageUrls(item.images) };
}

export { resolveProductImageUrl, resolveProductImageUrls };
