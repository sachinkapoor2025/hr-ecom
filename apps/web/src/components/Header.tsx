"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { site, navItems, cityLinks } from "@/lib/site";

function CitiesMenu({ onNavigate }: { onNavigate?: () => void }) {
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
              onClick={() => {
                setOpen(false);
                onNavigate?.();
              }}
            >
              Rakhi to {c.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function CartIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
      />
    </svg>
  );
}

function UserIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  );
}

function BurgerIcon({ open }: { open: boolean }) {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      {open ? (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      )}
    </svg>
  );
}

export function Header() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category");
  const { itemCount } = useCart();
  const { user, logout, isAdmin } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [citiesOpen, setCitiesOpen] = useState(false);

  const isActive = (href: string, category?: string) => {
    if (href === "/") return pathname === "/" && !activeCategory;
    if (category) return pathname === "/products" && activeCategory === category;
    return pathname.startsWith(href.split("?")[0]) && href !== "/";
  };

  const closeMenu = () => {
    setMenuOpen(false);
    setCitiesOpen(false);
  };

  useEffect(() => {
    setMenuOpen(false);
    setCitiesOpen(false);
  }, [pathname, activeCategory]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Link href="/" className="shrink-0" onClick={closeMenu}>
          <Image src={site.logoSrc} alt={site.name} width={150} height={50} className="h-11 w-auto" priority />
        </Link>

        <div className="hidden md:flex items-center gap-2 shrink-0">
          <Link href="/cart" className="relative p-2 text-primary hover:text-nav" aria-label="Cart">
            <CartIcon />
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-accent text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {itemCount}
              </span>
            )}
          </Link>
          {user ? (
            <>
              {isAdmin && (
                <Link href="/admin" className="text-xs text-slate-500 hover:text-nav">
                  Admin
                </Link>
              )}
              <button type="button" onClick={logout} className="text-xs text-slate-500 hover:text-nav">
                Logout
              </button>
            </>
          ) : (
            <Link href="/account" className="text-xs text-slate-500 hover:text-nav">
              Login
            </Link>
          )}
        </div>

        <button
          type="button"
          className="md:hidden p-2 text-primary hover:text-nav"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <BurgerIcon open={menuOpen} />
        </button>
      </div>

      <nav className="hidden md:block border-t border-slate-100 bg-white">
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

      {menuOpen && (
        <>
          <button
            type="button"
            className="md:hidden fixed inset-0 top-[65px] bg-black/40 z-40"
            aria-label="Close menu"
            onClick={closeMenu}
          />
          <div className="md:hidden fixed top-[65px] left-0 right-0 bottom-0 z-50 bg-white overflow-y-auto">
            <div className="px-4 py-4 border-b border-slate-100 flex items-center gap-3">
              <Link
                href="/cart"
                onClick={closeMenu}
                className="flex flex-1 items-center justify-center gap-2 rounded-full border border-slate-200 py-3 text-sm font-semibold text-primary hover:border-nav hover:text-nav"
              >
                <span className="relative">
                  <CartIcon className="w-5 h-5" />
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-accent text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                      {itemCount}
                    </span>
                  )}
                </span>
                Cart{itemCount > 0 ? ` (${itemCount})` : ""}
              </Link>
              {user ? (
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    closeMenu();
                  }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full border border-slate-200 py-3 text-sm font-semibold text-primary hover:border-nav hover:text-nav"
                >
                  <UserIcon className="w-5 h-5" />
                  Logout
                </button>
              ) : (
                <Link
                  href="/account"
                  onClick={closeMenu}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full border border-slate-200 py-3 text-sm font-semibold text-primary hover:border-nav hover:text-nav"
                >
                  <UserIcon className="w-5 h-5" />
                  Sign In
                </Link>
              )}
            </div>

            <nav className="px-4 py-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  className={`block rounded-lg px-4 py-3 text-sm font-semibold ${
                    isActive(item.href, "category" in item ? item.category : undefined)
                      ? "bg-nav text-white"
                      : "text-primary hover:bg-blue-50 hover:text-nav"
                  }`}
                >
                  {item.label}
                </Link>
              ))}

              <div>
                <button
                  type="button"
                  onClick={() => setCitiesOpen((v) => !v)}
                  className={`w-full flex items-center justify-between rounded-lg px-4 py-3 text-sm font-semibold ${
                    citiesOpen ? "bg-nav text-white" : "text-primary hover:bg-blue-50 hover:text-nav"
                  }`}
                >
                  Cities
                  <span className={`text-xs transition-transform ${citiesOpen ? "rotate-180" : ""}`}>▼</span>
                </button>
                {citiesOpen && (
                  <div className="mt-1 ml-2 border-l-2 border-slate-100 pl-2 space-y-1">
                    {cityLinks.map((c) => (
                      <Link
                        key={c.slug}
                        href={`/cities/${c.slug}`}
                        onClick={closeMenu}
                        className="block rounded-lg px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-nav"
                      >
                        Rakhi to {c.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {user && isAdmin && (
                <Link
                  href="/admin"
                  onClick={closeMenu}
                  className="block rounded-lg px-4 py-3 text-sm font-semibold text-primary hover:bg-blue-50 hover:text-nav"
                >
                  Admin
                </Link>
              )}
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
