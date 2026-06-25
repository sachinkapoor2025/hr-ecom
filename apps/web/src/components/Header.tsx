"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { site, navItems, cityLinks } from "@/lib/site";

function CitiesMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative" onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`btn-nav gap-1 ${open ? "btn-nav-active" : ""}`}
      >
        Cities
        <span className="text-xs">▼</span>
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 min-w-[180px] bg-white border border-slate-200 rounded-lg shadow-lg py-1">
          {cityLinks.map((c) => (
            <Link
              key={c.slug}
              href={`/cities/${c.slug}`}
              className="block px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-nav"
              onClick={() => setOpen(false)}
            >
              Rakhi to {c.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function Header() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category");
  const { itemCount } = useCart();
  const { user, logout, isAdmin } = useAuth();

  const isActive = (href: string, category?: string) => {
    if (href === "/") return pathname === "/" && !activeCategory;
    if (category) return pathname === "/products" && activeCategory === category;
    return pathname.startsWith(href.split("?")[0]) && href !== "/";
  };

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Link href="/" className="shrink-0">
          <Image src={site.logoSrc} alt={site.name} width={150} height={50} className="h-11 w-auto" priority />
        </Link>

        <div className="flex items-center gap-2 shrink-0">
          <Link href="/cart" className="relative p-2 text-primary hover:text-nav" aria-label="Cart">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-accent text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {itemCount}
              </span>
            )}
          </Link>
          {user ? (
            <>
              {isAdmin && (
                <Link href="/admin" className="text-xs text-slate-500 hover:text-nav hidden sm:inline">
                  Admin
                </Link>
              )}
              <button type="button" onClick={logout} className="text-xs text-slate-500 hover:text-nav hidden sm:inline">
                Logout
              </button>
            </>
          ) : (
            <Link href="/account" className="text-xs text-slate-500 hover:text-nav hidden sm:inline">
              Login
            </Link>
          )}
        </div>
      </div>

      <nav className="border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-2.5 overflow-x-auto">
          <div className="flex items-center gap-2 min-w-max">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`btn-nav ${isActive(item.href, "category" in item ? item.category : undefined) ? "btn-nav-active" : ""}`}
              >
                {item.label}
              </Link>
            ))}
            <CitiesMenu />
          </div>
        </div>
      </nav>
    </header>
  );
}
