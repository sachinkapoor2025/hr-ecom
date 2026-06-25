"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";

function SearchBarInner({ variant = "default" }: { variant?: "default" | "header" }) {
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

  if (variant === "header") {
    return (
      <form onSubmit={submit} className="relative w-full">
        <input
          type="search"
          placeholder="Search products..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full border border-slate-200 rounded-full pl-4 pr-11 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-nav focus:ring-1 focus:ring-nav"
        />
        <button
          type="submit"
          className="absolute right-1 top-1/2 -translate-y-1/2 p-2 text-nav hover:text-primary"
          aria-label="Search"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" />
          </svg>
        </button>
      </form>
    );
  }

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

export function SearchBar({ variant = "default" }: { variant?: "default" | "header" }) {
  return (
    <Suspense fallback={null}>
      <SearchBarInner variant={variant} />
    </Suspense>
  );
}
