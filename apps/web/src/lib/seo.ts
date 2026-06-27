import type { Metadata } from "next";
import { site, testimonials } from "./site";
import { siteUrl } from "./env";

/** Build absolute canonical URL for a path (no query string). */
export function canonical(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${siteUrl}${p === "/" ? "" : p}`.replace(/([^:]\/)\/+/g, "$1") || siteUrl;
}

export const defaultKeywords = [
  "send rakhi to USA",
  "rakhi delivery USA",
  "online rakhi USA",
  "rakhi for brother in USA",
  "raksha bandhan USA",
  "send rakhi from India to USA",
  "rakhi combo USA",
  "bhaiya bhabhi rakhi USA",
  "kids rakhi USA",
  "lumba rakhi USA",
  "UsaRakhi",
  "usarakhi.com",
].join(", ");

export function pageMetadata(opts: {
  title: string;
  description: string;
  path: string;
  keywords?: string;
  ogImage?: string;
  noIndex?: boolean;
}): Metadata {
  const url = canonical(opts.path);
  const image = opts.ogImage ?? site.logoSrc;
  return {
    title: opts.title,
    description: opts.description,
    keywords: opts.keywords ?? defaultKeywords,
    alternates: { canonical: url },
    openGraph: {
      title: opts.title,
      description: opts.description,
      url,
      siteName: site.name,
      locale: "en_US",
      type: "website",
      images: [{ url: image, alt: site.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: opts.title,
      description: opts.description,
      images: [image],
    },
    robots: opts.noIndex ? { index: false, follow: false } : { index: true, follow: true },
  };
}

export function organizationJsonLd() {
  const avgRating =
    testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length;

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name: site.name,
    url: siteUrl,
    logo: site.logoSrc,
    description: site.description,
    email: site.supportEmail,
    telephone: site.phone,
    sameAs: [`https://${site.domain}`],
    areaServed: { "@type": "Country", name: "United States" },
    knowsAbout: [
      "Raksha Bandhan",
      "Rakhi delivery to USA",
      "Online Rakhi shopping",
      "Indian festival gifts USA",
      "Send rakhi from India to USA",
      "Rakhi combo with chocolates",
      "Bhaiya Bhabhi Rakhi",
      "Kids Rakhi USA",
      "Lumba Rakhi",
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: avgRating.toFixed(1),
      bestRating: "5",
      worstRating: "1",
      reviewCount: String(testimonials.length),
    },
    review: testimonials.map((t) => ({
      "@type": "Review",
      author: { "@type": "Person", name: t.name },
      reviewRating: {
        "@type": "Rating",
        ratingValue: String(t.rating),
        bestRating: "5",
      },
      reviewBody: t.text,
    })),
  };
}

export function onlineStoreJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    "@id": `${siteUrl}/#store`,
    name: site.name,
    url: siteUrl,
    description: site.description,
    image: site.logoSrc,
    email: site.supportEmail,
    telephone: site.phone,
    areaServed: { "@type": "Country", name: "United States" },
    priceRange: "$$",
    currenciesAccepted: "USD, INR",
    paymentAccepted: "Credit Card, Debit Card, Razorpay, Stripe",
    parentOrganization: { "@id": `${siteUrl}/#organization` },
  };
}

export function webSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    name: site.name,
    url: siteUrl,
    description: site.description,
    publisher: { "@id": `${siteUrl}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/products?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function faqJsonLd(faqs: readonly { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: canonical(item.path),
    })),
  };
}

export function productJsonLd(product: {
  slug: string;
  name: string;
  description: string;
  images?: string[];
  sku?: string;
  price: number;
  currency: string;
  inventory: number;
  categorySlug?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${siteUrl}/products/${product.slug}#product`,
    name: product.name,
    description: product.description,
    image: product.images ?? [],
    sku: product.sku,
    url: canonical(`/products/${product.slug}`),
    brand: { "@type": "Brand", name: site.name },
    category: product.categorySlug?.replace(/-/g, " "),
    offers: {
      "@type": "Offer",
      url: canonical(`/products/${product.slug}`),
      price: product.price,
      priceCurrency: product.currency,
      availability:
        product.inventory > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      seller: { "@id": `${siteUrl}/#organization` },
    },
  };
}

export function articleJsonLd(article: {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    url: canonical(`/blog/${article.slug}`),
    datePublished: article.publishedAt,
    dateModified: article.updatedAt ?? article.publishedAt,
    ...(article.image ? { image: article.image } : {}),
    author: { "@type": "Organization", name: site.name },
    publisher: { "@id": `${siteUrl}/#organization` },
  };
}

export function itemListJsonLd(name: string, items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      url: canonical(item.path),
    })),
  };
}

export function howToSendRakhiJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to send Rakhi to USA online",
    description:
      "Order Rakhi for delivery anywhere in the United States from India, UK, Canada, or worldwide using UsaRakhi.",
    totalTime: "P7D",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Browse Rakhi collections",
        text: "Visit UsaRakhi.com and choose Single Rakhi, Rakhi Combo, Kids Rakhi, Bhaiya Bhabhi, or Lumba Rakhi.",
        url: canonical("/products"),
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "Add to cart",
        text: "Select your Rakhi. Most include complimentary roli and chawal for the Raksha Bandhan tilak.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Enter US delivery address",
        text: "At checkout, enter your brother's full US address — city, state, and ZIP code.",
        url: canonical("/shipping"),
      },
      {
        "@type": "HowToStep",
        position: 4,
        name: "Pay securely",
        text: "Complete payment with Razorpay (INR) or Stripe (USD).",
      },
      {
        "@type": "HowToStep",
        position: 5,
        name: "Receive delivery in USA",
        text: "UsaRakhi delivers domestically within America in 5–7 business days to all 50 states.",
      },
    ],
  };
}

export function rakshaBandhanEventJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: "Raksha Bandhan 2026",
    description:
      "Hindu festival celebrating the bond between brothers and sisters. Send Rakhi to USA with UsaRakhi.",
    startDate: "2026-08-28",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: {
      "@type": "Country",
      name: "United States",
    },
    organizer: { "@id": `${siteUrl}/#organization` },
    url: canonical("/raksha-bandhan"),
  };
}

export function contactPageJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: `Contact ${site.name}`,
    url: canonical("/contact"),
    description: `Contact ${site.name} for Rakhi delivery support and Raksha Bandhan order help.`,
    mainEntity: { "@id": `${siteUrl}/#organization` },
  };
}

export function serviceAreaJsonLd(city: { label: string; slug: string; state?: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `Rakhi Delivery to ${city.label}, USA`,
    description: `Send Rakhi to ${city.label} with ${site.name}. Premium rakhis delivered in 5–7 business days across the United States.`,
    url: canonical(`/cities/${city.slug}`),
    provider: { "@id": `${siteUrl}/#organization` },
    areaServed: {
      "@type": city.state ? "City" : "State",
      name: city.state ? `${city.label}, ${city.state}` : city.label,
      containedInPlace: { "@type": "Country", name: "United States" },
    },
    serviceType: "Rakhi delivery",
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: canonical(`/cities/${city.slug}`),
    },
  };
}

export function aboutPageJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: `About ${site.name}`,
    url: canonical("/about"),
    description: site.description,
    mainEntity: { "@id": `${siteUrl}/#organization` },
  };
}
