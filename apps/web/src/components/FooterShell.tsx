"use client";

import { usePathname } from "next/navigation";
import { Footer } from "./Footer";

/** Hides storefront footer on admin routes so the portal has a clean shell. */
export function FooterShell() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  return <Footer />;
}
