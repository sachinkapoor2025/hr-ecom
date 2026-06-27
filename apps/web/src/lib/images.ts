import { getCdnUrl } from "./env";

/** Map legacy WordPress media URLs to the S3/CloudFront CDN mirror. */
export function resolveImageUrl(url: string | undefined | null): string {
  if (!url) return "";
  const trimmed = url.trim();
  if (!trimmed) return "";

  const cdn = getCdnUrl();
  if (cdn && trimmed.startsWith(cdn)) return trimmed;

  const uploadsMatch = trimmed.match(/\/wp-content\/uploads\/(.+)$/i);
  if (uploadsMatch && cdn) {
    return `${cdn}/uploads/${uploadsMatch[1]}`;
  }

  return trimmed;
}

export function resolveImageUrls(urls: string[] | undefined | null): string[] {
  if (!urls?.length) return [];
  return urls.map(resolveImageUrl).filter(Boolean);
}
