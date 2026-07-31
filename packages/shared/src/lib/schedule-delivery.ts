/** Latest customer-selectable scheduled delivery date (inclusive). */
export const SCHEDULE_DELIVERY_MAX_DATE = "2026-08-28";

/** Calendar day key in America/New_York (YYYY-MM-DD). */
export function calendarDayKeyAmericaNy(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** Min selectable delivery date = today (America/New_York). */
export function scheduleDeliveryMinDate(date = new Date()): string {
  return calendarDayKeyAmericaNy(date);
}

export function isValidScheduleDeliveryDate(
  value: string,
  now = new Date()
): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const min = scheduleDeliveryMinDate(now);
  return value >= min && value <= SCHEDULE_DELIVERY_MAX_DATE;
}

/** ISO timestamp for the selected calendar day (stable for vendors / emails). */
export function preferredDeliveryDateToIso(dateYmd: string): string {
  return `${dateYmd}T16:00:00.000Z`;
}
