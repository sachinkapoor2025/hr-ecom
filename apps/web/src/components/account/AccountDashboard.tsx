"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { fetchAccount } from "@/lib/account";
import { useSessionId } from "@/lib/session";
import type { AccountAddress, AccountProfile, Order } from "@hr-ecom/shared";
import type { AuthUser } from "@/lib/cognito";
import { AccountNav, type AccountTab } from "./AccountNav";
import { AccountOrdersPanel } from "./AccountOrdersPanel";
import { AccountAddressesPanel } from "./AccountAddressesPanel";
import { AccountPaymentsPanel } from "./AccountPaymentsPanel";
import { AccountDetailsPanel } from "./AccountDetailsPanel";

const VALID_TABS: AccountTab[] = ["orders", "addresses", "payments", "details"];

function parseTab(value: string | null): AccountTab {
  if (value && VALID_TABS.includes(value as AccountTab)) return value as AccountTab;
  return "orders";
}

export function AccountDashboard({
  user,
  token,
  isAdmin,
  onLogout,
}: {
  user: AuthUser;
  token: string;
  isAdmin: boolean;
  onLogout: () => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = useSessionId();
  const [tab, setTab] = useState<AccountTab>(() => parseTab(searchParams.get("tab")));

  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [addresses, setAddresses] = useState<AccountAddress[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [accountLoading, setAccountLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);

  const loadAccount = useCallback(async () => {
    if (!sessionId) return;
    setAccountLoading(true);
    try {
      const data = await fetchAccount(token, sessionId);
      setProfile(data.profile);
      setAddresses(data.addresses);
    } catch {
      setProfile(null);
      setAddresses([]);
    } finally {
      setAccountLoading(false);
    }
  }, [token, sessionId]);

  const loadOrders = useCallback(async () => {
    if (!sessionId) return;
    setOrdersLoading(true);
    try {
      const data = await api<{ orders: Order[] }>("/orders", { sessionId, token });
      setOrders(
        [...data.orders].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      );
    } catch {
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  }, [token, sessionId]);

  useEffect(() => {
    void loadAccount();
    void loadOrders();
  }, [loadAccount, loadOrders]);

  useEffect(() => {
    setTab(parseTab(searchParams.get("tab")));
  }, [searchParams]);

  const changeTab = (next: AccountTab) => {
    setTab(next);
    router.replace(`/account?tab=${next}`, { scroll: false });
  };

  const refreshAll = async () => {
    await Promise.all([loadAccount(), loadOrders()]);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-10">
      <div className="rounded-xl bg-gradient-to-r from-violet-600 via-violet-700 to-blue-800 text-white px-6 py-8 sm:px-10 sm:py-10 mb-6 shadow-md">
        <p className="text-lg sm:text-xl font-medium leading-relaxed max-w-2xl">
          Welcome back to your account. Manage orders, addresses and profile details easily.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary">My Account</h1>
          <div className="flex flex-wrap items-center gap-3">
            {isAdmin && (
              <button
                type="button"
                onClick={() => router.push("/admin")}
                className="text-sm font-medium text-nav hover:underline"
              >
                Admin portal
              </button>
            )}
            <button
              type="button"
              onClick={onLogout}
              className="text-sm font-medium text-slate-600 hover:text-red-600"
            >
              Logout
            </button>
          </div>
        </div>

        <AccountNav active={tab} onChange={changeTab} />

        <div className="mt-6">
          {tab === "orders" && <AccountOrdersPanel orders={orders} loading={ordersLoading} />}

          {tab === "addresses" &&
            (accountLoading || !profile ? (
              <p className="text-slate-500 text-sm py-6">Loading addresses...</p>
            ) : (
              <AccountAddressesPanel
                addresses={addresses}
                token={token}
                sessionId={sessionId!}
                userEmail={user.email}
                onRefresh={loadAccount}
              />
            ))}

          {tab === "payments" &&
            (accountLoading || !profile ? (
              <p className="text-slate-500 text-sm py-6">Loading payment settings...</p>
            ) : (
              <AccountPaymentsPanel
                profile={profile}
                orders={orders}
                token={token}
                sessionId={sessionId!}
                onRefresh={loadAccount}
              />
            ))}

          {tab === "details" &&
            (accountLoading || !profile ? (
              <p className="text-slate-500 text-sm py-6">Loading account details...</p>
            ) : (
              <AccountDetailsPanel
                profile={profile}
                email={user.email}
                token={token}
                sessionId={sessionId!}
                onRefresh={loadAccount}
              />
            ))}
        </div>
      </div>
    </div>
  );
}
