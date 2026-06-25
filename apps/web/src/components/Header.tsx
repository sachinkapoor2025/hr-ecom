"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { site, navItems, cityLinks } from "@/lib/site";
import { SearchBar } from "@/components/SearchBar";

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

function BurgerIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function AccountLink({ className = "" }: { className?: string }) {
  return (
    <Link href="/account" className={`p-2 text-primary hover:text-nav ${className}`} aria-label="Account">
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    </Link>
  );
}

function CartLink({ className = "" }: { className?: string }) {
  const { itemCount } = useCart();

  return (
    <Link href="/cart" className={`relative p-2 text-primary hover:text-nav ${className}`} aria-label="Cart">
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
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

        <div className="flex items-center shrink-0">
          <AccountLink />
          <CartLink />
        </div>
      </div>

      {/* Desktop top bar */}
      <div className="hidden md:flex max-w-7xl mx-auto px-4 py-3 items-center justify-between gap-4">
        <Link href="/" className="shrink-0">
          <Image src={site.logoSrc} alt={site.name} width={150} height={50} className="h-11 w-auto" priority />
        </Link>

        <div className="flex items-center shrink-0">
          <AccountLink />
          <CartLink />
        </div>
      </div>

      <div className="border-t border-slate-100 bg-white px-4 py-2.5">
        <div className="max-w-7xl mx-auto">
          <SearchBar variant="header" />
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
