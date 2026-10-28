/** Merge coupon rows by code. Later groups overwrite earlier ones so the stored coupon wins over the list feed. */
export function mergeListedCoupons<T extends { code?: string }>(groups: T[][]): T[] {
  const byCode = new Map<string, T>();
  for (const group of groups) {
    for (const row of group) {
      const code = row.code?.trim().toUpperCase();
      if (!code) continue;
      const prev = byCode.get(code);
      byCode.set(code, prev ? { ...prev, ...row, code } : { ...row, code });
    }
  }
  return [...byCode.values()];
}
