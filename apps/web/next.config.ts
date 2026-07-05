import type { NextConfig } from "next";
import { categoryRedirectRules, categoryRewriteRules } from "./src/lib/category-urls";
import { legacyRedirectRules } from "./src/lib/legacy-urls";

const nextConfig: NextConfig = {
  transpilePackages: ["@hr-ecom/shared"],
  async redirects() {
    return [
      ...categoryRedirectRules(),
      ...legacyRedirectRules(),
      { source: "/cities/:slug", destination: "/send-rakhi-to-:slug", permanent: true },
    ];
  },
  async rewrites() {
    return [
      ...categoryRewriteRules(),
      { source: "/send-rakhi-to-:slug", destination: "/locations/:slug" },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    NEXT_PUBLIC_COGNITO_USER_POOL_ID: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID,
    NEXT_PUBLIC_COGNITO_CLIENT_ID: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
    NEXT_PUBLIC_COGNITO_REGION: process.env.NEXT_PUBLIC_COGNITO_REGION,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_CDN_URL: process.env.NEXT_PUBLIC_CDN_URL,
  },
};

export default nextConfig;
