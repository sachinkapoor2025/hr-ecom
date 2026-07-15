"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdminGuard } from "@/components/AdminGuard";
import { AdminSearch } from "@/components/admin/AdminSearch";
import { useAuth } from "@/lib/auth-context";

type AdminNavLink = { href: string; label: string; exact?: boolean };

const links: AdminNavLink[] = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/welcome-leads", label: "Welcome Leads" },
  { href: "/admin/visitors", label: "Visitors" },
  { href: "/admin/carts", label: "Abandoned Carts" },
  { href: "/admin/coupons", label: "Coupons" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/shipping", label: "Shipping" },
  { href: "/admin/email", label: "Marketing Email" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/payments", label: "Payments" },
];

const superAdminLinks: AdminNavLink[] = [{ href: "/admin/load-test", label: "Load Test" }];

function isActive(pathname: string, href: string, exact?: boolean) {
  return exact ? pathname === href : pathname.startsWith(href);
}

function NavButtons({
  pathname,
  onNavigate,
  isSuperAdmin,
}: {
  pathname: string;
  onNavigate?: () => void;
  isSuperAdmin: boolean;
}) {
  const allLinks = isSuperAdmin ? [...links, ...superAdminLinks] : links;
  return (
    <nav className="flex flex-col gap-1.5" aria-label="Admin">
      {allLinks.map((l) => {
        const active = isActive(pathname, l.href, l.exact);
        return (
          <Link
            key={l.href}
            href={l.href}
            onClick={onNavigate}
            className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "bg-nav text-white shadow-sm"
                : "text-slate-700 hover:bg-slate-100 hover:text-primary"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isSuperAdmin } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <AdminGuard>
      <div className="min-h-screen bg-slate-50 lg:flex">
        <aside className="hidden lg:flex lg:w-56 lg:shrink-0 lg:flex-col lg:border-r lg:border-slate-200 lg:bg-white">
          <div className="sticky top-0 flex h-screen flex-col px-3 py-4">
            <Link href="/admin" className="mb-4 px-3 text-lg font-bold text-primary">
              UsaRakhi Admin
            </Link>
            <div className="mb-4 px-1">
              <AdminSearch />
            </div>
            <div className="flex-1 overflow-y-auto">
              <NavButtons pathname={pathname} isSuperAdmin={isSuperAdmin} />
            </div>
            <Link
              href="/"
              className="mt-4 rounded-lg px-3 py-2.5 text-sm text-slate-500 hover:bg-slate-100 hover:text-accent"
            >
              ← Storefront
            </Link>
          </div>
        </aside>

        <div className="sticky top-0 z-40 border-b border-slate-200 bg-white lg:hidden">
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
                aria-label="Open admin menu"
                aria-expanded={menuOpen}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path
                    d="M3 5h14M3 10h14M3 15h14"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
              <Link href="/admin" className="truncate font-bold text-primary">
                UsaRakhi Admin
              </Link>
            </div>
            <Link href="/" className="shrink-0 text-sm text-slate-500 hover:text-accent">
              ← Store
            </Link>
          </div>
          <div className="border-t border-slate-100 px-4 py-2">
            <AdminSearch />
          </div>
        </div>

        {menuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Admin menu">
            <button
              type="button"
              className="absolute inset-0 bg-slate-900/40"
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
            />
            <aside className="absolute inset-y-0 left-0 flex w-[min(100%,18rem)] flex-col bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                <span className="font-bold text-primary">Menu</span>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                  aria-label="Close menu"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path
                      d="M4 4l8 8M12 4l-8 8"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-3 py-4">
                <NavButtons
                  pathname={pathname}
                  onNavigate={() => setMenuOpen(false)}
                  isSuperAdmin={isSuperAdmin}
                />
              </div>
              <div className="border-t border-slate-200 px-3 py-3">
                <Link
                  href="/"
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm text-slate-500 hover:bg-slate-100 hover:text-accent"
                >
                  ← Storefront
                </Link>
              </div>
            </aside>
          </div>
        )}

        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </AdminGuard>
  );
}
