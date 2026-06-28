/** Estimated visitor location from CDN edge headers (CloudFront on Amplify). */
export type ViewerGeo = {
  country?: string;
  region?: string;
  regionName?: string;
  city?: string;
};

const GEO_HEADER_KEYS: Record<keyof ViewerGeo, string[]> = {
  country: ["cloudfront-viewer-country", "cf-ipcountry", "x-country-code"],
  city: ["cloudfront-viewer-city"],
  region: ["cloudfront-viewer-country-region"],
  regionName: ["cloudfront-viewer-country-region-name"],
};

function decodeGeoHeader(value: string): string {
  try {
    return decodeURIComponent(value.replace(/\+/g, " ")).trim();
  } catch {
    return value.trim();
  }
}

function headerValue(headers: Record<string, string | undefined>, names: string[]): string | undefined {
  for (const name of names) {
    const direct = headers[name];
    if (direct) return decodeGeoHeader(direct);
    const lower = headers[name.toLowerCase()];
    if (lower) return decodeGeoHeader(lower);
  }
  return undefined;
}

/** Parse CloudFront / CDN geo headers (keys may be any casing). */
export function parseViewerGeoFromHeaders(
  headers: Record<string, string | undefined>
): ViewerGeo {
  const normalized: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (value) normalized[key.toLowerCase()] = value;
  }

  const country = headerValue(normalized, GEO_HEADER_KEYS.country)?.toUpperCase();
  const city = headerValue(normalized, GEO_HEADER_KEYS.city);
  const region = headerValue(normalized, GEO_HEADER_KEYS.region)?.toUpperCase();
  const regionName = headerValue(normalized, GEO_HEADER_KEYS.regionName);

  const geo: ViewerGeo = {};
  if (country && /^[A-Z]{2}$/.test(country)) geo.country = country;
  if (city) geo.city = city;
  if (region) geo.region = region;
  if (regionName) geo.regionName = regionName;
  return geo;
}

export function mergeViewerGeo(client: ViewerGeo, edge: ViewerGeo): ViewerGeo {
  return {
    country: client.country ?? edge.country,
    city: client.city ?? edge.city,
    region: client.region ?? edge.region,
    regionName: client.regionName ?? edge.regionName,
  };
}

/** Human-readable location for admin. */
export function formatViewerLocation(
  geo: ViewerGeo,
  hints?: { timezone?: string; locale?: string }
): string {
  const parts: string[] = [];
  if (geo.city) parts.push(geo.city);
  const regionLabel = geo.regionName ?? geo.region;
  if (regionLabel && regionLabel.toLowerCase() !== geo.city?.toLowerCase()) {
    parts.push(regionLabel);
  }
  if (geo.country) parts.push(geo.country);
  if (parts.length > 0) return parts.join(", ");

  if (hints?.timezone?.includes("Kolkata") || hints?.timezone?.includes("Calcutta")) {
    return "IN";
  }
  if (hints?.locale?.startsWith("en-IN")) return "IN";
  if (hints?.locale?.startsWith("en-US")) return "US";
  if (hints?.timezone) return hints.timezone;
  return "—";
}

export function viewerGeoFromMetadata(metadata?: Record<string, string>): ViewerGeo {
  if (!metadata) return {};
  return {
    country: metadata.country,
    city: metadata.city,
    region: metadata.region,
    regionName: metadata.regionName,
  };
}
