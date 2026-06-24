"use client";

import { useState } from "react";
import { useApiClient } from "@/lib/auth-context";

export default function AdminCategoriesPage() {
  const apiClient = useApiClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient("/categories", {
        method: "POST",
        body: JSON.stringify({ name, description }),
      });
      setMessage(`Category "${name}" created`);
      setName("");
      setDescription("");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed");
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Add Category</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          placeholder="Category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded-lg px-3 py-2"
          required
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border rounded-lg px-3 py-2"
        />
        <button type="submit" className="bg-accent text-white px-6 py-2 rounded-lg">
          Create Category
        </button>
      </form>
      {message && <p className="mt-4 text-sm">{message}</p>}
    </div>
  );
}
