import { ORDER_STATUS } from "@hr-ecom/shared";

export type SortDir = "asc" | "desc";

export function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows
    .map((r) => r.map((f) => `"${String(f ?? "").replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function paginate<T>(items: T[], page: number, pageSize: number) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    page: safePage,
    totalPages,
    total: items.length,
  };
}

export function sortItems<T>(
  items: T[],
  key: keyof T | ((item: T) => string | number),
  dir: SortDir
): T[] {
  const get = typeof key === "function" ? key : (item: T) => item[key] as string | number;
  return [...items].sort((a, b) => {
    const av = get(a);
    const bv = get(b);
    if (av < bv) return dir === "asc" ? -1 : 1;
    if (av > bv) return dir === "asc" ? 1 : -1;
    return 0;
  });
}

export function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amount);
}

export function paymentStatusLabel(status: string): string {
  if (status === ORDER_STATUS.PENDING_PAYMENT) return "Pending";
  if (status === ORDER_STATUS.REFUNDED) return "Refunded";
  if (status === ORDER_STATUS.CANCELLED) return "Failed";
  return "Paid";
}

export function paymentStatusClass(status: string): string {
  if (status === ORDER_STATUS.PENDING_PAYMENT) return "bg-amber-100 text-amber-800";
  if (status === ORDER_STATUS.REFUNDED) return "bg-purple-100 text-purple-800";
  if (status === ORDER_STATUS.CANCELLED) return "bg-red-100 text-red-800";
  return "bg-green-100 text-green-800";
}

export function shippingStatusLabel(status: string): string {
  if (status === ORDER_STATUS.SHIPPED) return "Shipped";
  if (status === ORDER_STATUS.DELIVERED || status === ORDER_STATUS.COMPLETE) return "Delivered";
  if (status === ORDER_STATUS.CANCELLED || status === ORDER_STATUS.REFUNDED) return "—";
  if (status === ORDER_STATUS.PENDING_PAYMENT) return "—";
  return "Pending";
}

export function formatDurationMs(ms: number): string {
  if (ms < 60_000) return `${Math.round(ms / 1000)}s`;
  if (ms < 3_600_000) return `${Math.round(ms / 60_000)}m`;
  if (ms < 86_400_000) return `${Math.round(ms / 3_600_000)}h`;
  return `${Math.round(ms / 86_400_000)}d`;
}

export function referrerLabel(referrer?: string): string {
  if (!referrer) return "Direct";
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "");
    if (host.includes("google")) return "Google";
    if (host.includes("facebook") || host.includes("fb.")) return "Facebook";
    if (host.includes("instagram")) return "Instagram";
    return host;
  } catch {
    return referrer.slice(0, 40);
  }
}
