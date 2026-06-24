import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Blog",
  description: `Raksha Bandhan tips, Rakhi delivery guides, and festival stories from ${site.name}.`,
};

const posts = [
  {
    title: "How to Send Rakhi to USA from India — Complete Guide",
    excerpt: "Step-by-step guide for sisters sending Rakhi internationally with fast USA delivery.",
    href: "https://usarakhi.com/",
  },
  {
    title: "Best Rakhi with Chocolates Combos for Raksha Bandhan 2026",
    excerpt: "Premium Ferrero Rocher, Lindt, and Hershey's combos your brother will love.",
    href: "/products?category=rakhi-combo",
  },
  {
    title: "Bhaiya Bhabhi Rakhi Sets — What to Choose",
    excerpt: "Elegant matching sets for brother and sister-in-law celebrations.",
    href: "/products?category=bhaiya-bhabhi-rakhi",
  },
];

export default function BlogPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-primary mb-2">Blogs</h1>
      <p className="text-slate-600 mb-8">Rakhi tips, delivery guides, and Raksha Bandhan stories.</p>
      <div className="space-y-6">
        {posts.map((post) => (
          <article key={post.title} className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition">
            <h2 className="text-xl font-bold text-primary mb-2">
              <Link href={post.href} className="hover:text-nav">
                {post.title}
              </Link>
            </h2>
            <p className="text-slate-600 text-sm mb-3">{post.excerpt}</p>
            <Link href={post.href} className="text-nav font-semibold text-sm hover:underline">
              Read more →
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
