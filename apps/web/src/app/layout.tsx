import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { CartProvider } from "@/lib/cart-context";
import { WishlistProvider } from "@/lib/wishlist-context";
import { HeaderShell } from "@/components/HeaderShell";
import { Footer } from "@/components/Footer";
import { siteUrl } from "@/lib/env";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "UsaRakhi — Send Rakhi to USA Online | Free Shipping",
    template: "%s | UsaRakhi",
  },
  description:
    "Send Rakhi to USA with fast delivery, free shipping, and premium Rakhi combos. Trusted by sisters worldwide for Raksha Bandhan.",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "UsaRakhi",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased flex flex-col">
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
            <HeaderShell />
            <main className="flex-1">{children}</main>
            <Footer />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
