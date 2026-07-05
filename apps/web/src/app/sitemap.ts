import type { MetadataRoute } from "next";
import { api } from "@/lib/api";
import type { Product } from "@hr-ecom/shared";
import { siteUrl } from "@/lib/env";
import { categoryHref } from "@/lib/category-urls";
import { categoryOrder } from "@/lib/site";
import { listAllBlogPosts } from "@/lib/content/blog-posts";
import { allSeoLocationSlugs, locationPublicPath } from "@/lib/content/seo-data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/products`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/reviews`, lastModified: now, changeFrequency: "weekly", priority: 0.75 },
    { url: `${siteUrl}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/shipping`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/raksha-bandhan`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${siteUrl}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${siteUrl}/returns`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/press`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/llms.txt`, lastModified: now, changeFrequency: "weekly", priority: 0.5 },
    { url: `${siteUrl}/llms-full.txt`, lastModified: now, changeFrequency: "daily", priority: 0.5 },
    { url: `${siteUrl}/humans.txt`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
  ];

  const categoryRoutes = categoryOrder.map((slug) => ({
    url: `${siteUrl}${categoryHref(slug)}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  const locationRoutes = allSeoLocationSlugs().map((slug) => ({
    url: `${siteUrl}${locationPublicPath(slug)}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: slug.includes("los-angeles") || slug.includes("san-") ? 0.8 : 0.72,
  }));

  const blogRoutes = listAllBlogPosts().map((p) => ({
    url: `${siteUrl}/blog/${p.slug}`,
    lastModified: new Date(p.updatedAt),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  try {
    const productsData = await api<{ products: Product[] }>("/products");
    const productRoutes = productsData.products.map((p) => ({
      url: `${siteUrl}/products/${p.slug}`,
      lastModified: new Date(p.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    return [...staticRoutes, ...categoryRoutes, ...locationRoutes, ...blogRoutes, ...productRoutes];
  } catch {
    return [...staticRoutes, ...categoryRoutes, ...locationRoutes, ...blogRoutes];
  }
}
