"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";

export function Header() {
  const { itemCount } = useCart();
  const { user, logout, isAdmin } = useAuth();

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-slate-900">
          HR Shop
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link href="/products" className="hover:text-accent">
            Shop
          </Link>
          <Link href="/cart" className="hover:text-accent relative">
            Cart
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-4 bg-accent text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>
          {user ? (
            <>
              {isAdmin && (
                <Link href="/admin" className="hover:text-accent">
                  Admin
                </Link>
              )}
              <span className="text-slate-400 hidden sm:inline">{user.email}</span>
              <button type="button" onClick={logout} className="hover:text-accent">
                Logout
              </button>
            </>
          ) : (
            <Link href="/account" className="hover:text-accent">
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
