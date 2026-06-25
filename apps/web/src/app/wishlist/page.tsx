import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Wish List",
};

export default function WishlistPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <h1 className="text-3xl font-bold text-primary mb-3">Wish Lists</h1>
      <p className="text-slate-600 mb-6">Your saved Rakhis will appear here.</p>
      <Link href="/products" className="text-nav font-semibold hover:underline">
        Browse Rakhi collection →
      </Link>
    </div>
  );
}
