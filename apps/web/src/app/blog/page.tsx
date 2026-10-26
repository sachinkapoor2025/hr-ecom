import type { Metadata } from "next";
import Link from "next/link";
import { BlogCoverImage } from "@/components/BlogCoverImage";
import { BlogShowMoreProducts } from "@/components/BlogShowMoreProducts";
import { loadBlogPostsWithImages } from "@/lib/blog-images";
import { isRakhiContentHidden, textMentionsRakhi } from "@hr-ecom/shared";
import { applyInlineLinks } from "@/lib/inline-links";
import { pageMetadata } from "@/lib/seo";

/** Keep blog list fresh when admin updates hero images. */
export const revalidate = 60;

export function generateMetadata(): Metadata {
  const hidden = isRakhiContentHidden();
  return pageMetadata({
    title: hidden
      ? "Diwali & Bhai Dooj Guides — Festive Gifts USA"
      : "Rakhi Blog — Guides, Tips & Raksha Bandhan USA",
    description: hidden
      ? "Guides for sending Diwali and Bhai Dooj gifts in the USA: hampers, sweets, dry fruits, and domestic delivery."
      : "Raksha Bandhan guides: send Rakhi to USA from India, best Rakhi combos, Bhaiya Bhabhi sets, and 2026 festival tips from UsaRakhi.",
    path: "/blog",
  });
}

export default async function BlogPage() {
  const hidden = isRakhiContentHidden();
  const posts = (await loadBlogPostsWithImages()).filter((post) => {
    if (!hidden) return true;
    return !textMentionsRakhi(`${post.slug} ${post.title} ${post.excerpt} ${post.description ?? ""}`);
  });
  return (
    <div className="max-w-7xl mx-auto px-4 py-12 overflow-x-hidden">
      <h1 className="text-3xl font-bold text-primary mb-2">
        {hidden ? "Diwali & Bhai Dooj guides" : "Rakhi Guides & Blog"}
      </h1>
      <p className={`text-slate-600 max-w-3xl ${hidden ? "mb-4" : "mb-8"}`}>
        {hidden
          ? "Guides for Diwali and Bhai Dooj gifts delivered in the United States — sweets, dry fruits, chocolates, and pooja sets."
          : "Expert guides on sending Rakhi to USA, Raksha Bandhan traditions, and choosing the perfect Rakhi for your brother."}
      </p>
      {hidden ? (
        <ul className="mb-8 space-y-2 text-sm text-slate-700">
          <li>
            <Link href="/blog/send-diwali-gifts-to-usa" className="text-nav font-semibold hover:underline">
              Send Diwali gifts to the USA
            </Link>
          </li>
          <li>
            <Link href="/blog/bhai-dooj-gifts-for-a-brother-in-the-usa" className="text-nav font-semibold hover:underline">
              Bhai Dooj gifts for a brother
            </Link>
          </li>
          <li>
            <Link href="/blog/when-to-order-bhai-dooj-gifts-for-usa-delivery" className="text-nav font-semibold hover:underline">
              When to order for USA delivery
            </Link>
          </li>
        </ul>
      ) : null}
      <div className="grid gap-6 sm:grid-cols-2">
        {posts.map((post) => (
          <article
            key={post.slug}
            className="border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition bg-white flex flex-col"
          >
            <Link href={`/blog/${post.slug}`} className="block bg-slate-100">
              {post.image ? (
                <BlogCoverImage src={post.image} alt={post.title} variant="card" />
              ) : (
                <div className="flex aspect-[16/9] w-full items-center justify-center bg-slate-50 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Blog image placeholder
                </div>
              )}
            </Link>
            <div className="p-5 flex flex-col flex-1 min-w-0">
              <time dateTime={post.publishedAt} className="text-xs text-slate-400">
                {new Date(post.publishedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
              <h2 className="text-lg font-bold text-primary mt-1 mb-2 leading-snug">
                <Link href={`/blog/${post.slug}`} className="hover:text-nav break-words">
                  {post.title}
                </Link>
              </h2>
              <p className="text-slate-600 text-sm mb-4 flex-1 break-words">{post.excerpt}</p>
              <Link href={`/blog/${post.slug}`} className="text-nav font-semibold text-sm hover:underline">
                Read full guide →
              </Link>
            </div>
          </article>
        ))}
      </div>

      {hidden ? (
        <section className="mt-12 pt-10 border-t border-slate-200 text-slate-700 leading-relaxed">
          <h2 className="text-xl font-bold text-primary mb-3">Festive gift guides</h2>
          <p className="mb-4">
            {applyInlineLinks(
              "These articles explain Diwali and Bhai Dooj gifts that ship to a US address: sweets, dry fruits, chocolates, and pooja sets, and how domestic delivery works.",
              [
                { phrase: "Diwali", href: "/diwali-to-usa" },
                { phrase: "Bhai Dooj", href: "/bhai-dooj-to-usa" },
                { phrase: "dry fruits", href: "/dry-fruit-combos-to-usa" },
                { phrase: "pooja sets", href: "/pooja-sets-to-usa" },
              ]
            )}
          </p>
          <p className="text-sm">
            Ready to choose a hamper?{" "}
            <Link href="/products" className="text-nav font-semibold hover:underline">
              Browse the shop
            </Link>
            .
          </p>
        </section>
      ) : (
      <section className="mt-12 pt-10 border-t border-slate-200 text-slate-700 leading-relaxed">
        <h2 className="text-xl font-bold text-primary mb-3">What these rakhi guides cover</h2>
        <p className="mb-4">
          Each article on this page is a separate guide. Some explain the ritual — what the rakhi thread means, why
          roli and chawal are used, and what a Lumba or a Bhaiya Bhabhi set is. Others are practical for sisters
          sending to the United States: ordering from India, chocolate combos, kids designs, hampers, and domestic
          shipping without a customs stop for your brother.
        </p>
        <h3 className="text-lg font-semibold text-primary mb-2">Start with the question you actually have</h3>
        <ul className="list-disc pl-5 space-y-2 mb-4">
          <li>
            <Link href="/blog/send-rakhi-to-usa-from-india" className="text-nav font-semibold hover:underline">
              Sending from India
            </Link>{" "}
            — pay in INR and deliver to a US address.
          </li>
          <li>Roli and chawal — the tilak items packed with most rakhis.</li>
          <li>Raksha Bandhan 2026 — the festival date and how USA orders fit around it.</li>
          <li>
            <Link href="/blog/rakhi-usa-domestic-shipping-no-customs" className="text-nav font-semibold hover:underline">
              Domestic US shipping
            </Link>{" "}
            — why the parcel is fulfilled inside America.
          </li>
        </ul>
        <p className="text-sm">
          Ready to choose a design?{" "}
          <Link href="/products" className="text-nav font-semibold hover:underline">
            Browse the shop
          </Link>
          .
        </p>
      </section>
      )}

      <BlogShowMoreProducts />
    </div>
  );
}
