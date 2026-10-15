import type { MetadataRoute } from "next";
import { isRakhiContentHidden } from "@hr-ecom/shared";
import { publicSiteDescription, site } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: isRakhiContentHidden()
      ? `${site.name} — Diwali & Bhai Dooj Gifts`
      : `${site.name} — Send Rakhi to USA Online`,
    short_name: site.name,
    description: publicSiteDescription(),
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: site.primaryColor,
    categories: ["shopping", "lifestyle"],
    icons: [
      {
        src: site.logoSrc,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
