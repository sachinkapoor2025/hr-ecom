"use client";

import { usePathname } from "next/navigation";
import { CustomerReviews } from "@/components/CustomerReviews";

export function CustomerReviewsSection() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  return <CustomerReviews />;
}
