/**
 * Redirects from the old WordPress / WooCommerce site so inbound links are not lost.
 * See also categoryRedirectRules() for category slug migrations.
 */
export function legacyRedirectRules(): {
  source: string;
  destination: string;
  permanent: true;
}[] {
  const home = "/";
  const rules: { source: string; destination: string; permanent: true }[] = [];

  const toHome = (source: string) => rules.push({ source, destination: home, permanent: true });

  // WooCommerce tags (e.g. /product-tag/online-rakhi-india)
  toHome("/product-tag/:path*");

  // Generic WP tags
  toHome("/tag/:path*");

  // Old single-segment product URLs → new /products/:slug (slug may still 404 → home)
  rules.push({ source: "/product/:slug", destination: "/products/:slug", permanent: true });

  // WP core / misc paths
  toHome("/wp-admin/:path*");
  toHome("/wp-content/:path*");
  toHome("/wp-includes/:path*");
  toHome("/feed");
  toHome("/feed/:path*");
  toHome("/author/:path*");
  toHome("/page/:path*");
  toHome("/comments/:path*");
  toHome("/my-account/:path*");

  // Do not redirect /cart or /checkout — those are live app routes.

  // Old shop index
  rules.push({ source: "/shop", destination: "/products", permanent: true });
  rules.push({ source: "/shop/:path*", destination: "/products", permanent: true });

  return rules;
}
