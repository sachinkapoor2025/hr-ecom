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

function CartBagIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 8h8l-1 12H9L8 8z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 8V6.5a3 3 0 116 0V8" />
    </svg>
  );
}

function BurgerIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function CartLink({ className = "" }: { className?: string }) {
  const { itemCount } = useCart();

  return (
    <Link href="/cart" className={`relative p-2 text-nav hover:text-primary ${className}`} aria-label="Cart">
      <CartBagIcon />
      {itemCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 bg-accent text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
          {itemCount}
        </span>
      )}
    </Link>
  );
}

export function Header() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category");
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
      {/* Mobile top bar */}
      <div className="md:hidden max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
        <button
          type="button"
          className="p-1 text-nav hover:text-primary shrink-0"
          aria-label="Open menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(true)}
        >
          <BurgerIcon />
        </button>

        <Link href="/" className="flex-1 flex justify-center min-w-0" onClick={closeMenu}>
          <Image src={site.logoSrc} alt={site.name} width={150} height={50} className="h-10 w-auto" priority />
        </Link>

        <CartLink className="shrink-0" />
      </div>

      {/* Desktop top bar */}
      <div className="hidden md:flex max-w-7xl mx-auto px-4 py-3 items-center justify-between gap-4">
        <Link href="/" className="shrink-0">
          <Image src={site.logoSrc} alt={site.name} width={150} height={50} className="h-11 w-auto" priority />
        </Link>

        <div className="flex items-center gap-2 shrink-0">
          <CartLink />
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
      </div>

      {/* Desktop nav */}
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

      {/* Mobile slide-out menu */}
      {menuOpen && (
        <>
          <button
            type="button"
            className="md:hidden fixed inset-0 bg-black/40 z-40"
            aria-label="Close menu"
            onClick={closeMenu}
          />
          <aside className="md:hidden fixed top-0 left-0 bottom-0 w-[min(85vw,320px)] z-50 bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-4 py-4 border-b border-slate-100">
              <span className="font-semibold text-primary">Menu</span>
              <button
                type="button"
                className="p-1 text-slate-500 hover:text-nav"
                aria-label="Close menu"
                onClick={closeMenu}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
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
            </nav>
          </aside>
        </>
      )}
    </header>
  );
}
