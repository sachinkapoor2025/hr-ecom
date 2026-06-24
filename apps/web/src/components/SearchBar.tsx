"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";

function SearchBarInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("search") ?? "");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (q) params.set("search", q);
    else params.delete("search");
    router.push(`/products?${params.toString()}`);
  };

  return (
    <form onSubmit={submit} className="flex gap-2 max-w-md">
      <input
        type="search"
        placeholder="Search products..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm"
      />
      <button type="submit" className="bg-accent text-white px-4 py-2 rounded-lg text-sm">
        Search
      </button>
    </form>
  );
}

export function SearchBar() {
  return (
    <Suspense fallback={null}>
      <SearchBarInner />
    </Suspense>
  );
}
