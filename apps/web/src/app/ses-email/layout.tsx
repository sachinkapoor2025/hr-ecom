"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { EmailGuard } from "@/components/EmailGuard";
import { useAuth } from "@/lib/auth-context";

const links = [
  { href: "/ses-email", label: "Dashboard", exact: true },
  { href: "/ses-email/compose", label: "Compose Email" },
  { href: "/ses-email/upload", label: "Upload Recipients" },
  { href: "/ses-email/campaigns", label: "Campaigns" },
  { href: "/ses-email/templates", label: "Templates" },
  { href: "/ses-email/queue", label: "Queue" },
  { href: "/ses-email/analytics", label: "Analytics" },
  { href: "/ses-email/suppression", label: "Suppression List" },
  { href: "/ses-email/settings", label: "Settings" },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  return exact ? pathname === href : pathname.startsWith(href);
}

export default function SesEmailLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <EmailGuard>
      <div className="min-h-screen bg-slate-50 flex">
        <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-slate-200 bg-white">
          <div className="px-4 py-5 border-b">
            <Link href="/ses-email" className="text-lg font-bold text-primary">
              SES Email
            </Link>
            <p className="text-[11px] text-slate-500 mt-0.5">UsaRakhi campaigns</p>
          </div>
          <nav className="flex-1 p-3 space-y-0.5">
            {links.map((l) => {
              const active = isActive(pathname, l.href, l.exact);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`block rounded-lg px-3 py-2 text-sm font-medium ${
                    active ? "bg-nav text-white" : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>
          <div className="p-3 border-t text-xs text-slate-500 space-y-1">
            <p className="truncate">{user?.email}</p>
            <Link href="/admin" className="text-nav hover:underline block">
              Admin portal
            </Link>
            <button type="button" onClick={logout} className="text-red-600 hover:underline">
              Sign out
            </button>
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <header className="md:hidden flex items-center justify-between gap-2 border-b bg-white px-4 py-3">
            <Link href="/ses-email" className="font-bold text-primary">
              SES Email
            </Link>
            <button
              type="button"
              className="text-sm border rounded-lg px-3 py-1.5"
              onClick={() => setMenuOpen((v) => !v)}
            >
              Menu
            </button>
          </header>
          {menuOpen && (
            <div className="md:hidden border-b bg-white p-3 space-y-1">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm hover:bg-slate-100"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          )}
          <main className="p-4 sm:p-6 lg:p-8 max-w-6xl">{children}</main>
        </div>
      </div>
    </EmailGuard>
  );
}
