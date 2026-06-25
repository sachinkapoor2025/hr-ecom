import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { blogPosts, getBlogPost } from "@/lib/content/blog-posts";
import { articleJsonLd, breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return { title: "Article" };
  return pageMetadata({
    title: post.title,
    description: post.description,
    path: `/blog/${slug}`,
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Blog", href: "/blog" },
    { label: post.title },
  ];

  return (
    <article className="max-w-3xl mx-auto px-4 py-10">
      <JsonLd data={[articleJsonLd(post), breadcrumbJsonLd(crumbs.map((c) => ({ name: c.label, path: c.href ?? `/blog/${slug}` })))]} />
      <Breadcrumbs items={crumbs} />
      <header className="mb-8">
        <time dateTime={post.publishedAt} className="text-sm text-slate-500">
          {new Date(post.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        </time>
        <h1 className="text-3xl font-bold text-primary mt-2 mb-3">{post.title}</h1>
        <p className="text-lg text-slate-600">{post.excerpt}</p>
      </header>

      <div className="prose prose-slate max-w-none space-y-8">
        {post.sections.map((section, i) => (
          <section key={i}>
            {section.heading && <h2 className="text-xl font-bold text-primary mb-3">{section.heading}</h2>}
            {section.paragraphs.map((p, j) => (
              <p key={j} className="text-slate-700 leading-relaxed mb-4">
                {p}
              </p>
            ))}
          </section>
        ))}
      </div>

      {post.relatedCategory && (
        <div className="mt-10 p-6 bg-slate-50 rounded-xl border">
          <h2 className="font-semibold text-primary mb-2">Shop related Rakhis</h2>
          <Link href={`/categories/${post.relatedCategory}`} className="text-nav font-semibold hover:underline">
            Browse {post.relatedCategory.replace(/-/g, " ")} →
          </Link>
        </div>
      )}

      <div className="mt-8 pt-6 border-t">
        <Link href="/blog" className="text-nav hover:underline text-sm">← All articles</Link>
      </div>
    </article>
  );
}
