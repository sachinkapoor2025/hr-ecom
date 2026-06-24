"use client";

import { useState } from "react";
import { useApiClient } from "@/lib/auth-context";

export default function AdminProductsPage() {
  const apiClient = useApiClient();
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    categorySlug: "",
    inventory: "10",
    currency: "USD" as "USD" | "INR",
  });
  const [csv, setCsv] = useState("");
  const [message, setMessage] = useState("");
  const [lastSlug, setLastSlug] = useState("");
  const [uploading, setUploading] = useState(false);

  const createProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await apiClient<{ product: { slug: string } }>("/products", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price),
          inventory: parseInt(form.inventory, 10),
        }),
      });
      setLastSlug(result.product.slug);
      setMessage(`Product "${form.name}" created!`);
      setForm({ name: "", description: "", price: "", categorySlug: "", inventory: "10", currency: "USD" });
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed");
    }
  };

  const bulkUpload = async () => {
    const lines = csv.trim().split("\n");
    if (lines.length < 2) {
      setMessage("CSV needs header + at least one row");
      return;
    }
    const headers = lines[0].split(",").map((h) => h.trim());
    const rows = lines.slice(1).map((line) => {
      const values = line.split(",").map((v) => v.trim());
      return Object.fromEntries(headers.map((h, i) => [h, values[i]]));
    });

    try {
      const result = await apiClient<{ created: number; errors: unknown[] }>("/products/bulk", {
        method: "POST",
        body: JSON.stringify({ rows }),
      });
      setMessage(`Bulk upload: ${result.created} created, ${result.errors.length} errors`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Bulk upload failed");
    }
  };

  const uploadImage = async (file: File) => {
    if (!lastSlug) {
      setMessage("Create a product first, then upload an image.");
      return;
    }
    setUploading(true);
    try {
      const presign = await apiClient<{
        uploadUrl: string;
        publicUrl: string;
        mode: string;
      }>("/uploads/presign", {
        method: "POST",
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      });

      await fetch(presign.uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      await apiClient(`/products/${lastSlug}/images`, {
        method: "POST",
        body: JSON.stringify({ imageUrl: presign.publicUrl }),
      });

      setMessage(`Image uploaded for product "${lastSlug}"`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-12">
      <div>
        <h1 className="text-2xl font-bold mb-6">Add Product</h1>
        <form onSubmit={createProduct} className="space-y-4">
          {(["name", "description", "price", "categorySlug", "inventory"] as const).map((field) => (
            <input
              key={field}
              placeholder={field}
              value={form[field]}
              onChange={(e) => setForm({ ...form, [field]: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
              required={field !== "description"}
            />
          ))}
          <select
            value={form.currency}
            onChange={(e) => setForm({ ...form, currency: e.target.value as "USD" | "INR" })}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="USD">USD</option>
            <option value="INR">INR</option>
          </select>
          <button type="submit" className="bg-accent text-white px-6 py-2 rounded-lg">
            Create Product
          </button>
        </form>

        {lastSlug && (
          <div className="mt-6 p-4 border rounded-lg bg-white">
            <p className="text-sm mb-2">Upload image for <code>{lastSlug}</code></p>
            <input
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])}
            />
          </div>
        )}
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Bulk Upload (CSV)</h2>
        <p className="text-sm text-slate-600 mb-2">
          Headers: name, description, price, categorySlug, sku, inventory, currency, tags
        </p>
        <textarea
          value={csv}
          onChange={(e) => setCsv(e.target.value)}
          rows={8}
          className="w-full border rounded-lg px-3 py-2 font-mono text-sm"
          placeholder={"name,description,price,categorySlug,inventory,currency\nWireless Headphones,Great sound,149.99,electronics,50,USD"}
        />
        <button onClick={bulkUpload} className="mt-2 bg-slate-800 text-white px-6 py-2 rounded-lg">
          Upload CSV
        </button>
      </div>

      {message && <p className="text-sm bg-slate-50 border p-3 rounded-lg">{message}</p>}
    </div>
  );
}
