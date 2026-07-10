"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useApiClient, useAuth } from "@/lib/auth-context";
import { blogPosts } from "@/lib/content/blog-posts";

export default function AdminBlogImagesPage() {
  const apiClient = useApiClient();
  const { token } = useAuth();
  const posts = blogPosts;
  const [images, setImages] = useState<Record<string, string>>({});
  const imagesRef = useRef(images);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  useEffect(() => {
    apiClient<{ images: Record<string, string> }>("/blog-images")
      .then((d) => setImages(d.images ?? {}))
      .catch(() => setImages({}))
      .finally(() => setLoading(false));
  }, [apiClient]);

  const revalidateStorefrontBlog = useCallback(
    async (slug?: string) => {
      if (!token) return;
      try {
        await fetch("/api/revalidate/blog", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(slug ? { slug } : {}),
        });
      } catch {
        // Cache bust is best-effort; DynamoDB save is the source of truth.
      }
    },
    [token]
  );

  const persistImages = useCallback(
    async (next: Record<string, string>, successMessage: string, slug?: string) => {
      setSaving(true);
      setMessage("");
      try {
        await apiClient("/admin/blog-images", {
          method: "PUT",
          body: JSON.stringify({ images: next }),
        });
        setImages(next);
        await revalidateStorefrontBlog(slug);
        setMessage(successMessage);
      } catch (err) {
        setMessage(err instanceof Error ? err.message : "Save failed");
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [apiClient, revalidateStorefrontBlog]
  );

  const save = async () => {
    try {
      await persistImages(imagesRef.current, "Blog images saved. Storefront will refresh shortly.");
    } catch {
      // Message already set in persistImages
    }
  };

  const uploadImage = useCallback(
    async (slug: string, file: File) => {
      setUploading(slug);
      setMessage("");
      try {
        const contentType = file.type || "image/jpeg";
        const presign = await apiClient<{ uploadUrl: string; publicUrl: string }>("/uploads/presign", {
          method: "POST",
          body: JSON.stringify({
            filename: file.name,
            contentType,
            folder: "blog",
          }),
        });
        const uploadRes = await fetch(presign.uploadUrl, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": contentType },
        });
        if (!uploadRes.ok) {
          throw new Error(`Upload failed (${uploadRes.status})`);
        }
        const next = { ...imagesRef.current, [slug]: presign.publicUrl };
        await persistImages(
          next,
          `Image saved for "${slug}". Visible on the website after cache refresh.`,
          slug
        );
      } catch (err) {
        setMessage(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(null);
      }
    },
    [apiClient, persistImages]
  );

  const clearImage = async (slug: string) => {
    const next = { ...imagesRef.current };
    delete next[slug];
    try {
      await persistImages(next, `Cleared image for "${slug}".`, slug);
    } catch {
      // Message already set
    }
  };

  if (loading) return <div className="p-10">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-6">
        <Link href="/admin" className="text-sm text-nav hover:underline">
          ← Admin
        </Link>
      </div>
      <h1 className="text-2xl font-bold mb-2">Blog Images</h1>
      <p className="text-slate-600 text-sm mb-6">
        Upload a dedicated hero image for each blog post. Images save automatically after upload — same as
        product images. Posts without an image show a placeholder on the blog list and article pages.
      </p>

      {message && (
        <p className="mb-4 text-sm rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">{message}</p>
      )}

      <div className="space-y-4">
        {posts.map((post) => (
          <div
            key={post.slug}
            className="border border-slate-200 rounded-xl p-4 bg-white flex flex-col sm:flex-row gap-4"
          >
            <div className="relative aspect-[16/10] w-full sm:w-48 shrink-0 rounded-lg overflow-hidden bg-slate-100 border border-dashed border-slate-300">
              {images[post.slug] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={images[post.slug]} alt={post.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-center text-xs font-semibold uppercase tracking-wide text-slate-400 px-2">
                  Blog image placeholder
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-primary break-words">{post.title}</h2>
              <p className="text-xs text-slate-500 mt-1 font-mono break-all">{post.slug}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <label className="inline-flex cursor-pointer items-center rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50">
                  {uploading === post.slug ? "Uploading…" : saving ? "Saving…" : "Upload image"}
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    disabled={uploading === post.slug || saving}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void uploadImage(post.slug, file);
                      e.target.value = "";
                    }}
                  />
                </label>
                {images[post.slug] && (
                  <button
                    type="button"
                    onClick={() => void clearImage(post.slug)}
                    disabled={saving || uploading === post.slug}
                    className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => void save()}
        disabled={saving || uploading !== null}
        className="mt-6 rounded-lg bg-primary px-6 py-3 font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save all & refresh site"}
      </button>
    </div>
  );
}
