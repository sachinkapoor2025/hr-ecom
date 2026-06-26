import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { CartProvider } from "@/lib/cart-context";
import { WishlistProvider } from "@/lib/wishlist-context";
import { CurrencyProvider } from "@/lib/currency-context";
import { HeaderShell } from "@/components/HeaderShell";
import { Footer } from "@/components/Footer";
import { CurrencySwitcher } from "@/components/CurrencySwitcher";
import { TrackingProvider } from "@/components/TrackingProvider";
import { JsonLd } from "@/components/JsonLd";
import { site } from "@/lib/site";
import { organizationJsonLd, webSiteJsonLd, onlineStoreJsonLd, defaultKeywords, canonical } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(canonical("/")),
  title: {
    default: "UsaRakhi — Send Rakhi to USA Online | Free Shipping",
    template: "%s | UsaRakhi",
  },
  description: site.description,
  keywords: defaultKeywords,
  alternates: { canonical: canonical("/") },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: site.name,
    url: canonical("/"),
    title: "UsaRakhi — Send Rakhi to USA Online | Free Shipping",
    description: site.description,
    images: [{ url: site.logoSrc, alt: site.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: "UsaRakhi — Send Rakhi to USA Online",
    description: site.description,
    images: [site.logoSrc],
  },
  robots: { index: true, follow: true },
  other: {
    "ai-content-declaration": "This site sells Rakhi for USA delivery. See /llms.txt for AI assistants.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="alternate" type="text/plain" href="/llms.txt" title="LLMs.txt" />
      </head>
      <body className="min-h-screen antialiased flex flex-col">
        <JsonLd data={[organizationJsonLd(), webSiteJsonLd(), onlineStoreJsonLd()]} />
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
            <CurrencyProvider>
            <TrackingProvider />
            <HeaderShell />
            <main className="flex-1">{children}</main>
            <Footer />
            <CurrencySwitcher />
            </CurrencyProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
