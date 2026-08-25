"use client";

import { useCallback, useEffect, useState } from "react";
import type { PublicProductReview } from "@hr-ecom/shared";
import { api } from "@/lib/api";
import { SiteReviewsList } from "@/components/SiteReviewsList";

export function PublishedReviewsLoader() {
  const [reviews, setReviews] = useState<PublicProductReview[]>([]);

  const load = useCallback(() => {
    api<{ reviews: PublicProductReview[] }>("/reviews", { revalidate: false })
      .then((d) => setReviews(d.reviews ?? []))
      .catch(() => setReviews([]));
  }, []);

  useEffect(() => {
    load();
    const onUpdate = () => load();
    window.addEventListener("usarakhi:reviews-updated", onUpdate);
    return () => window.removeEventListener("usarakhi:reviews-updated", onUpdate);
  }, [load]);

  return (
    <div className="pt-10">
      <SiteReviewsList reviews={reviews} />
    </div>
  );
}
