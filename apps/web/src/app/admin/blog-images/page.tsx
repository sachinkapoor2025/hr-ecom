"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useApiClient } from "@/lib/auth-context";
import { listAllBlogPosts } from "@/lib/content/blog-posts";

export default function AdminBlogImagesPage() {
  const apiClient = useApiClient();
  const posts = listAllBlogPosts();
  const [images, setImages] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient<{ images: Record<string, string> }>("/blog-images")
      .then((d) => setImages(d.images ?? {}))
      .catch(() => setImages({}))
      .finally(() => setLoading(false));
  }, [apiClient]);

  const save = async () => {
    try {
      await apiClient("/admin/blog-images", {
        method: "PUT",
        body: JSON.stringify({ images }),
      });
      setMessage("Blog images saved.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Save failed");
    }
  };

  const uploadImage = useCallback(
    async (slug: string, file: File) => {
      setUploading(slug);
      setMessage("");
      try {
        const presign = await apiClient<{ uploadUrl: string; publicUrl: string }>("/uploads/presign", {
          method: "POST",
          body: JSON.stringify({
            filename: file.name,
            contentType: file.type || "image/jpeg",
            folder: "blog",
          }),
        });
        await fetch(presign.uploadUrl, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type || "image/jpeg" },
        });
        setImages((prev) => ({ ...prev, [slug]: presign.publicUrl }));
        setMessage(`Uploaded image for "${slug}". Click Save to publish.`);
      } catch (err) {
        setMessage(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(null);
      }
    },
    [apiClient]
  );

  const clearImage = (slug: string) => {
    setImages((prev) => {
      const next = { ...prev };
      delete next[slug];
      return next;
    });
    setMessage(`Cleared image for "${slug}". Click Save to publish.`);
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
        Upload a dedicated hero image for each blog post. Posts without an image show a placeholder on
        the blog list and article pages.
      </p>

      {message && (
        <p className="mb-4 text-sm rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">{message}</p>
      )}

      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post.slug} className="border border-slate-200 rounded-xl p-4 bg-white flex flex-col sm:flex-row gap-4">
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
                  {uploading === post.slug ? "Uploading…" : "Upload image"}
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    disabled={uploading === post.slug}
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
                    onClick={() => clearImage(post.slug)}
                    className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
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
        className="mt-6 rounded-lg bg-primary px-6 py-3 font-semibold text-white hover:bg-primary/90"
      >
        Save all
      </button>
    </div>
  );
}
