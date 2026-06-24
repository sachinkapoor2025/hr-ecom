"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { site } from "@/lib/site";

export function Header() {
  const { itemCount } = useCart();
  const { user, logout, isAdmin } = useAuth();

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-50 shadow-sm">
      <div className="bg-primary text-white text-center text-xs py-1.5 px-4">
        Free shipping on selected orders · Same-day dispatch · Send Rakhi to USA
      </div>
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image src={site.logoSrc} alt={site.name} width={140} height={48} className="h-10 w-auto" priority />
        </Link>
        <nav className="flex items-center gap-4 md:gap-6 text-sm font-medium text-slate-700">
          <Link href="/products" className="hover:text-accent hidden sm:inline">
            Shop
          </Link>
          <Link href="/products?category=rakhi-combo" className="hover:text-accent hidden md:inline">
            Rakhi Combo
          </Link>
          <Link href="/products?category=kids-rakhi" className="hover:text-accent hidden md:inline">
            Kids Rakhi
          </Link>
          <a
            href={site.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:inline text-green-600 hover:text-green-700 font-semibold"
          >
            WhatsApp
          </a>
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
